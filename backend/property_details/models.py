from django.db import models

# Create your models here.
class PropertyContract_Detail(models.Model):
    uniqueId = models.CharField(unique=True)
    communityManager = models.CharField(max_length=100)
    roomNo = models.CharField()
    accommodationType = models.CharField()
    monthlyFee = models.CharField()
    stayDuration = models.CharField()
    startDate = models.CharField()
    endDate = models.CharField()
    moveOutTime = models.CharField()
    securityDeposit = models.CharField()
    userFeeDueDate = models.CharField()
    propertyAddress = models.CharField()
    tenantContact = models.CharField()
    status = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(auto_now_add=True)
    