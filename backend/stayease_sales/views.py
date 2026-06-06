import json
import math
import calendar
from datetime import date, datetime, timedelta
from django.utils import timezone
from django.db import transaction
from django.http import JsonResponse
from django.db.models import Prefetch
from django.core.mail import EmailMessage
from django.db.models import Sum, FloatField
from django.db.models.functions import Cast
from dateutil.relativedelta import relativedelta
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.files.storage import default_storage
from django.core.exceptions import ValidationError
from .models import User_Activity_Data, User_Login_Data, resident_Data, resident_Rent_Data, Leads_Detail, Document, SigningRequest, PaymentTransaction, PaymentRefund
from stayease_supply.models import Property_Data, Room_Data, Bed_Data
from stayease_accounts.models import Expense_Detail, Expense_Category_Detail
from .service import ZohoESignService

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from stayease_project.permissions import IsSalesTeam, IsOperationsTeam, IsAdminGroup
from rest_framework import status

DATE_MIN = date(1900, 1, 1)
DATE_MAX = date(2099, 12, 31)

# Create your views here.
@login_required
def auth_check(request):
    """Handle GET /auth/check/ — verify whether the current session user is authenticated.

    Returns:
        JsonResponse with ``isAuthenticated`` bool and ``username`` if logged in.
    """
    if request.user.is_authenticated:
        return JsonResponse({"isAuthenticated": True, "username": request.user.username})
    return JsonResponse({"isAuthenticated": False})
    
@csrf_exempt
def login_view(request):
    """Handle POST /login/ — authenticate a staff user and create a login activity record.

    Args:
        request: Django HttpRequest with JSON body containing ``username`` and ``password``.

    Returns:
        JsonResponse with ``success``, ``username``, ``permissions``, and ``login_id`` on success,
        or an error message with HTTP 400 on failure.
    """
    data = json.loads(request.body)
    username = data.get("username")
    password = data.get("password")
    
    user = authenticate(request, username=username, password=password)

    if user is not None:
        login(request, user)
        permissions = list(user.get_all_permissions())

        user_activity_data_instance, created = User_Activity_Data.objects.get_or_create(
            username=user.username,
            useremail=user.email,
        )

        user_activity_data_instance.save()

        user_login_instance = User_Login_Data.objects.create(
            user_activity_instance=user_activity_data_instance,
            login_time=timezone.now()
        )

        return JsonResponse({"success": True, "username": user.username, "useremail": user.email, "permissions": permissions, "login_id": user_login_instance.id})

    return JsonResponse({"success": False, "message": "Invalid credentials"}, status=400)

def logout_view(request):
    """Handle POST /logout/ — end the user session and stamp the logout time on the login record.

    Args:
        request: Django HttpRequest with optional JSON body containing ``loginId``.

    Returns:
        JsonResponse with ``success`` bool.
    """
    if request.method != 'POST':
        return JsonResponse({"success": False, "message": "Invalid request method. POST expected."}, status=405)

    try:
        data = json.loads(request.body or '{}')
    except json.JSONDecodeError:
        data = {}

    login_id = data.get("loginId")
    if login_id:
        login_instance = User_Login_Data.objects.filter(id=login_id).first()
        if login_instance and not login_instance.logout_time:
            login_instance.logout_time = timezone.now()
            login_instance.save(update_fields=["logout_time"])

    logout(request)
    return JsonResponse({"success": True})

def get_user_activity_data(request):
    """Handle GET /user-activity/ — return all staff users with their full login/logout history.

    Returns:
        JsonResponse with ``user_activity_data`` list on success, or an error message.
    """
    if request.method == 'GET':
        try:
            user_activity_data = User_Activity_Data.objects.prefetch_related(
                Prefetch('user_activity', queryset=User_Login_Data.objects.order_by('login_time'))
            ).all()

            data = []

            for user_data in user_activity_data:
                data.append({
                    "id": user_data.id,
                    "username": user_data.username,
                    "useremail": user_data.useremail,
                    "login_data": [
                        {
                            "id": login_data.id,
                            "login_time": login_data.login_time,
                            "logout_time": login_data.logout_time
                        }
                        for login_data in user_data.user_activity.all()
                    ]
                })

            return JsonResponse({'success': True, 'user_activity_data': data})
            
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': 'Error fetching data. Please try again later!'})
        
    return JsonResponse({'success': False, 'message': 'Invalid request method. GET expected!'})

def get_resident_deductions(resident, room):
    """Calculate the total check-out deductions charged to a resident for a given room.

    Args:
        resident: Resident name string used to filter expense records.
        room: Room number string used to filter expense records.

    Returns:
        Float representing the grand total of all applicable deduction amounts including GST.
    """
    expense_query = Expense_Detail.objects.filter(
        headOfExpense='Resident',
        expenseType='Check-Out Deductions'
    )

    if room:
        expense_query = expense_query.filter(room=room)

    if resident:
        expense_query = expense_query.filter(resident=resident)

    total = (Expense_Category_Detail.objects
                .filter(expense_instance__in=expense_query)
                .annotate(
                    amount_num=Cast('amount', FloatField()),
                    gst_num=Cast('gst', FloatField()),
                    total=Cast('amount', FloatField()) + Cast('gst', FloatField())
                )
                .aggregate(
                    grand_total=Sum('total')
                )['grand_total'] or 0
            )

    return total

def calculate_daily_value(day):
    """Return the delay charge amount (in rupees) based on the day-of-month a rent payment is made.

    Args:
        day: Integer day of month (1–31).

    Returns:
        Integer delay charge; zero for payments on or before the 5th.
    """
    if day <= 5:
        return 0
    elif 6 <= day <= 10:
        return (day - 5) * 100
    elif 11 <= day <= 20:
        return 500 + 250 * (day - 10)
    else:
        return 3000 + 500 * (day - 20)

def update_delay_charges_for_received_rents():
    """Recalculate and persist delay charges for all rent records whose status is 'Received'."""
    current_date = date.today()
    current_day = current_date.day
    
    received_rents = resident_Rent_Data.objects.filter(rentStatus='Received')
    
    updated_count = 0
    
    for rent_record in received_rents:
        try:
            delay_charges = 0
            
            if rent_record.transferredDate and rent_record.transferredDate.strip():
                try:
                    transferred_date_str = rent_record.transferredDate.strip()
                    transferred_date = datetime.strptime(transferred_date_str, "%Y-%m-%d").date()
                    day_of_payment = transferred_date.day
                    
                    delay_charges = calculate_daily_value(day_of_payment)
                                        
                except ValueError:
                    date_formats = ["%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y", "%m-%d-%Y", "%Y/%m/%d"]
                    parsed = False
                    
                    for date_format in date_formats:
                        try:
                            transferred_date = datetime.strptime(transferred_date_str, date_format).date()
                            day_of_payment = transferred_date.day
                            delay_charges = calculate_daily_value(day_of_payment)
                            parsed = True
                            break
                        except:
                            continue
                    
                    if not parsed:
                        delay_charges = calculate_daily_value(current_day)
            else:
                delay_charges = calculate_daily_value(current_day)
            
            old_charges = rent_record.delayCharges or "0"
            new_charges = str(delay_charges)
            
            if old_charges != new_charges:
                rent_record.delayCharges = new_charges
                rent_record.save(update_fields=['delayCharges', 'updatedDateAndTime'])
                updated_count += 1
            
        except Exception as e:
            print(f"Error updating record {rent_record.id}: {e}")
            import traceback
            traceback.print_exc()
    
