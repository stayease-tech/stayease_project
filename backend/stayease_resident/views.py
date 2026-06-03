# Copyright (c) 2026 Aravind Adari. All rights reserved.

import json
import hmac
import hashlib
import uuid
import time
import logging
from datetime import datetime, date
from decimal import Decimal, InvalidOperation

import razorpay

from django.core.paginator import Paginator
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core.mail import EmailMessage
from django.conf import settings

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from stayease_project.permissions import IsResident
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from stayease_project.throttles import LoginRateThrottle

from stayease_sales.models import resident_Data, resident_Rent_Data, PaymentTransaction, RecurringMandate
from stayease_operations.models import PropertyComplaintDetail, ComplaintCategory, Feedback

logger = logging.getLogger(__name__)

# In-memory set for webhook event deduplication (resets on restart — acceptable for this use case)
_processed_webhook_event_ids = set()


def _get_razorpay_client():
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


# ─── resident Login (JWT) ───────────────────────────────────────────

class residentLoginView(APIView):
    """Phone + password login → JWT tokens + resident info."""
    authentication_classes = []
    permission_classes = []
    throttle_classes = [LoginRateThrottle]

    def post(self, request):
        phone = request.data.get('phone', '').strip()
        password = request.data.get('password', '')

        if not phone or not password:
            return Response({'success': False, 'message': 'Phone and password are required.'},
                            status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=phone, password=password)
        if user is None:
            return Response({'success': False, 'message': 'Invalid phone number or password.'},
                            status=status.HTTP_401_UNAUTHORIZED)

        try:
            resident = resident_Data.objects.get(residentUser=user)
        except resident_Data.DoesNotExist:
            return Response({'success': False, 'message': 'No resident account linked to this user.'},
                            status=status.HTTP_404_NOT_FOUND)

        # Ensure user is in the Resident group for RBAC
        from django.contrib.auth.models import Group
        resident_group, _ = Group.objects.get_or_create(name='Resident')
        user.groups.add(resident_group)

        refresh = RefreshToken.for_user(user)
        return Response({
            'success': True,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user_type': 'resident',
            'phone': phone,
            'resident_id': resident.id,
            'residentsName': resident.residentsName,
            'kycApprovalStatus': resident.kycApprovalStatus,
            'residentStatus': resident.residentStatus,
        })


# ─── Helper: get resident from JWT user ─────────────────────────────

def _get_resident(request):
    """Return the resident_Data linked to the authenticated JWT user."""
    try:
        return resident_Data.objects.select_related('bed_data_instance__room__property__owner').get(residentUser=request.user)
    except resident_Data.DoesNotExist:
        return None


# ─── Dashboard ─────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsResident])
def resident_dashboard(request):
    """Handle GET /resident/dashboard/ — return dashboard summary for the authenticated resident.

    Returns:
        Response with KYC status, lease status, total rent due, next due date, complaint
        counts, and property/room/bed assignment details.
    """
    resident = _get_resident(request)
    if not resident:
        return Response({'success': False, 'message': 'resident not found.'}, status=404)

    # Rent records
    rent_records = resident_Rent_Data.objects.filter(resident_data_instance=resident).order_by('-submittedDateAndTime')
    pending_rent = rent_records.filter(rentStatus='Not Received')
    total_due = sum(float(r.rent or 0) + float(r.delayCharges or 0) for r in pending_rent)

    # Next due date (5th of current/next month)
    now = timezone.now()
    due_day = 5
    if now.day <= due_day:
        next_due = now.replace(day=due_day)
    else:
        month = now.month + 1 if now.month < 12 else 1
        year = now.year if now.month < 12 else now.year + 1
        next_due = now.replace(year=year, month=month, day=due_day)

    # Lease status — check if resident has a lease agreement uploaded or a completed signing request
    from stayease_sales.models import Document, SigningRequest
    lease_completed = bool(resident.leaseAgreement)
    if not lease_completed:
        lease_docs = Document.objects.filter(recipient_email=resident.email)
        lease_completed = SigningRequest.objects.filter(
            document__in=lease_docs, status='completed'
        ).exists()

    # Complaints count
    complaint_count = PropertyComplaintDetail.objects.filter(propertyComplaint_bed=resident).count()
    open_complaints = ComplaintCategory.objects.filter(
        complaint__propertyComplaint_bed=resident, status__in=['Open', 'Follow Up']
    ).count()

    # Property info
    bed = resident.bed_data_instance
    property_name = ''
    room_no = ''
    bed_label = ''
    if bed:
        bed_label = bed.bedLabel or ''
        if hasattr(bed, 'room') and bed.room:
            room_no = bed.room.roomNo or ''
            if hasattr(bed.room, 'property') and bed.room.property:
                property_name = bed.room.property.propertyName or ''

    return Response({
        'success': True,
        'kycApprovalStatus': resident.kycApprovalStatus,
        'leaseCompleted': lease_completed,
        'residentStatus': resident.residentStatus,
        'residentsName': resident.residentsName,
        'totalDue': total_due,
        'nextDueDate': next_due.strftime('%Y-%m-%d'),
        'pendingRentCount': pending_rent.count(),
        'totalComplaints': complaint_count,
        'openComplaints': open_complaints,
        'propertyName': property_name,
        'roomNo': room_no,
        'bedLabel': bed_label,
        'checkIn': resident.checkIn,
        'checkOut': resident.checkOut,
        'rentPerMonth': resident.rentPerMonth,
    })


