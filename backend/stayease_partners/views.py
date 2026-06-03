import json
import random
import requests
from django.core.cache import cache
from datetime import datetime
from urllib.parse import quote
from django.http import JsonResponse
from django.db.models.functions import Cast, Coalesce
from django.db.models import Sum, IntegerField
from dateutil.relativedelta import relativedelta
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view, permission_classes
from stayease_project.permissions import IsPartner
from stayease_accounts.models import Expense_Category_Detail
from stayease_supply.models import Owner_Data, Property_Data, Bed_Data
from .models import YearlyDeductionSummary

def get_total_rent(owner_id):
    """Return the sum of rent (cast to integer) across all properties for a given owner.

    Args:
        owner_id: Primary key of the Owner_Data record.

    Returns:
        int: Total rent amount; 0 if no properties exist.
    """
    total_rent = Property_Data.objects.filter(
        owner_id=owner_id
    ).select_related('owner').aggregate(
        total_rent=Sum(Cast('rent', IntegerField()))
    ).get('total_rent', 0) or 0

    return total_rent

def get_prev_month_deductions(owner_id):
    """Return the total approved owner deduction expenses for the previous calendar month.

    Args:
        owner_id: Primary key of the Owner_Data record.

    Returns:
        int: Sum of approved deduction amounts; 0 if none exist.
    """
    current_date = datetime.now()

    prev_month_date = current_date - relativedelta(months=1)
    prev_month = prev_month_date.month
    prev_year = prev_month_date.year

    total_deductions = Expense_Category_Detail.objects.filter(
        expense_instance__owner_instance_id=owner_id,
        expense_instance__expenseType='Owner Deductions',
        status='Approved',
        createdAt__month=prev_month,
        createdAt__year=prev_year
    ).aggregate(
        total_amount=Coalesce(Sum(Cast('amount', IntegerField())), 0)
    )['total_amount']

    return total_deductions        

def get_yearly_income(owner, monthly_rent_after_deductions):
    """Accumulate monthly net rent into the owner's yearly deduction summary record.

    Args:
        owner: Owner_Data instance to associate with.
        monthly_rent_after_deductions: Net rent value to append for the current month.

    Returns:
        float: Updated cumulative yearly total for this owner.
    """
    current_date = datetime.now()
    current_year = current_date.year

    yearly_summary, created = YearlyDeductionSummary.objects.get_or_create(
        owner=owner,
         year=current_year,
        defaults={
            'monthly_values': [monthly_rent_after_deductions],
            'cumulative_total': monthly_rent_after_deductions
        }
    )

    if not created:
        yearly_summary.update_deductions(monthly_rent_after_deductions)
    
    return yearly_summary.cumulative_total

