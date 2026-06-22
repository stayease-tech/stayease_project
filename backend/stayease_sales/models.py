from django.db import models
from django.conf import settings
from django.contrib.auth.models import User
from stayease_supply.models import Bed_Data

# Create your models here.
class User_Activity_Data(models.Model):
    """Tracks a unique staff user by username and email for activity auditing."""

    username = models.CharField(max_length=100)
    useremail = models.CharField(max_length=100)

class User_Login_Data(models.Model):
    """Records individual login/logout sessions for a staff user."""

    user_activity_instance = models.ForeignKey(User_Activity_Data, related_name="user_activity", on_delete=models.CASCADE)
    login_time = models.DateTimeField(auto_now_add=True)
    logout_time = models.DateTimeField(blank=True, null=True)

class resident_Data(models.Model):
    """Core resident record linking a person to a bed, storing KYC, lease, rent, and stay lifecycle information."""

    bed_data_instance = models.ForeignKey(Bed_Data, related_name="bed_data_instance", on_delete=models.CASCADE, blank=True, null=True)
    propertyManager = models.CharField(max_length=255, blank=True, null=True)
    salesManager = models.CharField(max_length=255, blank=True, null=True)
    comfortClass = models.CharField(max_length=255, blank=True, null=True)
    mealType = models.CharField(max_length=255, blank=True, null=True)
    firstName = models.CharField(max_length=150, blank=True, null=True)
    lastName = models.CharField(max_length=150, blank=True, null=True)
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
    checkoutReason = models.TextField(blank=True, null=True)
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
    leaseAgreement = models.FileField(upload_to='documents/lease-agreements/%Y/%m/%d/', blank=True, null=True)
    leaseUploadedAt = models.DateTimeField(blank=True, null=True)
    leaseUploadedBy = models.CharField(max_length=255, blank=True, null=True)
    submittedDateAndTime = models.DateTimeField(auto_now_add=True)
    updatedDateAndTime = models.DateTimeField(auto_now=True)
    last_activity = models.DateTimeField(auto_now=True)

class resident_Rent_Data(models.Model):
    """Represents a monthly rent record for a resident, tracking payment status, delay charges, and transfer details."""

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

class PaymentTransaction(models.Model):
    """Records each payment attempt made by a resident, including gateway identifiers and final status."""

    STATUS_CHOICES = [
        ('initiated', 'Initiated'),
        ('success', 'Success'),
        ('failed', 'Failed'),
    ]
    txnid = models.CharField(max_length=64, unique=True)
    resident = models.ForeignKey(resident_Data, on_delete=models.CASCADE, related_name='payment_transactions')
    rent_record = models.ForeignKey(resident_Rent_Data, on_delete=models.SET_NULL, null=True, blank=True, related_name='payment_transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    product_info = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='initiated')
    gateway_status = models.CharField(max_length=50, blank=True, null=True)
    gateway_order_id = models.CharField(max_length=128, blank=True, null=True)
    gateway_payment_id = models.CharField(max_length=128, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['txnid']),
        ]


class RecurringMandate(models.Model):
    """Stores a recurring payment mandate (e.g. auto-debit subscription) linked to a resident for monthly rent collection."""

    STATUS_CHOICES = [
        ('initiated', 'Initiated'),
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('revoked', 'Revoked'),
        ('expired', 'Expired'),
    ]
    txnid = models.CharField(max_length=64, unique=True)
    resident = models.ForeignKey(resident_Data, on_delete=models.CASCADE, related_name='recurring_mandates')
    gateway_subscription_id = models.CharField(max_length=128, blank=True, null=True)
    gateway_plan_id = models.CharField(max_length=128, blank=True, null=True)
    billing_amount = models.DecimalField(max_digits=10, decimal_places=2)
    billing_cycle = models.CharField(max_length=20, default='MONTHLY')
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='initiated')
    next_charge_date = models.DateField(blank=True, null=True)
    last_charged_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['txnid']),
            models.Index(fields=['status', 'next_charge_date']),
        ]

    def __str__(self):
        return f"Mandate {self.txnid} - {self.resident.residentsName} ({self.status})"


class PaymentRefund(models.Model):
    """Tracks a refund initiated against a successful PaymentTransaction, including gateway refund ID and status."""

    STATUS_CHOICES = [
        ('initiated', 'Initiated'),
        ('processing', 'Processing'),
        ('success', 'Success'),
        ('failed', 'Failed'),
    ]
    transaction = models.ForeignKey(PaymentTransaction, on_delete=models.CASCADE, related_name='refunds')
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='initiated')
    gateway_refund_id = models.CharField(max_length=128, blank=True, null=True)
    initiated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='initiated_refunds')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Refund {self.id} — ₹{self.refund_amount} on txn {self.transaction.txnid}"


class Leads_Detail(models.Model):
    """Stores a sales lead with source, contact information, and conversion outcome."""

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
    """Represents a PDF document uploaded by a staff user for e-signature delivery to a recipient."""

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    pdf_file = models.FileField(upload_to='documents/')
    recipient_email = models.EmailField()
    recipient_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

class SigningRequest(models.Model):
    """Records the e-signature request sent to Zoho Sign for a Document, including the signing URL and current status."""

    document = models.ForeignKey(Document, on_delete=models.CASCADE)
    request_id = models.CharField(max_length=100)
    signing_url = models.URLField()
    status = models.CharField(max_length=20, default='sent')
    sent_at = models.DateTimeField(auto_now_add=True)
