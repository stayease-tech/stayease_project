from django.db import models
from stayease_supply.models import Owner_Data
from stayease_sales.models import Tenant_Data
    
class User_Activity_Data(models.Model):
    username = models.CharField(max_length=100)
    useremail = models.CharField(max_length=100)

class User_Login_Data(models.Model):
    user_activity_instance = models.ForeignKey(User_Activity_Data, related_name="user_activity", on_delete=models.CASCADE)
    login_time = models.DateTimeField(auto_now_add=True)
    logout_time = models.DateTimeField(blank=True, null=True)

class Vendor_Detail(models.Model):
    vendor = models.CharField()
    contact = models.CharField()
    category = models.CharField()
    billingType = models.CharField()
    accountHolderName = models.CharField(blank=True, null=True)
    accountNumber = models.CharField(blank=True, null=True)
    bankName = models.CharField(blank=True, null=True)
    bankBranch = models.CharField(blank=True, null=True)
    ifscCode = models.CharField(blank=True, null=True)
    upiNumber = models.CharField(blank=True, null=True)
    otherBankingDetails = models.CharField(blank=True, null=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    last_activity = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-last_activity']
        indexes = [
            models.Index(fields=['-last_activity']),
        ]

class Expense_Detail(models.Model):
    owner_instance = models.ForeignKey(Owner_Data, related_name="owner_expenses", on_delete=models.CASCADE, blank=True, null=True)
    dashboardUser = models.CharField(max_length=100, blank=True, null=True)
    propertyName = models.CharField(max_length=100)
    headOfExpense = models.CharField(max_length=100)
    expenseType = models.CharField(max_length=100)
    owner = models.CharField(max_length=100, blank=True, null=True)
    room = models.CharField(max_length=100, blank=True, null=True)
    resident = models.CharField(max_length=100, blank=True, null=True)
    email_thread_id = models.CharField(max_length=255, blank=True, null=True)

class Expense_Category_Detail(models.Model):
    expense_instance = models.ForeignKey(Expense_Detail, related_name="expense_categories", on_delete=models.CASCADE, blank=True, null=True)
    vendor_instance = models.ForeignKey(Vendor_Detail, related_name="vendor_categories", on_delete=models.CASCADE, blank=True, null=True)
    expenseRaisedEmail = models.CharField(max_length=100, blank=True, null=True)
    category = models.CharField(max_length=100)
    amount = models.CharField(max_length=100)
    gst = models.CharField(max_length=100, blank=True, null=True)
    remarks = models.CharField(max_length=100, blank=True, null=True)
    paymentType = models.CharField(max_length=100, blank=True, null=True)
    vendorType = models.CharField(max_length=100, blank=True, null=True)
    vendor = models.CharField(max_length=100, blank=True, null=True)
    accountId = models.CharField(max_length=100, blank=True, null=True)
    amountTransferredDate = models.CharField(max_length=100, blank=True, null=True)
    priority = models.CharField(max_length=100)
    deadline = models.CharField(max_length=100)
    receipt = models.ImageField(upload_to='documents/accounts-receipts/%Y/%m/%d/', blank=True, null=True)
    comments = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=100)
    transferType = models.CharField(max_length=100, blank=True, null=True)
    utrNumber = models.CharField(max_length=100, blank=True, null=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    last_activity = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-last_activity']
        indexes = [
            models.Index(fields=['-last_activity']),
        ]

    def delete(self, *args, **kwargs):
        if self.receipt:
            storage = self.receipt.storage
            if storage.exists(self.receipt.name):
                storage.delete(self.receipt.name)
        super().delete(*args, **kwargs)

    class Meta:
        verbose_name = "Expense Category"
        verbose_name_plural = "Expense Categories"

class Fixed_Expense_Detail(models.Model):
    owner_instance = models.ForeignKey(Owner_Data, related_name="owner_fixed_expenses", on_delete=models.CASCADE)
    dashboardUser = models.CharField(max_length=100)
    expenseRaisedEmail = models.CharField(max_length=100)
    propertyName = models.CharField(max_length=100)
    owner = models.CharField(max_length=100)
    ownerEmail = models.CharField(max_length=100)
    rental = models.CharField(max_length=100)
    tds = models.CharField(max_length=100)
    rentalAfterTds = models.CharField(max_length=100)
    deductions = models.CharField(max_length=100)
    comments = models.CharField(max_length=100, blank=True, null=True)
    monthYear = models.CharField(max_length=100)
    status = models.CharField(max_length=100)
    transferType = models.CharField(max_length=100, blank=True, null=True)
    utrNumber = models.CharField(max_length=100, blank=True, null=True)
    amountTransferred = models.CharField(max_length=100, blank=True, null=True)
    dateOfTransfer = models.CharField(max_length=100, blank=True, null=True)
    emailNote = models.CharField(max_length=100, blank=True, null=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    last_activity = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-last_activity']
        indexes = [
            models.Index(fields=['-last_activity']),
        ]

class Liability_Detail(models.Model):
    liability_tenant = models.ForeignKey(Tenant_Data, related_name="liability_tenant", on_delete=models.CASCADE, blank=True, null=True)
    status = models.CharField(max_length=100)
    checkSendEmail = models.BooleanField(blank=True, null=True)
    amount = models.CharField(max_length=100, blank=True, null=True)
    utrNumber = models.CharField(max_length=100, blank=True, null=True)
    transferredDate = models.CharField(max_length=100, blank=True, null=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    last_activity = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-last_activity']
        indexes = [
            models.Index(fields=['-last_activity']),
        ]

class RawdataFile(models.Model):
    rawdataFile = models.FileField(upload_to='documents/accounts-files/%Y/%m/%d/')
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    last_activity = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-last_activity']
        indexes = [
            models.Index(fields=['-last_activity']),
        ]

    def delete(self, *args, **kwargs):
        if self.rawdataFile:
            storage = self.rawdataFile.storage
            if storage.exists(self.rawdataFile.name):
                storage.delete(self.rawdataFile.name)
        super().delete(*args, **kwargs)

class Rawdata_Detail(models.Model):
    rawdata = models.ForeignKey(RawdataFile, related_name="rawdata", on_delete=models.CASCADE)
    owner_instance = models.ForeignKey(Owner_Data, related_name="owner_rawdata", on_delete=models.CASCADE, blank=True, null=True)
    date = models.CharField()
    desc = models.CharField()
    type = models.CharField()
    balance = models.CharField()
    debit = models.CharField()
    credit = models.CharField()
    propertyName = models.CharField()
    headOfExpense = models.CharField()
    expenseType = models.CharField()
    owner = models.CharField(blank=True, null=True)
    room = models.CharField(blank=True, null=True)
    category = models.CharField()
    status = models.CharField()
    comments = models.TextField(blank=True, null=True)
    receipt = models.ImageField(upload_to='documents/accounts-receipts/%Y/%m/%d/', blank=True, null=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def delete(self, *args, **kwargs):
        if self.receipt:
            storage = self.receipt.storage
            if storage.exists(self.receipt.name):
                storage.delete(self.receipt.name)
        super().delete(*args, **kwargs)

    class Meta:
        verbose_name = "Raw Data Detail"
        verbose_name_plural = "Raw Data Details"

class OtherFile(models.Model):
    propertyName = models.CharField(max_length=255)
    fileName = models.CharField(max_length=255)
    file = models.FileField(upload_to='documents/accounts-other-files/%Y/%m/%d/')
    createdAt = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-last_activity']
        indexes = [
            models.Index(fields=['-last_activity']),
        ]

    def delete(self, *args, **kwargs):
        if self.file:
            storage = self.file.storage
            if storage.exists(self.file.name):
                storage.delete(self.file.name)
        super().delete(*args, **kwargs)