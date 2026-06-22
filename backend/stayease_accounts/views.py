import boto3
import json
import uuid
from django.utils import timezone
from django.core import serializers
from django.http import JsonResponse
from django.core.mail import EmailMessage
from django.db.models import Sum, FloatField, Q, OuterRef, Subquery, Prefetch, Exists
from django.db.models.functions import Cast
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from stayease_project.permissions import IsAdminGroup, IsAccountsTeam
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from datetime import datetime, timedelta
from collections import defaultdict
from django.contrib.auth.models import User
from .models import User_Activity_Data, User_Login_Data, Vendor_Detail, RawdataFile, Rawdata_Detail, Expense_Detail, Expense_Category_Detail, Fixed_Expense_Detail, Liability_Detail, OtherFile, DropdownConfig
from stayease_supply.models import Owner_Data, Property_Data, Room_Data, Bed_Data
from stayease_sales.models import resident_Data

# Create your views here.
def auth_check(request):
    """Handle GET /auth/check/ — confirm whether the current session is authenticated.

    Returns:
        JsonResponse with `isAuthenticated` bool and `username` if authenticated.
    """
    if request.user.is_authenticated:
        return JsonResponse({"isAuthenticated": True, "username": request.user.username})
    return JsonResponse({"isAuthenticated": False})
    
@csrf_exempt
def login_view(request):
    """Handle POST /auth/login/ — authenticate a dashboard user and create a session.

    Args:
        request: Django HttpRequest with JSON body containing `username` and `password`.

    Returns:
        JsonResponse with user info, permissions, groups, and login session ID on success (200),
        or an error message on invalid credentials (400).
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

        groups = list(user.groups.values_list('name', flat=True))
        return JsonResponse({"success": True, "username": user.username, "useremail": user.email, "permissions": permissions, "groups": groups, "login_id": user_login_instance.id, "is_superuser": user.is_superuser})

    return JsonResponse({"success": False, "message": "Invalid credentials"}, status=400)

@csrf_exempt
@login_required
def logout_view(request):
    """Handle POST /auth/logout/ — end the current session and record logout time.

    Args:
        request: Django HttpRequest with optional JSON body containing `loginId`.

    Returns:
        JsonResponse with `success: true` on success, or an error message on failure (405).
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
    """Handle GET /accounts/user-activity/ — retrieve all users with their login/logout history.

    Returns:
        JsonResponse with `user_activity_data` list containing login session details per user.
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

def get_dropdown_config(request):
    """Handle GET /accounts/dropdown-config/ — return all dropdown options grouped by category.

    Returns:
        JsonResponse with `dropdown_config` dict mapping group names to lists of values.
    """
    if request.method == 'GET':
        try:
            configs = DropdownConfig.objects.all()
            grouped = defaultdict(list)
            for c in configs:
                grouped[c.group].append(c.value)
            return JsonResponse({'success': True, 'dropdown_config': dict(grouped)})
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': 'Error fetching dropdown config.'})
    return JsonResponse({'success': False, 'message': 'Invalid request method. GET expected!'})

def get_staff_names(request):
    """Handle GET /accounts/staff-names/ — return a list of active staff users.

    Returns:
        JsonResponse with `staff_names` list containing id, name, and username per staff member.
    """
    if request.method == 'GET':
        try:
            staff = User.objects.filter(is_active=True, is_staff=True).values('id', 'first_name', 'last_name', 'username')
            staff_list = []
            for u in staff:
                name = f"{u['first_name']} {u['last_name']}".strip() or u['username']
                staff_list.append({'id': u['id'], 'name': name, 'username': u['username']})
            return JsonResponse({'success': True, 'staff_names': staff_list})
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': 'Error fetching staff names.'})
    return JsonResponse({'success': False, 'message': 'Invalid request method. GET expected!'})

@api_view(['POST'])
@permission_classes([IsAdminGroup])
def employee_form_submit(request):
    """Handle POST /accounts/employee-form-submit/ — create a new staff user and assign to RBAC group.

    Accepts JSON body with firstName, lastName, phone, email, gender, role.
    Creates a Django User with is_staff=True and adds them to the matching group.

    Returns:
        JsonResponse with success status and the generated username.
    """
    try:
        data = request.data
        first_name = data.get('firstName', '').strip()
        last_name = data.get('lastName', '').strip()
        phone = data.get('phone', '').strip()
        email = data.get('email', '').strip()
        role = data.get('role', '').strip()

        if not all([first_name, last_name, phone, email, role]):
            return JsonResponse({'success': False, 'message': 'All fields are required.'}, status=400)

        # Generate username from first+last name, lowercased, spaces removed
        base_username = f"{first_name.lower()}{last_name.lower()}".replace(' ', '')
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        if User.objects.filter(email=email).exists():
            return JsonResponse({'success': False, 'message': 'A user with this email already exists.'}, status=400)

        # Generate a temporary password
        temp_password = f"Stayease@{uuid.uuid4().hex[:8]}"

        user = User.objects.create_user(
            username=username,
            email=email,
            password=temp_password,
            first_name=first_name,
            last_name=last_name,
            is_staff=True,
            is_active=True,
        )

        # Assign to RBAC group matching the role
        from django.contrib.auth.models import Group
        try:
            group = Group.objects.get(name=role)
            user.groups.add(group)
        except Group.DoesNotExist:
            pass

        return JsonResponse({
            'success': True,
            'message': f'Employee account created. Username: {username}, Temporary Password: {temp_password}',
            'username': username,
            'temp_password': temp_password,
        })
    except Exception as e:
        print(e)
        return JsonResponse({'success': False, 'message': 'Error creating employee account.'}, status=500)

def get_resident_deductions(resident, room):
    """Calculate total check-out deductions for a given resident and room.

    Args:
        resident: Resident name string to filter expenses by.
        room: Room number string to filter expenses by.

    Returns:
        Float total of amount + GST across all approved check-out deduction categories.
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

def get_resident_amount(id, type):
    """Fetch a specific field from the first liability record linked to a resident.

    Args:
        id: Primary key of the resident_Data instance.
        type: Field name to retrieve — one of 'id', 'status', 'amount', 'utrNumber',
            'transferredDate', 'createdAt', or 'updatedAt'.

    Returns:
        The requested field value, or None if no liability record exists.
    """
    liability_query = Liability_Detail.objects.filter(liability_resident_id=id).first()

    if not liability_query:
        return None
    
    if type == 'id':
        return liability_query.id

    if type == 'status':
        return liability_query.status
    
    if type == 'amount':
        return liability_query.amount
    
    if type == 'utrNumber':
        return liability_query.utrNumber
    
    if type == 'transferredDate':
        return liability_query.transferredDate
    
    if type == 'createdAt':
        return liability_query.createdAt
    
    if type == 'updatedAt':
        return liability_query.updatedAt
    
    return None

@csrf_exempt
def vendor_form_submit(request):
    """Handle POST /accounts/vendor/submit/ — create a new vendor record.

    Args:
        request: Django HttpRequest with JSON body containing vendor name, contact,
            category, billing type, and optional banking/UPI details.

    Returns:
        JsonResponse with `success` bool and a `message` describing the outcome.
    """
    if request.method == 'POST':
        try:
            vendor_data = json.loads(request.body)

            existing_vendor = Vendor_Detail.objects.filter(
                vendor=vendor_data['vendor'],
                contact=vendor_data['contact'],
                category=vendor_data['category']
            ).first()

            if existing_vendor:
                return JsonResponse({'success': False, 'message': 'Vendor data already exists!'})

            vendor_instance = Vendor_Detail(
                vendor = vendor_data['vendor'],
                contact = vendor_data['contact'],
                category = vendor_data['category'],
                billingType = vendor_data['billingType'],
                accountHolderName = vendor_data['accountHolderName'],
                accountNumber = vendor_data['accountNumber'],
                bankName = vendor_data['bankName'],
                bankBranch = vendor_data['bankBranch'],
                ifscCode = vendor_data['ifscCode'],
                upiNumber = vendor_data['upiNumber'],
                otherBankingDetails = vendor_data['otherBankingDetails']
            )

            vendor_instance.save()

            return JsonResponse({'success': True, 'message': 'Vendor data submitted successfully!'})
            
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': 'Error submitting data. Please try again later!'})
    
    return JsonResponse({'success': False, 'message': 'Invalid request method. POST expected!'})

def get_vendor_data(request):
    """Handle GET /accounts/vendor/ — return all vendors with their linked expense categories.

    Returns:
        JsonResponse with `vendor_table` list containing vendor details and nested categories.
    """
    if request.method == 'GET':
        try:
            vendors = Vendor_Detail.objects.prefetch_related('vendor_categories').all()

            vendor_data = []

            for vendor in vendors:
                vendor_data.append({
                    "id": vendor.id,
                    "vendor": vendor.vendor,
                    "contact": vendor.contact,
                    "category": vendor.category,
                    "billingType": vendor.billingType,
                    "accountHolderName": vendor.accountHolderName,
                    "accountNumber": vendor.accountNumber,
                    "bankName": vendor.bankName,
                    "bankBranch": vendor.bankBranch,
                    "ifscCode": vendor.ifscCode,
                    "upiNumber": vendor.upiNumber,
                    "otherBankingDetails": vendor.otherBankingDetails,
                    "createdAt": vendor.createdAt,
                    "updatedAt": vendor.updatedAt,
                    "categories": [
                        {
                            "id": category.id,
                            "expenseRaisedEmail": category.expenseRaisedEmail,
                            "category": category.category,
                            "amount": category.amount,
                            "paymentType": category.paymentType,
                            "vendorType": category.vendorType,
                            "vendor": category.vendor,
                            "priority": category.priority,
                            "deadline": category.deadline,
                            "comments": category.comments,
                            "receipt": category.receipt.url if category.receipt else None,
                            "status": category.status,
                            "transferType": category.transferType,
                            "utrNumber": category.utrNumber,
                            "vendor_instance_id": category.vendor_instance_id,
                            "expense_instance_id": category.expense_instance_id
                        }
                        for category in vendor.vendor_categories.all()
                    ]
                })

            return JsonResponse({'success': True, 'vendor_table': vendor_data})
            
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': 'Error fetching data. Please try again later!'})
        
    return JsonResponse({'success': False, 'message': 'Invalid request method. GET expected!'})