def sync_rent_records_for_active_residents():
    """Ensure every active resident has a rent record for each month from check-in through today."""
    current_date = date.today()
    
    active_residents = resident_Data.objects.filter(residentStatus='Active')
    
    stats = {
        'total_active_residents': active_residents.count(),
        'records_created': 0,
        'residents_processed': 0
    }
    
    for resident in active_residents:
        if not resident.checkIn:
            continue
            
        try:
            checkin_date = resident.checkIn
            if isinstance(checkin_date, str):
                checkin_date = datetime.strptime(checkin_date, "%Y-%m-%d").date()
            
            start_month = checkin_date.replace(day=1)
            end_month = current_date.replace(day=1)
            
            expected_months = []
            current_month = start_month
            
            while current_month <= end_month:
                month_str = current_month.strftime("%B %Y")
                expected_months.append(month_str)
                current_month = current_month + relativedelta(months=1)
            
            existing_months = set(resident_Rent_Data.objects.filter(
                resident_data_instance=resident
            ).values_list('month', flat=True))
            
            months_to_create = [month for month in expected_months if month not in existing_months]
            
            if months_to_create:
                records_to_create = []
                for month_str in months_to_create:
                    records_to_create.append(
                        resident_Rent_Data(
                            resident_data_instance=resident,
                            month=month_str,
                            rent=resident.rentPerMonth,
                            delayCharges=calculate_daily_value(current_date.day)
                        )
                    )
                
                resident_Rent_Data.objects.bulk_create(records_to_create)
                stats['records_created'] += len(records_to_create)
            
            stats['residents_processed'] += 1
            
        except Exception as e:
            print(f"Error processing resident {resident.id}: {e}")
            continue
            
def calculate_rent_with_delay_charges_new_resident(checkIn, resident_instance):
    """Create monthly rent records with delay charges for a newly added resident from check-in to today.

    Args:
        checkIn: ISO date string (``YYYY-MM-DD``) representing the resident's check-in date.
        resident_instance: Unsaved or newly saved ``resident_Data`` instance to attach records to.
    """
    if resident_instance.pk is None:
        resident_instance.save()
    
    target_date = datetime.strptime(checkIn, "%Y-%m-%d").date()
    current_date = date.today()
    
    if target_date <= current_date:
        current_month_date = target_date.replace(day=1)
        end_month_date = current_date.replace(day=1)
        full_rent = int(resident_instance.rentPerMonth or 0)
        checkin_month = target_date.replace(day=1)

        while current_month_date <= end_month_date:
            # Current month: no delay charge — resident just registered and hasn't had a chance to pay
            is_current_month = (current_month_date == end_month_date)
            delay = 0 if is_current_month else calculate_daily_value(current_date.day)

            # Prorated rent for the check-in month if resident joins mid-month
            if current_month_date == checkin_month and target_date.day > 1:
                days_in_month = calendar.monthrange(target_date.year, target_date.month)[1]
                remaining_days = days_in_month - (target_date.day - 1)
                rent_amount = math.floor(full_rent / days_in_month * remaining_days)
            else:
                rent_amount = full_rent

            resident_rent_instance = resident_Rent_Data(
                resident_data_instance=resident_instance,
                month=current_month_date.strftime("%B %Y"),
                rent=rent_amount,
                delayCharges=delay,
            )
            resident_rent_instance.save()

            current_month_date = current_month_date + relativedelta(months=1)

def calculate_rent_with_delay_charges_update(checkIn, resident_instance):
    """Reconcile rent records after a resident update — adds missing months and removes months outside the stay range.

    Args:
        checkIn: ISO date string (``YYYY-MM-DD``) or date object for the resident's check-in.
        resident_instance: ``resident_Data`` instance whose rent records should be kept in sync.
    """
    if not checkIn:
        print("Error: checkIn is None or empty")
        return
    
    rent_records = resident_Rent_Data.objects.filter(
        resident_data_instance=resident_instance
    )
    
    checkin_date = checkIn
    if isinstance(checkin_date, str):
        checkin_date = datetime.strptime(checkin_date, "%Y-%m-%d").date()
    
    current_date = date.today()
    
    if not checkin_date:
        print("Error: checkin_date is None after conversion")
        return
    
    start_month = checkin_date.replace(day=1)
    end_month = current_date.replace(day=1)
    
    existing_months = set(rent_records.values_list('month', flat=True))
    
    expected_months = set()
    current_month = start_month
    
    while current_month <= end_month:
        expected_months.add(current_month)
        current_month = current_month + relativedelta(months=1)
    
    months_to_add = expected_months - existing_months
    months_to_remove = existing_months - expected_months
    
    full_rent = int(resident_instance.rentPerMonth or 0)
    checkin_month = checkin_date.replace(day=1)

    with transaction.atomic():
        if months_to_remove:
            resident_Rent_Data.objects.filter(
                resident_data_instance=resident_instance,
                month__in=list(months_to_remove)
            ).delete()

        for month_date in months_to_add:
            # Prorated rent for the check-in month if resident joins mid-month
            if month_date == checkin_month and checkin_date.day > 1:
                days_in_month = calendar.monthrange(checkin_date.year, checkin_date.month)[1]
                remaining_days = days_in_month - (checkin_date.day - 1)
                rent_amount = math.floor(full_rent / days_in_month * remaining_days)
            else:
                rent_amount = full_rent

            resident_Rent_Data.objects.create(
                resident_data_instance=resident_instance,
                month=month_date.strftime("%B %Y"),
                rent=rent_amount,
                delayCharges=calculate_daily_value(current_date.day)
            )
        
def is_current_month_in_range(start_date_str, end_date_str=None):
    """Check whether the current calendar month falls within the given date range.

    Args:
        start_date_str: ISO date string marking the start of the range.
        end_date_str: Optional ISO date string marking the end; defaults to the current month.

    Returns:
        ``True`` if the current month is within the range, ``False`` otherwise.
    """
    if not start_date_str:
        return False
    
    try:
        start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
        start_month = datetime(start_date.year, start_date.month, 1)
    except ValueError:
        return False
    
    current_date = timezone.now().date()
    current_month = datetime(current_date.year, current_date.month, 1)
    
    if not end_date_str:
        end_month = current_month
    else:
        try:
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
            end_month = datetime(end_date.year, end_date.month, 1)
        except ValueError:
            return False
    
    return start_month <= current_month <= end_month

today = timezone.now().date()

