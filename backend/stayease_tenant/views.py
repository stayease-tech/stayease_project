import json
import hashlib
import uuid
from datetime import datetime
from decimal import Decimal, InvalidOperation

from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core.mail import EmailMessage
from django.conf import settings

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView

from stayease_sales.models import Tenant_Data, Tenant_Rent_Data
from stayease_operations.models import PropertyComplaintDetail, ComplaintCategory, Feedback


# ─── Tenant Login (JWT) ───────────────────────────────────────────

class TenantLoginView(APIView):
    """Phone + password login → JWT tokens + tenant info."""
    authentication_classes = []
    permission_classes = []

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
            tenant = Tenant_Data.objects.get(tenantUser=user)
        except Tenant_Data.DoesNotExist:
            return Response({'success': False, 'message': 'No tenant account linked to this user.'},
                            status=status.HTTP_404_NOT_FOUND)

        refresh = RefreshToken.for_user(user)
        return Response({
            'success': True,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user_type': 'tenant',
            'phone': phone,
            'tenant_id': tenant.id,
            'residentsName': tenant.residentsName,
            'kycApprovalStatus': tenant.kycApprovalStatus,
            'tenantStatus': tenant.tenantStatus,
        })


# ─── Helper: get tenant from JWT user ─────────────────────────────

def _get_tenant(request):
    """Return the Tenant_Data linked to the authenticated JWT user."""
    try:
        return Tenant_Data.objects.select_related('bed_data_instance__room__property__owner').get(tenantUser=request.user)
    except Tenant_Data.DoesNotExist:
        return None


# ─── Dashboard ─────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tenant_dashboard(request):
    tenant = _get_tenant(request)
    if not tenant:
        return Response({'success': False, 'message': 'Tenant not found.'}, status=404)

    # Rent records
    rent_records = Tenant_Rent_Data.objects.filter(tenant_data_instance=tenant).order_by('-submittedDateAndTime')
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

    # Complaints count
    complaint_count = PropertyComplaintDetail.objects.filter(propertyComplaint_bed=tenant).count()
    open_complaints = ComplaintCategory.objects.filter(
        complaint__propertyComplaint_bed=tenant, status__in=['Open', 'Follow Up']
    ).count()

    # Property info
    bed = tenant.bed_data_instance
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
        'kycApprovalStatus': tenant.kycApprovalStatus,
        'tenantStatus': tenant.tenantStatus,
        'residentsName': tenant.residentsName,
        'totalDue': total_due,
        'nextDueDate': next_due.strftime('%Y-%m-%d'),
        'pendingRentCount': pending_rent.count(),
        'totalComplaints': complaint_count,
        'openComplaints': open_complaints,
        'propertyName': property_name,
        'roomNo': room_no,
        'bedLabel': bed_label,
        'checkIn': tenant.checkIn,
        'checkOut': tenant.checkOut,
        'rentPerMonth': tenant.rentPerMonth,
    })


# ─── Profile ───────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tenant_profile(request):
    tenant = _get_tenant(request)
    if not tenant:
        return Response({'success': False, 'message': 'Tenant not found.'}, status=404)

    bed = tenant.bed_data_instance
    property_name = room_no = bed_label = property_address = ''
    if bed:
        bed_label = bed.bedLabel or ''
        if hasattr(bed, 'room') and bed.room:
            room_no = bed.room.roomNo or ''
            if hasattr(bed.room, 'property') and bed.room.property:
                prop = bed.room.property
                property_name = prop.propertyName or ''
                property_address = f"{prop.doorNo or ''}, {prop.streetName or ''}, {prop.areaName or ''}, {prop.city or ''}"

    return Response({
        'success': True,
        'residentsName': tenant.residentsName,
        'phoneNumber': tenant.phoneNumber,
        'email': tenant.email,
        'permanentAddress': tenant.permanentAddress,
        'propertyName': property_name,
        'propertyAddress': property_address,
        'roomNo': room_no,
        'bedLabel': bed_label,
        'checkIn': tenant.checkIn,
        'checkOut': tenant.checkOut,
        'rentPerMonth': tenant.rentPerMonth,
        'totalDepositPaid': tenant.totalDepositPaid,
        'comfortClass': tenant.comfortClass,
        'mealType': tenant.mealType,
        'kycApprovalStatus': tenant.kycApprovalStatus,
        'tenantStatus': tenant.tenantStatus,
    })


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def tenant_profile_update(request):
    tenant = _get_tenant(request)
    if not tenant:
        return Response({'success': False, 'message': 'Tenant not found.'}, status=404)

    data = request.data
    updatable = ['residentsName', 'email', 'permanentAddress']
    for field in updatable:
        val = data.get(field)
        if val is not None:
            setattr(tenant, field, val)
    tenant.save()

    # Sync first_name on auth.User
    if 'residentsName' in data:
        request.user.first_name = data['residentsName']
        request.user.save(update_fields=['first_name'])

    return Response({'success': True, 'message': 'Profile updated successfully.'})