# ─── Profile ───────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsResident])
def resident_profile(request):
    """Handle GET /resident/profile/ — return full profile details for the authenticated resident.

    Returns:
        Response with personal info, property/room/bed assignment, lease dates,
        rent, deposit, meal type, KYC status, and resident status.
    """
    resident = _get_resident(request)
    if not resident:
        return Response({'success': False, 'message': 'resident not found.'}, status=404)

    bed = resident.bed_data_instance
    property_name = room_no = bed_label = property_address = ''
    if bed:
        bed_label = bed.bedLabel or ''
        if hasattr(bed, 'room') and bed.room:
            room_no = bed.room.roomNo or ''
            if hasattr(bed.room, 'property') and bed.room.property:
                prop = bed.room.property
                property_name = prop.propertyName or ''
                property_address = f"{prop.doorBuilding or ''}, {prop.streetAddress or ''}, {prop.area or ''}, {prop.city or ''}"

    return Response({
        'success': True,
        'residentsName': resident.residentsName,
        'phoneNumber': resident.phoneNumber,
        'email': resident.email,
        'permanentAddress': resident.permanentAddress,
        'propertyName': property_name,
        'propertyAddress': property_address,
        'roomNo': room_no,
        'bedLabel': bed_label,
        'checkIn': resident.checkIn,
        'checkOut': resident.checkOut,
        'rentPerMonth': resident.rentPerMonth,
        'totalDepositPaid': resident.totalDepositPaid,
        'comfortClass': resident.comfortClass,
        'mealType': resident.mealType,
        'kycApprovalStatus': resident.kycApprovalStatus,
        'residentStatus': resident.residentStatus,
    })


@api_view(['PUT'])
@permission_classes([IsResident])
def resident_profile_update(request):
    """Handle PUT /resident/profile/update/ — update editable profile fields for the authenticated resident.

    Args:
        request: DRF Request with optional JSON body fields: `residentsName`, `email`, `permanentAddress`.

    Returns:
        Response with `success` flag and a confirmation message.
    """
    resident = _get_resident(request)
    if not resident:
        return Response({'success': False, 'message': 'resident not found.'}, status=404)

    data = request.data
    updatable = ['residentsName', 'email', 'permanentAddress']
    for field in updatable:
        val = data.get(field)
        if val is not None:
            setattr(resident, field, val)
    resident.save()

    # Sync first_name on auth.User
    if 'residentsName' in data:
        request.user.first_name = data['residentsName']
        request.user.save(update_fields=['first_name'])

    return Response({'success': True, 'message': 'Profile updated successfully.'})


# ─── Change Password ───────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsResident])
def resident_change_password(request):
    """Handle POST /resident/change-password/ — change the authenticated resident's password.

    Args:
        request: DRF Request with JSON body containing `currentPassword` and `newPassword`.

    Returns:
        Response with `success` flag and a message. Returns 400 if current password is
        incorrect or new password is fewer than 6 characters.
    """
    current_password = request.data.get('currentPassword', '')
    new_password = request.data.get('newPassword', '')

    if not current_password or not new_password:
        return Response({'success': False, 'message': 'Both current and new password are required.'},
                        status=status.HTTP_400_BAD_REQUEST)

    if len(new_password) < 6:
        return Response({'success': False, 'message': 'New password must be at least 6 characters.'},
                        status=status.HTTP_400_BAD_REQUEST)

    if not request.user.check_password(current_password):
        return Response({'success': False, 'message': 'Current password is incorrect.'},
                        status=status.HTTP_400_BAD_REQUEST)

    request.user.set_password(new_password)
    request.user.save()
    return Response({'success': True, 'message': 'Password changed successfully.'})


# ─── KYC Upload ────────────────────────────────────────────────────

def _validate_kyc_file(uploaded_file):
    """Validate a KYC upload: max 5 MB, images and PDFs only (magic-byte check)."""
    max_size = 5 * 1024 * 1024  # 5 MB
    if uploaded_file.size > max_size:
        return f'"{uploaded_file.name}" exceeds the 5 MB limit.'

    # Read magic bytes and reset
    header = uploaded_file.read(8)
    uploaded_file.seek(0)

    allowed_signatures = [
        b'\xff\xd8\xff',           # JPEG
        b'\x89PNG\r\n\x1a\n',     # PNG
        b'%PDF',                   # PDF
        b'RIFF',                   # WebP (RIFF container)
    ]
    if not any(header.startswith(sig) for sig in allowed_signatures):
        return f'"{uploaded_file.name}" is not a valid image or PDF file.'

    return None


@api_view(['POST'])
@permission_classes([IsResident])
def resident_kyc_upload(request):
    """Handle POST /resident/kyc/upload/ — upload KYC identity documents for the resident.

    Args:
        request: DRF Request with multipart form data containing optional file fields
            (`aadharFrontCopy`, `aadharBackCopy`, `panFrontCopy`, `panBackCopy`,
            `studentEmployeeIdCopy`) and text fields for corresponding ID numbers.

    Returns:
        Response with `success` flag and a message. Rejects already-approved KYC and
        files exceeding 5 MB or with unsupported formats.
    """
    resident = _get_resident(request)
    if not resident:
        return Response({'success': False, 'message': 'resident not found.'}, status=404)

    if resident.kycApprovalStatus == 'Approved':
        return Response({'success': False, 'message': 'KYC is already approved.'}, status=400)

    # Handle file uploads
    files = request.FILES
    data = request.POST

    # Validate all uploaded files before processing
    for field_name, uploaded_file in files.items():
        error = _validate_kyc_file(uploaded_file)
        if error:
            return Response({'success': False, 'message': error},
                            status=status.HTTP_400_BAD_REQUEST)

    if 'aadharFrontCopy' in files:
        resident.aadharFrontCopy = files['aadharFrontCopy']
    if 'aadharBackCopy' in files:
        resident.aadharBackCopy = files['aadharBackCopy']
    if data.get('aadharNumber'):
        resident.aadharNumber = data['aadharNumber']

    if 'panFrontCopy' in files:
        resident.panFrontCopy = files['panFrontCopy']
    if 'panBackCopy' in files:
        resident.panBackCopy = files['panBackCopy']
    if data.get('panNumber'):
        resident.panNumber = data['panNumber']

    if 'studentEmployeeIdCopy' in files:
        resident.studentEmployeeIdCopy = files['studentEmployeeIdCopy']
    if data.get('studentEmployeeIdType'):
        resident.studentEmployeeIdType = data['studentEmployeeIdType']
    if data.get('studentEmployeeIdNumber'):
        resident.studentEmployeeIdNumber = data['studentEmployeeIdNumber']

    # Reset to Pending if previously rejected so operations can re-review
    if resident.kycApprovalStatus == 'Rejected':
        resident.kycApprovalStatus = 'Pending'
        resident.kycRejectionReason = None

    resident.save()
    return Response({'success': True, 'message': 'KYC documents uploaded successfully.'})