def update_bed_status_for_checked_out_residents():
    """Sync resident status (Active/Inactive) and bed salesStatus based on current checkout dates."""
    Bed_Data.objects.filter(bed_data_instance__isnull=True).update(salesStatus='Pending')
    
    residents = resident_Data.objects.select_related('bed_data_instance').all()
    
    if not residents.exists():
        return
    
    has_active_residents = False
    for resident in residents:
        try:
            if resident.checkOut and resident.checkOut.strip():
                check_out_date = datetime.strptime(resident.checkOut.strip(), '%Y-%m-%d').date()
                if check_out_date > today:
                    has_active_residents = True
                    break
            else:
                has_active_residents = True
                break
        except Exception as e:
            print(f"Error checking resident {resident.id}: {e}")
            continue
    
    residents_to_update = []
    beds_to_update = []
    
    for resident in residents:
        try:
            if resident.checkOut and resident.checkOut.strip():
                check_out_date = datetime.strptime(resident.checkOut.strip(), '%Y-%m-%d').date()
                is_active = (check_out_date > today)
            else:
                is_active = True
            
            resident.residentStatus = 'Active' if is_active else 'Inactive'
            residents_to_update.append(resident)
            
            if resident.bed_data_instance:
                resident.bed_data_instance.salesStatus = 'Completed' if has_active_residents else 'Pending'
                beds_to_update.append(resident.bed_data_instance)
                
        except Exception as e:
            print(f"Error processing resident {resident.id}: {e}")
    
    if residents_to_update:
        resident_Data.objects.bulk_update(residents_to_update, ['residentStatus'])
    
    if beds_to_update:
        Bed_Data.objects.bulk_update(beds_to_update, ['salesStatus'])

def get_beds_data(request):
    """Handle GET /beds/ — return all properties, rooms, and beds with their resident and rent records.

    Also triggers bed status sync, rent record sync, and delay charge recalculation on every request.

    Returns:
        JsonResponse with ``beds_table`` list containing nested property, room, bed, and resident data.
    """
    if request.method == 'GET':
        try:
            properties = Property_Data.objects.prefetch_related(
                Prefetch(
                    'property',
                    queryset=Room_Data.objects.prefetch_related(
                        Prefetch(
                            'room',
                            queryset=Bed_Data.objects.prefetch_related(
                                Prefetch(
                                    'bed_data_instance',
                                    queryset=resident_Data.objects.all()
                                )
                            )
                        )
                    )
                )
            )

            data = []

            for property in properties:
                for room in property.property.all():
                    for bed in room.room.all():
                        residents = list(bed.bed_data_instance.all())
                        
                        if residents:
                            for resident in residents:
                                resident_rent_list = []
                                for rent_data in resident.resident_data_instance.all():
                                    resident_rent_list.append({
                                        'id': rent_data.id,
                                        'month': rent_data.month,
                                        'rent': rent_data.rent,
                                        'rentStatus': rent_data.rentStatus,
                                        'delayCharges': rent_data.delayCharges,
                                        'transferType': rent_data.transferType,
                                        'utrNumber': rent_data.utrNumber,
                                        'transferredDate': rent_data.transferredDate,
                                        'submittedDateAndTime': rent_data.submittedDateAndTime,
                                        'updatedDateAndTime': rent_data.updatedDateAndTime,
                                        'last_activity': rent_data.last_activity
                                    })
                                
                                def month_sort_key(record):
                                    month_str = record['month']
                                    try:
                                        return datetime.strptime(month_str, "%B %Y")
                                    except:
                                        try:
                                            return datetime.strptime(month_str, "%b %Y")
                                        except:
                                            try:
                                                return datetime.strptime(month_str, "%Y-%m")
                                            except:
                                                return datetime.min
                                
                                resident_rent_list.sort(key=month_sort_key)
                                
                                data.append({
                                    'id': bed.id,
                                    'propertyName': property.propertyName,
                                    'propertyType': property.propertyType,
                                    'doorBuilding': property.doorBuilding,
                                    'streetAddress': property.streetAddress,
                                    'area': property.area,
                                    'state': property.state,
                                    'city': property.city,
                                    'pincode': property.pincode,
                                    'buildingLevel': room.buildingLevel,
                                    'roomNo': room.roomNo,
                                    'roomType': room.roomType,
                                    'room_id': bed.room_id,
                                    'bedLabel': bed.bedLabel,
                                    'balconyAccess': bed.balconyAccess,
                                    'bathAccess': bed.bathAccess,
                                    'bedRoomType': bed.roomType,
                                    'energyPlan': bed.energyPlan,
                                    'hallAccess': bed.hallAccess,
                                    'kitchenAccess': bed.kitchenAccess,
                                    'roomSqft': bed.roomSqft,
                                    'tataSkyNo': bed.tataSkyNo,
                                    'wifiNo': bed.wifiNo,
                                    'bescomMeterNo': bed.bescomMeterNo,
                                    'salesStatus': bed.salesStatus,
                                    'resident_data': {
                                        'id': resident.id,
                                        'bed_data_instance_id': resident.bed_data_instance_id,
                                        'propertyManager': resident.propertyManager,
                                        'salesManager': resident.salesManager,
                                        'comfortClass': resident.comfortClass,
                                        'mealType': resident.mealType,
                                        'residentsName': resident.residentsName,
                                        'phoneNumber': resident.phoneNumber,
                                        'email': resident.email,
                                        'permanentAddress': resident.permanentAddress,
                                        'kycType': resident.kycType,
                                        'aadharNumber': resident.aadharNumber,
                                        'aadharFrontCopy': resident.aadharFrontCopy.url if resident.aadharFrontCopy else '',
                                        'aadharBackCopy': resident.aadharBackCopy.url if resident.aadharBackCopy else '',
                                        'aadharStatus': resident.aadharStatus,
                                        'panNumber': resident.panNumber,
                                        'panFrontCopy': resident.panFrontCopy.url if resident.panFrontCopy else '',
                                        'panBackCopy': resident.panBackCopy.url if resident.panBackCopy else '',
                                        'panStatus': resident.panStatus,
                                        'checkIn': resident.checkIn,
                                        'checkOut': resident.checkOut,
                                        'totalDepositPaid': resident.totalDepositPaid,
                                        'rentPerMonth': resident.rentPerMonth,
                                        'residentStatus': resident.residentStatus,
                                        'moveInChecklistStatus': resident.moveInChecklistStatus,
                                        'moveInFeedbackStatus': resident.moveInFeedbackStatus,
                                        'moveOutChecklistStatus': resident.moveOutChecklistStatus,
                                        'moveOutFeedbackStatus': resident.moveOutFeedbackStatus,
                                        'residentDeductions': get_resident_deductions(resident.residentsName, resident.bed_data_instance.room.roomNo),
                                        'payoutDate': datetime.strptime(resident.checkOut, '%Y-%m-%d').date() + timedelta(days=45) if resident.checkOut else '',
                                        'submittedDateAndTime': resident.submittedDateAndTime,
                                        'updatedDateAndTime': resident.updatedDateAndTime,
                                        'rent_records': resident_rent_list
                                    }
                                })
                        else:
                            data.append({
                                'id': bed.id,
                                'propertyName': property.propertyName,
                                'propertyType': property.propertyType,
                                'doorBuilding': property.doorBuilding,
                                'streetAddress': property.streetAddress,
                                'area': property.area,
                                'state': property.state,
                                'city': property.city,
                                'pincode': property.pincode,
                                'buildingLevel': room.buildingLevel,
                                'roomNo': room.roomNo,
                                'roomType': room.roomType,
                                'room_id': bed.room_id,
                                'bedLabel': bed.bedLabel,
                                'balconyAccess': bed.balconyAccess,
                                'bathAccess': bed.bathAccess,
                                'bedRoomType': bed.roomType,
                                'energyPlan': bed.energyPlan,
                                'hallAccess': bed.hallAccess,
                                'kitchenAccess': bed.kitchenAccess,
                                'roomSqft': bed.roomSqft,
                                'tataSkyNo': bed.tataSkyNo,
                                'wifiNo': bed.wifiNo,
                                'bescomMeterNo': bed.bescomMeterNo,
                                'salesStatus': bed.salesStatus,
                                'resident_data': {}
                            })

            update_bed_status_for_checked_out_residents()
            sync_rent_records_for_active_residents()
            update_delay_charges_for_received_rents()

            return JsonResponse({'success': True, 'beds_table': data})
        except Exception as e:
            print (e)
            return JsonResponse({'success': False, 'message': 'Error fetching data. Please try again later!'})
        
    return JsonResponse({'success': False, 'message': 'Invalid request method. GET expected!'})

