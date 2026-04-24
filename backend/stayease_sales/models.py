from django.db import models
from django.conf import settings
from django.contrib.auth.models import User
from stayease_supply.models import Bed_Data

# Create your models here.
class User_Activity_Data(models.Model):
    username = models.CharField(max_length=100)
    useremail = models.CharField(max_length=100)

class User_Login_Data(models.Model):
    user_activity_instance = models.ForeignKey(User_Activity_Data, related_name="user_activity", on_delete=models.CASCADE)
    login_time = models.DateTimeField(auto_now_add=True)
    logout_time = models.DateTimeField(blank=True, null=True)

class resident_Data(models.Model):
    bed_data_instance = models.ForeignKey(Bed_Data, related_name="bed_data_instance", on_delete=models.CASCADE, blank=True, null=True)
    propertyManager = models.CharField(max_length=255, blank=True, null=True)
    salesManager = models.CharField(max_length=255, blank=True, null=True)
    comfortClass = models.CharField(max_length=255, blank=True, null=True)
    mealType = models.CharField(max_length=255, blank=True, null=True)
    residentsName = models.CharField(max_length=255, blank=True, null=True)
    phoneNumber = models.CharField(max_length=255, blank=True, null=True)
    email = models.CharField(max_length=255, blank=True, null=True)
    permanentAddress = models.CharField(max_length=255, blank=True, null=True)
    kycType = models.CharField(max_length=255, blank=True, null=True)
    aadharNumber = models.CharField(max_length=255, blank=True, null=True)
    aadharFrontCopy = models.FileField(upload_to='documents/resident-documents/%Y/%m/%d/', blank=True, null=True)
    aadharBackCopy = models.FileField(upload_to='documents/resident-documents/%Y/%m/%d/', blank=True, null=True)
    aadharStatus = models.CharField(max_length=255, blank=True, null=True)
    panNumber = models.CharField(max_length=255, blank=True, null=True)
    panFrontCopy = models.FileField(upload_to='documents/resident-documents/%Y/%m/%d/', blank=True, null=True)
    panBackCopy = models.FileField(upload_to='documents/resident-documents/%Y/%m/%d/', blank=True, null=True)
    panStatus = models.CharField(max_length=255, blank=True, null=True)
    studentEmployeeIdType = models.CharField(max_length=50, blank=True, null=True)
    studentEmployeeIdNumber = models.CharField(max_length=255, blank=True, null=True)
    studentEmployeeIdCopy = models.FileField(upload_to='documents/resident-documents/%Y/%m/%d/', blank=True, null=True)
    kycApprovalStatus = models.CharField(max_length=20, default='Pending')
    kycApprovedBy = models.CharField(max_length=255, blank=True, null=True)
    kycApprovalDate = models.DateTimeField(blank=True, null=True)
    kycRejectionReason = models.TextField(blank=True, null=True)
    residentUser = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True, related_name='resident_profile')
    pushNotificationToken = models.CharField(max_length=255, blank=True, null=True)
    checkIn = models.CharField(max_length=255, blank=True, null=True)
    checkOut = models.CharField(max_length=255, blank=True, null=True)
    totalDepositPaid = models.CharField(max_length=255, blank=True, null=True)
    rentPerMonth = models.CharField(max_length=255, blank=True, null=True)
    residentStatus = models.CharField(max_length=255, blank=True, null=True)
    moveInChecklistStatus = models.CharField(default='Pending')
    moveInFeedbackStatus = models.CharField(default='Pending')
    moveOutChecklistStatus = models.CharField(default='Pending')
    moveOutFeedbackStatus = models.CharField(default='Pending')
    rentStatus = models.CharField(default='Not Received')
    transferType = models.CharField(max_length=255, blank=True, null=True)
    utrNumber = models.CharField(max_length=255, blank=True, null=True)
    transferredDate = models.CharField(max_length=255, blank=True, null=True)
    submittedDateAndTime = models.DateTimeField(auto_now_add=True)
    updatedDateAndTime = models.DateTimeField(auto_now=True)
    last_activity = models.DateTimeField(auto_now=True)

class resident_Rent_Data(models.Model):
    resident_data_instance = models.ForeignKey(resident_Data, related_name="resident_data_instance", on_delete=models.CASCADE, blank=True, null=True)
    rentStatus = models.CharField(default='Not Received')
    month = models.CharField(max_length=255, blank=True, null=True)
    rent = models.CharField(max_length=255, blank=True, null=True)
    delayCharges = models.CharField(max_length=255, blank=True, null=True)
    transferType = models.CharField(max_length=255, blank=True, null=True)
    utrNumber = models.CharField(max_length=255, blank=True, null=True)
    transferredDate = models.CharField(max_length=255, blank=True, null=True)
    submittedDateAndTime = models.DateTimeField(auto_now_add=True)
    updatedDateAndTime = models.DateTimeField(auto_now=True)
    last_activity = models.DateTimeField(auto_now=True)

class Leads_Detail(models.Model):
    leadDate = models.CharField()
    leadSource = models.CharField()
    name = models.CharField()
    contact = models.CharField()
    email = models.CharField(blank=True, null=True)
    leadResult = models.CharField()
    notConvertedReason = models.CharField(blank=True, null=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    last_activity = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-last_activity']
        indexes = [
            models.Index(fields=['-last_activity']),
        ]

class Document(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    pdf_file = models.FileField(upload_to='documents/')
    recipient_email = models.EmailField()
    recipient_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

class SigningRequest(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE)
    request_id = models.CharField(max_length=100)
    signing_url = models.URLField()
    status = models.CharField(max_length=20, default='sent')
    sent_at = models.DateTimeField(auto_now_add=True)