@api_view(['GET'])
@permission_classes([IsResident])
def resident_kyc_status(request):
    """Handle GET /resident/kyc/status/ — return the KYC status and uploaded document URLs.

    Returns:
        Response with KYC approval status, rejection reason, document numbers,
        and signed URLs for all uploaded identity document files.
    """
    resident = _get_resident(request)
    if not resident:
        return Response({'success': False, 'message': 'resident not found.'}, status=404)

    return Response({
        'success': True,
        'kycApprovalStatus': resident.kycApprovalStatus,
        'kycApprovedBy': resident.kycApprovedBy,
        'kycApprovalDate': resident.kycApprovalDate.isoformat() if resident.kycApprovalDate else None,
        'kycRejectionReason': resident.kycRejectionReason,
        'aadharNumber': resident.aadharNumber,
        'aadharFrontCopy': resident.aadharFrontCopy.url if resident.aadharFrontCopy else None,
        'aadharBackCopy': resident.aadharBackCopy.url if resident.aadharBackCopy else None,
        'panNumber': resident.panNumber,
        'panFrontCopy': resident.panFrontCopy.url if resident.panFrontCopy else None,
        'panBackCopy': resident.panBackCopy.url if resident.panBackCopy else None,
        'studentEmployeeIdType': resident.studentEmployeeIdType,
        'studentEmployeeIdNumber': resident.studentEmployeeIdNumber,
        'studentEmployeeIdCopy': resident.studentEmployeeIdCopy.url if resident.studentEmployeeIdCopy else None,
    })


# ─── Rent History / Invoices ──────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsResident])
def resident_rent_history(request):
    """Handle GET /resident/rent-history/ — return paginated rent records for the resident.

    Args:
        request: DRF Request with optional query params `paid_only` (bool), `page` (int),
            and `page_size` (int, max 50).

    Returns:
        Response with paginated `rentRecords` list and pagination metadata.
    """
    resident = _get_resident(request)
    if not resident:
        return Response({'success': False, 'message': 'resident not found.'}, status=404)

    qs = resident_Rent_Data.objects.filter(resident_data_instance=resident)
    if request.query_params.get('paid_only') == 'true':
        qs = qs.filter(rentStatus='Received')
    records = qs.order_by('-submittedDateAndTime')

    page_num = request.query_params.get('page', 1)
    page_size = request.query_params.get('page_size', 10)
    try:
        page_num = int(page_num)
        page_size = min(int(page_size), 50)
    except (ValueError, TypeError):
        page_num = 1
        page_size = 10

    paginator = Paginator(records, page_size)
    page = paginator.get_page(page_num)

    data = []
    for r in page:
        data.append({
            'id': r.id,
            'month': r.month,
            'rent': r.rent,
            'delayCharges': r.delayCharges,
            'rentStatus': r.rentStatus,
            'transferType': r.transferType,
            'utrNumber': r.utrNumber,
            'transferredDate': r.transferredDate,
        })

    return Response({
        'success': True,
        'rentRecords': data,
        'currentPage': page.number,
        'totalPages': paginator.num_pages,
        'totalRecords': paginator.count,
    })


# ─── Razorpay One-Time Payments ─────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsResident])
def resident_payment_init(request):
    """Initiate a Razorpay order for one-time rent payment."""
    resident = _get_resident(request)
    if not resident:
        return Response({'success': False, 'message': 'resident not found.'}, status=404)

    amount_raw = str(request.data.get('amount', '')).strip()
    try:
        amount = Decimal(amount_raw)
    except (InvalidOperation, TypeError):
        return Response({'success': False, 'message': 'Amount must be a valid number.'}, status=400)

    if amount <= 0:
        return Response({'success': False, 'message': 'Amount must be greater than zero.'}, status=400)

    rent_id = str(request.data.get('rentId') or '')
    rent_record = None
    if rent_id:
        try:
            rent_record = resident_Rent_Data.objects.get(
                id=int(rent_id),
                resident_data_instance=resident,
            )
        except (resident_Rent_Data.DoesNotExist, ValueError):
            return Response({'success': False, 'message': 'Invalid rent record.'}, status=400)

        if rent_record.rentStatus == 'Received':
            return Response({'success': False, 'message': 'Rent already paid.'}, status=400)

    txn_id = f"SE{uuid.uuid4().hex[:18]}"
    firstname = (resident.residentsName or request.user.first_name or 'Resident').strip()
    email = (resident.email or '').strip()
    phone = str(resident.phoneNumber or request.user.username or '').strip()

    try:
        client = _get_razorpay_client()
        order = client.order.create(dict(
            amount=int(amount * 100),  # paise
            currency='INR',
            receipt=txn_id,
            notes={
                'resident_id': str(resident.id),
                'user_id': str(request.user.id),
                'rent_id': rent_id,
            }
        ))
    except Exception as e:
        logger.error(f"[PAYMENT_INIT] Razorpay order.create failed: {e}")
        return Response({
            'success': False,
            'message': 'Payment service unavailable. Please try again later.',
        }, status=503)

    PaymentTransaction.objects.create(
        txnid=txn_id,
        resident=resident,
        rent_record=rent_record,
        amount=amount,
        product_info=str(request.data.get('productInfo') or 'Rent Payment').strip()[:100],
        status='initiated',
        gateway_order_id=order['id'],
    )

    return Response({
        'success': True,
        'orderId': order['id'],
        'keyId': settings.RAZORPAY_KEY_ID,
        'amount': int(amount * 100),
        'currency': 'INR',
        'prefill': {
            'name': firstname,
            'email': email,
            'contact': phone,
        },
        'notes': {
            'resident_id': str(resident.id),
            'rent_id': rent_id,
        },
    })