def validate_resident_dates(new_checkIn, new_checkOut, bed_instance, resident_instance=None):
    """Validate that the proposed check-in/out range does not overlap with any existing resident on the same bed.

    Args:
        new_checkIn: ISO date string for the proposed check-in.
        new_checkOut: ISO date string for the proposed check-out (may be empty/None).
        bed_instance: ``Bed_Data`` instance to check for conflicts.
        resident_instance: Optional existing ``resident_Data`` to exclude from the overlap check.

    Returns:
        ``True`` if dates are valid and non-overlapping, ``False`` otherwise.
    """
    def parse_date(date_str):
        if not date_str:
            return None
        try:
            return datetime.strptime(date_str, '%Y-%m-%d').date()
        except:
            return None
    
    def ranges_overlap(start1, end1, start2, end2):
        if start1 and start2:
            eff_end1 = end1 if end1 else timezone.now().date() + timezone.timedelta(days=365*10)
            eff_end2 = end2 if end2 else timezone.now().date() + timezone.timedelta(days=365*10)
            
            return not (eff_end1 < start2 or eff_end2 < start1)
        
        return False
    
    new_in = parse_date(new_checkIn)
    new_out = parse_date(new_checkOut)
    
    if new_in and new_out and new_out < new_in:
        return False
    
    existing_residents = bed_instance.bed_data_instance.all()
    if resident_instance:
        existing_residents = existing_residents.exclude(id=resident_instance.id)
    
    existing_residents = existing_residents.exclude(checkIn__isnull=True).exclude(checkIn='')
    
    for resident in existing_residents:
        exist_in = parse_date(resident.checkIn)
        exist_out = parse_date(resident.checkOut)
        
        if ranges_overlap(new_in, new_out, exist_in, exist_out):
            return False
    
    return True


def parse_and_validate_iso_date(date_str, field_label, required=False):
    """Parse and validate an ISO date string, enforcing YYYY-MM-DD format and a safe year range.

    Args:
        date_str: Raw date value from the request.
        field_label: Human-readable field name used in error messages.
        required: Whether a missing value should be treated as an error.

    Returns:
        Tuple of ``(raw_str, parsed_date, error_message)``; ``error_message`` is ``None`` on success.
    """
    raw = str(date_str or '').strip()
    if not raw:
        if required:
            return None, None, f'{field_label} is required.'
        return '', None, None

    try:
        parsed = datetime.strptime(raw, '%Y-%m-%d').date()
    except ValueError:
        return None, None, f'{field_label} must be in YYYY-MM-DD format.'

    if parsed < DATE_MIN or parsed > DATE_MAX:
        return None, None, f'{field_label} must be between 1900-01-01 and 2099-12-31.'

    return raw, parsed, None

@csrf_exempt
def resident_form_submit(request):
    """Handle POST /resident/ — create a new resident record, assign a bed, generate rent records, and create a portal user.

    Args:
        request: Django HttpRequest with JSON body containing resident details, ``bedId``, and date fields.

    Returns:
        JsonResponse with ``success`` bool, a status message, and ``residentCredentials`` on success.
    """
    if request.method == 'POST':
        try:
            resident_data = json.loads(request.body)

            bed_id = resident_data.get('bedId')
            if not bed_id:
                return JsonResponse({'success': False, 'message': 'Bed selection is required.'})

            bed_data_instance = Bed_Data.objects.get(id=bed_id)

            check_in_value, check_in_date, check_in_error = parse_and_validate_iso_date(
                resident_data.get('checkIn'),
                'Check-in date',
                required=True,
            )
            if check_in_error:
                return JsonResponse({'success': False, 'message': check_in_error})

            check_out_value, check_out_date, check_out_error = parse_and_validate_iso_date(
                resident_data.get('checkOut'),
                'Check-out date',
                required=False,
            )
            if check_out_error:
                return JsonResponse({'success': False, 'message': check_out_error})

            if check_in_date and check_out_date and check_out_date < check_in_date:
                return JsonResponse({'success': False, 'message': 'Check-out date cannot be before check-in date.'})

            phone_raw = str(resident_data.get('phoneNumber', '')).strip()
            phone_digits = ''.join(ch for ch in phone_raw if ch.isdigit())
            if len(phone_digits) != 10:
                return JsonResponse({'success': False, 'message': 'Phone number must be exactly 10 digits.'})

            # A resident portal user is keyed by phone number (username). Re-using the same
            # phone across multiple residents causes a one-to-one collision on residentUser.
            existing_phone_resident = resident_Data.objects.filter(
                phoneNumber=phone_digits,
                residentUser__isnull=False,
            ).first()
            if existing_phone_resident:
                return JsonResponse({
                    'success': False,
                    'message': 'A resident with this phone number already exists. Please use a different phone number.',
                })

            total_deposit = str(resident_data.get('totalDepositPaid', '')).strip() or '0'

            first_name = resident_data.get('firstName', '').strip()
            last_name = resident_data.get('lastName', '').strip()
            residents_name = resident_data.get('residentsName', '').strip()
            # Build residentsName from first/last if not explicitly provided
            if not residents_name and (first_name or last_name):
                residents_name = f"{first_name} {last_name}".strip()

            resident_instance = resident_Data(
                bed_data_instance = bed_data_instance,
                propertyManager = resident_data.get('propertyManager', ''),
                salesManager = resident_data.get('salesManager', ''),
                comfortClass = resident_data.get('comfortClass', ''),
                mealType = resident_data.get('mealType', ''),
                firstName = first_name,
                lastName = last_name,
                residentsName = residents_name,
                phoneNumber = phone_digits,
                email = resident_data.get('email', ''),
                permanentAddress = resident_data.get('permanentAddress', ''),
                kycType = resident_data.get('kycType', ''),
                aadharNumber = resident_data.get('aadharNumber', ''),
                aadharFrontCopy = resident_data.get('aadharFrontCopy', ''),
                aadharBackCopy = resident_data.get('aadharBackCopy', ''),
                aadharStatus = resident_data.get('aadharStatus', ''),
                panNumber = resident_data.get('panNumber', ''),
                panFrontCopy = resident_data.get('panFrontCopy', ''),
                panBackCopy = resident_data.get('panBackCopy', ''),
                panStatus = resident_data.get('panStatus', ''),
                checkIn = check_in_value,
                checkOut = check_out_value,
                totalDepositPaid = total_deposit,
                rentPerMonth = resident_data.get('rentPerMonth', ''),
            )

            if validate_resident_dates(check_in_value, check_out_value, bed_data_instance) == False:
                return JsonResponse({'success': False, 'message': 'Check-In or Check-Out dates are within existing Check-Ins and Check-Outs!'})

            with transaction.atomic():
                today = date.today()
                if check_out_date:
                    if check_out_date <= today:
                        bed_data_instance.salesStatus = 'Pending'
                        resident_instance.residentStatus = 'Inactive'
                    else:
                        bed_data_instance.salesStatus = 'Completed'
                        resident_instance.residentStatus = 'Active'
                        calculate_rent_with_delay_charges_new_resident(check_in_value, resident_instance)
                else:
                    bed_data_instance.salesStatus = 'Completed'
                    resident_instance.residentStatus = 'Active'
                    calculate_rent_with_delay_charges_new_resident(check_in_value, resident_instance)

                resident_instance.save()
                bed_data_instance.save()

                # Create Django auth user for resident portal access
                from stayease_resident.utils import create_resident_user
                user, plain_password = create_resident_user(resident_instance)

            return JsonResponse({
                'success': True,
                'message': 'resident data submitted successfully!',
                'residentCredentials': {
                    'username': resident_instance.phoneNumber,
                    'password': plain_password,
                },
            })
            
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': 'Error submitting data. Please try again later!'})
    
    return JsonResponse({'success': False, 'message': 'Invalid request method. POST expected!'})

