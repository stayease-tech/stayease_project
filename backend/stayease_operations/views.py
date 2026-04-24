import json
from django.utils import timezone
from django.http import JsonResponse
from django.db.models import Prefetch
from django.core.mail import EmailMessage
from datetime import datetime
import uuid
from django.db.models import F
from email.utils import formatdate
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import User_Activity_Data, User_Login_Data, MoveInChecklistDetail, MoveInFeedback, MoveOutChecklistDetail, MoveOutFeedback, PropertyComplaintDetail, ComplaintCategory, Feedback
from stayease_supply.models import Room_Data
from stayease_sales.models import resident_Data
from stayease_accounts.models import Vendor_Detail

# Create your views here.
@login_required
def auth_check(request):
    if request.user.is_authenticated:
        return JsonResponse({"isAuthenticated": True, "username": request.user.username})
    return JsonResponse({"isAuthenticated": False})
    
@csrf_exempt
def login_view(request):
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

def get_checklistfeedback_data(request):
    if request.method == 'GET':
        try:
            moveIn_checklists = MoveInChecklistDetail.objects.select_related(
                'moveInChecklist_bed__bed_data_instance__room__property'
            ).filter(
                moveInChecklist_bed__bed_data_instance__salesStatus='Completed'
            ).annotate(
                room_number=F('moveInChecklist_bed__bed_data_instance__room__roomNo'),
                property_name=F('moveInChecklist_bed__bed_data_instance__room__property__propertyName')
            )

            moveIn_feedbacks = MoveInFeedback.objects.select_related(
                'moveInFeedback_bed__bed_data_instance__room__property'
            ).filter(
                moveInFeedback_bed__bed_data_instance__salesStatus='Completed'
            ).annotate(
                room_number=F('moveInFeedback_bed__bed_data_instance__room__roomNo'),
                property_name=F('moveInFeedback_bed__bed_data_instance__room__property__propertyName')
            )

            moveOut_checklists = MoveOutChecklistDetail.objects.select_related(
                'moveOutChecklist_bed__bed_data_instance__room__property'
            ).filter(
                moveOutChecklist_bed__bed_data_instance__salesStatus='Completed'
            ).annotate(
                room_number=F('moveOutChecklist_bed__bed_data_instance__room__roomNo'),
                property_name=F('moveOutChecklist_bed__bed_data_instance__room__property__propertyName')
            )

            moveOut_feedbacks = MoveOutFeedback.objects.select_related(
                'moveOutFeedback_bed__bed_data_instance__room__property'
            ).filter(
                moveOutFeedback_bed__bed_data_instance__salesStatus='Completed'
            ).annotate(
                room_number=F('moveOutFeedback_bed__bed_data_instance__room__roomNo'),
                property_name=F('moveOutFeedback_bed__bed_data_instance__room__property__propertyName')
            )

            moveInChecklist_data=[]
            moveInFeedback_data=[]
            moveOutChecklist_data=[]
            moveOutFeedback_data=[]

            for detail in moveIn_checklists:
                resident = detail.moveInChecklist_bed
                bed = resident.bed_data_instance if hasattr(resident, 'bed_data_instance') else None
                room = bed.room if bed else None
                
                moveInChecklist_data.append({
                    'roomNo': room.roomNo if room else None,
                    'roomType': room.roomType if room else None,
                    'bedLabel': bed.bedLabel,
                    'residentId': resident.id,
                    'residentsName': resident.residentsName,
                    'checkIn': resident.checkIn,
                    'checkOut': resident.checkOut,
                    'propertyManager': resident.propertyManager,
                    'moveInChecklistStatus': resident.moveInChecklistStatus,
                    'moveInPropertyCondition': detail.moveInPropertyCondition,
                    'moveInPropertyConditionComments': detail.moveInPropertyConditionComments,
                    'moveInElectricalLighting': detail.moveInElectricalLighting,
                    'moveInElectricalLightingComments': detail.moveInElectricalLightingComments,
                    'moveInFurnitureFixtures': detail.moveInFurnitureFixtures,
                    'moveInFurnitureFixturesComments': detail.moveInFurnitureFixturesComments,
                    'moveInKitchenPlumbing': detail.moveInKitchenPlumbing,
                    'moveInKitchenPlumbingComments': detail.moveInKitchenPlumbingComments,
                    'moveInHousekeepingCleanliness': detail.moveInHousekeepingCleanliness,
                    'moveInHousekeepingCleanlinessComments': detail.moveInHousekeepingCleanlinessComments,
                    'moveInRemarks': detail.moveInRemarks,
                    'submittedDateAndTime': detail.submittedDateAndTime,
                    'updatedDateAndTime': detail.updatedDateAndTime
                })

            for detail in moveIn_feedbacks:
                resident = detail.moveInFeedback_bed
                bed = resident.bed_data_instance if hasattr(resident, 'bed_data_instance') else None
                room = bed.room if bed else None

                moveInFeedback_data.append({
                    'roomNo': room.roomNo,
                    'roomType': room.roomType,
                    'residentsName': resident.residentsName,
                    'checkIn': resident.checkIn,
                    'moveInFeedbackStatus': resident.moveInFeedbackStatus,
                    'cleanlinessRoomWashroom': detail.cleanlinessRoomWashroom,
                    'functionalityAppliancesUtilities': detail.functionalityAppliancesUtilities,
                    'comfortSetupRoom': detail.comfortSetupRoom,
                    'staffBehaviorCheckinExperience': detail.staffBehaviorCheckinExperience,
                    'overallImpressionStayease': detail.overallImpressionStayease,
                    'overallComments': detail.overallComments,
                    'submittedDateAndTime': detail.submittedDateAndTime,
                    'updatedDateAndTime': detail.updatedDateAndTime,
                })

            for detail in moveOut_checklists:
                resident = detail.moveOutChecklist_bed
                bed = resident.bed_data_instance if hasattr(resident, 'bed_data_instance') else None
                room = bed.room if bed else None

                moveOutChecklist_data.append({
                    'roomNo': room.roomNo,
                    'roomType': room.roomType,
                    'bedLabel': bed.bedLabel,
                    'residentsName': resident.residentsName,
                    'checkIn': resident.checkIn,
                    'checkOut': resident.checkOut,
                    'moveOutChecklistStatus': resident.moveOutChecklistStatus,
                    'moveOutPropertyCondition': detail.moveOutPropertyCondition,
                    'moveOutPropertyConditionComments': detail.moveOutPropertyConditionComments,
                    'moveOutElectricalLighting': detail.moveOutElectricalLighting,
                    'moveOutElectricalLightingComments': detail.moveOutElectricalLightingComments,
                    'moveOutFurnitureFixtures': detail.moveOutFurnitureFixtures,
                    'moveOutFurnitureFixturesComments': detail.moveOutFurnitureFixturesComments,
                    'moveOutKitchenPlumbing': detail.moveOutKitchenPlumbing,
                    'moveOutKitchenPlumbingComments': detail.moveOutKitchenPlumbingComments,
                    'moveOutHousekeepingCleanliness': detail.moveOutHousekeepingCleanliness,
                    'moveOutHousekeepingCleanlinessComments': detail.moveOutHousekeepingCleanlinessComments,
                    'moveOutRemarks': detail.moveOutRemarks,
                    'submittedDateAndTime': detail.submittedDateAndTime,
                    'updatedDateAndTime': detail.updatedDateAndTime
                })

            for detail in moveOut_feedbacks:
                resident = detail.moveOutFeedback_bed
                bed = resident.bed_data_instance if hasattr(resident, 'bed_data_instance') else None
                room = bed.room if bed else None

                moveOutFeedback_data.append({
                    'roomNo': room.roomNo,
                    'roomType': room.roomType,
                    'residentsName': resident.residentsName,
                    'checkIn': resident.checkIn,
                    'moveOutFeedbackStatus': resident.moveOutFeedbackStatus,
                    'overallStayExperience': detail.overallStayExperience,
                    'cleanlinessPropertyStay': detail.cleanlinessPropertyStay,
                    'responsivenessPropertyTeam': detail.responsivenessPropertyTeam,
                    'commonareaKitchenExperience': detail.commonareaKitchenExperience,
                    'recommendStayease': detail.recommendStayease,
                    'likeMostAboutStay': detail.likeMostAboutStay,
                    'couldImprove': detail.couldImprove,
                    'submittedDateAndTime': detail.submittedDateAndTime,
                    'updatedDateAndTime': detail.updatedDateAndTime,
                })

            return JsonResponse({'success': True, 'moveInChecklist_data': moveInChecklist_data, 'moveInFeedback_data': moveInFeedback_data, 'moveOutChecklist_data': moveOutChecklist_data, 'moveOutFeedback_data': moveOutFeedback_data})
            
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': 'Error fetching data. Please try again later!'})
        
    return JsonResponse({'success': False, 'message': 'Invalid request method. GET expected!'})