@api_view(['POST'])
@permission_classes([IsResident])
def resident_payment_verify(request):
    """Verify Razorpay payment signature and update records on success."""
    resident = _get_resident(request)
    if not resident:
        return Response({'success': False, 'message': 'resident not found.'}, status=404)

    razorpay_payment_id = request.data.get('razorpay_payment_id', '').strip()
    razorpay_order_id = request.data.get('razorpay_order_id', '').strip()
    razorpay_signature = request.data.get('razorpay_signature', '').strip()

    if not razorpay_payment_id or not razorpay_order_id or not razorpay_signature:
        return Response({'success': False, 'message': 'razorpay_payment_id, razorpay_order_id, and razorpay_signature are required.'}, status=400)

    try:
        txn = PaymentTransaction.objects.get(gateway_order_id=razorpay_order_id, resident=resident)
    except PaymentTransaction.DoesNotExist:
        return Response({'success': False, 'message': 'Transaction not found.'}, status=404)

    # Idempotency — return success if already processed
    if txn.status == 'success':
        return Response({'success': True, 'txnid': txn.txnid, 'amount': str(txn.amount)})

    try:
        client = _get_razorpay_client()
        client.utility.verify_payment_signature({
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature,
        })
    except razorpay.errors.SignatureVerificationError:
        txn.status = 'failed'
        txn.gateway_status = 'signature_mismatch'
        txn.save()
        return Response({'success': False, 'message': 'Payment signature verification failed.'}, status=400)
    except Exception as e:
        logger.error(f"[PAYMENT_VERIFY] Unexpected error: {e}")
        return Response({'success': False, 'message': 'Verification error.'}, status=500)

    # Signature valid — mark success
    txn.status = 'success'
    txn.gateway_status = 'captured'
    txn.gateway_payment_id = razorpay_payment_id
    txn.save()

    if txn.rent_record:
        rent_record = txn.rent_record
        rent_record.rentStatus = 'Received'
        rent_record.transferType = 'Online - Razorpay'
        rent_record.utrNumber = razorpay_payment_id
        rent_record.transferredDate = date.today().strftime('%Y-%m-%d')
        rent_record.save()

    return Response({'success': True, 'txnid': txn.txnid, 'amount': str(txn.amount)})


# ─── Razorpay Webhook (server-to-server) ────────────────────────────

@csrf_exempt
def razorpay_webhook(request):
    """Handle Razorpay server-to-server webhook.
    Verify via X-Razorpay-Signature (HMAC-SHA256 with webhook secret).
    Configure this URL in Razorpay Dashboard under Settings → Webhooks.
    """
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'POST only'}, status=405)

    signature = request.headers.get('X-Razorpay-Signature', '')
    if not signature:
        logger.warning('[WEBHOOK] Missing X-Razorpay-Signature header')
        return JsonResponse({'status': 'error', 'message': 'missing_signature'}, status=403)

    webhook_secret = (settings.RAZORPAY_WEBHOOK_SECRET or '').encode('utf-8')
    expected = hmac.new(webhook_secret, request.body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, signature):
        logger.warning('[WEBHOOK] HMAC signature mismatch')
        return JsonResponse({'status': 'error', 'message': 'invalid_signature'}, status=403)

    # Deduplicate by event ID
    event_id = request.headers.get('X-Razorpay-Event-Id', '')
    if event_id and event_id in _processed_webhook_event_ids:
        logger.info(f'[WEBHOOK] Duplicate event {event_id}, skipping')
        return JsonResponse({'status': 'ok', 'message': 'duplicate'})
    if event_id:
        _processed_webhook_event_ids.add(event_id)

    try:
        payload = json.loads(request.body)
    except (json.JSONDecodeError, Exception) as e:
        logger.error(f'[WEBHOOK] JSON parse error: {e}')
        return JsonResponse({'status': 'error', 'message': 'invalid_json'}, status=400)

    event = payload.get('event', '')
    logger.info(f'[WEBHOOK] Received event: {event}')

    if event == 'payment.captured':
        _handle_payment_captured(payload)
    elif event == 'payment.failed':
        _handle_payment_failed(payload)
    elif event == 'subscription.charged':
        _handle_subscription_charged(payload)
    elif event == 'subscription.cancelled':
        _handle_subscription_cancelled(payload)
    elif event == 'qr_code.closed':
        _handle_qr_code_closed(payload)
    else:
        logger.info(f'[WEBHOOK] Unhandled event type: {event}')

    return JsonResponse({'status': 'ok'})


def _handle_payment_captured(payload):
    """Update transaction to success when Razorpay confirms capture."""
    try:
        payment = payload['payload']['payment']['entity']
        order_id = payment.get('order_id', '')
        payment_id = payment.get('id', '')
    except (KeyError, TypeError):
        logger.warning('[WEBHOOK] payment.captured: malformed payload')
        return

    try:
        txn = PaymentTransaction.objects.get(gateway_order_id=order_id)
    except PaymentTransaction.DoesNotExist:
        logger.warning(f'[WEBHOOK] payment.captured: unknown order_id={order_id}')
        return

    if txn.status == 'success':
        return  # already processed — idempotent

    txn.status = 'success'
    txn.gateway_status = 'captured'
    txn.gateway_payment_id = payment_id
    txn.save()

    if txn.rent_record:
        txn.rent_record.rentStatus = 'Received'
        txn.rent_record.transferType = 'Online - Razorpay'
        txn.rent_record.utrNumber = payment_id
        txn.rent_record.transferredDate = date.today().strftime('%Y-%m-%d')
        txn.rent_record.save()

    logger.info(f'[WEBHOOK] payment.captured: txn {txn.txnid} marked success')


def _handle_payment_failed(payload):
    """Mark transaction failed — do NOT overwrite a successful payment."""
    try:
        payment = payload['payload']['payment']['entity']
        order_id = payment.get('order_id', '')
        error_code = payment.get('error_code', 'failed')
    except (KeyError, TypeError):
        return

    try:
        txn = PaymentTransaction.objects.get(gateway_order_id=order_id)
    except PaymentTransaction.DoesNotExist:
        return

    if txn.status == 'success':
        return  # success is terminal — never downgrade

    txn.status = 'failed'
    txn.gateway_status = error_code
    txn.save()
    logger.info(f'[WEBHOOK] payment.failed: txn gateway_order_id={order_id} marked failed')