@api_view(["PUT"])
@csrf_exempt
def resident_data_update(request, id):
    """Handle PUT /resident/<id>/ — update resident fields and files, sync bed status, and recalculate rent records.

    Args:
        request: Django HttpRequest with multipart form data containing updated fields and optional file uploads.
        id: Primary key of the ``resident_Data`` record to update.

    Returns:
        JsonResponse with ``success`` bool and a status message.
    """
    if request.method == 'PUT':
        try:
            submitted_data = request.POST
            uploaded_files = request.FILES

            resident_instance = resident_Data.objects.get(pk=id)

            updated_fields = []

            for field, new_value in submitted_data.items():
                if field == 'csrfmiddlewaretoken':
                    continue
                    
                if hasattr(resident_instance, field):
                    current_value = getattr(resident_instance, field)
                    
                    if current_value is None:
                        current_value_str = ''
                    else:
                        current_value_str = str(current_value)
                        
                    if str(new_value) != current_value_str:
                        setattr(resident_instance, field, new_value)
                        updated_fields.append(field)

            check_in_value, check_in_date, check_in_error = parse_and_validate_iso_date(
                resident_instance.checkIn,
                'Check-in date',
                required=False,
            )
            if check_in_error:
                return JsonResponse({'success': False, 'message': check_in_error})

            check_out_value, check_out_date, check_out_error = parse_and_validate_iso_date(
                resident_instance.checkOut,
                'Check-out date',
                required=False,
            )
            if check_out_error:
                return JsonResponse({'success': False, 'message': check_out_error})

            if check_in_date and check_out_date and check_out_date < check_in_date:
                return JsonResponse({'success': False, 'message': 'Check-out date cannot be before check-in date.'})

            resident_instance.checkIn = check_in_value
            resident_instance.checkOut = check_out_value

            if uploaded_files:
                for field, new_file in uploaded_files.items():
                    if hasattr(resident_instance, field):
                        existing_file = getattr(resident_instance, field)
                        
                        if existing_file:
                            try:
                                if default_storage.exists(existing_file.name):
                                    default_storage.delete(existing_file.name)
                            except Exception as e:
                                raise ValidationError(f"Error deleting old file {field}: {str(e)}")
                        
                        setattr(resident_instance, field, new_file)
                        updated_fields.append(field)

            bed_data_instance = Bed_Data.objects.get(id = submitted_data.get('bedId'))

            if validate_resident_dates(resident_instance.checkIn, resident_instance.checkOut, bed_data_instance, resident_instance) == False:
                return JsonResponse({'success': False, 'message': 'Check-In or Check-Out dates are within existing Check-Ins and Check-Outs!'})

            today = date.today()
            if 'checkOut' in updated_fields:
                if resident_instance.checkOut:
                    if check_out_date <= today:
                        bed_data_instance.salesStatus = 'Pending'
                        resident_instance.residentStatus = 'Inactive'
                    else:
                        bed_data_instance.salesStatus = 'Completed'
                        resident_instance.residentStatus = 'Active'
                    bed_data_instance.save()
                else:
                    bed_data_instance.salesStatus = 'Completed'
                    resident_instance.residentStatus = 'Active'
                    bed_data_instance.save()

            resident_instance.save()

            if resident_instance.residentStatus == 'Active' and resident_instance.checkIn:
                calculate_rent_with_delay_charges_update(resident_instance.checkIn, resident_instance)
            elif resident_instance.residentStatus == 'Active' and not resident_instance.checkIn:
                pass

            return JsonResponse({'success': True, 'message': 'resident data updated successfully!'})
        except Exception as e:
            print (e)
            return JsonResponse({'success': False, 'message': 'Error updating data. Please try again later!'})
        
    return JsonResponse({'success': False, 'message': 'Invalid request method. PUT expected!'})