@api_view(['GET'])
@permission_classes([IsPartner])
def get_expense_data(request):
    """Handle GET /partner/expenses/ — retrieve owner summary and expense breakdown by phone number.

    Args:
        request: Django HttpRequest with query param `phone` matching an owner's phone number.

    Returns:
        JsonResponse with `owner_data` summary dict and `expenses` list of expense category records.
    """
    if request.method == "GET":
        phone_number = request.GET.get('phone')
        owner_row = Owner_Data.objects.filter(ownerPhone=phone_number)

        first_matched_owner = owner_row.first()

        owner_data = {}
        expenses = []
        properties = []

        if first_matched_owner:
            owner_properties = Property_Data.objects.filter(owner_id=first_matched_owner.id)

            total_rent = get_total_rent(first_matched_owner.id)

            total_deductions = get_prev_month_deductions(first_matched_owner.id)

            # monthly_rent_after_deductions = total_rent - total_deductions

            # yearly_income = get_yearly_income(first_matched_owner, monthly_rent_after_deductions)

            for property in owner_properties:
                beds = Bed_Data.objects.filter(
                    room__property_id=property.id
                ).exclude(
                    salesStatus="Pending"
                )

                occupied_rooms = beds.count()

                occupancy_rate = (int(occupied_rooms) / int(property.noOfRooms)) * 100

                properties.append({'occupancy': occupancy_rate})

            occupancy = round(sum(prop['occupancy'] for prop in properties) / len(properties)) if len(properties) > 0 else 0

            owner_data = {
                "id": first_matched_owner.id,
                "name": first_matched_owner.ownerName,
                "noOfProperties": first_matched_owner.noOfProperties,
                "aadharVerification": first_matched_owner.aadharVerification,
                "panVerification": first_matched_owner.panVerification,
                "accountStatus": first_matched_owner.accountStatus,
                "occupancy": occupancy,
                "rent": total_rent,
                "ownerDeductions": total_deductions,
                # 'cumulative_yearly_total': yearly_income,
            }

            expense_categories = Expense_Category_Detail.objects.filter(
                expense_instance__owner_instance_id=first_matched_owner.id
            ).select_related('expense_instance').order_by('-createdAt')

            for category in expense_categories:
                expenses.append({
                    'id': category.expense_instance.id,
                    'propertyName': category.expense_instance.propertyName,
                    'expense_category_id': category.id,
                    'category': category.category,
                    'amount': int(category.amount),
                    'vendor': category.vendor,
                    'status': category.status,
                    'priority': category.priority,
                    'deadline': category.deadline,
                    'receipt': category.receipt.url if category.receipt else None,
                    'amountTransferredDate': category.amountTransferredDate,
                    'createdAt': category.createdAt,
                })

            return JsonResponse({"owner_data": owner_data, "expenses": expenses})

@api_view(['GET'])
@permission_classes([IsPartner])
def get_overall_data(request):
    """Handle GET /partner/overview/ — retrieve all properties for an owner identified by phone.

    Args:
        request: Django HttpRequest with query param `phone` matching an owner's phone number.

    Returns:
        JsonResponse with `properties` list containing full property details and document URLs.
    """
    if request.method == "GET":
        phone_number = request.GET.get('phone')
        owner_row = Owner_Data.objects.filter(ownerPhone=phone_number)

        first_matched_owner = owner_row.first()

        properties = []

        if first_matched_owner:
            owner_properties = Property_Data.objects.filter(owner_id=first_matched_owner.id)

            for property in owner_properties:
                properties.append({
                    'id': property.id,
                    'name': property.propertyName,
                    'type': property.propertyType,
                    'foundedYear': property.foundedYear,
                    'doorBuilding': property.doorBuilding,
                    'streetAddress': property.streetAddress,
                    'area': property.area,
                    'landmark': property.landmark,
                    'state': property.state,
                    'city': property.city,
                    'pincode': property.pincode,
                    'location': f"{property.area}, {property.city}",
                    'selectedMealTypes': property.selectedMealTypes,
                    'rent': property.rent,
                    'deposit': property.deposit,
                    'rentFree': property.rentFree,
                    'rating': property.rating,
                    'amenities': property.selectedAmenities,
                    'image': property.image.url if property.image else None,
                    'status': property.status,
                    'noOfBasements': property.noOfBasements,
                    'noOfFloors': property.noOfFloors,
                    'rooms': property.noOfRooms,
                    'saleDeed': property.saleDeed.url if property.saleDeed else None,
                    'ebill': property.ebill.url if property.ebill else None,
                    'taxReceipt': property.taxReceipt.url if property.taxReceipt else None,
                    'waterBill': property.waterBill.url if property.waterBill else None,
                    'loi': property.loi.url if property.loi else None,
                    'agreement': property.agreement.url if property.agreement else None,
                    'createdAt': property.submittedDateAndTime,
                    'lastUpdated': property.updatedDateAndTime
                })

            return JsonResponse({"properties": properties})