def _handle_subscription_charged(payload):
    """Create rent record when Razorpay auto-charges a subscription."""
    try:
        subscription = payload['payload']['subscription']['entity']
        sub_id = subscription.get('id', '')
        payment = payload['payload']['payment']['entity']
        payment_id = payment.get('id', '')
    except (KeyError, TypeError):
        logger.warning('[WEBHOOK] subscription.charged: malformed payload')
        return

    try:
        mandate = RecurringMandate.objects.select_related('resident').get(gateway_subscription_id=sub_id)
    except RecurringMandate.DoesNotExist:
        logger.warning(f'[WEBHOOK] subscription.charged: unknown subscription_id={sub_id}')
        return

    today = date.today()
    month_label = today.strftime('%B %Y')

    # Deduplicate — check if a rent record already exists for this month
    existing = resident_Rent_Data.objects.filter(
        resident_data_instance=mandate.resident,
        month=month_label,
        transferType='Auto-Pay (Razorpay)',
    ).exists()
    if existing:
        logger.info(f'[WEBHOOK] subscription.charged: rent record already exists for {month_label}, skipping')
        return

    resident_Rent_Data.objects.create(
        resident_data_instance=mandate.resident,
        rentStatus='Received',
        month=month_label,
        rent=str(mandate.billing_amount),
        transferType='Auto-Pay (Razorpay)',
        utrNumber=payment_id,
        transferredDate=today.strftime('%Y-%m-%d'),
    )

    mandate.last_charged_date = today
    if today.month < 12:
        next_date = today.replace(month=today.month + 1, day=1)
    else:
        next_date = today.replace(year=today.year + 1, month=1, day=1)
    mandate.next_charge_date = min(next_date, mandate.end_date) if next_date <= mandate.end_date else None
    mandate.save()
    logger.info(f'[WEBHOOK] subscription.charged: rent record created for {month_label}')


def _handle_subscription_cancelled(payload):
    """Mark mandate revoked when Razorpay subscription is cancelled."""
    try:
        subscription = payload['payload']['subscription']['entity']
        sub_id = subscription.get('id', '')
    except (KeyError, TypeError):
        return

    try:
        mandate = RecurringMandate.objects.get(gateway_subscription_id=sub_id)
        mandate.status = 'revoked'
        mandate.save()
        logger.info(f'[WEBHOOK] subscription.cancelled: mandate {mandate.txnid} revoked')
    except RecurringMandate.DoesNotExist:
        logger.warning(f'[WEBHOOK] subscription.cancelled: unknown sub_id={sub_id}')


def _handle_qr_code_closed(payload):
    """Update txn and rent record when a QR code is paid."""
    try:
        qr = payload['payload']['qr_code']['entity']
        qr_id = qr.get('id', '')
        close_reason = qr.get('close_reason', '')
        payment_id = qr.get('payments_amount_received', '') or ''
        # payment_id comes from the linked payment in notes
        payments = payload['payload'].get('payment', {}).get('entity', {})
        if payments:
            payment_id = payments.get('id', payment_id)
    except (KeyError, TypeError):
        return

    try:
        txn = PaymentTransaction.objects.get(gateway_order_id=qr_id)
    except PaymentTransaction.DoesNotExist:
        return

    if txn.status == 'success':
        return

    if close_reason == 'paid':
        txn.status = 'success'
        txn.gateway_status = 'paid'
        txn.gateway_payment_id = str(payment_id)
        txn.save()

        if txn.rent_record:
            txn.rent_record.rentStatus = 'Received'
            txn.rent_record.transferType = 'Online - Razorpay'
            txn.rent_record.utrNumber = str(payment_id)
            txn.rent_record.transferredDate = date.today().strftime('%Y-%m-%d')
            txn.rent_record.save()
        logger.info(f'[WEBHOOK] qr_code.closed (paid): txn {txn.txnid} success')
    else:
        txn.status = 'failed'
        txn.gateway_status = close_reason or 'expired'
        txn.save()
        logger.info(f'[WEBHOOK] qr_code.closed ({close_reason}): txn {txn.txnid} failed')


# ─── Razorpay UPI QR Code Payments ──────────────────────────────────

@api_view(['POST'])
@permission_classes([IsResident])
def resident_payment_qr(request):
    """Generate a single-use UPI QR code for a pending rent payment."""
    resident = _get_resident(request)
    if not resident:
        return Response({'success': False, 'message': 'resident not found.'}, status=404)

    amount_raw = str(request.data.get('amount', '')).strip()
    try:
        amount = Decimal(amount_raw)
    except (InvalidOperation, TypeError):
        return Response({'success': False, 'message': 'Amount must be a valid number.'}, status=400)

    if amount <= 0:
        return Response({'success': False, 'message': 'Amount must be greater than zero.'}, status=400)

    rent_id = str(request.data.get('rentId') or '')
    rent_record = None
    if rent_id:
        try:
            rent_record = resident_Rent_Data.objects.get(
                id=int(rent_id),
                resident_data_instance=resident,
            )
        except (resident_Rent_Data.DoesNotExist, ValueError):
            return Response({'success': False, 'message': 'Invalid rent record.'}, status=400)

        if rent_record.rentStatus == 'Received':
            return Response({'success': False, 'message': 'Rent already paid.'}, status=400)

    txn_id = f"SE{uuid.uuid4().hex[:18]}"
    month = rent_record.month if rent_record else 'Rent'
    close_by = int(time.time()) + 300  # 5 minutes

    try:
        client = _get_razorpay_client()
        qr = client.qrcode.create({
            'type': 'upi_qr',
            'name': f'Rent - {month}',
            'usage': 'single_use',
            'fixed_amount': True,
            'payment_amount': int(amount * 100),
            'description': f'Rent Payment - {month}',
            'close_by': close_by,
            'notes': {
                'resident_id': str(resident.id),
                'rent_id': rent_id,
                'order_id': txn_id,
            }
        })
    except Exception as e:
        logger.error(f'[QR_GENERATE] Razorpay qrcode.create failed: {e}')
        return Response({'success': False, 'message': 'QR generation failed. Please try again.'}, status=503)

    PaymentTransaction.objects.create(
        txnid=txn_id,
        resident=resident,
        rent_record=rent_record,
        amount=amount,
        product_info=f'Rent Payment - {month}',
        status='initiated',
        gateway_order_id=qr['id'],
    )

    return Response({
        'success': True,
        'qrCodeId': qr['id'],
        'qrImageUrl': qr.get('image_url', ''),
        'amount': str(amount),
        'expiresAt': close_by,
    })