@csrf_exempt
def rent_data_update(request, id):
    """Handle PUT /rent/<id>/ — update payment details for a monthly rent record and refresh delay charges.

    Args:
        request: Django HttpRequest with JSON body containing ``transferType``, ``utrNumber``, ``transferredDate``, and/or ``rentStatus``.
        id: Primary key of the ``resident_Rent_Data`` record to update.

    Returns:
        JsonResponse with ``success`` bool and a status message.
    """
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)

            FIELD_MAPPING = {
                'transferType': 'transferType',
                'utrNumber': 'utrNumber',
                'transferredDate': 'transferredDate',
            }

            instance = resident_Rent_Data.objects.get(pk=id)
            tracking_model = instance
            
            updates = {}
            for frontend_field, value in data.items():
                db_field = FIELD_MAPPING.get(frontend_field, frontend_field)
                    
                if hasattr(instance, db_field):
                    current_value = getattr(instance, db_field)
                    if current_value != value:
                        setattr(instance, db_field, value)
                        updates[db_field] = value

            if 'rentStatus' in updates:
                rent_status_value = data['rentStatus']
                if rent_status_value != 'Received':
                    if hasattr(instance, 'transferType'):
                        instance.transferType = ''
                        updates.append('transferType')
                    if hasattr(instance, 'utrNumber'):
                        instance.utrNumber = ''
                        updates.append('utrNumber')
                    if hasattr(instance, 'transferredDate'):
                        instance.transferredDate = None
                        updates.append('transferredDate')
                
            if updates:
                instance.save(update_fields=updates.keys())

                tracking_model.updatedDateAndTime = timezone.now()
                tracking_model.save(update_fields=['updatedDateAndTime'])
                update_delay_charges_for_received_rents()

            return JsonResponse({'success': True, 'message': 'Rent data updated successfully!'})

        except Exception as e:
            print (e)
            return JsonResponse({'success': False, 'message': 'Error updating data. Please try again later!'})
        
    return JsonResponse({'success': False, 'message': 'Invalid request method. PUT expected!'})


# ─── Refund Management ────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsSalesTeam])
def get_refund_eligible_transactions(request):
    """List transactions eligible for refund (successful payments with remaining refundable amount)."""
    transactions = PaymentTransaction.objects.filter(
        status='success'
    ).select_related('resident', 'rent_record').order_by('-created_at')

    data = []
    for txn in transactions:
        total_refunded = sum(
            r.refund_amount for r in txn.refunds.filter(status__in=['initiated', 'processing', 'success'])
        )
        refundable = txn.amount - total_refunded
        if refundable <= 0:
            continue
        data.append({
            'txnid': txn.txnid,
            'amount': str(txn.amount),
            'totalRefunded': str(total_refunded),
            'refundable': str(refundable),
            'residentName': txn.resident.residentsName if txn.resident else '',
            'residentPhone': txn.resident.phoneNumber if txn.resident else '',
            'productInfo': txn.product_info,
            'rentMonth': txn.rent_record.month if txn.rent_record else '',
            'paidAt': txn.created_at.isoformat(),
        })

    return Response({'success': True, 'transactions': data})