@api_view(['GET'])
@permission_classes([IsPartner])
def get_owner_data(request):
    """Handle GET /partner/owner/ — retrieve full owner profile and financial summary by phone.

    Args:
        request: Django HttpRequest with query param `phone` matching an owner's phone number.

    Returns:
        JsonResponse with `owner_data` dict containing personal, bank, KYC, and rent fields.
    """
    if request.method == "GET":
        phone_number = request.GET.get('phone')
        owner_row = Owner_Data.objects.filter(ownerPhone=phone_number)

        first_matched_owner = owner_row.first()

        if first_matched_owner:
            total_rent = get_total_rent(first_matched_owner.id)

            total_deductions = get_prev_month_deductions(first_matched_owner.id)

            # monthly_rent_after_deductions = total_rent - total_deductions

            # yearly_income = get_yearly_income(first_matched_owner, monthly_rent_after_deductions)
            
            owner_data = {
                "id": first_matched_owner.id,
                "name": first_matched_owner.ownerName,
                "memberSince": first_matched_owner.memberSince,
                "phone": first_matched_owner.ownerPhone,
                "email": first_matched_owner.ownerEmail,
                "address": first_matched_owner.ownerAddress,
                "dateOfBirth": first_matched_owner.ownerDob,
                "gender": first_matched_owner.ownerGender,
                "noOfProperties": first_matched_owner.noOfProperties,
                "accountHolderName": first_matched_owner.accountHolderName,
                "accountNumber": first_matched_owner.accountNumber,
                "bankName": first_matched_owner.bankName,
                "branchName": first_matched_owner.bankBranch,
                "ifscCode": first_matched_owner.ifscCode,
                "accountStatus": first_matched_owner.accountStatus,
                "paymentType": first_matched_owner.paymentType,
                "chequeCopy": first_matched_owner.chequeCopy.url if first_matched_owner.chequeCopy else None,
                "aadharNumber": first_matched_owner.aadharNumber,
                "aadharFrontCopy": first_matched_owner.aadharFrontCopy.url if first_matched_owner.aadharFrontCopy else None,
                "aadharBackCopy": first_matched_owner.aadharBackCopy.url if first_matched_owner.aadharBackCopy else None,
                "aadharVerification": first_matched_owner.aadharVerification,
                "panNumber": first_matched_owner.panNumber,
                "panFrontCopy": first_matched_owner.panFrontCopy.url if first_matched_owner.panFrontCopy else None,
                "panBackCopy": first_matched_owner.panBackCopy.url if first_matched_owner.panBackCopy else None,
                "panVerification": first_matched_owner.panVerification,
                "rent": total_rent,
                "ownerDeductions": total_deductions,
                # 'cumulative_yearly_total': yearly_income,
            }

            return JsonResponse({"owner_data": owner_data})
        
@api_view(['GET'])
@permission_classes([IsPartner])
def get_property_data(request):
    """Handle GET /partner/properties/ — retrieve properties with occupancy rates for an owner.

    Args:
        request: Django HttpRequest with query param `phone` matching an owner's phone number.

    Returns:
        JsonResponse with `properties` list, each entry including occupancy rate and bed counts.
    """
    if request.method == "GET":
        phone_number = request.GET.get('phone')
        owner_row = Owner_Data.objects.filter(ownerPhone=phone_number)

        first_matched_owner = owner_row.first()

        properties = []

        if first_matched_owner:
            owner_properties = Property_Data.objects.filter(owner_id=first_matched_owner.id)

            for property in owner_properties:
                no_of_beds = Bed_Data.objects.filter(
                    room__property_id=property.id
                )

                completed_beds = Bed_Data.objects.filter(
                    room__property_id=property.id
                ).exclude(
                    salesStatus="Pending"
                )

                total_rent = get_total_rent(first_matched_owner.id)

                total_beds = no_of_beds.count()
                occupied_beds = completed_beds.count()

                occupancy_rate = (int(occupied_beds) / int(total_beds)) * 100

                properties.append({
                    'id': property.id,
                    'name': property.propertyName,
                    'type': property.propertyType,
                    'foundedYear': property.foundedYear,
                    'doorBuilding': property.doorBuilding,
                    'streetAddress': property.streetAddress,
                    'area': property.area,
                    'landmark': property.landmark,
                    'state': property.state,
                    'city': property.city,
                    'pincode': property.pincode,
                    'location': f"{property.area}, {property.city}",
                    'selectedMealTypes': property.selectedMealTypes,
                    'rent': property.rent,
                    'deposit': property.deposit,
                    'rentFree': property.rentFree,
                    'rating': property.rating,
                    'amenities': property.selectedAmenities,
                    'image': property.image.url if property.image else None,
                    'status': property.status,
                    'noOfBasements': property.noOfBasements,
                    'noOfFloors': property.noOfFloors,
                    'rooms': property.noOfRooms,
                    'rent': total_rent,
                    'occupancy': occupancy_rate,
                    'saleDeed': property.saleDeed.url if property.saleDeed else None,
                    'ebill': property.ebill.url if property.ebill else None,
                    'taxReceipt': property.taxReceipt.url if property.taxReceipt else None,
                    'waterBill': property.waterBill.url if property.waterBill else None,
                    'loi': property.loi.url if property.loi else None,
                    'agreement': property.agreement.url if property.agreement else None,
                    'createdAt': property.submittedDateAndTime,
                    'lastUpdated': property.updatedDateAndTime,
                })

            return JsonResponse({"properties": properties})