@api_view(['GET'])
@permission_classes([IsResident])
def resident_payment_qr_status(request):
    """Poll QR payment status."""
    resident = _get_resident(request)
    if not resident:
        return Response({'success': False, 'message': 'resident not found.'}, status=404)

    qr_code_id = request.GET.get('qrCodeId', '').strip()
    if not qr_code_id:
        return Response({'success': False, 'message': 'qrCodeId is required.'}, status=400)

    try:
        txn = PaymentTransaction.objects.get(gateway_order_id=qr_code_id)
    except PaymentTransaction.DoesNotExist:
        return Response({'success': False, 'message': 'QR code not found.'}, status=404)

    if txn.resident_id != resident.id:
        return Response({'success': False, 'message': 'Not authorised.'}, status=403)

    # Already in terminal state
    if txn.status == 'success':
        return Response({'status': 'paid'})
    if txn.status == 'failed':
        return Response({'status': 'expired'})

    # Fetch live status from Razorpay
    try:
        client = _get_razorpay_client()
        qr = client.qrcode.fetch(qr_code_id)
    except Exception as e:
        logger.error(f'[QR_STATUS] qrcode.fetch failed: {e}')
        return Response({'status': 'pending'})

    close_reason = qr.get('close_reason', '')
    if close_reason == 'paid' and txn.status != 'success':
        txn.status = 'success'
        txn.gateway_status = 'paid'
        txn.save()
        if txn.rent_record:
            txn.rent_record.rentStatus = 'Received'
            txn.rent_record.transferType = 'Online - Razorpay'
            txn.rent_record.transferredDate = date.today().strftime('%Y-%m-%d')
            txn.rent_record.save()
        return Response({'status': 'paid'})
    elif close_reason in ('timeout', 'on_demand'):
        txn.status = 'failed'
        txn.gateway_status = close_reason
        txn.save()
        return Response({'status': 'expired'})

    return Response({'status': 'pending'})


# ─── Recurring Payments / Subscriptions ─────────────────────────────

@api_view(['POST'])
@permission_classes([IsResident])
def resident_subscription_init(request):
    """Initiate Razorpay subscription for recurring rent auto-pay."""
    resident = _get_resident(request)
    if not resident:
        return Response({'success': False, 'message': 'Resident not found.'}, status=404)

    # Check for existing active mandate
    active_mandate = RecurringMandate.objects.filter(
        resident=resident, status='active'
    ).first()
    if active_mandate:
        return Response({
            'success': False,
            'message': 'You already have an active auto-pay mandate.',
        }, status=400)

    # Validate lease dates
    if not resident.checkIn or not resident.checkOut:
        return Response({
            'success': False,
            'message': 'Lease dates (check-in/check-out) are not set. Contact support.',
        }, status=400)

    try:
        start_date = datetime.strptime(resident.checkIn, '%Y-%m-%d').date()
        end_date = datetime.strptime(resident.checkOut, '%Y-%m-%d').date()
    except (ValueError, TypeError):
        return Response({
            'success': False,
            'message': 'Lease dates are in an invalid format. Contact support.',
        }, status=400)

    if end_date <= start_date:
        return Response({
            'success': False,
            'message': 'Lease end date must be after start date.',
        }, status=400)

    # Validate billing amount
    try:
        billing_amount = Decimal(str(resident.rentPerMonth or '').strip())
    except (InvalidOperation, TypeError):
        return Response({
            'success': False,
            'message': 'Monthly rent amount is not configured. Contact support.',
        }, status=400)

    if billing_amount <= 0:
        return Response({
            'success': False,
            'message': 'Monthly rent must be greater than zero.',
        }, status=400)

    # Calculate total count (number of months in lease)
    months = (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month)
    if end_date.day > start_date.day:
        months += 1
    total_count = max(1, months)

    firstname = (resident.residentsName or request.user.first_name or 'Resident').strip()
    email = (resident.email or '').strip()
    phone = str(resident.phoneNumber or request.user.username or '').strip()

    txn_id = f"SESI{uuid.uuid4().hex[:16]}"

    try:
        client = _get_razorpay_client()
        plan = client.plan.create({
            'period': 'monthly',
            'interval': 1,
            'item': {
                'name': f'Monthly Rent - {firstname}',
                'amount': int(billing_amount * 100),
                'currency': 'INR',
            }
        })
        subscription = client.subscription.create({
            'plan_id': plan['id'],
            'total_count': total_count,
            'customer_notify': 1,
            'notes': {
                'resident_id': str(resident.id),
            }
        })
    except Exception as e:
        logger.error(f'[SUBSCRIPTION_INIT] Razorpay API failed: {e}')
        return Response({
            'success': False,
            'message': 'Subscription service unavailable. Please try again later.',
        }, status=503)

    RecurringMandate.objects.create(
        txnid=txn_id,
        resident=resident,
        billing_amount=billing_amount,
        billing_cycle='MONTHLY',
        start_date=start_date,
        end_date=end_date,
        status='initiated',
        gateway_plan_id=plan['id'],
        gateway_subscription_id=subscription['id'],
    )

    return Response({
        'success': True,
        'subscriptionId': subscription['id'],
        'keyId': settings.RAZORPAY_KEY_ID,
        'prefill': {
            'name': firstname,
            'email': email,
            'contact': phone,
        },
    })


@api_view(['POST'])
@permission_classes([IsResident])
def resident_subscription_verify(request):
    """Verify Razorpay subscription payment signature and activate mandate."""
    resident = _get_resident(request)
    if not resident:
        return Response({'success': False, 'message': 'Resident not found.'}, status=404)

    razorpay_payment_id = request.data.get('razorpay_payment_id', '').strip()
    razorpay_subscription_id = request.data.get('razorpay_subscription_id', '').strip()
    razorpay_signature = request.data.get('razorpay_signature', '').strip()

    if not razorpay_payment_id or not razorpay_subscription_id or not razorpay_signature:
        return Response({'success': False, 'message': 'razorpay_payment_id, razorpay_subscription_id, and razorpay_signature are required.'}, status=400)

    try:
        mandate = RecurringMandate.objects.get(
            gateway_subscription_id=razorpay_subscription_id,
            resident=resident,
        )
    except RecurringMandate.DoesNotExist:
        return Response({'success': False, 'message': 'Mandate not found.'}, status=404)

    # Idempotency
    if mandate.status == 'active':
        return Response({'success': True, 'type': 'mandate'})

    try:
        client = _get_razorpay_client()
        client.utility.verify_subscription_payment_signature({
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_subscription_id': razorpay_subscription_id,
            'razorpay_signature': razorpay_signature,
        })
    except razorpay.errors.SignatureVerificationError:
        return Response({'success': False, 'message': 'Subscription signature verification failed.'}, status=400)
    except Exception as e:
        logger.error(f'[SUBSCRIPTION_VERIFY] Error: {e}')
        return Response({'success': False, 'message': 'Verification error.'}, status=500)

    mandate.status = 'active'
    today = date.today()
    if today.month < 12:
        next_month_1st = today.replace(month=today.month + 1, day=1)
    else:
        next_month_1st = today.replace(year=today.year + 1, month=1, day=1)
    mandate.next_charge_date = max(next_month_1st, mandate.start_date)
    mandate.save()

    return Response({'success': True, 'type': 'mandate'})