@csrf_exempt
def vendor_data_update(request, id):
    """Handle PUT /accounts/vendor/<id>/ — update changed fields on an existing vendor record.

    Args:
        request: Django HttpRequest with JSON body of fields to update.
        id: Primary key of the Vendor_Detail to update.

    Returns:
        JsonResponse with `success` bool and a `message` describing the outcome.
    """
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)

            FIELD_MAPPING = {
                'vendor': 'vendor',
                'contact': 'contact',
                'category': 'category',
                'billingType': 'billingType',
                'accountHolderName': 'accountHolderName',
                'accountNumber': 'accountNumber',
                'bankName': 'bankName',
                'bankBranch': 'bankBranch',
                'ifscCode': 'ifscCode',
                'upiNumber': 'upiNumber',
                'otherBankingDetails': 'otherBankingDetails'
            }

            instance = Vendor_Detail.objects.get(pk=id)
            tracking_model = instance

            all_data_exists = True
            for frontend_field, value in data.items():
                db_field = FIELD_MAPPING.get(frontend_field, frontend_field)
                if hasattr(instance, db_field) and getattr(instance, db_field) != value:
                    all_data_exists = False
                    break

            if not all_data_exists:
                updates = {}
                for frontend_field, value in data.items():
                    db_field = FIELD_MAPPING.get(frontend_field, frontend_field)
                    
                    if hasattr(instance, db_field):
                        current_value = getattr(instance, db_field)
                        if current_value != value:
                            setattr(instance, db_field, value)
                            updates[db_field] = value
                
                if updates:
                    instance.save(update_fields=updates.keys())

                    tracking_model.updatedAt = timezone.now()
                    tracking_model.save(update_fields=['updatedAt'])
            else:
                return JsonResponse({'success': False, 'message': 'All data matches existing record - no update needed!'})

            return JsonResponse({'success': True, 'message': 'Vendor data updated successfully!'})

        except Exception as e:
            print (e)
            return JsonResponse({'success': False, 'message': 'Error updating data. Please try again later!'})
        
    return JsonResponse({'success': False, 'message': 'Invalid request method. PUT expected!'})

def get_property_data(request):
    """Handle GET /accounts/properties/ — return a list of all registered properties.

    Returns:
        JsonResponse with `properties` list containing id, name, and submission timestamps.
    """
    if request.method == 'GET':
        try:
            property_data = Property_Data.objects.all()
            properties = []

            for property in property_data:
                properties.append({
                    "id": property.id,
                    "propertyName": property.propertyName,
                    "submittedDateAndTime": property.submittedDateAndTime,
                    "updatedDateAndTime": property.updatedDateAndTime
                })

            return JsonResponse({'success': True, 'properties': properties})
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': 'Error fetching data. Please try again later!'})

def get_owner_rooms(request, id):
    """Handle GET /accounts/owner/<id>/rooms/ — return completed rooms for an owner or property.

    Args:
        request: Django HttpRequest.
        id: Owner numeric ID or property name string to filter rooms by.

    Returns:
        JsonResponse with `rooms_data` list of serialized room records.
    """
    if request.method == 'GET':
        try:
            if id.isdigit():
                rooms = Room_Data.objects.filter(
                    property__owner_id=int(id),
                    status='Completed'
                )
            else:
                rooms = Room_Data.objects.filter(
                    Q(property__propertyName__iexact=id, status='Completed') & 
                    Exists(Bed_Data.objects.filter(
                        room=OuterRef('pk'), 
                        salesStatus='Completed'
                    ))
                )
            
            serialized_rooms = serializers.serialize('json', rooms)
            rooms_data = json.loads(serialized_rooms)

            return JsonResponse({'success': True, 'rooms_data': rooms_data})
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': 'Error fetching data. Please try again later!'})
        
def get_resident_data(request, property_name, room):
    """Handle GET /accounts/residents/<property_name>/<room>/ — return active residents in a room.

    Args:
        request: Django HttpRequest.
        property_name: Name of the property to filter by.
        room: Room number to filter by.

    Returns:
        JsonResponse with `residents_data` list of serialized active resident records.
    """
    if request.method == 'GET':
        try:
            residents = resident_Data.objects.filter(
                bed_data_instance__room__property__propertyName=property_name,
                bed_data_instance__room__roomNo=room,
                bed_data_instance__salesStatus='Completed',
                residentStatus='Active'
            )
            
            serialized_rooms = serializers.serialize('json', residents)
            residents_data = json.loads(serialized_rooms)

            return JsonResponse({'success': True, 'residents_data': residents_data})
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': 'Error fetching data. Please try again later!'})
        
def get_owner_data(request):
    """Handle GET /accounts/owners/ — return owners with rent totals and previous month expenses.

    Returns:
        JsonResponse with `owner_data` list including summed rents, approved expense details,
        and the relevant month/year label for each owner.
    """
    if request.method == 'GET':
        try:
            today = datetime.now().date()

            # For current month
            # first_day_prev_month = today.replace(day=1)
            # last_day_prev_month = (today.replace(day=1) + timedelta(days=32)).replace(day=1) - timedelta(days=1)

            first_day_prev_month = (today.replace(day=1) - timedelta(days=1)).replace(day=1)
            last_day_prev_month = (today.replace(day=1) - timedelta(days=1))

            approved_expenses = Expense_Detail.objects.filter(
                expenseType='Owner Deductions',
                expense_categories__status='Approved',
                expense_categories__createdAt__gte=first_day_prev_month,
                expense_categories__createdAt__lte=last_day_prev_month
            ).prefetch_related(
                Prefetch('expense_categories', 
                        queryset=Expense_Category_Detail.objects.filter(
                            status='Approved',
                            createdAt__gte=first_day_prev_month,
                            createdAt__lte=last_day_prev_month
                        ),
                        to_attr='filtered_categories')
            )

            approved_expenses_subquery = Expense_Detail.objects.filter(
                expenseType='Owner Deductions',
                owner_instance=OuterRef('pk'),
                expense_categories__status='Approved',
                expense_categories__createdAt__gte=first_day_prev_month,
                expense_categories__createdAt__lte=last_day_prev_month
            ).annotate(
                cleaned_amount=Cast('expense_categories__amount', FloatField())
            ).values('owner_instance').annotate(
                total=Sum('cleaned_amount')
            ).values('total')

            owners = Owner_Data.objects.prefetch_related(
                Prefetch('owner_expenses', 
                        queryset=approved_expenses,
                        to_attr='approved_expenses_list')
            ).annotate(
                total_rent=Sum(
                    Cast('owner__rent', FloatField()),
                    filter=Q(owner__rent__regex=r'^\d*\.?\d+$')
                ),
                total_approved_expenses_prev_month=Subquery(approved_expenses_subquery[:1])
            )

            data = []
            for owner in owners:
                detailed_expenses = []
                for expense in owner.approved_expenses_list:
                    for category in expense.filtered_categories:
                        detailed_expenses.append({
                            'expense_id': expense.id,
                            'category_id': category.id,
                            'expenseRaisedEmail': category.expenseRaisedEmail,
                            'category': category.category,
                            'amount': category.amount,
                            'paymentType': category.paymentType,
                            'accountId': category.accountId,
                            'priority': category.priority,
                            'deadline': category.deadline,
                            "receipt": category.receipt.url if category.receipt else None,
                            'comments': category.comments,
                            'status': category.status,
                            'createdAt': category.createdAt,
                            'updatedAt': category.updatedAt
                        })
                
                data.append({
                    "id": owner.id,
                    "ownerName": owner.ownerName,
                    "sumOfRents": round(float(owner.total_rent or 0), 2),
                    "sumOfExpenses": round(float(owner.total_approved_expenses_prev_month or 0), 2),
                    "monthYear": last_day_prev_month.strftime("%B %Y"),
                    "approvedExpenses": detailed_expenses,
                })

            return JsonResponse({'success': True, 'owner_data': data})
        except Exception as e:
            print (e)
            return JsonResponse({'success': False, 'message': 'Error fetching data. Please try again later!'})
        
    return JsonResponse({'success': False, 'message': 'Invalid request method. GET expected!'})