# ─── Change Password ───────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def tenant_change_password(request):
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def tenant_kyc_upload(request):
    tenant = _get_tenant(request)
    if not tenant:
        return Response({'success': False, 'message': 'Tenant not found.'}, status=404)

    if tenant.kycApprovalStatus == 'Approved':
        return Response({'success': False, 'message': 'KYC is already approved.'}, status=400)

    # Handle file uploads
    files = request.FILES
    data = request.POST

    if 'aadharFrontCopy' in files:
        tenant.aadharFrontCopy = files['aadharFrontCopy']
    if 'aadharBackCopy' in files:
        tenant.aadharBackCopy = files['aadharBackCopy']
    if data.get('aadharNumber'):
        tenant.aadharNumber = data['aadharNumber']

    if 'panFrontCopy' in files:
        tenant.panFrontCopy = files['panFrontCopy']
    if 'panBackCopy' in files:
        tenant.panBackCopy = files['panBackCopy']
    if data.get('panNumber'):
        tenant.panNumber = data['panNumber']

    if 'studentEmployeeIdCopy' in files:
        tenant.studentEmployeeIdCopy = files['studentEmployeeIdCopy']
    if data.get('studentEmployeeIdType'):
        tenant.studentEmployeeIdType = data['studentEmployeeIdType']
    if data.get('studentEmployeeIdNumber'):
        tenant.studentEmployeeIdNumber = data['studentEmployeeIdNumber']

    # Reset to Pending if previously rejected so operations can re-review
    if tenant.kycApprovalStatus == 'Rejected':
        tenant.kycApprovalStatus = 'Pending'
        tenant.kycRejectionReason = None

    tenant.save()
    return Response({'success': True, 'message': 'KYC documents uploaded successfully.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tenant_kyc_status(request):
    tenant = _get_tenant(request)
    if not tenant:
        return Response({'success': False, 'message': 'Tenant not found.'}, status=404)

    return Response({
        'success': True,
        'kycApprovalStatus': tenant.kycApprovalStatus,
        'kycApprovedBy': tenant.kycApprovedBy,
        'kycApprovalDate': tenant.kycApprovalDate.isoformat() if tenant.kycApprovalDate else None,
        'kycRejectionReason': tenant.kycRejectionReason,
        'aadharNumber': tenant.aadharNumber,
        'aadharFrontCopy': tenant.aadharFrontCopy.url if tenant.aadharFrontCopy else None,
        'aadharBackCopy': tenant.aadharBackCopy.url if tenant.aadharBackCopy else None,
        'panNumber': tenant.panNumber,
        'panFrontCopy': tenant.panFrontCopy.url if tenant.panFrontCopy else None,
        'panBackCopy': tenant.panBackCopy.url if tenant.panBackCopy else None,
        'studentEmployeeIdType': tenant.studentEmployeeIdType,
        'studentEmployeeIdNumber': tenant.studentEmployeeIdNumber,
        'studentEmployeeIdCopy': tenant.studentEmployeeIdCopy.url if tenant.studentEmployeeIdCopy else None,
    })


# ─── Rent History / Invoices ──────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tenant_rent_history(request):
    tenant = _get_tenant(request)
    if not tenant:
        return Response({'success': False, 'message': 'Tenant not found.'}, status=404)

    records = Tenant_Rent_Data.objects.filter(tenant_data_instance=tenant).order_by('-submittedDateAndTime')
    data = []
    for r in records:
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

    return Response({'success': True, 'rentRecords': data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def tenant_payu_init(request):
    tenant = _get_tenant(request)
    if not tenant:
        return Response({'success': False, 'message': 'Tenant not found.'}, status=404)

    amount_raw = str(request.data.get('amount', '')).strip()
    try:
        amount = Decimal(amount_raw)
    except (InvalidOperation, TypeError):
        return Response({'success': False, 'message': 'Amount must be a valid number.'}, status=400)

    if amount <= 0:
        return Response({'success': False, 'message': 'Amount must be greater than zero.'}, status=400)

    payu_config = getattr(settings, 'PAYU_CONFIG', {})
    merchant_key = (payu_config.get('merchant_key') or '').strip()
    merchant_salt = (payu_config.get('merchant_salt') or '').strip()
    payu_base_url = (payu_config.get('base_url') or '').strip()
    success_url = (payu_config.get('success_url') or '').strip()
    failure_url = (payu_config.get('failure_url') or '').strip()

    if not merchant_key or not merchant_salt or not payu_base_url:
        return Response({
            'success': False,
            'message': 'Payment service is not configured yet. Please contact support.',
        }, status=503)

    txn_id = str(request.data.get('txnId') or f"SE{uuid.uuid4().hex[:18]}")
    product_info = str(request.data.get('productInfo') or 'Rent Payment').strip()[:100]
    firstname = (tenant.residentsName or request.user.first_name or 'Tenant').strip()
    email = (tenant.email or '').strip()
    phone = str(tenant.phoneNumber or request.user.username or '').strip()

    amount_str = f"{amount:.2f}"
    hash_sequence = "|".join([
        merchant_key,
        txn_id,
        amount_str,
        product_info,
        firstname,
        email,
        '', '', '', '', '', '', '', '', '', '',
        merchant_salt,
    ])
    payu_hash = hashlib.sha512(hash_sequence.encode('utf-8')).hexdigest()

    return Response({
        'success': True,
        'paymentProvider': 'payu',
        'payuBaseUrl': payu_base_url,
        'paymentData': {
            'key': merchant_key,
            'txnid': txn_id,
            'amount': amount_str,
            'productinfo': product_info,
            'firstname': firstname,
            'email': email,
            'phone': phone,
            'surl': success_url,
            'furl': failure_url,
            'hash': payu_hash,
            'udf1': str(tenant.id),
            'udf2': str(request.user.id),
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tenant_invoice_detail(request, pk):
    tenant = _get_tenant(request)
    if not tenant:
        return Response({'success': False, 'message': 'Tenant not found.'}, status=404)

    try:
        record = Tenant_Rent_Data.objects.get(id=pk, tenant_data_instance=tenant)
    except Tenant_Rent_Data.DoesNotExist:
        return Response({'success': False, 'message': 'Invoice not found.'}, status=404)

    bed = tenant.bed_data_instance
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
            'tenantName': tenant.residentsName,
            'phoneNumber': tenant.phoneNumber,
            'propertyName': property_name,
            'roomNo': room_no,
            'bedLabel': bed.bedLabel if bed else '',
            'rentPerMonth': tenant.rentPerMonth,
        },
    })


# ─── Complaints ────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tenant_complaints(request):
    tenant = _get_tenant(request)
    if not tenant:
        return Response({'success': False, 'message': 'Tenant not found.'}, status=404)

    complaints = PropertyComplaintDetail.objects.filter(
        propertyComplaint_bed=tenant
    ).prefetch_related('complaint_category').order_by('-id')

    data = []
    for c in complaints:
        categories = c.complaint_category.all()
        latest_cat = categories.order_by('-id').first()
        data.append({
            'id': c.id,
            'issueDesc': c.issueDesc,
            'preferredTime': c.preferredTime,
            'latestStatus': latest_cat.status if latest_cat else 'Open',
            'latestCategory': latest_cat.category_type if latest_cat else None,
            'ticketNumber': latest_cat.ticket_number if latest_cat else None,
        })

    return Response({'success': True, 'complaints': data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def tenant_complaint_submit(request):
    tenant = _get_tenant(request)
    if not tenant:
        return Response({'success': False, 'message': 'Tenant not found.'}, status=404)

    if tenant.kycApprovalStatus != 'Approved':
        return Response({'success': False, 'message': 'KYC must be approved to submit complaints.'},
                        status=status.HTTP_403_FORBIDDEN)

    data = request.data
    issue_desc = data.get('issueDesc', '').strip()
    preferred_time = data.get('preferredTime', '').strip()

    if not issue_desc:
        return Response({'success': False, 'message': 'Issue description is required.'}, status=400)

    complaint = PropertyComplaintDetail.objects.create(
        propertyComplaint_bed=tenant,
        residentsName=tenant.residentsName,
        phoneNumber=tenant.phoneNumber,
        issueDesc=issue_desc,
        preferredTime=preferred_time,
    )

    return Response({'success': True, 'message': 'Complaint submitted successfully.', 'complaintId': complaint.id})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tenant_complaint_detail(request, pk):
    tenant = _get_tenant(request)
    if not tenant:
        return Response({'success': False, 'message': 'Tenant not found.'}, status=404)

    try:
        complaint = PropertyComplaintDetail.objects.prefetch_related(
            'complaint_category__complaint_vendor',
            'complaint_category__complaint_feedback',
        ).get(id=pk, propertyComplaint_bed=tenant)
    except PropertyComplaintDetail.DoesNotExist:
        return Response({'success': False, 'message': 'Complaint not found.'}, status=404)

    categories = []
    for cat in complaint.complaint_category.all().order_by('id'):
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
            'issueDesc': complaint.issueDesc,
            'preferredTime': complaint.preferredTime,
            'residentsName': complaint.residentsName,
            'categories': categories,
        },
    })


# ─── Lease Agreement ──────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tenant_lease(request):
    tenant = _get_tenant(request)
    if not tenant:
        return Response({'success': False, 'message': 'Tenant not found.'}, status=404)

    from stayease_sales.models import Document, SigningRequest

    # Find documents linked to tenant's email
    docs = Document.objects.filter(recipient_email=tenant.email).order_by('-created_at')
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

    return Response({'success': True, 'documents': data})


# ─── Push Token ───────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def tenant_register_push_token(request):
    tenant = _get_tenant(request)
    if not tenant:
        return Response({'success': False, 'message': 'Tenant not found.'}, status=404)

    token = request.data.get('pushToken', '').strip()
    if not token:
        return Response({'success': False, 'message': 'Push token is required.'}, status=400)

    tenant.pushNotificationToken = token
    tenant.save(update_fields=['pushNotificationToken'])
    return Response({'success': True, 'message': 'Push token registered.'})