@api_view(['GET'])
@permission_classes([IsResident])
def resident_mandate_status(request):
    """Get the current auto-pay mandate status for the authenticated resident."""
    resident = _get_resident(request)
    if not resident:
        return Response({'success': False, 'message': 'Resident not found.'}, status=404)

    mandate = RecurringMandate.objects.filter(
        resident=resident, status__in=['active', 'initiated']
    ).order_by('-created_at').first()

    if not mandate:
        return Response({'success': True, 'hasMandate': False})

    return Response({
        'success': True,
        'hasMandate': True,
        'mandate': {
            'id': mandate.id,
            'status': mandate.status,
            'billingAmount': str(mandate.billing_amount),
            'startDate': mandate.start_date.isoformat(),
            'endDate': mandate.end_date.isoformat(),
            'nextChargeDate': mandate.next_charge_date.isoformat() if mandate.next_charge_date else None,
            'lastChargedDate': mandate.last_charged_date.isoformat() if mandate.last_charged_date else None,
            'createdAt': mandate.created_at.isoformat(),
        },
    })


@api_view(['POST'])
@permission_classes([IsResident])
def resident_mandate_cancel(request):
    """Cancel the active recurring mandate — RBI requires residents can cancel at any time."""
    resident = _get_resident(request)
    if not resident:
        return Response({'success': False, 'message': 'Resident not found.'}, status=404)

    mandate = RecurringMandate.objects.filter(
        resident=resident, status='active'
    ).order_by('-created_at').first()

    if not mandate:
        return Response({
            'success': False,
            'message': 'No active auto-pay mandate found.',
        }, status=404)

    # Cancel subscription on Razorpay
    if mandate.gateway_subscription_id:
        try:
            client = _get_razorpay_client()
            client.subscription.cancel(mandate.gateway_subscription_id)
        except Exception as e:
            logger.warning(f'Razorpay subscription cancel failed: {e}')

    mandate.status = 'revoked'
    mandate.save()

    return Response({'success': True, 'message': 'Auto-pay mandate cancelled successfully.'})


# ─── Invoices ─────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsResident])
def resident_invoice_detail(request, pk):
    """Handle GET /resident/invoice/<pk>/ — return full invoice details for a specific rent record.

    Args:
        request: DRF Request.
        pk: Primary key of the rent record belonging to this resident.

    Returns:
        Response with detailed invoice data including rent amount, delay charges,
        payment status, and property/room context.
    """
    resident = _get_resident(request)
    if not resident:
        return Response({'success': False, 'message': 'resident not found.'}, status=404)

    try:
        record = resident_Rent_Data.objects.get(id=pk, resident_data_instance=resident)
    except resident_Rent_Data.DoesNotExist:
        return Response({'success': False, 'message': 'Invoice not found.'}, status=404)

    bed = resident.bed_data_instance
    property_name = room_no = ''
    if bed and hasattr(bed, 'room') and bed.room:
        room_no = bed.room.roomNo or ''
        if hasattr(bed.room, 'property') and bed.room.property:
            property_name = bed.room.property.propertyName or ''

    return Response({
        'success': True,
        'invoice': {
            'id': record.id,
            'month': record.month,
            'rent': record.rent,
            'delayCharges': record.delayCharges,
            'rentStatus': record.rentStatus,
            'transferType': record.transferType,
            'utrNumber': record.utrNumber,
            'transferredDate': record.transferredDate,
            'residentName': resident.residentsName,
            'phoneNumber': resident.phoneNumber,
            'propertyName': property_name,
            'roomNo': room_no,
            'bedLabel': bed.bedLabel if bed else '',
            'rentPerMonth': resident.rentPerMonth,
        },
    })


# ─── Complaints ────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsResident])
def resident_complaints(request):
    """Handle GET /resident/complaints/ — list all maintenance complaints for the resident.

    Returns:
        Response with `complaints` list including category, location, urgency, latest
        status, and ticket number for each complaint.
    """
    resident = _get_resident(request)
    if not resident:
        return Response({'success': False, 'message': 'resident not found.'}, status=404)

    complaints = PropertyComplaintDetail.objects.filter(
        propertyComplaint_bed=resident
    ).prefetch_related('complaint').order_by('-id')

    data = []
    for c in complaints:
        categories = c.complaint.all()
        latest_cat = categories.order_by('-id').first()
        data.append({
            'id': c.id,
            'category': c.category,
            'location': c.location,
            'urgency': c.urgency,
            'issueDesc': c.issueDesc,
            'preferredTime': c.preferredTime,
            'submittedAt': c.submittedDateAndTime.strftime('%Y-%m-%d %H:%M') if c.submittedDateAndTime else '',
            'latestStatus': latest_cat.status if latest_cat else 'Open',
            'latestCategory': latest_cat.category_type if latest_cat else None,
            'ticketNumber': latest_cat.ticket_number if latest_cat else None,
        })

    return Response({'success': True, 'complaints': data})