def expense_email(expenseRaisedEmail, propertyName, headOfExpense, expenseType, categories, email_type, expense_instance=None):
    """Send a threaded HTML email notification for an expense submission or status update.

    Args:
        expenseRaisedEmail: Email address of the staff member who raised the expense.
        propertyName: Property the expense belongs to.
        headOfExpense: Head category of the expense (e.g. 'Owner', 'Resident').
        expenseType: Type label for the expense.
        categories: List of category dicts for 'pendingStatus', or an Expense_Category_Detail
            instance for 'statusUpdate'.
        email_type: Either 'pendingStatus' (new submission) or 'statusUpdate' (approval change).
        expense_instance: Optional Expense_Detail instance used to maintain the email thread ID.
    """
    if expense_instance and expense_instance.email_thread_id:
        thread_message_id = expense_instance.email_thread_id
    else:
        thread_message_id = f"<expense-{uuid.uuid4()}@stayease.com>"
        if expense_instance:
            expense_instance.email_thread_id = thread_message_id
            expense_instance.save()
    
    if email_type == 'pendingStatus':
        subject = f"Expense Submission: {expenseType} - {propertyName} (Head: {headOfExpense})"
        
        expense_items = ""
        for expense in categories:
            gst_str = str(expense.get('gst', '0')).strip()
            if gst_str.replace('.', '', 1).replace('-', '', 1).isdigit():
                gst = float(gst_str)
            else:
                gst = 0.0

            date_str = expense.get('amountTransferredDate')
            if date_str:
                formatted_date = datetime.strptime(date_str, "%Y-%m-%d").strftime("%d-%b-%Y")
            else:
                formatted_date = "N/A"

            expense_items += f"""
                <h4><strong>Category:</strong> {expense.get('category')}</h4>
                <ul>
                    <li><strong>Amount:</strong> {float(expense.get('amount')) + gst}</li>
                    <li><strong>Payment Type:</strong> {expense.get('paymentType')}</li>
                    <li><strong>Account Id:</strong> {expense.get('accountId') or 'N/A'}</li>
                    <li><strong>Amount Transferred Date:</strong> {formatted_date}</li>
                    <li><strong>Priority:</strong> {expense.get('priority')}</li>
                    <li><strong>Deadline:</strong> {expense.get('deadline')}</li>
                    <li><strong>Comments:</strong> {expense.get('comments') or '-'}</li>
                    <li><strong>Status:</strong> Pending</li>
                </ul>
                """
        
        html_body = f"""
            <html>
            <body>
                <p>Dear {expenseRaisedEmail.split('@')[0].replace('"', '').capitalize()},</p>
                
                <p>This email is to inform you that a new expense report has been submitted for your review/approval.</p>

                <h3>Expense Details:</h3>

                <ul>
                    {expense_items}
                </ul>
                
                <p>--<br>
                Best regards,<br>
                <strong>Stayease</strong></p>
            </body>
            </html>
            """

        emailsend = EmailMessage(
            subject=subject,
            body=html_body,
            from_email='hello@mystayease.com',
            to=[expenseRaisedEmail, 'accounts@mystayease.com'],
        )
        
        emailsend.extra_headers['Message-ID'] = thread_message_id
        emailsend.extra_headers['References'] = thread_message_id
        
        emailsend.content_subtype = "html"
        emailsend.send()
        
        return thread_message_id
    
    if email_type == 'statusUpdate':
        gst_value = getattr(categories, 'gst', '0')
        gst_str = str(gst_value).strip()
        
        if gst_str.replace('.', '', 1).replace('-', '', 1).isdigit():
            gst = float(gst_str)
        else:
            gst = 0.0
        
        date_str = getattr(categories, 'amountTransferredDate', None)
        if date_str:
            try:
                formatted_date = datetime.strptime(str(date_str), "%Y-%m-%d").strftime("%d-%b-%Y")
            except (ValueError, TypeError):
                formatted_date = "Invalid Date"
        else:
            formatted_date = "N/A"
        
        amount = float(getattr(categories, 'amount', 0) or 0)
        total_amount = amount + gst

        timestamp = getattr(categories, 'updatedAt')

        if isinstance(timestamp, datetime):
            formatted_datetime = timestamp.strftime("%d-%b-%Y %I:%M %p")
        else:
            try:
                dt = datetime.fromisoformat(str(timestamp))
                formatted_datetime = dt.strftime("%d-%b-%Y %I:%M %p")
            except (ValueError, TypeError):
                formatted_datetime = str(timestamp)
        
        subject = f"Re: Expense Submission: {expenseType} - {propertyName} (Head: {headOfExpense})"

        status = getattr(categories, 'status', '').lower()
        
        new_message_id = f"<expense-{uuid.uuid4()}@stayease.com>"
        
        if status == 'rejected':
            html_body = f"""
                <html>
                <body>
                    <p>Dear {expenseRaisedEmail.split('@')[0].replace('"', '').capitalize()},</p>
                    
                    <p>Your expense report has been <strong>rejected</strong>.</p>

                    <h3>Expense Summary:</h3>

                    <h4><strong>Category:</strong> {getattr(categories, 'category', 'N/A')}</h4>
                    <ul>
                        <li><strong>Amount:</strong> {total_amount:.2f}</li>
                        <li><strong>Payment Type:</strong> {getattr(categories, 'paymentType', 'N/A')}</li>
                        <li><strong>Account Id:</strong> {getattr(categories, 'accountId', 'N/A') or 'N/A'}</li>
                        <li><strong>Amount Transferred Date:</strong> {formatted_date}</li>
                        <li><strong>Reason:</strong> {getattr(categories, 'comments', '-') or '-'}</li>
                        <li><strong>Status:</strong> {getattr(categories, 'status', 'N/A')}</li>
                        <li><strong>Transfer Type:</strong> {getattr(categories, 'transferType', 'N/A')}</li>
                        <li><strong>UTR Number:</strong> {getattr(categories, 'utrNumber', 'N/A')}</li>
                        <li><strong>Rejected at:</strong> {formatted_datetime}</li>
                    </ul>

                    <p><strong>Next Steps:</strong></p>
                    <ul>
                        <li>Review the rejection reason above</li>
                        <li>Make necessary corrections to your expense submission</li>
                        <li>Resubmit the corrected expense report</li>
                    </ul>

                    <p>If you have questions about the rejection or need clarification, please contact the accounts department.</p>
                    
                    <p>--<br>
                    Best regards,<br>
                    <strong>Stayease</strong></p>
                </body>
                </html>
                """
            
            emailsend = EmailMessage(
                subject=subject,
                body=html_body,
                from_email='hello@mystayease.com',
                to=[expenseRaisedEmail, 'accounts@mystayease.com'],
            )
            
            emailsend.extra_headers['Message-ID'] = new_message_id
            emailsend.extra_headers['References'] = thread_message_id
            emailsend.extra_headers['In-Reply-To'] = thread_message_id
            
            emailsend.content_subtype = "html"
            emailsend.send()
        
        if status == 'approved':
            html_body = f"""
                <html>
                <body>
                    <p>Dear {expenseRaisedEmail.split('@')[0].replace('"', '').capitalize()},</p>
                    
                    <p>Your expense report has been <strong>approved</strong>.</p>

                    <h3>Expense Summary:</h3>

                    <h4><strong>Category:</strong> {getattr(categories, 'category', 'N/A')}</h4>
                    <ul>
                        <li><strong>Amount:</strong> {total_amount:.2f}</li>
                        <li><strong>Payment Type:</strong> {getattr(categories, 'paymentType', 'N/A')}</li>
                        <li><strong>Account Id:</strong> {getattr(categories, 'accountId', 'N/A') or 'N/A'}</li>
                        <li><strong>Amount Transferred Date:</strong> {formatted_date}</li>
                        <li><strong>Comments:</strong> {getattr(categories, 'comments', '-') or '-'}</li>
                        <li><strong>Status:</strong> {getattr(categories, 'status', 'N/A')}</li>
                        <li><strong>Approved at:</strong> {formatted_datetime}</li>
                    </ul>

                    <p>The approved amount will be processed for reimbursement/payment according to company policy.</p>
                    
                    <p>--<br>
                    Best regards,<br>
                    <strong>Stayease</strong></p>
                </body>
                </html>
                """
            
            emailsend = EmailMessage(
                subject=subject,
                body=html_body,
                from_email='hello@mystayease.com',
                to=[expenseRaisedEmail, 'accounts@mystayease.com'],
            )
            
            emailsend.extra_headers['Message-ID'] = new_message_id
            emailsend.extra_headers['References'] = thread_message_id
            emailsend.extra_headers['In-Reply-To'] = thread_message_id
            
            emailsend.content_subtype = "html"
            emailsend.send()

        if status == 'completed':
            html_body = f"""
                <html>
                <body>
                    <p>Dear {expenseRaisedEmail.split('@')[0].replace('"', '').capitalize()},</p>
                    
                    <p>Your expense report has been <strong>completed</strong>.</p>

                    <h3>Expense Summary:</h3>

                    <h4><strong>Category:</strong> {getattr(categories, 'category', 'N/A')}</h4>
                    <ul>
                        <li><strong>Amount:</strong> {total_amount:.2f}</li>
                        <li><strong>Payment Type:</strong> {getattr(categories, 'paymentType', 'N/A')}</li>
                        <li><strong>Account Id:</strong> {getattr(categories, 'accountId', 'N/A') or 'N/A'}</li>
                        <li><strong>Amount Transferred Date:</strong> {formatted_date}</li>
                        <li><strong>Comments:</strong> {getattr(categories, 'comments', '-') or '-'}</li>
                        <li><strong>Status:</strong> {getattr(categories, 'status', 'N/A')}</li>
                        <li><strong>Transfer Type:</strong> {getattr(categories, 'transferType', 'N/A')}</li>
                        <li><strong>UTR Number:</strong> {getattr(categories, 'utrNumber', 'N/A')}</li>
                        <li><strong>Completed at:</strong> {formatted_datetime}</li>
                    </ul>

                    <p>The reimbursement/payment has been processed according to company policy.</p>
                    
                    <p>--<br>
                    Best regards,<br>
                    <strong>Stayease</strong></p>
                </body>
                </html>
                """
            
            emailsend = EmailMessage(
                subject=subject,
                body=html_body,
                from_email='hello@mystayease.com',
                to=[expenseRaisedEmail, 'accounts@mystayease.com'],
            )
            
            emailsend.extra_headers['Message-ID'] = new_message_id
            emailsend.extra_headers['References'] = thread_message_id
            emailsend.extra_headers['In-Reply-To'] = thread_message_id
            
            emailsend.content_subtype = "html"
            emailsend.send() 
        