@api_view(['POST'])
@permission_classes([IsSalesTeam])
def initiate_refund(request):
    """Admin-initiated refund against a specific PaymentTransaction.
    Validates refund amount doesn't exceed remaining refundable balance.
    Calls Razorpay payment.refund API.
    Refund goes back to the original payment method (RBI requirement).
    """
    txnid = request.data.get('txnid', '').strip()
    refund_amount_raw = str(request.data.get('amount', '')).strip()
    reason = request.data.get('reason', '').strip()

    if not txnid or not refund_amount_raw or not reason:
        return Response({
            'success': False,
            'message': 'Transaction ID, amount, and reason are required.',
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        from decimal import Decimal, InvalidOperation
        refund_amount = Decimal(refund_amount_raw)
    except (InvalidOperation, TypeError):
        return Response({
            'success': False,
            'message': 'Amount must be a valid number.',
        }, status=status.HTTP_400_BAD_REQUEST)

    if refund_amount <= 0:
        return Response({
            'success': False,
            'message': 'Refund amount must be greater than zero.',
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        txn = PaymentTransaction.objects.get(txnid=txnid, status='success')
    except PaymentTransaction.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Transaction not found or not eligible for refund.',
        }, status=status.HTTP_404_NOT_FOUND)

    # Calculate remaining refundable amount
    total_refunded = sum(
        r.refund_amount for r in txn.refunds.filter(status__in=['initiated', 'processing', 'success'])
    )
    refundable = txn.amount - total_refunded

    if refund_amount > refundable:
        return Response({
            'success': False,
            'message': f'Refund amount exceeds refundable balance (₹{refundable}).',
        }, status=status.HTTP_400_BAD_REQUEST)

    # Create refund record
    refund = PaymentRefund.objects.create(
        transaction=txn,
        refund_amount=refund_amount,
        reason=reason,
        status='initiated',
        initiated_by=request.user,
    )

    # Call Razorpay refund API
    razorpay_result = _process_razorpay_refund(txn, refund)

    if razorpay_result['success']:
        refund.status = 'processing'
        refund.gateway_refund_id = razorpay_result.get('refund_id', '')
        refund.save()

        # If full refund, revert the rent record status
        new_total_refunded = total_refunded + refund_amount
        if new_total_refunded >= txn.amount and txn.rent_record:
            txn.rent_record.rentStatus = 'Refunded'
            txn.rent_record.save(update_fields=['rentStatus'])

        return Response({
            'success': True,
            'message': 'Refund initiated successfully. It will be credited to the original payment method within 5-7 business days.',
            'refundId': refund.id,
            'gatewayRefundId': refund.gateway_refund_id,
        })
    else:
        refund.status = 'failed'
        refund.save()
        return Response({
            'success': False,
            'message': f'Refund could not be processed: {razorpay_result.get("message", "Unknown error")}',
        }, status=status.HTTP_502_BAD_GATEWAY)


@api_view(['GET'])
@permission_classes([IsSalesTeam])
def get_refund_history(request):
    """List all refunds with their status."""
    refunds = PaymentRefund.objects.select_related(
        'transaction__resident', 'initiated_by'
    ).order_by('-created_at')

    data = []
    for r in refunds:
        data.append({
            'id': r.id,
            'txnid': r.transaction.txnid,
            'originalAmount': str(r.transaction.amount),
            'refundAmount': str(r.refund_amount),
            'reason': r.reason,
            'status': r.status,
            'gatewayRefundId': r.gateway_refund_id,
            'residentName': r.transaction.resident.residentsName if r.transaction.resident else '',
            'initiatedBy': r.initiated_by.get_full_name() or r.initiated_by.username if r.initiated_by else '',
            'createdAt': r.created_at.isoformat(),
        })

    return Response({'success': True, 'refunds': data})


def _process_razorpay_refund(transaction, refund):
    """Process refund via Razorpay payment.refund API.
    Uses the gateway_payment_id stored on the original PaymentTransaction.
    Refund is credited back to the original payment method per RBI mandate.
    """
    import logging
    import razorpay
    from django.conf import settings

    logger = logging.getLogger(__name__)

    if not transaction.gateway_payment_id:
        logger.info(
            f"[REFUND] No gateway_payment_id for txn {transaction.txnid}. "
            f"Cannot process Razorpay refund without original payment ID."
        )
        return {'success': False, 'message': 'Original payment ID not available for refund.'}

    try:
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        response = client.payment.refund(
            transaction.gateway_payment_id,
            {'amount': int(refund.refund_amount * 100)}
        )
        refund_id = response.get('id', '')
        logger.info(f"[REFUND] Razorpay refund created: {refund_id} for txn {transaction.txnid}")
        return {'success': True, 'refund_id': refund_id}
    except Exception as e:
        logger.error(f"[REFUND] Razorpay refund failed for txn {transaction.txnid}: {e}")
        return {'success': False, 'message': str(e)}


def converted_welcome_email_template(data):
    """Send a welcome email to a converted lead requesting required resident details and KYC documents.

    Args:
        data: Either a ``Leads_Detail`` instance or a dict containing ``name``, ``email``, and ``contact``.
    """
    if hasattr(data, '__dict__'):
        data = {
            'name': data.name,
            'email': data.email,
            'contact': data.contact
        }
    
    subject = f"""Welcome to Stayease! Next Steps & Resident Information Needed"""

    html_body = f"""
        <html>
        <body>
            <p>Dear {data['name']},</p>
            
            <p>Welcome to Stayease! We’re thrilled to have you join our community and hope you’re excited to settle into your new home.</p>
            
            <p>To ensure we have all the necessary information for a smooth move-in process and to keep our records up to date, please provide the following details at your earliest convenience:</p>
            
            <p><strong>Required Resident Details:</strong></p>
            <ul>
                <li><strong>Full Name:</strong> {data['name']}</li>
                <li><strong>Phone Number:</strong> {data['contact']}</li>
                <li><strong>Email Address:</strong> {data['email']}</li>
                <li><strong>Permanent Address:</strong></li>
                <li><strong>Aadhar Number or PAN Number:</strong> (please provide either one for identification purposes)</li>
            </ul>
            
            <p><strong>Important:</strong> Please also send a scanned copy or clear photo of your Aadhar card OR PAN card document for verification along with the above details.</p>
            
            <p>You can reply directly to this email with the details and attached documents. If you have any questions or need assistance, feel free to reach out to us.</p>
            
            <p>We’re here to help make your transition as seamless as possible. Once again, welcome to your new home!</p>
            
            <p>--<br>
            Warm regards,<br>
            <strong>Stayease</strong><br>
            </p>
        </body>
        </html>
    """
        
    emailsend = EmailMessage(
        subject=subject,
        body=html_body,
        from_email='hello@mystayease.com',
        to=[data['email']],
    )
    
    emailsend.content_subtype = "html"
    emailsend.send()

@csrf_exempt
def leads_form_submit(request):
    """Handle POST /leads/ — save a new sales lead and send a welcome email if the lead was converted.

    Args:
        request: Django HttpRequest with JSON body containing lead fields including ``leadResult``.

    Returns:
        JsonResponse with ``success`` bool and a status message.
    """
    if request.method == 'POST':
        try:
            lead_data = json.loads(request.body)

            lead_instance = Leads_Detail(
                leadDate = lead_data['leadDate'],
                leadSource = lead_data['leadSource'],
                name = lead_data['name'],
                contact = lead_data['contact'],
                email = lead_data['email'],
                leadResult = lead_data['leadResult'],
                notConvertedReason = lead_data.get('notConvertedReason', None)
            )

            lead_instance.save()

            if lead_data['leadResult'] == 'Converted - Visit' or lead_data['leadResult'] == 'Converted - Closed':
                converted_welcome_email_template(lead_data)

            return JsonResponse({'success': True, 'message': 'Lead data submitted successfully!'})
            
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': 'Error submitting data. Please try again later!'})
    
    return JsonResponse({'success': False, 'message': 'Invalid request method. POST expected!'})

def get_leads_data(request):
    """Handle GET /leads/ — retrieve all sales leads as a flat list.

    Returns:
        JsonResponse with ``leads_table`` list on success, or an error message.
    """
    if request.method == 'GET':
        try:
            leads = Leads_Detail.objects.all()
            leads_data = []

            for lead in leads:
                leads_data.append({
                    "id": lead.id,
                    "leadDate": lead.leadDate,
                    "leadSource": lead.leadSource,
                    "name": lead.name,
                    "contact": lead.contact,
                    "email": lead.email,
                    "leadResult": lead.leadResult,
                    "notConvertedReason": lead.notConvertedReason,
                    "createdAt": lead.createdAt,
                    "updatedAt": lead.updatedAt
                })

            return JsonResponse({'success': True, 'leads_table': leads_data})
            
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': 'Error fetching data. Please try again later!'})
        
    return JsonResponse({'success': False, 'message': 'Invalid request method. GET expected!'})

@csrf_exempt
def leads_data_update(request, id):
    """Handle PUT /leads/<id>/ — update lead fields and send a welcome email if the lead result changes to converted.

    Args:
        request: Django HttpRequest with JSON body containing updated lead fields.
        id: Primary key of the ``Leads_Detail`` record to update.

    Returns:
        JsonResponse with ``success`` bool and a status message.
    """
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)

            FIELD_MAPPING = {
                'leadDate': 'leadDate',
                'leadSource': 'leadSource',
                'name': 'name',
                'contact': 'contact',
                'email': 'email',
                'leadResult': 'leadResult',
                'notConvertedReason': 'notConvertedReason'
            }

            instance = Leads_Detail.objects.get(pk=id)
            tracking_model = instance
            
            updates = {}
            for frontend_field, value in data.items():
                db_field = FIELD_MAPPING.get(frontend_field, frontend_field)
                    
                if hasattr(instance, db_field):
                    current_value = getattr(instance, db_field)
                    if current_value != value:
                        setattr(instance, db_field, value)
                        updates[db_field] = value

            if 'leadResult' in updates:
                if updates['leadResult'] != 'Not Converted':
                    if hasattr(instance, 'notConvertedReason'):
                        if getattr(instance, 'notConvertedReason') is not None:
                            setattr(instance, 'notConvertedReason', None)
                            updates['notConvertedReason'] = None
                
                if updates['leadResult'] == 'Converted - Visit' or updates['leadResult'] == 'Converted - Closed':
                    converted_welcome_email_template(instance)
                
            if updates:
                instance.save(update_fields=updates.keys())

                tracking_model.updatedAt = timezone.now()
                tracking_model.save(update_fields=['updatedAt'])

            return JsonResponse({'success': True, 'message': 'Leads data updated successfully!'})

        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': 'Error updating data. Please try again later!'})
        
    return JsonResponse({'success': False, 'message': 'Invalid request method. PUT expected!'})

@csrf_exempt
def leads_data_delete(request, id):
    """Handle DELETE /leads/<id>/ — permanently remove a lead record.

    Args:
        request: Django HttpRequest; method must be DELETE.
        id: Primary key of the ``Leads_Detail`` record to delete.

    Returns:
        JsonResponse with ``success`` bool and a status message.
    """
    if request.method == 'DELETE':
        try:
                lead = Leads_Detail.objects.get(id=id)
                lead.delete()
                return JsonResponse({'success': True, 'message': 'Lead data deleted successfully!'})
                
        except Exception as e:
            print (e)
            return JsonResponse({'success': False, 'message': 'Error deleting lead data. Please try again later!'})

@api_view(['POST'])
@permission_classes([IsSalesTeam])
def upload_and_send(request):
    """Handle POST /documents/upload/ — upload a PDF and send it for e-signature via Zoho Sign.

    Args:
        request: Multipart request with ``title``, ``recipientEmail``, ``recipientName``, and ``pdfFile``.

    Returns:
        DRF Response with ``success`` bool, ``signing_url`` on success, or error details on failure.
    """
    # Get data
    title = request.data.get('title')
    recipient_email = request.data.get('recipientEmail')
    recipient_name = request.data.get('recipientName')
    pdf_file = request.FILES.get('pdfFile')

    # Validate
    if not all([title, recipient_email, recipient_name, pdf_file]):
        return Response({'error': 'All fields required'}, status=400)
    
    # Save document (don't delete on error - keep for retry)
    document = Document.objects.create(
        user=request.user,
        title=title,
        recipient_email=recipient_email,
        recipient_name=recipient_name,
        pdf_file=pdf_file
    )

    try:
        # Send to Zoho
        service = ZohoESignService()
        result = service.send_for_signature(document)

        if result.get('success'):
            SigningRequest.objects.create(
                document=document,
                request_id=result['request_id'],
                signing_url=result['signing_url']
            )
            return Response({
                'success': True,
                'signing_url': result['signing_url'],
                'message': f'Sent to {recipient_email}'
            })
        else:
            # Handle different error types
            error_msg = result.get('error', 'Unknown error occurred')
            
            # Check if it's a rate limit error
            if result.get('rate_limited') or 'rate limit' in error_msg.lower():
                return Response({
                    'success': False,
                    'error': 'Zoho is rate limiting requests. Please try again in a few minutes.',
                    'rate_limited': True,
                    'document_id': document.id  # Return document ID for potential retry
                }, status=429)
            
            # Check if it's a validation error (like the JSON structure issue)
            elif 'extra key' in error_msg.lower() or 'invalid' in error_msg.lower():
                # Don't delete document - we need to fix the code
                return Response({
                    'success': False,
                    'error': f'Zoho API error: {error_msg}',
                    'document_id': document.id
                }, status=400)
            
            # For other errors, keep the document but mark it as failed
            else:
                # Optionally create a failed record
                # FailedRequest.objects.create(document=document, error=error_msg)
                return Response({
                    'success': False,
                    'error': error_msg,
                    'document_id': document.id
                }, status=500)
                
    except Exception as e:
        # Handle unexpected exceptions
        print(f"Unexpected error in upload_and_send: {str(e)}")
        return Response({
            'success': False,
            'error': f'An unexpected error occurred: {str(e)}',
            'document_id': document.id
        }, status=500)

@api_view(['GET'])
@permission_classes([IsSalesTeam])
def get_documents(request):
    """Handle GET /documents/ — list all documents uploaded by the current user.

    Returns:
        DRF Response with a list of document id, title, recipient_email, and created_at.
    """
    docs = Document.objects.filter(user=request.user).values('id', 'title', 'recipient_email', 'created_at')
    return Response(list(docs))

@api_view(['GET'])
@permission_classes([IsSalesTeam])
def get_requests(request):
    """Handle GET /signing-requests/ — list all e-signature requests created by the current user.

    Returns:
        DRF Response with a list of signing request details including status and signing URL.
    """
    reqs = SigningRequest.objects.filter(document__user=request.user).values(
        'id', 'document__title', 'signing_url', 'status', 'sent_at'
    )
    return Response(list(reqs))


@api_view(['POST'])
@permission_classes([IsOperationsTeam | IsSalesTeam | IsAdminGroup])
def upload_lease_agreement(request, resident_id):
    """Handle POST /resident/<resident_id>/lease/ — upload a PDF lease agreement and auto-enable the resident portal.

    Args:
        request: Multipart request with a ``leaseAgreement`` PDF file (max 10 MB).
        resident_id: Primary key of the ``resident_Data`` record.

    Returns:
        DRF Response with ``success`` bool, lease URL, and upload timestamp on success.
    """
    try:
        resident = resident_Data.objects.get(id=resident_id)
    except resident_Data.DoesNotExist:
        return Response({'success': False, 'message': 'Resident not found.'}, status=404)

    lease_file = request.FILES.get('leaseAgreement')
    if not lease_file:
        return Response({'success': False, 'message': 'No file provided.'}, status=400)

    # Validate file type (PDF only)
    if not lease_file.name.lower().endswith('.pdf'):
        return Response({'success': False, 'message': 'Only PDF files are allowed.'}, status=400)

    # Validate file size (max 10MB)
    if lease_file.size > 10 * 1024 * 1024:
        return Response({'success': False, 'message': 'File size must be under 10MB.'}, status=400)

    # Delete old file if exists
    if resident.leaseAgreement:
        default_storage.delete(resident.leaseAgreement.name)

    resident.leaseAgreement = lease_file
    resident.leaseUploadedAt = timezone.now()
    resident.leaseUploadedBy = request.user.get_full_name() or request.user.username
    resident.save(update_fields=['leaseAgreement', 'leaseUploadedAt', 'leaseUploadedBy'])

    # Auto-enable resident portal
    if resident.residentUser and not resident.residentUser.is_active:
        resident.residentUser.is_active = True
        resident.residentUser.save(update_fields=['is_active'])

    # Send notification email to resident
    if resident.email:
        try:
            email = EmailMessage(
                subject='Your Lease Agreement is Ready',
                body=(
                    f'Dear {resident.residentsName},\n\n'
                    'Your lease agreement has been uploaded and is now available '
                    'for viewing on your resident portal.\n\n'
                    'Please log in to your portal to view and download your lease agreement.\n\n'
                    'Regards,\nStayEase Team'
                ),
                to=[resident.email],
            )
            email.send(fail_silently=True)
        except Exception:
            pass

    return Response({
        'success': True,
        'message': 'Lease agreement uploaded successfully.',
        'leaseAgreement': resident.leaseAgreement.url if resident.leaseAgreement else None,
        'leaseUploadedAt': resident.leaseUploadedAt.isoformat() if resident.leaseUploadedAt else None,
    })


@api_view(['POST'])
@permission_classes([IsOperationsTeam | IsSalesTeam | IsAdminGroup])
def enable_resident_portal(request, resident_id):
    """Handle POST /resident/<resident_id>/enable-portal/ — activate the resident's Django auth user for portal access.

    Args:
        request: Django HttpRequest; no body required.
        resident_id: Primary key of the ``resident_Data`` record.

    Returns:
        DRF Response with ``success`` bool and a status message.
    """
    try:
        resident = resident_Data.objects.get(id=resident_id)
    except resident_Data.DoesNotExist:
        return Response({'success': False, 'message': 'Resident not found.'}, status=404)

    if not resident.residentUser:
        return Response({'success': False, 'message': 'No portal account exists for this resident.'}, status=400)

    if resident.residentUser.is_active:
        return Response({'success': False, 'message': 'Portal is already enabled.'}, status=400)

    resident.residentUser.is_active = True
    resident.residentUser.save(update_fields=['is_active'])

    return Response({'success': True, 'message': 'Resident portal enabled successfully.'})