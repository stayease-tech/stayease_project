from django.db import models
from stayease_sales.models import Tenant_Data
from stayease_accounts.models import Vendor_Detail

class User_Activity_Data(models.Model):
    username = models.CharField(max_length=100)
    useremail = models.CharField(max_length=100)

class User_Login_Data(models.Model):
    user_activity_instance = models.ForeignKey(User_Activity_Data, related_name="user_activity", on_delete=models.CASCADE)
    login_time = models.DateTimeField(auto_now_add=True)
    logout_time = models.DateTimeField(blank=True, null=True)
    
class MoveInChecklistDetail(models.Model):
    moveInChecklist_bed = models.ForeignKey(Tenant_Data, related_name="moveInChecklist_bed", on_delete=models.CASCADE)
    moveInPropertyCondition = models.CharField(blank=True, null=True)
    moveInPropertyConditionComments = models.TextField(blank=True, null=True)
    moveInElectricalLighting = models.CharField(blank=True, null=True)
    moveInElectricalLightingComments = models.TextField(blank=True, null=True)
    moveInFurnitureFixtures = models.CharField(blank=True, null=True)
    moveInFurnitureFixturesComments = models.TextField(blank=True, null=True)
    moveInKitchenPlumbing = models.CharField(blank=True, null=True)
    moveInKitchenPlumbingComments = models.TextField(blank=True, null=True)
    moveInHousekeepingCleanliness = models.CharField(blank=True, null=True)
    moveInHousekeepingCleanlinessComments = models.TextField(blank=True, null=True)
    moveInRemarks = models.TextField(blank=True, null=True)
    submittedDateAndTime = models.DateTimeField(auto_now_add=True)
    updatedDateAndTime = models.DateTimeField(auto_now=True)
    last_activity = models.DateTimeField(auto_now=True)

class MoveInFeedback(models.Model):
    moveInFeedback_bed = models.ForeignKey(Tenant_Data, related_name="moveInFeedback_bed", on_delete=models.CASCADE)
    cleanlinessRoomWashroom = models.IntegerField(blank=True, null=True)
    functionalityAppliancesUtilities = models.IntegerField(blank=True, null=True)
    comfortSetupRoom = models.IntegerField(blank=True, null=True)
    staffBehaviorCheckinExperience = models.IntegerField(blank=True, null=True)
    overallImpressionStayease = models.IntegerField(blank=True, null=True)
    overallComments = models.TextField(blank=True, null=True)
    submittedDateAndTime = models.DateTimeField(auto_now_add=True)
    updatedDateAndTime = models.DateTimeField(auto_now=True)
    last_activity = models.DateTimeField(auto_now=True)

class MoveOutChecklistDetail(models.Model):
    moveOutChecklist_bed = models.ForeignKey(Tenant_Data, related_name="moveOutChecklist_bed", on_delete=models.CASCADE)
    moveOutPropertyCondition = models.CharField(blank=True, null=True)
    moveOutPropertyConditionComments = models.TextField(blank=True, null=True)
    moveOutElectricalLighting = models.CharField(blank=True, null=True)
    moveOutElectricalLightingComments = models.TextField(blank=True, null=True)
    moveOutFurnitureFixtures = models.CharField(blank=True, null=True)
    moveOutFurnitureFixturesComments = models.TextField(blank=True, null=True)
    moveOutKitchenPlumbing = models.CharField(blank=True, null=True)
    moveOutKitchenPlumbingComments = models.TextField(blank=True, null=True)
    moveOutHousekeepingCleanliness = models.CharField(blank=True, null=True)
    moveOutHousekeepingCleanlinessComments = models.TextField(blank=True, null=True)
    moveOutRemarks = models.TextField(blank=True, null=True)
    submittedDateAndTime = models.DateTimeField(auto_now_add=True)
    updatedDateAndTime = models.DateTimeField(auto_now=True)
    last_activity = models.DateTimeField(auto_now=True)