@csrf_exempt
def expense_form_submit(request):
    """Handle POST /accounts/expense/submit/ — create an expense with category line items.

    Accepts multipart/form-data. Creates an Expense_Detail header and one or more
    Expense_Category_Detail rows, then sends a pending-status notification email.

    Returns:
        JsonResponse with `success` bool and a `message` describing the outcome.
    """
    if request.method == 'POST':
        try:
            data = {
                    'dashboardUser': request.POST.get('dashboardUser'),
                    'propertyName': request.POST.get('propertyName'),
                    'headOfExpense': request.POST.get('headOfExpense'),
                    'expenseType': request.POST.get('expenseType'),
                }

            if request.POST.get('owner') and request.POST.get('room'):
                owner_instance = Owner_Data.objects.get(id=request.POST.get('ownerId'))

                data['owner_instance'] = owner_instance
                data['owner'] = request.POST.get('owner')
                data['room'] = request.POST.get('room')
                
            if request.POST.get('room') and request.POST.get('resident'):
                data['room'] = request.POST.get('room')
                data['resident'] = request.POST.get('resident')

            expense_instance = Expense_Detail.objects.create(**data)

            categories = []
            index = 0

            while f'selectedCategories[{index}].category' in request.POST:
                category_data = {
                    'expenseRaisedEmail': request.POST.get('expenseRaisedEmail'),
                    'category': request.POST.get(f'selectedCategories[{index}].category'),
                    'amount': request.POST.get(f'selectedCategories[{index}].amount'),
                    'gst': request.POST.get(f'selectedCategories[{index}].gst'),
                    'remarks': request.POST.get(f'selectedCategories[{index}].remarks'),
                    'paymentType': request.POST.get(f'selectedCategories[{index}].paymentType'),
                    'vendorType': request.POST.get(f'selectedCategories[{index}].vendorType'),
                    'vendor': request.POST.get(f'selectedCategories[{index}].vendor'),
                    'accountId': request.POST.get(f'selectedCategories[{index}].accountId'),
                    'amountTransferredDate': request.POST.get(f'selectedCategories[{index}].amountTransferredDate'),
                    'priority': request.POST.get(f'selectedCategories[{index}].priority'),
                    'deadline': request.POST.get(f'selectedCategories[{index}].deadline'),
                    'comments': request.POST.get(f'selectedCategories[{index}].comments'),
                    'receipt': None
                }
                        
                file_key = f'selectedCategories[{index}].receipt'
                if file_key in request.FILES:
                    file_obj = request.FILES[file_key]
                    category_data['receipt'] = file_obj
                        
                categories.append(category_data)
                index += 1

            vendor_ids_json = request.POST.get('vendorIds', '[]')
                    
            if vendor_ids_json and vendor_ids_json != '[]':
                vendor_ids = json.loads(vendor_ids_json)
                vendors = Vendor_Detail.objects.filter(id__in=vendor_ids)

                for category in categories:
                    if category['paymentType'] == 'Reimbursement':
                            Expense_Category_Detail.objects.create(
                                expense_instance=expense_instance,
                                expenseRaisedEmail=request.POST.get('expenseRaisedEmail'),
                                category=category['category'],
                                amount=category['amount'],
                                gst=category['gst'],
                                paymentType=category['paymentType'],
                                accountId=category['accountId'],
                                amountTransferredDate=category['amountTransferredDate'],
                                priority=category['priority'],
                                deadline=category['deadline'],
                                receipt=category['receipt'],
                                comments=category['comments'],
                                status='Pending'
                            )
                    
                for vendor_instance in vendors:
                    for category in categories:
                        if category['paymentType'] == 'Vendor' and category['vendor'] == vendor_instance.vendor:
                            Expense_Category_Detail.objects.create(
                                expense_instance=expense_instance,
                                vendor_instance=vendor_instance,
                                expenseRaisedEmail=request.POST.get('expenseRaisedEmail'),
                                category=category['category'],
                                amount=category['amount'],
                                gst=category['gst'],
                                paymentType=category['paymentType'],
                                vendorType=category['vendorType'],
                                vendor=category['vendor'],
                                accountId=category['accountId'],
                                amountTransferredDate=category['amountTransferredDate'],
                                priority=category['priority'],
                                deadline=category['deadline'],
                                receipt=category['receipt'],
                                comments=category['comments'],
                                status='Pending'
                            )
                
            else:
                if request.POST.get('room') and request.POST.get('resident'):
                    for category in categories:
                        Expense_Category_Detail.objects.create(
                            expense_instance=expense_instance,
                            expenseRaisedEmail=request.POST.get('expenseRaisedEmail'),
                            category=category['category'],
                            amount=category['amount'],
                            gst=category['gst'],
                            remarks=category['remarks'],
                            status='Pending'
                        )
                else:
                    for category in categories:
                        Expense_Category_Detail.objects.create(
                            expense_instance=expense_instance,
                            expenseRaisedEmail=request.POST.get('expenseRaisedEmail'),
                            category=category['category'],
                            amount=category['amount'],
                            gst=category['gst'],
                            paymentType=category['paymentType'],
                            accountId=category['accountId'],
                            amountTransferredDate=category['amountTransferredDate'],
                            priority=category['priority'],
                            deadline=category['deadline'],
                            receipt=category['receipt'],
                            comments=category['comments'],
                            status='Pending'
                        )

            try:
                expense_email(
                    expenseRaisedEmail=request.POST.get('expenseRaisedEmail'),
                    propertyName=request.POST.get('propertyName'),
                    headOfExpense=request.POST.get('headOfExpense'),
                    expenseType=request.POST.get('expenseType'),
                    categories=categories,
                    email_type='pendingStatus',
                    expense_instance=expense_instance
                )
            except Exception as email_err:
                print(f'Expense email failed (non-fatal): {email_err}')

            return JsonResponse({'success': True, 'message': 'Expense data submitted successfully!'})
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': 'Error submitting data. Please try again later!'})
    
    return JsonResponse({'success': False, 'message': 'Invalid request method. POST expected!'})
        
def get_expense_data(request):
    """Handle GET /accounts/expense/ — return all expenses with their category line items flattened.

    Returns:
        JsonResponse with `expense_table` list where each entry represents one category row
        merged with its parent expense header fields.
    """
    if request.method == 'GET':
        try:
            expenses = Expense_Detail.objects.prefetch_related('expense_categories').all()

            expense_data = [
                {
                    "id": expense.id,
                    "owner_instance_id": expense.owner_instance_id,
                    "dashboardUser": expense.dashboardUser,
                    "propertyName": expense.propertyName,
                    "headOfExpense": expense.headOfExpense,
                    "expenseType": expense.expenseType,
                    "owner": expense.owner,
                    "room": expense.room,
                    "resident": expense.resident,
                    "category_id": category.id,
                    "expenseRaisedEmail": category.expenseRaisedEmail.split('@')[0].replace('"', '').capitalize(),
                    "category": category.category,
                    "amount": category.amount,
                    "gst": category.gst,
                    "remarks": category.remarks,
                    "paymentType": category.paymentType,
                    "vendorType": category.vendorType,
                    "vendor": category.vendor,
                    "accountId": category.accountId,
                    "amountTransferredDate": category.amountTransferredDate,
                    "priority": category.priority,
                    "deadline": category.deadline,
                    "comments": category.comments,
                    "receipt": category.receipt.url if category.receipt else None,
                    "status": category.status,
                    "transferType": category.transferType,
                    "utrNumber": category.utrNumber,
                    "createdAt": category.createdAt,
                    "updatedAt": category.updatedAt,
                    "expense_instance_id": category.expense_instance_id,
                    "vendor_instance_id": category.vendor_instance_id,
                }
                for expense in expenses
                for category in expense.expense_categories.all()
            ]

            return JsonResponse({'success': True, 'expense_table': expense_data})
        except Exception as e:
            print (e)
            return JsonResponse({'success': False, 'message': 'Error fetching data. Please try again later!'})
        
    return JsonResponse({'success': False, 'message': 'Invalid request method. GET expected!'})