@ensure_csrf_cookie
def send_otp(request):
    """Handle POST /partner/send-otp/ — generate and dispatch a one-time password via SMS.

    Args:
        request: Django HttpRequest with JSON body containing `ownerPhone`.

    Returns:
        JsonResponse with a `message` indicating success or the reason for failure.
    """
    if request.method == "POST":
        data = json.loads(request.body)

        ownerPhone = data.get("ownerPhone")

        if not ownerPhone:
            return JsonResponse({"message": "Phone number required!"})
        
        if not Owner_Data.objects.filter(ownerPhone=ownerPhone).exists():
            return JsonResponse({'message': 'Phone Number not registered!'})

        otp = str(random.randint(100000, 999999))
        cache.set(f"otp_{ownerPhone}", otp, 86400)
        message = f"""Dear User,

Your OTP for login to Stayease is {otp}.  
Please use this OTP to complete your login. It is valid for 24 Hours.  

If you did not request this OTP, please ignore this message.  

Thank you,  
Stayease Support Team
www.mystayease.com"""

        encoded_message = quote(message)

        url = f"https://pre-prod.cheerio.in/direct-apis/v1/announcements/single-sms/send?SenderId=ESTANZ&Is_Unicode=false&Is_Flash=false&Message={encoded_message}&MobileNumbers=91{ownerPhone}"

        headers = {
            'x-api-key': 'c50d8dcdc491e27c350d0abdc461054798cffbe744423346feaaa8bc77a4446b'
        }

        response = requests.get(url, headers=headers)

        return JsonResponse({"message": "OTP sent successfully!"})
    
@ensure_csrf_cookie
def verify_otp(request):
    """Handle POST /partner/verify-otp/ — validate the OTP and establish a partner session.

    Args:
        request: Django HttpRequest with JSON body containing `ownerPhone` and `otp`.

    Returns:
        JsonResponse with a `message` indicating login success or the validation error.
    """
    data = json.loads(request.body)

    ownerPhone = data.get("ownerPhone")
    otp_input = data.get("otp")
    
    otp_stored = cache.get(f"otp_{ownerPhone}")
    
    if not otp_input:
        return JsonResponse({"message": "OTP required!"})

    if otp_stored is None:
        return JsonResponse({"error": "OTP expired or not found!"}, status=400)

    if otp_input != otp_stored:
        return JsonResponse({"message": "Invalid OTP!"})

    cache.delete(f"otp_{ownerPhone}")

    request.session['is_logged_in'] = True
    request.session["authenticated_phone"] = ownerPhone

    return JsonResponse({"message": "Login successful!"})


def verify_otp_internal(phone, otp):
    """Internal OTP verification for mobile JWT login (no request/session needed)."""
    otp_stored = cache.get(f"otp_{phone}")
    if not otp or otp_stored is None or otp != otp_stored:
        return False
    cache.delete(f"otp_{phone}")
    return True


# def login_required_custom(view_func):
#     def wrapper(request, *args, **kwargs):
#         if not request.session.get('is_logged_in'):
#             return JsonResponse({'error': 'Unauthorized'}, status=401)
#         return view_func(request, *args, **kwargs)
#     return wrapper

# @login_required_custom