@api_view(['POST'])
@permission_classes([IsResident])
def resident_complaint_submit(request):
    """Handle POST /resident/complaints/submit/ — create a new maintenance complaint.

    Args:
        request: DRF Request with JSON body containing `category`, `location`, `urgency`,
            `issueDesc`, and optional `preferredTime`.

    Returns:
        Response with `success` flag and `complaintId` on success. Requires approved KYC.
    """
    resident = _get_resident(request)
    if not resident:
        return Response({'success': False, 'message': 'resident not found.'}, status=404)

    if resident.kycApprovalStatus != 'Approved':
        return Response({'success': False, 'message': 'KYC must be approved to submit complaints.'},
                        status=status.HTTP_403_FORBIDDEN)

    data = request.data
    category = data.get('category', '').strip()
    location = data.get('location', '').strip()
    urgency = data.get('urgency', '').strip()
    issue_desc = data.get('issueDesc', '').strip()
    preferred_time = data.get('preferredTime', '').strip()

    valid_categories = [c[0] for c in PropertyComplaintDetail.CATEGORY_CHOICES]
    valid_locations = [l[0] for l in PropertyComplaintDetail.LOCATION_CHOICES]
    valid_urgencies = [u[0] for u in PropertyComplaintDetail.URGENCY_CHOICES]

    if not category or category not in valid_categories:
        return Response({'success': False, 'message': 'A valid category is required.'}, status=400)
    if not location or location not in valid_locations:
        return Response({'success': False, 'message': 'A valid location is required.'}, status=400)
    if not urgency or urgency not in valid_urgencies:
        return Response({'success': False, 'message': 'A valid urgency level is required.'}, status=400)
    if not issue_desc:
        return Response({'success': False, 'message': 'Issue description is required.'}, status=400)

    complaint = PropertyComplaintDetail.objects.create(
        propertyComplaint_bed=resident,
        residentsName=resident.residentsName,
        phoneNumber=resident.phoneNumber,
        category=category,
        location=location,
        urgency=urgency,
        issueDesc=issue_desc,
        preferredTime=preferred_time,
    )

    return Response({'success': True, 'message': 'Maintenance request submitted successfully.', 'complaintId': complaint.id})


@api_view(['GET'])
@permission_classes([IsResident])
def resident_complaint_detail(request, pk):
    """Handle GET /resident/complaints/<pk>/ — return full detail of a single complaint.

    Args:
        request: DRF Request.
        pk: Primary key of the complaint belonging to this resident.

    Returns:
        Response with complaint metadata, all category updates with ticket numbers and
        vendor info, and any associated feedback entries.
    """
    resident = _get_resident(request)
    if not resident:
        return Response({'success': False, 'message': 'resident not found.'}, status=404)

    try:
        complaint = PropertyComplaintDetail.objects.prefetch_related(
            'complaint__complaint_vendor',
            'complaint__complaint_feedback',
        ).get(id=pk, propertyComplaint_bed=resident)
    except PropertyComplaintDetail.DoesNotExist:
        return Response({'success': False, 'message': 'Complaint not found.'}, status=404)

    categories = []
    for cat in complaint.complaint.all().order_by('id'):
        feedbacks = []
        for fb in cat.complaint_feedback.all():
            feedbacks.append({
                'issueResolved': fb.issueResolved,
                'ratings': fb.ratings,
                'suggestions': fb.suggestions,
            })
        categories.append({
            'id': cat.id,
            'category_type': cat.category_type,
            'ticket_number': cat.ticket_number,
            'items': cat.items,
            'vendor': cat.complaint_vendor.vendor if cat.complaint_vendor else None,
            'status': cat.status,
            'comments': cat.comments,
            'feedbacks': feedbacks,
        })

    return Response({
        'success': True,
        'complaint': {
            'id': complaint.id,
            'rawCategory': complaint.category or '',
            'category': complaint.get_category_display() if complaint.category else '',
            'location': complaint.get_location_display() if complaint.location else '',
            'urgency': complaint.get_urgency_display() if complaint.urgency else '',
            'issueDesc': complaint.issueDesc,
            'preferredTime': complaint.preferredTime,
            'residentsName': complaint.residentsName,
            'submittedAt': complaint.submittedDateAndTime.strftime('%d %b %Y, %I:%M %p') if complaint.submittedDateAndTime else '',
            'categories': categories,
        },
    })


# ─── Lease Agreement ──────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsResident])
def resident_lease(request):
    """Handle GET /resident/lease/ — return lease documents and signing requests for the resident.

    Returns:
        Response with `documents` list (each with signing request status and URL) and
        a direct `leaseAgreement` upload if present on the resident profile.
    """
    resident = _get_resident(request)
    if not resident:
        return Response({'success': False, 'message': 'resident not found.'}, status=404)

    from stayease_sales.models import Document, SigningRequest

    # Find documents linked to resident's email
    docs = Document.objects.filter(recipient_email=resident.email).order_by('-created_at')
    data = []
    for doc in docs:
        signing_reqs = SigningRequest.objects.filter(document=doc)
        data.append({
            'id': doc.id,
            'title': doc.title,
            'pdfUrl': doc.pdf_file.url if doc.pdf_file else None,
            'recipientName': doc.recipient_name,
            'createdAt': doc.created_at.isoformat(),
            'signingRequests': [{
                'requestId': sr.request_id,
                'signingUrl': sr.signing_url,
                'status': sr.status,
                'sentAt': sr.sent_at.isoformat(),
            } for sr in signing_reqs],
        })

    # Include direct lease agreement from resident profile
    lease_agreement = None
    if resident.leaseAgreement:
        lease_agreement = {
            'pdfUrl': resident.leaseAgreement.url,
            'uploadedAt': resident.leaseUploadedAt.isoformat() if resident.leaseUploadedAt else None,
            'uploadedBy': resident.leaseUploadedBy,
        }

    return Response({'success': True, 'documents': data, 'leaseAgreement': lease_agreement})


# ─── Push Token ───────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsResident])
def resident_register_push_token(request):
    """Handle POST /resident/push-token/ — save an Expo push notification token for the resident.

    Args:
        request: DRF Request with JSON body containing `pushToken`.

    Returns:
        Response with `success` flag and a confirmation message.
    """
    resident = _get_resident(request)
    if not resident:
        return Response({'success': False, 'message': 'resident not found.'}, status=404)

    token = request.data.get('pushToken', '').strip()
    if not token:
        return Response({'success': False, 'message': 'Push token is required.'}, status=400)

    resident.pushNotificationToken = token
    resident.save(update_fields=['pushNotificationToken'])
    return Response({'success': True, 'message': 'Push token registered.'})