@csrf_exempt
def accounts_form_update(request, id):
    """Handle PUT /accounts/expense/<id>/update/ — update status and payment fields on a category.

    Args:
        request: Django HttpRequest with JSON body of fields to update.
        id: Primary key of the Expense_Category_Detail to update.

    Returns:
        JsonResponse with `success` bool and a `message`; also triggers a status-update email.
    """
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)

            FIELD_MAPPING = {
                'remarks': 'remarks',
                'comments': 'comments',
                'status': 'status',
                'transferType': 'transferType',
                'utrNumber': 'utrNumber',
            }

            instance = Expense_Category_Detail.objects.get(pk=id)

            updates = {}
            for frontend_field, value in data.items():
                db_field = FIELD_MAPPING.get(frontend_field, frontend_field)
                
                if hasattr(instance, db_field):
                    current_value = getattr(instance, db_field)
                    if current_value != value:
                        setattr(instance, db_field, value)
                        updates[db_field] = value

            if 'status' in updates and updates['status'] != 'Completed':
                if hasattr(instance, 'transferType'):
                    instance.transferType = ''
                    updates['transferType'] = ''
                if hasattr(instance, 'utrNumber'):
                    instance.utrNumber = ''
                    updates['utrNumber'] = ''
            
            if updates:
                instance.save(update_fields=updates.keys())

                instance.updatedAt = timezone.now()
                instance.save(update_fields=['updatedAt'])

                expense_detail = instance.expense_instance

                try:
                    expense_email(
                        expenseRaisedEmail=instance.expenseRaisedEmail,
                        propertyName=expense_detail.propertyName,
                        headOfExpense=expense_detail.headOfExpense,
                        expenseType=expense_detail.expenseType,
                        categories=instance,
                        email_type='statusUpdate',
                        expense_instance=expense_detail
                    )
                except Exception as email_err:
                    print(f'Expense status email failed (non-fatal): {email_err}')

            return JsonResponse({'success': True, 'message': 'Expense details updated successfully!'})

        except Exception as e:
            print (e)
            return JsonResponse({'success': False, 'message': 'Error updating data. Please try again later!'})
        
    return JsonResponse({'success': False, 'message': 'Invalid request method. PUT expected!'})

@csrf_exempt
def accounts_form_delete(request, id):
    """Handle DELETE /accounts/expense/<id>/delete/ — delete an expense or a single category.

    Args:
        request: Django HttpRequest with optional query param `model_type=expense`.
        id: Primary key of the record to delete.

    Returns:
        JsonResponse with `success` bool and a `message`; also deletes the parent expense
        header when the last category is removed.
    """
    if request.method == 'DELETE':
        model_type = request.GET.get('model_type')

        if model_type == 'expense':
            try:
                expense = Expense_Detail.objects.get(id=id)
                expense.delete()
                return JsonResponse({'success': True, 'message': 'Expense data deleted successfully!'})
                
            except Exception as e:
                print (e)
                return JsonResponse({'success': False, 'message': 'Error deleting expense data. Please try again later!'})
                
        else:
            try:
                category_detail = Expense_Category_Detail.objects.get(id=id)
                expense_instance_id = category_detail.expense_instance_id
                
                category_detail.delete()
                
                remaining_categories = Expense_Category_Detail.objects.filter(
                    expense_instance_id=expense_instance_id
                ).exists()
                
                if not remaining_categories:
                    Expense_Detail.objects.filter(id=expense_instance_id).delete()

                    return JsonResponse({'success': True, 'message': 'Category data deleted successfully!', 'value': 'categoryNull'})

                return JsonResponse({'success': True, 'message': 'Category data deleted successfully!'})

            except Exception as e:
                print (e)
                return JsonResponse({'success': False, 'message': 'Error deleting category data. Please try again later!'})
        
    return JsonResponse({'success': False, 'message': 'Invalid request method. DELETE expected!'})

@csrf_exempt
def fixed_expense_form_submit(request):
    """Handle POST /accounts/fixed-expense/submit/ — create a monthly rental payout record.

    Accepts multipart/form-data with owner, property, rental, TDS, and deduction fields.

    Returns:
        JsonResponse with `success` bool and a `message` describing the outcome.
    """
    if request.method == 'POST':
        try:
            owner_instance = Owner_Data.objects.get(id=request.POST.get('ownerId'))

            fixed_expense_instance = Fixed_Expense_Detail(
                owner_instance=owner_instance,
                dashboardUser=request.POST.get('dashboardUser'),
                expenseRaisedEmail=request.POST.get('expenseRaisedEmail'),
                propertyName=request.POST.get('propertyName'),
                owner=request.POST.get('owner'),
                ownerEmail=owner_instance.ownerEmail,
                rental=request.POST.get('rental'),
                tds=request.POST.get('tds'),
                rentalAfterTds=request.POST.get('rentalAfterTds'),
                deductions=request.POST.get('deductions'),
                comments=request.POST.get('comments'),
                monthYear=request.POST.get('monthYear'),
                status='Pending'
            )
            fixed_expense_instance.save()

            return JsonResponse({'success': True, 'message': 'Expense submitted successfully!'})
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': 'Error submitting data. Please try again later!'})
        
def get_fixed_expense_data(request):
    """Handle GET /accounts/fixed-expense/ — return all fixed monthly expense records.

    Returns:
        JsonResponse with `expense_table` list containing rental, TDS, and transfer details.
    """
    if request.method == 'GET':
        try:
            fixed_expenses = Fixed_Expense_Detail.objects.all()

            fixed_expense_data = []

            for expense in fixed_expenses:
                fixed_expense_data.append({
                    "id": expense.id,
                    "dashboardUser": expense.dashboardUser,
                    "expenseRaisedEmail": expense.expenseRaisedEmail,
                    "propertyName": expense.propertyName,
                    "owner": expense.owner,
                    "ownerEmail": expense.ownerEmail,
                    "rental": expense.rental,
                    "tds": expense.tds,
                    "rentalAfterTds": expense.rentalAfterTds,
                    "deductions": expense.deductions,
                    "comments": expense.comments,
                    "monthYear": expense.monthYear,
                    "status": expense.status,
                    "transferType": expense.transferType,
                    "utrNumber": expense.utrNumber,
                    "amountTransferred": expense.amountTransferred,
                    "dateOfTransfer": expense.dateOfTransfer,
                    "emailNote": expense.emailNote,
                    "createdAt": expense.createdAt,
                    "updatedAt": expense.updatedAt
                })

            return JsonResponse({'success': True, 'expense_table': fixed_expense_data})
        except Exception as e:
            print (e)
            return JsonResponse({'success': False, 'message': 'Error fetching data. Please try again later!'})
        
    return JsonResponse({'success': False, 'message': 'Invalid request method. GET expected!'})

@api_view(['PUT'])
@permission_classes([IsAdminGroup])
def accounts_fixed_expense_update(request, id):
    """Handle PUT /accounts/fixed-expense/<id>/update/ — update a fixed expense record.

    Sends a rental payment confirmation email to the owner when status is set to 'Completed'.

    Args:
        request: Django HttpRequest with JSON body of fields to update.
        id: Primary key of the Fixed_Expense_Detail to update.

    Returns:
        JsonResponse with `success` bool, `message`, and `updatedTime` on success.
    """
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)

            FIELD_MAPPING = {
                'comments': 'comments',
                'status': 'status',
                'transferType': 'transferType',
                'utrNumber': 'utrNumber',
                'amountTransferred': 'amountTransferred',
                'dateOfTransfer': 'dateOfTransfer',
                'emailNote': 'emailNote',
            }

            instance = Fixed_Expense_Detail.objects.get(pk=id)
            tracking_model = instance

            updates = {}
            for frontend_field, value in data.items():
                db_field = FIELD_MAPPING.get(frontend_field, frontend_field)
                
                if hasattr(instance, db_field):
                    current_value = getattr(instance, db_field)
                    if current_value != value:
                        setattr(instance, db_field, value)
                        updates[db_field] = value

            if 'status' in updates and updates['status'] != 'Completed':
                if hasattr(instance, 'transferType'):
                    instance.transferType = ''
                    updates['transferType'] = ''
                if hasattr(instance, 'utrNumber'):
                    instance.utrNumber = ''
                    updates['utrNumber'] = ''
                if hasattr(instance, 'amountTransferred'):
                    instance.amountTransferred = ''
                    updates['amountTransferred'] = ''
                if hasattr(instance, 'dateOfTransfer'):
                    instance.dateOfTransfer = ''
                    updates['dateOfTransfer'] = ''
                if hasattr(instance, 'emailNote'):
                    instance.emailNote = ''
                    updates['emailNote'] = ''
            
            if updates:
                instance.save(update_fields=updates.keys())

                tracking_model.updatedAt = timezone.now()
                tracking_model.save(update_fields=['updatedAt'])

            if 'status' in updates and updates['status'] == 'Completed':
                subject = f"Rent Payment for {instance.owner} Processed for Stayease - {instance.monthYear}"

                html_body = f"""
<html>
<body>
    <p>Dear Partners,</p>
    
    <p>We hope this message finds you well.</p>
    
    <p>We are pleased to inform you that the <strong>rental payout for {instance.monthYear}</strong> has been successfully processed as per the agreed terms.</p>
    
    <p>Please find below the UTR details for your reference:</p>
    <ul>
        <li><strong>UTR Number:</strong> {instance.utrNumber}</li>
        <li><strong>Amount Transferred:</strong> ₹ {instance.amountTransferred}</li>
        <li><strong>Date of Transfer:</strong> {instance.dateOfTransfer}</li>
    </ul>
    
    <p><strong>Note:</strong> {instance.emailNote}</p>
    
    <p>Thank you once again for your continued trust and partnership.</p>
    
    <p>--<br>
    Best regards,<br>
    <strong>Stayease</strong></p>
</body>
</html>
"""
                emailsend = EmailMessage(
                    subject=subject,
                    body=html_body,
                    from_email='hello@mystayease.com',
                    to=[instance.expenseRaisedEmail, instance.ownerEmail],
                )
                
                emailsend.content_subtype = "html"
                emailsend.send()

            return JsonResponse({'success': True, 'message': 'Expense details updated successfully!', 'updatedTime': tracking_model.updatedAt})

        except Exception as e:
            print (e)
            return JsonResponse({'success': False, 'message': 'Error updating data. Please try again later!'})
        
    return JsonResponse({'success': False, 'message': 'Invalid request method. PUT expected!'})