def format_date(date):
    if not date:
        return ''
    date_obj = datetime.strptime(date, "%Y-%m-%d")
    formatted_date = date_obj.strftime("%d-%b-%Y")
    return formatted_date

def format_time(time):
    if not time:
        return ''
    time_obj = datetime.strptime(time, "%H:%M")
    formatted_time = time_obj.strftime("%I:%M %p")
    return formatted_time

def send_email_check_in(data):
    bed_data_instance = data.bed_data_instance

    if bed_data_instance:
        room_data_instance = bed_data_instance.room
        
        room_no = room_data_instance.roomNo
        room_type = room_data_instance.roomType
        bed_label = bed_data_instance.bedLabel
                
        property_instance = room_data_instance.property
        property_name = property_instance.propertyName
        
    else:
        room_no = None
        room_type = None
        bed_label = None

    subject = f"""Your Room is Ready! Pre-Arrival Check Complete"""

    html_body = f"""
        <html>
        <body>
            <p>Dear {data.residentsName},</p>
            
            <p>We are pleased to inform you that our pre-arrival check-in audit is now complete, and your room is prepared and ready for you.</p>
            
            <p><strong>Your reservation details have been finalized as follows:</strong></p>
            <ul>
                <li><strong>Guest Name:</strong> {data.residentsName}</li>
                <li><strong>Check-in Date:</strong> {format_date(data.checkIn)}</li>
                <li><strong>Check-out Date:</strong> {format_date(data.checkOut) if data.checkOut else '-'}</li>
                <li><strong>Room Type:</strong> {room_type}</li>
                <li><strong>Unit Number:</strong> {room_no}</li>
                <li><strong>Room Number:</strong> {bed_label}</li>
            </ul>
            
            <p>We have personally inspected your room to ensure it meets our standards of cleanliness and comfort, and we have prepared it according to your reservation details. You can proceed directly to the front desk upon arrival for a quick and efficient check-in experience.</p>

            <p><strong>After your stay, we would greatly value your feedback to help us continue improving our service. Please share your experience with us via this link:<br>
            http://127.0.0.1:8000/operations/operations-moveinfeedback-form/{data.id}?residentId={data.id}</strong></p>
            
            <p>If you need anything before your arrival or have any special requests, feel free to reach out to us by replying to this email.</p>
            
            <p>We look forward to welcoming you to {property_name}!</p>
            
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
        to=[data.email],
    )
    
    emailsend.content_subtype = "html"
    emailsend.send()

@csrf_exempt
def moveinchecklist_form_submit(request):
    if request.method == 'POST':
        try:
            moveinchecklist_data = json.loads(request.body)
            resident_instance = resident_Data.objects.get(id=moveinchecklist_data.get('residentId'))

            MoveInChecklistDetail.objects.create(
                moveInChecklist_bed=resident_instance,
                moveInPropertyCondition=moveinchecklist_data.get('moveInPropertyCondition', ''),
                moveInPropertyConditionComments=moveinchecklist_data.get('moveInPropertyConditionComments', ''),
                moveInElectricalLighting=moveinchecklist_data.get('moveInElectricalLighting', ''),
                moveInElectricalLightingComments=moveinchecklist_data.get('moveInElectricalLightingComments', ''),
                moveInFurnitureFixtures=moveinchecklist_data.get('moveInFurnitureFixtures', ''),
                moveInFurnitureFixturesComments=moveinchecklist_data.get('moveInFurnitureFixturesComments', ''),
                moveInKitchenPlumbing=moveinchecklist_data.get('moveInKitchenPlumbing', ''),
                moveInKitchenPlumbingComments=moveinchecklist_data.get('moveInKitchenPlumbingComments', ''),
                moveInHousekeepingCleanliness=moveinchecklist_data.get('moveInHousekeepingCleanliness', ''),
                moveInHousekeepingCleanlinessComments=moveinchecklist_data.get('moveInHousekeepingCleanlinessComments', ''),
                moveInRemarks=moveinchecklist_data.get('moveInRemarks', ''),
            )

            resident_instance.moveInChecklistStatus='Completed'
            resident_instance.save()

            send_email_check_in(resident_instance)

            return JsonResponse({'success': True, 'message': 'Move-In checklist submitted successfully!'})
            
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': 'Error submitting data. Please try again later!'})
    
    return JsonResponse({'success': False, 'message': 'Invalid request method. POST expected!'})

@csrf_exempt
def moveinfeedback_form_submit(request):
    if request.method == 'POST':
        try:
            moveinfeedback_data = json.loads(request.body)
            bed_instance = resident_Data.objects.get(id=moveinfeedback_data.get('residentId'))

            exists = MoveInFeedback.objects.filter(
                moveInFeedback_bed=bed_instance
            ).exists()

            if exists:
                return JsonResponse({'success': False, 'message': 'Feedback already submitted!'})

            MoveInFeedback.objects.create(
                moveInFeedback_bed=bed_instance,
                cleanlinessRoomWashroom=moveinfeedback_data.get('cleanlinessRoomWashroom', ''),
                functionalityAppliancesUtilities=moveinfeedback_data.get('functionalityAppliancesUtilities', ''),
                comfortSetupRoom=moveinfeedback_data.get('comfortSetupRoom', ''),
                staffBehaviorCheckinExperience=moveinfeedback_data.get('staffBehaviorCheckinExperience', ''),
                overallImpressionStayease=moveinfeedback_data.get('overallImpressionStayease', ''),
                overallComments=moveinfeedback_data.get('overallComments', ''),
            )

            bed_instance.moveInFeedbackStatus='Completed'
            bed_instance.save()

            return JsonResponse({'success': True, 'message': 'Feedback submitted successfully!'})
            
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': 'Error submitting data. Please try again later!'})
    
    return JsonResponse({'success': False, 'message': 'Invalid request method. POST expected!'})

def send_email_check_out(data):
    bed_data_instance = data.bed_data_instance

    if bed_data_instance:
        room_data_instance = bed_data_instance.room
        
        room_no = room_data_instance.roomNo
        bed_label = bed_data_instance.bedLabel
                
        property_instance = room_data_instance.property
        property_name = property_instance.propertyName
        
    else:
        room_no = None
        bed_label = None

    subject = f"""Thank You For Your Stay at {property_name}!"""

    html_body = f"""
        <html>
        <body>
            <p>Dear {data.residentsName},</p>
            
            <p>We hope you had a pleasant and comfortable stay with us at {property_name}!</p>
            
            <p><strong>Your stay details:</strong></p>
            <ul>
                <li><strong>Guest Name:</strong> {data.residentsName}</li>
                <li><strong>Check-in Date:</strong> {format_date(data.checkIn)}</li>
                <li><strong>Check-out Date:</strong> {format_date(data.checkOut) if data.checkOut else 'Today'}</li>
                <li><strong>Room/Unit:</strong> {room_no} ({bed_label})</li>
            </ul>
            
            <p>As you depart, please note:</p>
            <ol>
                <li>Check-out date is {format_date(data.checkOut) if data.checkOut else 'today'}</li>
                <li>Please return your keys/access cards to the front desk</li>
                <li>Ensure all personal belongings have been collected from your room</li>
                <li>Final charges, if any, will be settled at the front desk</li>
            </ol>
            
            <p>We would greatly appreciate your feedback about your stay. Your insights help us improve our services for future guests:<br>
            <strong><a href="http://127.0.0.1:8000/operations/operations-moveoutfeedback-form/{data.id}?residentId={data.id}">Share Your Experience Here</a></strong></p>
            
            <p>Safe travels, and we hope to welcome you back to {property_name} in the future!</p>
            
            <p>--<br>
            Warm regards,<br>
            <strong>The Team at Stayease</strong><br>
            {property_name}<br></p>
        </body>
        </html>
    """
            
    emailsend = EmailMessage(
        subject=subject,
        body=html_body,
        from_email='hello@mystayease.com',
        to=[data.email],
    )
        
    emailsend.content_subtype = "html"
    emailsend.send()

@csrf_exempt
def moveoutchecklist_form_submit(request):
    if request.method == 'POST':
        try:
            moveoutchecklist_data = json.loads(request.body)
            bed_instance = resident_Data.objects.get(id=moveoutchecklist_data.get('residentId'))

            exists = MoveOutChecklistDetail.objects.filter(
                moveOutChecklist_bed=bed_instance
            ).exists()

            if exists:
                return JsonResponse({'success': False, 'message': 'Checklist already submitted!'})

            MoveOutChecklistDetail.objects.create(
                moveOutChecklist_bed=bed_instance,
                moveOutPropertyCondition=moveoutchecklist_data.get('moveOutPropertyCondition', ''),
                moveOutPropertyConditionComments=moveoutchecklist_data.get('moveOutPropertyConditionComments', ''),
                moveOutElectricalLighting=moveoutchecklist_data.get('moveOutElectricalLighting', ''),
                moveOutElectricalLightingComments=moveoutchecklist_data.get('moveOutElectricalLightingComments', ''),
                moveOutFurnitureFixtures=moveoutchecklist_data.get('moveOutFurnitureFixtures', ''),
                moveOutFurnitureFixturesComments=moveoutchecklist_data.get('moveOutFurnitureFixturesComments', ''),
                moveOutKitchenPlumbing=moveoutchecklist_data.get('moveOutKitchenPlumbing', ''),
                moveOutKitchenPlumbingComments=moveoutchecklist_data.get('moveOutKitchenPlumbingComments', ''),
                moveOutHousekeepingCleanliness=moveoutchecklist_data.get('moveOutHousekeepingCleanliness', ''),
                moveOutHousekeepingCleanlinessComments=moveoutchecklist_data.get('moveOutHousekeepingCleanlinessComments', ''),
                moveOutRemarks=moveoutchecklist_data.get('moveOutRemarks', ''),
            )

            bed_instance.moveOutChecklistStatus='Completed'
            bed_instance.save()

            send_email_check_out(bed_instance)

            return JsonResponse({'success': True, 'message': 'Move-Out checklist submitted successfully!'})
            
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': 'Error submitting data. Please try again later!'})
    
    return JsonResponse({'success': False, 'message': 'Invalid request method. POST expected!'})

@csrf_exempt
def moveoutfeedback_form_submit(request):
    if request.method == 'POST':
        try:
            moveoutfeedback_data = json.loads(request.body)

            bed_instance = resident_Data.objects.get(id=moveoutfeedback_data.get('residentId'))

            exists = MoveOutFeedback.objects.filter(
                moveOutFeedback_bed=bed_instance
            ).exists()

            if exists:
                return JsonResponse({'success': False, 'message': 'Feedback already submitted!'})

            MoveOutFeedback.objects.create(
                moveOutFeedback_bed=bed_instance,
                overallStayExperience=moveoutfeedback_data.get('overallStayExperience', ''),
                cleanlinessPropertyStay=moveoutfeedback_data.get('cleanlinessPropertyStay', ''),
                responsivenessPropertyTeam=moveoutfeedback_data.get('responsivenessPropertyTeam', ''),
                commonareaKitchenExperience=moveoutfeedback_data.get('commonareaKitchenExperience', ''),
                recommendStayease=moveoutfeedback_data.get('recommendStayease', ''),
                likeMostAboutStay=moveoutfeedback_data.get('likeMostAboutStay', ''),
                couldImprove=moveoutfeedback_data.get('couldImprove', ''),
            )

            bed_instance.moveOutFeedbackStatus='Completed'
            bed_instance.save()

            return JsonResponse({'success': True, 'message': 'Feedback submitted successfully!'})
            
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': 'Error submitting data. Please try again later!'})
    
    return JsonResponse({'success': False, 'message': 'Invalid request method. POST expected!'})

def get_propertycomplaint_data(request):
    if request.method == 'GET':
        try:
            complaints = PropertyComplaintDetail.objects.select_related(
                'propertyComplaint_bed', 
                'propertyComplaint_bed__bed_data_instance'
            ).prefetch_related(
                'complaint',
                'complaint__complaint_feedback'
            ).all()

            complaints_array = []

            for complaint in complaints:
                for category in complaint.complaint.all():
                    feedback = category.complaint_feedback.first()
                    
                    complaint_obj = {
                        'residentsName': complaint.propertyComplaint_bed.residentsName,
                        'roomNo': complaint.propertyComplaint_bed.bed_data_instance.room.roomNo,
                        'bedLabel': complaint.propertyComplaint_bed.bed_data_instance.bedLabel,
                        'phoneNumber': complaint.propertyComplaint_bed.phoneNumber,
                        'complaint_id': complaint.id,
                        'issue_desc': complaint.issueDesc,
                        'preferredTime': complaint.preferredTime,
                        'submittedDateAndTime': complaint.submittedDateAndTime,
                        'updatedDateAndTime': complaint.updatedDateAndTime,
                        'last_activity': complaint.last_activity,
                        'id': category.id,
                        'category_type': category.get_category_type_display(),
                        'items': category.items,
                        'ticket_number': category.ticket_number,
                        'status': category.status,
                        'vendor': category.vendor,
                        'date': category.date,
                        'fromTime': category.fromTime,
                        'toTime': category.toTime,
                        'comments': category.comments,
                        'has_feedback': feedback is not None,
                        'feedback': {
                            'ratings': feedback.ratings if feedback else None,
                            'suggestions': feedback.suggestions if feedback else None,
                            'issueResolved': feedback.issueResolved if feedback else None,
                            'submittedDateAndTime': feedback.submittedDateAndTime if feedback else None
                        } if feedback else None
                    }
                    complaints_array.append(complaint_obj)

            return JsonResponse({'success': True, 'complaints_array': complaints_array})
            
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': 'Error fetching data. Please try again later!'})
        
    return JsonResponse({'success': False, 'message': 'Invalid request method. GET expected!'})

email_threads = {}

class ComplaintEmailThread:
    def __init__(self, ticket_number, resident_email, resident_name, category_type):
        self.thread_id = f"<complaint-{ticket_number}-{uuid.uuid4()}@mystayease.com>"
        self.ticket_number = ticket_number
        self.resident_email = resident_email
        self.resident_name = resident_name
        self.category_type = category_type
        self.original_subject = f"Property Complaint"
    
    def send_initial_email(self, tickets_list):
        """Send the initial complaint registration email"""
        html_body = f"""
        <html>
        <body>
            <p>Dear {self.resident_name},</p>
            
            <p>We hope this message finds you well.</p>
            
            <p>Thank you for bringing your concern to our attention. We have successfully received your complaint regarding the property and have created a support ticket for tracking purposes.</p>
            
            <p><strong>Your Ticket Numbers:</strong></p>
            <ul>
                {tickets_list}
            </ul>
            
            <p>Our team will review your complaint and address it promptly. You can use the ticket number above for any future correspondence regarding this matter.</p>
            
            <p>We appreciate your patience and will keep you updated on the progress.</p>
            
            <p>--<br>
            Best regards,<br>
            <strong>The Stayease Team</strong></p>
        </body>
        </html>
        """
        
        emailsend = EmailMessage(
            subject=self.original_subject,
            body=html_body,
            from_email='hello@mystayease.com',
            to=[self.resident_email],
        )
        
        emailsend.extra_headers = {
            'Message-ID': self.thread_id,
            'Date': formatdate(localtime=True),
        }
        
        emailsend.content_subtype = "html"
        emailsend.send()
        return self.thread_id
    
    def send_status_update(self, instance, bed_data, status):
        """Send status update email in the same thread"""
        
        subject = f"Re: {self.original_subject}"
        
        if status == 'Open':
            email_content = self._get_open_content(instance, bed_data)
        elif status == 'Follow Up':
            email_content = self._get_follow_up_content(instance, bed_data)
        elif status == 'Closed':
            email_content = self._get_closed_content(instance, bed_data)
        else:
            email_content = self._get_generic_content(instance, bed_data, status)
        
        html_body = f"""
        <html>
        <body>
            <p>Dear {self.resident_name},</p>
            {email_content}
            <p>--<br>Best regards,<br><strong>The Stayease Team</strong></p>
        </body>
        </html>
        """
        
        emailsend = EmailMessage(
            subject=subject,
            body=html_body,
            from_email='hello@mystayease.com',
            to=[self.resident_email],
        )
        
        emailsend.extra_headers = self._get_thread_headers()
        
        emailsend.content_subtype = "html"
        emailsend.send()
    
    def _get_thread_headers(self):
        """Get the appropriate headers for email threading"""
        return {
            'References': self.thread_id,
            'In-Reply-To': self.thread_id,
            'Message-ID': f"<{uuid.uuid4()}@mystayease.com>",
            'Date': formatdate(localtime=True),
        }
    
    def _get_open_content(self, instance, bed_data):
        return f"""
        <p>We hope this message finds you well.</p>
        
        <p><strong>Complaint Details:</strong></p>
        <ul>
            <li><strong>Issue Type:</strong> {instance.category_type}</li>
            <li><strong>Ticket Number:</strong> {instance.ticket_number}</li>
            <li><strong>Scheduled Date:</strong> {format_date(instance.date)}</li>
            <li><strong>Time Slot:</strong> {format_time(instance.fromTime)} - {format_time(instance.toTime)}</li>
            <li><strong>Status:</strong> {instance.status}</li>
        </ul>

        <p>This is to inform you that a vendor has been assigned to address your issue. {f"They will fix the issue on {format_date(instance.date)} between {format_time(instance.fromTime)} and {format_time(instance.toTime)}." if instance.date else ""}</p>
        
        <p>We appreciate your patience and will keep you updated on the progress.</p>
        """
    
    def _get_follow_up_content(self, instance, bed_data):
        return f"""
        <p>We are following up on your reported issue to provide you with an update.</p>
        
        <p><strong>Complaint Details:</strong></p>
        <ul>
            <li><strong>Issue Type:</strong> {instance.category_type}</li>
            <li><strong>Ticket Number:</strong> {instance.ticket_number}</li>
            <li><strong>Rescheduled Date:</strong> {format_date(instance.date)}</li>
            <li><strong>Time Slot:</strong> {format_time(instance.fromTime)} - {format_time(instance.toTime)}</li>
            <li><strong>Status:</strong> {instance.status}</li>
        </ul>

        <p>We have reassigned your case to a new vendor to ensure your issue is properly addressed. Our team is actively working to resolve this matter and we appreciate your continued patience.</p>

        <p>You will receive another update once the vendor has been scheduled or when there is significant progress on your complaint.</p>

        <p>We apologize for any inconvenience caused and thank you for your understanding.</p>
        """
    
    def _get_closed_content(self, instance, bed_data):
        return f"""
        <p>We are pleased to inform you that your reported issue has been successfully resolved.</p>
        
        <p><strong>Complaint Details:</strong></p>
        <ul>
            <li><strong>Issue Type:</strong> {instance.category_type}</li>
            <li><strong>Ticket Number:</strong> {instance.ticket_number}</li>
            <li><strong>Completed Date:</strong> {format_date(instance.date)}</li>
            <li><strong>Status:</strong> {instance.status}</li>
        </ul>

        <p>The maintenance work has been completed and verified by our team. Thank you for your patience and cooperation throughout the process.</p>

        <p>Please let us know your feedback here: http://localhost:8000/operations/operations-feedback-form/{instance.id}</p>
        """
    
    def _get_generic_content(self, instance, bed_data, status):
        return f"""
        <p>We have an update regarding your complaint.</p>
        
        <p><strong>Complaint Details:</strong></p>
        <ul>
            <li><strong>Issue Type:</strong> {instance.category_type}</li>
            <li><strong>Ticket Number:</strong> {instance.ticket_number}</li>
            <li><strong>Status:</strong> {instance.status}</li>
        </ul>

        <p>We will keep you updated on further progress.</p>
        """

@csrf_exempt
def propertycomplaint_form_submit(request):
    if request.method == 'POST':
        try:
            propertyComplaint_data = json.loads(request.body)

            bed_instance = resident_Data.objects.get(id = propertyComplaint_data.get('residentId'))

            complaint = PropertyComplaintDetail.objects.create(
                propertyComplaint_bed=bed_instance,
                residentsName=propertyComplaint_data.get('residentsName', ''),
                phoneNumber=propertyComplaint_data.get('phoneNumber', ''),
                issueDesc=propertyComplaint_data.get('issueDesc', ''),
                preferredTime=propertyComplaint_data.get('preferredTime', '')
            )

            categories = [
                ('Electrical Electronics', propertyComplaint_data.get('electricalElectronics', {})),
                ('Plumbing Bathroom', propertyComplaint_data.get('plumbingBathroom', {})),
                ('Furnitures Fixtures', propertyComplaint_data.get('furnituresFixtures', {})),
                ('Kitchen Equipment', propertyComplaint_data.get('kitchenEquipment', {})),
                ('Internet Connectivity', propertyComplaint_data.get('internetConnectivity', {})),
                ('Other Issues', propertyComplaint_data.get('others', {}))
            ]

            created_categories = []
            tickets_data = []
            
            for category_type, category_data in categories:
                if isinstance(category_data, dict) and (category_data.get('items') or category_data.get('text')):
                    items_value = ', '.join(category_data.get('items', [])) if category_data.get('items') else category_data.get('text', '')
                    
                    complaint_category = ComplaintCategory.objects.create(
                        complaint=complaint,
                        category_type=category_type,
                        items=items_value,
                        ticket_number=category_data.get('ticketNumber', '')
                    )
                    created_categories.append(complaint_category)
                    
                    if category_data.get('ticketNumber'):
                        display_name = category_type.replace(' Electronics', ' & Electronics').replace(' Bathroom', ' & Bathroom').replace(' Fixtures', ' & Fixtures')
                        tickets_data.append({
                            'display_name': display_name,
                            'ticket_number': category_data.get('ticketNumber', ''),
                            'category_type': category_type
                        })

            if tickets_data:
                tickets_list_items = []
                for ticket_info in tickets_data:
                    tickets_list_items.append(f'<li><strong>{ticket_info["display_name"]}:</strong> {ticket_info["ticket_number"]}</li>')
                
                tickets_list = ''.join(tickets_list_items)
                
                first_ticket_number = tickets_data[0]['ticket_number']
                thread_key = f"{first_ticket_number}"
                
                if thread_key not in email_threads:
                    email_threads[thread_key] = ComplaintEmailThread(
                        ticket_number=first_ticket_number,
                        resident_email=bed_instance.email,
                        resident_name=complaint.residentsName,
                        category_type="Property Complaint"
                    )
                    email_threads[thread_key].send_initial_email(tickets_list)

            return JsonResponse({'success': True, 'message': 'Thank you for bringing this to our attention. Our Stayease Property Management Team will ensure your issue is addressed promptly!'})
            
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': 'Error submitting data. Please try again later!'})
    
    return JsonResponse({'success': False, 'message': 'Invalid request method. POST expected!'})

@csrf_exempt
def operations_form_update(request, id):
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)

            vendor_instance = None
            if 'vendorId' in data and data['vendorId']:
                try:
                    vendor_instance = Vendor_Detail.objects.get(id=data['vendorId'])
                except Vendor_Detail.DoesNotExist:
                    vendor_instance = None

            FIELD_MAPPING = {
                'vendor': 'vendor',
                'date': 'date',
                'fromTime': 'fromTime',
                'toTime': 'toTime',
                'comments': 'comments',
                'status': 'status',
            }

            instance = ComplaintCategory.objects.get(pk=id)
            tracking_model = instance

            updates = {}
            for frontend_field, value in data.items():
                if frontend_field == 'vendorId':
                    continue
                    
                db_field = FIELD_MAPPING.get(frontend_field, frontend_field)
                    
                if hasattr(instance, db_field):
                    current_value = getattr(instance, db_field)
                    if current_value != value:
                        setattr(instance, db_field, value)
                        updates[db_field] = value

            if vendor_instance is not None:
                if instance.complaint_vendor != vendor_instance:
                    instance.complaint_vendor = vendor_instance
                    updates['complaint_vendor'] = vendor_instance.id

            if updates:
                instance.save(update_fields=updates.keys())
                tracking_model.updatedDateAndTime = timezone.now()
                tracking_model.save(update_fields=['updatedDateAndTime'])

                complaint_category = ComplaintCategory.objects.get(pk=id)

                bed_data = complaint_category.complaint.propertyComplaint_bed

                if instance.status in ['Open', 'Follow Up', 'Closed']:
                    thread_key = f"{instance.ticket_number}"
                    
                    if thread_key not in email_threads:
                        email_threads[thread_key] = ComplaintEmailThread(
                            ticket_number=instance.ticket_number,
                            resident_email=bed_data.email,
                            resident_name=complaint_category.complaint.residentsName,
                            category_type=instance.category_type
                        )
                    
                    email_threads[thread_key].send_status_update(instance, bed_data, instance.status)

            return JsonResponse({'success': True, 'message': 'Vendor assigned successfully!'})

        except Exception as e:
            print (e)
            return JsonResponse({'success': False, 'message': 'Error assigning vendor. Please try again later!'})
        
    return JsonResponse({'success': False, 'message': 'Invalid request method. PUT expected!'})

@csrf_exempt
def feedback_form_submit(request):
    if request.method == 'POST':
        try:
            feedback_data = json.loads(request.body)
            complaint_id = feedback_data.get('complaintId')

            complaint_instance = ComplaintCategory.objects.get(id=complaint_id)

            exists = Feedback.objects.filter(
                complaint_feedback=complaint_instance
            ).exists()

            if exists:
                return JsonResponse({'success': False, 'message': 'Feedback already submitted!'})
    
            Feedback.objects.create(
                complaint_feedback=complaint_instance,
                issueResolved=feedback_data.get('issueResolved', ''),
                ratings=feedback_data.get('ratings'),
                suggestions=feedback_data.get('suggestions', ''),
            )
            
            return JsonResponse({'success': True, 'message': 'Feedback submitted successfully!'})
            
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': 'Error submitting feedback. Please try again later!'})
    
    return JsonResponse({'success': False, 'message': 'Invalid request method. POST expected!'})

def get_room_data(request):
    if request.method == 'GET':
        try:
            rooms_with_beds = Room_Data.objects.filter(
                property__propertyName='Stayease Harmonia'
            ).prefetch_related(
                'room'
            )

            result_array = []

            for room in rooms_with_beds:
                beds_in_room = room.room.all()
                
                bed_details = []
                
                for bed in beds_in_room:
                    recent_resident = resident_Data.objects.filter(
                        bed_data_instance=bed
                    ).order_by('-checkIn').first()
                    
                    bed_details.append({
                        'id': bed.id,
                        'bedLabel': bed.bedLabel,
                        'residentId': recent_resident.id if recent_resident else None,
                    })
                
                if bed_details:
                    room_data = {
                        'roomNo': room.roomNo,
                        'bed_details': bed_details
                    }
                    result_array.append(room_data)

            return JsonResponse({'success': True, 'room_bed_data': result_array})
            
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': 'Error fetching data. Please try again later!'})


# ─── KYC Management (Operations) ──────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_kyc_pending(request):
    """List all residents with pending/rejected KYC for operations review."""
    if request.method == 'GET':
        try:
            status_filter = request.GET.get('status', 'Pending')
            residents = resident_Data.objects.filter(
                kycApprovalStatus=status_filter
            ).select_related('bed_data_instance__room__property').order_by('-id')

            data = []
            for t in residents:
                bed = t.bed_data_instance
                prop_name = room_no = ''
                if bed and hasattr(bed, 'room') and bed.room:
                    room_no = bed.room.roomNo or ''
                    if hasattr(bed.room, 'property') and bed.room.property:
                        prop_name = bed.room.property.propertyName or ''

                data.append({
                    'id': t.id,
                    'residentsName': t.residentsName,
                    'phoneNumber': t.phoneNumber,
                    'email': t.email,
                    'propertyName': prop_name,
                    'roomNo': room_no,
                    'kycApprovalStatus': t.kycApprovalStatus,
                    'aadharNumber': t.aadharNumber,
                    'aadharFrontCopy': t.aadharFrontCopy.url if t.aadharFrontCopy else None,
                    'aadharBackCopy': t.aadharBackCopy.url if t.aadharBackCopy else None,
                    'panNumber': t.panNumber,
                    'panFrontCopy': t.panFrontCopy.url if t.panFrontCopy else None,
                    'panBackCopy': t.panBackCopy.url if t.panBackCopy else None,
                    'studentEmployeeIdType': t.studentEmployeeIdType,
                    'studentEmployeeIdNumber': t.studentEmployeeIdNumber,
                    'studentEmployeeIdCopy': t.studentEmployeeIdCopy.url if t.studentEmployeeIdCopy else None,
                    'kycRejectionReason': t.kycRejectionReason,
                })

            return JsonResponse({'success': True, 'residents': data})
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': str(e)})

    return JsonResponse({'success': False, 'message': 'GET expected.'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def kyc_approve(request, resident_id):
    """Approve a resident's KYC."""
    if request.method == 'POST':
        try:
            resident = resident_Data.objects.get(id=resident_id)
            resident.kycApprovalStatus = 'Approved'
            resident.kycApprovedBy = request.user.get_full_name() or request.user.username
            resident.kycApprovalDate = timezone.now()
            resident.kycRejectionReason = None
            resident.save()
            return JsonResponse({'success': True, 'message': f'KYC approved for {resident.residentsName}.'})
        except resident_Data.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'resident not found.'})
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': str(e)})

    return JsonResponse({'success': False, 'message': 'POST expected.'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def kyc_reject(request, resident_id):
    """Reject a resident's KYC with a reason."""
    if request.method == 'POST':
        try:
            body = json.loads(request.body)
            reason = body.get('reason', '').strip()
            if not reason:
                return JsonResponse({'success': False, 'message': 'Rejection reason is required.'})

            resident = resident_Data.objects.get(id=resident_id)
            resident.kycApprovalStatus = 'Rejected'
            resident.kycRejectionReason = reason
            resident.kycApprovedBy = None
            resident.kycApprovalDate = None
            resident.save()
            return JsonResponse({'success': True, 'message': f'KYC rejected for {resident.residentsName}.'})
        except resident_Data.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'resident not found.'})
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': str(e)})

    return JsonResponse({'success': False, 'message': 'POST expected.'})
        
    return JsonResponse({'success': False, 'message': 'Invalid request method. GET expected!'})