from django.db import models

# Create your models here.
class TenantContract_Detail(models.Model):
    uniqueId = models.CharField(unique=True)
    fname = models.CharField(max_length=100)
    lname = models.CharField(max_length=100)
    phone = models.CharField(max_length=10, unique=True)
    email = models.EmailField(max_length=100, unique=True)
    address = models.TextField()
    dob = models.TextField()
    gender = models.TextField()
    identityType = models.TextField()
    identityNumber = models.TextField()
    frontCopy = models.FileField(upload_to='documents/tenant-identity-documents')
    backCopy = models.FileField(upload_to='documents/tenant-identity-documents')
    submitted_at = models.DateTimeField(auto_now_add=True)
    