@api_view(['DELETE'])
@permission_classes([IsAdminGroup])
def accounts_fixed_expense_delete(request, id):
    """Handle DELETE /accounts/fixed-expense/<id>/delete/ — remove a fixed expense record.

    Args:
        request: Django HttpRequest.
        id: Primary key of the Fixed_Expense_Detail to delete.

    Returns:
        JsonResponse with `success` bool and a `message` describing the outcome.
    """
    if request.method == 'DELETE':
        try:
            fixed_expense_data = Fixed_Expense_Detail.objects.get(id=id)
            fixed_expense_data.delete()
            return JsonResponse({'success': True, 'message': 'Expense data deleted successfully!'})
                
        except Exception as e:
            print (e)
            return JsonResponse({'success': False, 'message': 'Error deleting expense data. Please try again later!'})
        
    return JsonResponse({'success': False, 'message': 'Invalid request method. DELETE expected!'})

@api_view(['GET'])
@permission_classes([IsAdminGroup | IsAccountsTeam])
def get_beds_data(request):
    """Handle GET /accounts/beds/ — return active residents with bed, room, and liability data.

    Returns:
        JsonResponse with `beds_table` list combining property, room, resident,
        KYC, and deposit refund details for all active occupied beds.
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
                        for resident in bed.bed_data_instance.all():
                            if bed.salesStatus == 'Completed' and resident.residentStatus == 'Active':
                                data.append({
                                    'propertyName': property.propertyName,
                                    'doorBuilding': property.doorBuilding,
                                    'streetAddress': property.streetAddress,
                                    'area': property.area,
                                    'state': property.state,
                                    'city': property.city,
                                    'pincode': property.pincode,
                                    'roomNo': room.roomNo,
                                    'bedRoomType': bed.roomType,
                                    'residentId': resident.id,
                                    'propertyManager': resident.propertyManager,
                                    'residentsName': resident.residentsName,
                                    'phoneNumber': resident.phoneNumber,
                                    'email': resident.email,
                                    'permanentAddress': resident.permanentAddress,
                                    'kycType': resident.kycType,
                                    'aadharNumber': resident.aadharNumber,
                                    'aadharFrontCopy': resident.aadharFrontCopy.url if resident.aadharFrontCopy else None,
                                    'aadharBackCopy': resident.aadharBackCopy.url if resident.aadharBackCopy else None,
                                    'panNumber': resident.panNumber,
                                    'panFrontCopy': resident.panFrontCopy.url if resident.panFrontCopy else None,
                                    'panBackCopy': resident.panBackCopy.url if resident.panBackCopy else None,
                                    'checkIn': resident.checkIn,
                                    'checkOut': resident.checkOut,
                                    'rentPerMonth': resident.rentPerMonth,
                                    'totalDepositPaid': resident.totalDepositPaid,
                                    'residentDeductions': get_resident_deductions(resident.residentsName, resident.bed_data_instance.room.roomNo),
                                    'payoutDate': datetime.strptime(resident.checkOut, '%Y-%m-%d').date() + timedelta(days=45) if resident.checkOut else '',
                                    'id': get_resident_amount(resident.id, 'id'),
                                    'status': get_resident_amount(resident.id, 'status'),
                                    'amount': get_resident_amount(resident.id, 'amount'),
                                    'utrNumber': get_resident_amount(resident.id, 'utrNumber'),
                                    'transferredDate': get_resident_amount(resident.id, 'transferredDate'),
                                    'createdAt': get_resident_amount(resident.id, 'createdAt'),
                                    'updatedAt': get_resident_amount(resident.id, 'updatedAt')
                                })

            return JsonResponse({'success': True, 'beds_table': data})
        except Exception as e:
            print (e)
            return JsonResponse({'success': False, 'message': 'Error fetching data. Please try again later!'})
        
    return JsonResponse({'success': False, 'message': 'Invalid request method. GET expected!'})

@api_view(['GET'])
@permission_classes([IsAdminGroup | IsAccountsTeam])
def get_liability_data(request):
    """Handle GET /accounts/liability/ — return all liability records (admin only).

    Returns:
        JsonResponse with `liability_data` list containing resident name, refund status,
        amount, and transfer details.
    """
    if request.method == 'GET':
        try:
            liabilities = Liability_Detail.objects.select_related('liability_resident').all()
            liability_data = [
                {
                    "id": l.id,
                    "status": l.status,
                    "amount": l.amount,
                    "utrNumber": l.utrNumber,
                    "transferredDate": l.transferredDate,
                    "residentName": l.liability_resident.residentsName if l.liability_resident else "",
                    "createdAt": l.createdAt,
                    "updatedAt": l.updatedAt,
                }
                for l in liabilities
            ]
            return JsonResponse({'success': True, 'liability_data': liability_data})
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': 'Error fetching data. Please try again later!'})
    return JsonResponse({'success': False, 'message': 'Invalid request method. GET expected!'})

@csrf_exempt
def liability_form_submit(request):
    """Handle POST /accounts/liability/submit/ — create a deposit refund liability for a resident.

    Optionally sends a bank-details request email to the resident if `checkSendEmail` is true.

    Args:
        request: Django HttpRequest with JSON body containing `residentId`, `status`,
            `checkSendEmail`, `amount`, `utrNumber`, and `transferredDate`.

    Returns:
        JsonResponse with `success` bool and a `message` describing the outcome.
    """
    if request.method == 'POST':
        try:
            liability_data = json.loads(request.body)
            resident_instance = resident_Data.objects.get(id=liability_data.get('residentId'))
            bed_data = resident_instance.bed_data_instance
            room_data = bed_data.room
            property_data = room_data.property

            Liability_Detail.objects.create(
                liability_resident=resident_instance,
                status=liability_data.get('status', 'Pending'),
                checkSendEmail=liability_data.get('checkSendEmail', False),
                amount=liability_data.get('amount', ''),
                utrNumber=liability_data.get('utrNumber', ''),
                transferredDate=liability_data.get('transferredDate', '')
            )

            if liability_data.get('checkSendEmail', False) == True:
                check_in_date = datetime.strptime(resident_instance.checkIn, "%Y-%m-%d")
                formatted_check_in_date_date = check_in_date.strftime("%d-%b-%Y")

                if resident_instance.checkOut:
                    check_out_date = datetime.strptime(resident_instance.checkOut, "%Y-%m-%d")
                    formatted_check_out_date_date = check_out_date.strftime("%d-%b-%Y")
                else:
                    formatted_check_out_date_date = "-"

                subject = f"Request for Bank Details – {property_data.propertyName}"

                html_body = f"""
<html>
<body>
    <p>Dear {resident_instance.residentsName},</p>
    
    <p>Thank you for staying at {property_data.propertyName} during your visit from {formatted_check_in_date_date} to {formatted_check_out_date_date}. We hope you had a pleasant experience!</p>
    
    <p>To process your security deposit refund, we kindly request your bank details. Please provide the following information at your earliest convenience:</p>

    <h3>Booking Details:</h3>

    <ul>
        <li><strong>Guest Name:</strong> {resident_instance.residentsName}</li>
        <li><strong>Property Name:</strong> {property_data.propertyName}</li>
        <li><strong>Check-in Date:</strong> {formatted_check_in_date_date}</li>
        <li><strong>Check-out Date:</strong> {formatted_check_out_date_date}</li>
    </ul>

    <h3>Required Bank Information:</h3>
    
    <ul>
        <li><strong>Account Holder Name:</strong></li>
        <li><strong>Bank Name:</strong></li>
        <li><strong>Account Number:</strong></li>
        <li><strong>IFSC Code:</strong></li>
    </ul>
        
    <p>We appreciate your prompt response and hope to welcome you back soon!</p>
    
    <p>--<br>
    Best regards,<br>
    <strong>Stayease</strong></p>