class MoveOutFeedback(models.Model):
    moveOutFeedback_bed = models.ForeignKey(Tenant_Data, related_name="moveOutFeedback_bed", on_delete=models.CASCADE)
    overallStayExperience = models.IntegerField(blank=True, null=True)
    cleanlinessPropertyStay = models.IntegerField(blank=True, null=True)
    responsivenessPropertyTeam = models.IntegerField(blank=True, null=True)
    commonareaKitchenExperience = models.IntegerField(blank=True, null=True)
    recommendStayease = models.IntegerField(blank=True, null=True)
    likeMostAboutStay = models.TextField(blank=True, null=True)
    couldImprove = models.TextField(blank=True, null=True)
    submittedDateAndTime = models.DateTimeField(auto_now_add=True)
    updatedDateAndTime = models.DateTimeField(auto_now=True)
    last_activity = models.DateTimeField(auto_now=True)

class EmailThread(models.Model):
    ticket_number = models.CharField(max_length=100, unique=True)
    thread_id = models.CharField(max_length=255)
    resident_email = models.EmailField()
    resident_name = models.CharField(max_length=255)
    category_type = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

class PropertyComplaintDetail(models.Model):
    propertyComplaint_bed = models.ForeignKey(Tenant_Data, related_name="propertyComplaint_bed", on_delete=models.CASCADE)
    residentsName = models.TextField(blank=True, null=True)
    phoneNumber = models.TextField(blank=True, null=True)
    issueDesc = models.TextField(blank=True, null=True)
    preferredTime = models.CharField(blank=True, null=True)
    submittedDateAndTime = models.DateTimeField(auto_now_add=True)
    updatedDateAndTime = models.DateTimeField(auto_now=True)
    last_activity = models.DateTimeField(auto_now=True)

class ComplaintCategory(models.Model):
    complaint = models.ForeignKey(PropertyComplaintDetail, related_name='complaint', on_delete=models.CASCADE)
    complaint_vendor = models.ForeignKey(Vendor_Detail, related_name="complaint_vendor", on_delete=models.CASCADE, blank=True, null=True)
    
    category_type = models.CharField(max_length=50, choices=[
        ('electricalElectronics', 'Electrical & Electronics'),
        ('plumbingBathroom', 'Plumbing & Bathroom'),
        ('furnituresFixtures', 'Furnitures & Fixtures'),
        ('kitchenEquipment', 'Kitchen Equipment'),
        ('internetConnectivity', 'Internet Connectivity'),
        ('others', 'Other Issues')
    ])
    
    items = models.TextField(blank=True)
    ticket_number = models.CharField(max_length=100, blank=True)
    vendor = models.CharField(max_length=100, blank=True)
    date = models.CharField(max_length=100, blank=True)
    fromTime = models.CharField(max_length=100, blank=True)
    toTime = models.CharField(max_length=100, blank=True)
    comments = models.TextField(blank=True)
    
    status = models.CharField(
        max_length=20, 
        default='Open',
        choices=[
            ('Open', 'Open'),
            ('Follow Up', 'Follow Up'),
            ('Closed', 'Closed')
        ]
    )
    
    submittedDateAndTime = models.DateTimeField(auto_now_add=True)
    updatedDateAndTime = models.DateTimeField(auto_now=True)
    last_activity = models.DateTimeField(auto_now=True)

class Feedback(models.Model):
    complaint_feedback = models.ForeignKey(ComplaintCategory, related_name="complaint_feedback", on_delete=models.CASCADE)
    issueResolved = models.TextField(blank=True, null=True)
    ratings = models.IntegerField(blank=True, null=True)
    suggestions = models.CharField(blank=True, null=True)
    submittedDateAndTime = models.DateTimeField(auto_now_add=True)
    updatedDateAndTime = models.DateTimeField(auto_now=True)
    last_activity = models.DateTimeField(auto_now=True)