</body>
</html>
"""
                emailsend = EmailMessage(
                    subject=subject,
                    body=html_body,
                    from_email='hello@mystayease.com',
                    to=[resident_instance.email],
                )
                
                emailsend.content_subtype = "html"
                emailsend.send()

            return JsonResponse({'success': True, 'message': 'Liability data submitted successfully!'})
            
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': 'Error submitting data. Please try again later!'})
    
    return JsonResponse({'success': False, 'message': 'Invalid request method. POST expected!'})

@api_view(['PUT'])
@permission_classes([IsAdminGroup])
def liability_data_update(request, id):
    """Handle PUT /accounts/liability/<id>/update/ — update a resident's deposit liability record.

    Resends the bank-details email to the resident if `checkSendEmail` is set to true.

    Args:
        request: Django HttpRequest with JSON body of fields to update.
        id: Primary key of the Liability_Detail to update.

    Returns:
        JsonResponse with `success` bool and a `message` describing the outcome.
    """
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)

            FIELD_MAPPING = {
                'liability_resident': 'liability_resident',
                'status': 'status',
                'checkSendEmail': 'checkSendEmail',
                'amount': 'amount',
                'utrNumber': 'utrNumber',
                'transferredDate': 'transferredDate'
            }

            instance = Liability_Detail.objects.get(pk=id)
            tracking_model = instance

            updates = {}

            for frontend_field, value in data.items():
                db_field = FIELD_MAPPING.get(frontend_field, frontend_field)
                if hasattr(instance, db_field):
                    current_value = getattr(instance, db_field)
                    if current_value != value:
                        setattr(instance, db_field, value)
                        updates[db_field] = value

            if 'status' in updates and updates['status'] != 'Settled':
                if hasattr(instance, 'amount'):
                    instance.amount = ''
                    updates['amount'] = ''
                if hasattr(instance, 'utrNumber'):
                    instance.utrNumber = ''
                    updates['utrNumber'] = ''
                if hasattr(instance, 'transferredDate'):
                    instance.transferredDate = ''
                    updates['transferredDate'] = ''

            if 'checkSendEmail' in updates and updates['checkSendEmail'] == True:
                resident_instance = resident_Data.objects.get(id=data.get('residentId'))
                bed_instance = resident_instance.bed_data_instance
                room_data = bed_instance.room
                property_data = room_data.property

                check_in_date = datetime.strptime(resident_instance.checkIn, "%Y-%m-%d")
                formatted_check_in_date_date = check_in_date.strftime("%d-%b-%Y")

                if resident_instance.checkOut:
                    check_out_date = datetime.strptime(resident_instance.checkOut, "%Y-%m-%d")
                    formatted_check_out_date_date = check_out_date.strftime("%d-%b-%Y")
                else:
                    formatted_check_out_date_date = "-"

                subject = f"Request for Bank Details – {property_data.propertyName}"

                html_body = f"""
<html>
<body>
    <p>Dear {resident_instance.residentsName},</p>
    
    <p>Thank you for staying at {property_data.propertyName} during your visit from {formatted_check_in_date_date} to {formatted_check_out_date_date}. We hope you had a pleasant experience!</p>
    
    <p>To process your security deposit refund, we kindly request your bank details. Please provide the following information at your earliest convenience:</p>

    <h3>Booking Details:</h3>

    <ul>
        <li><strong>Guest Name:</strong> {resident_instance.residentsName}</li>
        <li><strong>Property Name:</strong> {property_data.propertyName}</li>
        <li><strong>Check-in Date:</strong> {formatted_check_in_date_date}</li>
        <li><strong>Check-out Date:</strong> {formatted_check_out_date_date}</li>
    </ul>

    <h3>Required Bank Information:</h3>
    
    <ul>
        <li><strong>Account Holder Name:</strong></li>
        <li><strong>Bank Name:</strong></li>
        <li><strong>Account Number:</strong></li>
        <li><strong>IFSC Code:</strong></li>
    </ul>
        
    <p>We appreciate your prompt response and hope to welcome you back soon!</p>
    
    <p>--<br>
    Best regards,<br>
    <strong>Stayease</strong></p>
</body>
</html>
"""
                emailsend = EmailMessage(
                    subject=subject,
                    body=html_body,
                    from_email='hello@mystayease.com',
                    to=[resident_instance.email],
                )
                
                emailsend.content_subtype = "html"
                emailsend.send()
            
            if updates:
                instance.save(update_fields=updates.keys())

                tracking_model.updatedAt = timezone.now()
                tracking_model.save(update_fields=['updatedAt'])

            return JsonResponse({'success': True, 'message': 'Liability data updated successfully!'})

        except Exception as e:
            print (e)
            return JsonResponse({'success': False, 'message': 'Error updating data. Please try again later!'})
        
    return JsonResponse({'success': False, 'message': 'Invalid request method. PUT expected!'})

@csrf_exempt
def rawdata_file_upload(request):
    """Handle POST /accounts/rawdata/upload/ — upload a raw bank statement file.

    Args:
        request: Django HttpRequest with multipart file field `rawdataFile`.

    Returns:
        JsonResponse with `success` bool, `message`, and `file_id` of the created record.
    """
    if request.method == 'POST':
        try:
            new_file = RawdataFile.objects.create(rawdataFile = request.FILES.get("rawdataFile"))

            file_id = new_file.id

            return JsonResponse({'success': True, 'message': 'Rawdata uploaded successfully!', 'file_id' : file_id})
            
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': 'Error uploading file. Please try again later!'})
    
    return JsonResponse({'success': False, 'message': 'Invalid request method. POST expected!'})

def get_rawdata_file(request):
    """Handle GET /accounts/rawdata/ — return a list of all uploaded raw data files.

    Returns:
        JsonResponse with `rawdata_files` list of all RawdataFile records as dicts.
    """
    if request.method == 'GET':
        try:
            serialized_data = list(RawdataFile.objects.all().values())

            return JsonResponse({'success': True, 'rawdata_files': serialized_data})
            
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': 'Error fetching data. Please try again later!'})
        
    return JsonResponse({'success': False, 'message': 'Invalid request method. GET expected!'})

@csrf_exempt
def rawdata_file_delete(request, id):
    """Handle DELETE /accounts/rawdata/<id>/delete/ — remove a raw data file record.

    Args:
        request: Django HttpRequest.
        id: Primary key of the RawdataFile to delete.

    Returns:
        JsonResponse with `success` bool and a `message` describing the outcome.
    """
    if request.method == 'DELETE':
        try:
            rawdataFile = RawdataFile.objects.get(id=id)
            rawdataFile.delete()
            return JsonResponse({'success': True, 'message': 'Rawdata file deleted successfully!'})
                
        except Exception as e:
            print (e)
            return JsonResponse({'success': False, 'message': 'Error deleting Rawdata file. Please try again later!'})
        
    return JsonResponse({'success': False, 'message': 'Invalid request method. DELETE expected!'})

def get_rawdata_content(request, id):
    """Handle GET /accounts/rawdata/<id>/content/ — return a presigned S3 URL and parsed rows.

    Args:
        request: Django HttpRequest.
        id: Primary key of the RawdataFile whose content to retrieve.

    Returns:
        JsonResponse with `file_url` presigned URL and `rawdata` list of parsed transaction rows.
    """
    if request.method == 'GET':
        try:
            file_obj = RawdataFile.objects.get(pk=id)
            s3_client = boto3.client('s3')
            presigned_url = s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': 'local-machine-bucket',
                    'Key': file_obj.rawdataFile.name,
                },
            )

            rawdata = Rawdata_Detail.objects.filter(rawdata=id)

            data = []
            for detail in rawdata:
                data.append({
                    "id": detail.id,
                    "Date": detail.date,
                    "Desc": detail.desc,
                    "Type": detail.type,
                    "balance": detail.balance,
                    "Debit": detail.debit,
                    "credit": detail.credit,
                    "propertyName": detail.propertyName,
                    "headOfExpense": detail.headOfExpense,
                    "expenseType": detail.expenseType,
                    "owner": detail.owner,
                    "room": detail.room,
                    "category": detail.category,
                    "comments": detail.comments,
                    "createdAt": detail.createdAt,
                    "updatedAt": detail.updatedAt,
                    "status": detail.status,
                    "receipt": detail.receipt.url if detail.receipt else None,
                    "rawdata_id": detail.rawdata_id,
                    "owner_instance_id": detail.owner_instance_id
                })

            return JsonResponse({'success': True, 'file_url': presigned_url, "rawdata": data})
            
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': 'Error fetching data. Please try again later!'})
        
    return JsonResponse({'success': False, 'message': 'Invalid request method. GET expected!'})

@csrf_exempt
def rawdata_form_submit(request, id):
    """Handle POST /accounts/rawdata/<id>/submit/ — add a parsed transaction row to a file.

    Accepts multipart/form-data with transaction fields and an optional receipt image.

    Args:
        request: Django HttpRequest with form fields for date, desc, type, amounts, and category.
        id: Primary key of the parent RawdataFile record.

    Returns:
        JsonResponse with `success` bool and a `message` describing the outcome.
    """
    if request.method == 'POST':
        try:
            rawdata_instance = get_object_or_404(RawdataFile, id=id)

            data = {
                    'rawdata': rawdata_instance,
                    'date': request.POST.get('date'),
                    'desc': request.POST.get('desc'),
                    'type': request.POST.get('type'),
                    'balance': request.POST.get('balance'),
                    'debit': request.POST.get('debit'),
                    'credit': request.POST.get('credit'),
                    'propertyName': request.POST.get('propertyName'),
                    'headOfExpense': request.POST.get('headOfExpense'),
                    'expenseType': request.POST.get('expenseType'),
                    'category': request.POST.get('category'),
                    'comments': request.POST.get('comments'),
                    'receipt': request.FILES.get("receipt"),
                    'status': 'Completed',
                }

            if request.POST.get('owner') and request.POST.get('room'):
                owner_instance = Owner_Data.objects.get(id=request.POST.get('ownerId'))

                data['owner_instance'] = owner_instance
                data['owner'] = request.POST.get('owner')
                data['room'] = request.POST.get('room')

            rawdata_instance = Rawdata_Detail.objects.create(**data)
            
            rawdata_instance.updatedAt = timezone.now()
            rawdata_instance.save() 

            return JsonResponse({'success': True, 'message': 'Rawdata submitted successfully!'})
            
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': 'Error submitting data. Please try again later!'})
    
    return JsonResponse({'success': False, 'message': 'Invalid request method. POST expected!'})

@api_view(["PUT"])
@csrf_exempt
def rawdata_form_update(request, id):
    """Handle PUT /accounts/rawdata/<id>/update/ — update an existing raw data transaction row.

    Handles optional receipt file replacement and owner instance re-assignment.

    Args:
        request: Django HttpRequest with multipart form data of fields to update.
        id: Primary key of the Rawdata_Detail to update.

    Returns:
        JsonResponse with `success` bool and a `message` describing the outcome.
    """
    if request.method == 'PUT':
        try:
            rawdata_instance = get_object_or_404(Rawdata_Detail, pk=id)
            rawdata_file_instance = get_object_or_404(RawdataFile, id=rawdata_instance.rawdata_id)

            updates = {}

            for key, value in request.POST.items():
                if hasattr(rawdata_instance, key) and key not in ['owner', 'ownerId']:
                    current_value = getattr(rawdata_instance, key)
                    if current_value != value:
                        setattr(rawdata_instance, key, value)
                        updates[key] = value

            if 'owner' in request.POST:
                owner_name = request.POST['owner']
                rawdata_instance.owner = owner_name
                updates['owner'] = owner_name
                
                owner_id = request.POST.get('ownerId', '')
                if owner_id:
                    try:
                        owner_instance = Owner_Data.objects.get(pk=owner_id)
                        rawdata_instance.owner_instance = owner_instance
                        updates['owner_instance'] = owner_instance.id
                    except Owner_Data.DoesNotExist:
                        rawdata_instance.owner_instance = None
                        updates['owner_instance'] = None
                else:
                    rawdata_instance.owner_instance = None
                    updates['owner_instance'] = None

            if 'expenseType' in request.POST and request.POST['expenseType'] != 'Owner Deductions':
                rawdata_instance.owner_instance = None
                rawdata_instance.owner = None
                rawdata_instance.room = None

            if 'receipt' in request.FILES:
                old_file = rawdata_instance.receipt

                if old_file:
                    try:
                        old_file.delete(save=False)
                    except Exception as e:
                        print(f"Error deleting old file: {str(e)}")

                receipt_file = request.FILES['receipt']
                rawdata_instance.receipt = receipt_file
                updates['receipt'] = receipt_file.name

            if updates:
                rawdata_instance.save()
                
                rawdata_instance.updatedAt = timezone.now()
                rawdata_file_instance.updatedAt = timezone.now()
                rawdata_instance.save(update_fields=['updatedAt'])
                rawdata_file_instance.save()

            return JsonResponse({'success': True, 'message': 'Rawdata data updated successfully!'})
            
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': 'Error updating data. Please try again later!'})
    
    return JsonResponse({'success': False, 'message': 'Invalid request method. PUT expected!'})

@csrf_exempt
def rawdata_form_delete(request, id):
    """Handle DELETE /accounts/rawdata/<id>/row/delete/ — remove a single raw data transaction row.

    Args:
        request: Django HttpRequest.
        id: Primary key of the Rawdata_Detail to delete.

    Returns:
        JsonResponse with `success` bool and a `message` describing the outcome.
    """
    if request.method == 'DELETE':
        try:
            rawdata_detail = Rawdata_Detail.objects.get(id=id)
            rawdata_id = rawdata_detail.rawdata_id 

            rawdata_detail.delete()
            rawdata_file = RawdataFile.objects.get(id=rawdata_id)

            rawdata_file.updatedAt = timezone.now()
            rawdata_file.save()
            
            return JsonResponse({'success': True, 'message': 'Rawdata details deleted successfully!'})
                
        except Exception as e:
            print (e)
            return JsonResponse({'success': False, 'message': 'Error deleting details Rawdata. Please try again later!'})
        
    return JsonResponse({'success': False, 'message': 'Invalid request method. DELETE expected!'})

@csrf_exempt
def other_files_upload(request):
    """Handle POST /accounts/other-files/upload/ — upload a miscellaneous document for a property.

    Args:
        request: Django HttpRequest with multipart fields `propertyName`, `fileName`, and `file`.

    Returns:
        JsonResponse with `success` bool and a `message` describing the outcome.
    """
    if request.method == 'POST':
        try:
            OtherFile.objects.create(
                propertyName = request.POST.get("propertyName"),
                fileName = request.POST.get("fileName"),
                file = request.FILES.get("file")
            )

            return JsonResponse({'success': True, 'message': 'File uploaded successfully!'})
            
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': 'Error uploading file. Please try again later!'})
    
    return JsonResponse({'success': False, 'message': 'Invalid request method. POST expected!'})

def get_other_files(request):
    """Handle GET /accounts/other-files/ — return a list of all uploaded miscellaneous files.

    Returns:
        JsonResponse with `other_files` list of all OtherFile records as dicts.
    """
    if request.method == 'GET':
        try:
            serialized_data = list(OtherFile.objects.all().values())

            return JsonResponse({'success': True, 'other_files': serialized_data})
            
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': 'Error fetching data. Please try again later!'})
        
    return JsonResponse({'success': False, 'message': 'Invalid request method. GET expected!'})

@csrf_exempt
def other_file_delete(request, id):
    """Handle DELETE /accounts/other-files/<id>/delete/ — remove a miscellaneous file record.

    Args:
        request: Django HttpRequest.
        id: Primary key of the OtherFile to delete.

    Returns:
        JsonResponse with `success` bool and a `message` describing the outcome.
    """
    if request.method == 'DELETE':
        try:
            rawdataFile = OtherFile.objects.get(id=id)
            rawdataFile.delete()
            return JsonResponse({'success': True, 'message': 'File deleted successfully!'})
                
        except Exception as e:
            print (e)
            return JsonResponse({'success': False, 'message': 'Error deleting Rawdata file. Please try again later!'})


# ── Mobile API Views (JWT-based) ──────────────────────────────

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status as drf_status
from rest_framework_simplejwt.tokens import RefreshToken
from stayease_project.throttles import LoginRateThrottle


class MobileLoginView(APIView):
    """Staff login for mobile — returns JWT tokens + user info."""
    permission_classes = [AllowAny]
    throttle_classes = [LoginRateThrottle]

    def post(self, request):
        """Handle POST /mobile/login/ — authenticate staff and return JWT access/refresh tokens.

        Args:
            request: DRF Request with JSON body containing `username` and `password`.

        Returns:
            Response with `access`, `refresh` tokens, user metadata, and login session ID.
        """
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'success': False, 'message': 'Username and password required.'}, status=drf_status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({'success': False, 'message': 'Invalid credentials.'}, status=drf_status.HTTP_401_UNAUTHORIZED)

        permissions = list(user.get_all_permissions())

        # Track activity
        user_activity_data_instance, _ = User_Activity_Data.objects.get_or_create(
            username=user.username, useremail=user.email,
        )
        user_activity_data_instance.save()
        user_login_instance = User_Login_Data.objects.create(
            user_activity_instance=user_activity_data_instance,
            login_time=timezone.now(),
        )

        refresh = RefreshToken.for_user(user)

        groups = list(user.groups.values_list('name', flat=True))

        return Response({
            'success': True,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'username': user.username,
            'useremail': user.email,
            'permissions': permissions,
            'groups': groups,
            'login_id': user_login_instance.id,
            'is_superuser': user.is_superuser,
        })


class MobilePartnerLoginView(APIView):
    """Partner OTP verification for mobile — returns JWT tokens."""
    permission_classes = [AllowAny]
    throttle_classes = [LoginRateThrottle]

    def post(self, request):
        """Handle POST /mobile/partner/login/ — verify partner OTP and return JWT tokens.

        Args:
            request: DRF Request with JSON body containing `phone` and `otp`.

        Returns:
            Response with `access`, `refresh` tokens and `user_type` on successful OTP verification.
        """
        phone = request.data.get('phone')
        otp = request.data.get('otp')

        if not phone or not otp:
            return Response({'success': False, 'message': 'Phone and OTP required.'}, status=drf_status.HTTP_400_BAD_REQUEST)

        # Delegate to the existing partner OTP verification logic
        try:
            from stayease_partners.views import verify_otp_internal
            result = verify_otp_internal(phone, otp)
            if not result:
                return Response({'success': False, 'message': 'OTP verification failed.'}, status=drf_status.HTTP_401_UNAUTHORIZED)
        except Exception:
            return Response({'success': False, 'message': 'OTP verification failed.'}, status=drf_status.HTTP_401_UNAUTHORIZED)

        # Get or create a Django User for this partner (enables RBAC)
        from django.contrib.auth.models import Group
        user, created = User.objects.get_or_create(
            username=f'partner_{phone}',
            defaults={'is_staff': False, 'is_active': True}
        )
        if created:
            user.set_unusable_password()
            user.save()

        # Ensure user is in the Partner group
        partner_group, _ = Group.objects.get_or_create(name='Partner')
        user.groups.add(partner_group)

        refresh = RefreshToken.for_user(user)
        return Response({
            'success': True,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'phone': phone,
            'user_type': 'partners',
        })