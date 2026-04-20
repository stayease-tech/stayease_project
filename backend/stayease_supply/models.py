from django.db import models
from django.db import transaction
import os

# Create your models here.
class User_Activity_Data(models.Model):
    username = models.CharField(max_length=100)
    useremail = models.CharField(max_length=100)

class User_Login_Data(models.Model):
    user_activity_instance = models.ForeignKey(User_Activity_Data, related_name="user_activity", on_delete=models.CASCADE)
    login_time = models.DateTimeField(auto_now_add=True)
    logout_time = models.DateTimeField(blank=True, null=True)

class Owner_Data(models.Model):
    ownerName = models.CharField()
    memberSince = models.CharField(blank=True, null=True)
    ownerPhone = models.CharField()
    ownerEmail = models.CharField()
    ownerAddress = models.CharField()
    ownerDob = models.CharField()
    ownerGender = models.CharField()
    aadharNumber = models.CharField()
    aadharVerification = models.CharField(blank=True, null=True)
    panNumber = models.CharField()
    panVerification = models.CharField(blank=True, null=True)
    accountHolderName = models.CharField()
    accountNumber = models.CharField()
    bankName = models.CharField()
    bankBranch = models.CharField()
    ifscCode = models.CharField()
    accountStatus = models.CharField(blank=True, null=True)
    paymentType = models.CharField(blank=True, null=True)
    aadharFrontCopy = models.FileField(upload_to='documents/owner-documents/%Y/%m/%d/', blank=True, null=True)
    aadharBackCopy = models.FileField(upload_to='documents/owner-documents/%Y/%m/%d/', blank=True, null=True)
    panFrontCopy = models.FileField(upload_to='documents/owner-documents/%Y/%m/%d/', blank=True, null=True)
    panBackCopy = models.FileField(upload_to='documents/owner-documents/%Y/%m/%d/', blank=True, null=True)
    chequeCopy = models.FileField(upload_to='documents/owner-documents/%Y/%m/%d/', blank=True, null=True)
    noOfProperties = models.IntegerField()
    submittedDateAndTime = models.DateTimeField(auto_now_add=True)
    updatedDateAndTime = models.DateTimeField(auto_now=True)
    last_activity = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-last_activity']
        indexes = [
            models.Index(fields=['-last_activity']),
        ]

    def delete(self, *args, **kwargs):
        if self.aadharFrontCopy:
            storage = self.aadharFrontCopy.storage
            if storage.exists(self.aadharFrontCopy.name):
                storage.delete(self.aadharFrontCopy.name)

        if self.aadharBackCopy:
            storage = self.aadharBackCopy.storage
            if storage.exists(self.aadharBackCopy.name):
                storage.delete(self.aadharBackCopy.name)

        if self.panFrontCopy:
            storage = self.panFrontCopy.storage
            if storage.exists(self.panFrontCopy.name):
                storage.delete(self.panFrontCopy.name)

        if self.panBackCopy:
            storage = self.panBackCopy.storage
            if storage.exists(self.panBackCopy.name):
                storage.delete(self.panBackCopy.name)

        if self.chequeCopy:
            storage = self.chequeCopy.storage
            if storage.exists(self.chequeCopy.name):
                storage.delete(self.chequeCopy.name)

        super().delete(*args, **kwargs)

class Property_Data(models.Model):
    owner = models.ForeignKey(Owner_Data, related_name="owner", on_delete=models.CASCADE)
    serial_number = models.CharField(max_length=20)
    propertyName = models.CharField()
    propertyType = models.CharField()
    foundedYear = models.CharField()
    doorBuilding = models.CharField()
    streetAddress = models.CharField()
    area = models.CharField()
    landmark = models.CharField(blank=True, null=True)
    state = models.CharField()
    city = models.CharField()
    pincode = models.CharField()
    selectedMealTypes = models.JSONField(blank=True, null=True)
    rent = models.CharField()
    deposit = models.CharField()
    rentFree = models.CharField()
    rating = models.CharField(blank=True, null=True)
    selectedAmenities = models.JSONField(blank=True, null=True)
    image = models.FileField(upload_to='images/property-images/%Y/%m/%d/', blank=True, null=True)
    status = models.CharField(blank=True, null=True)
    noOfBasements = models.CharField()
    noOfFloors = models.CharField()
    noOfRooms = models.CharField()
    saleDeed = models.FileField(upload_to='documents/property-documents/%Y/%m/%d/', blank=True, null=True)
    ebill = models.FileField(upload_to='documents/property-documents/%Y/%m/%d/', blank=True, null=True)
    taxReceipt = models.FileField(upload_to='documents/property-documents/%Y/%m/%d/', blank=True, null=True)
    waterBill = models.FileField(upload_to='documents/property-documents/%Y/%m/%d/', blank=True, null=True)
    loi = models.FileField(upload_to='documents/property-documents/%Y/%m/%d/', blank=True, null=True)
    agreement = models.FileField(upload_to='documents/property-documents/%Y/%m/%d/', blank=True, null=True)
    submittedDateAndTime = models.DateTimeField(auto_now_add=True)
    updatedDateAndTime = models.DateTimeField(auto_now=True)
    last_activity = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        with transaction.atomic():
            old_instance = None
            if self.pk:
                old_instance = Property_Data.objects.select_for_update().get(pk=self.pk)
            
            name_changed = old_instance and (old_instance.propertyName != self.propertyName)
            year_changed = old_instance and (old_instance.foundedYear != self.foundedYear)
            
            if year_changed and not name_changed:
                same_name_properties = Property_Data.objects.select_for_update().filter(
                    propertyName=self.propertyName,
                    serial_number__isnull=False
                ).exclude(serial_number='')
                
                updates = []
                for prop in same_name_properties:
                    parts = prop.serial_number.split('-')
                    if len(parts) == 3:
                        new_serial = f"SE-{self.foundedYear}-{parts[2]}"
                        updates.append((prop.pk, new_serial))
                
                if updates:
                    from django.db.models import Case, When, Value, CharField
                    
                    Property_Data.objects.filter(
                        pk__in=[u[0] for u in updates]
                    ).update(
                        foundedYear=self.foundedYear,
                        serial_number=Case(
                            *[When(pk=pk, then=Value(serial)) 
                            for pk, serial in updates],
                            output_field=CharField()
                        )
                    )
                    
                    if self.pk in [u[0] for u in updates]:
                        self.refresh_from_db()
            
            elif name_changed:
                existing_property = Property_Data.objects.select_for_update().filter(
                    propertyName=self.propertyName
                ).exclude(serial_number='').first()
                
                if existing_property:
                    self.serial_number = existing_property.serial_number
                    if year_changed:
                        parts = self.serial_number.split('-')
                        if len(parts) == 3:
                            self.serial_number = f"SE-{self.foundedYear}-{parts[2]}"
                else:
                    count = Property_Data.objects.filter(
                        foundedYear=self.foundedYear
                    ).count()
                    self.serial_number = f"SE-{self.foundedYear}-{str(count + 1).zfill(7)}"
            
            if not self.serial_number:
                existing_property = Property_Data.objects.select_for_update().filter(
                    propertyName=self.propertyName,
                    foundedYear=self.foundedYear
                ).exclude(serial_number='').first()
                
                if existing_property:
                    self.serial_number = existing_property.serial_number
                else:
                    count = Property_Data.objects.filter(
                        foundedYear=self.foundedYear
                    ).count()
                    self.serial_number = f"SE-{self.foundedYear}-{str(count + 1).zfill(7)}"
            
            super().save(*args, **kwargs)

    class Meta:
        ordering = ['-last_activity']
        indexes = [
            models.Index(fields=['-last_activity']),
        ]

    def delete(self, *args, **kwargs):
        if self.saleDeed:
            if os.path.isfile(self.saleDeed.path):
                os.remove(self.saleDeed.path)

        if self.ebill:
            if os.path.isfile(self.ebill.path):
                os.remove(self.ebill.path)

        if self.taxReceipt:
            if os.path.isfile(self.taxReceipt.path):
                os.remove(self.taxReceipt.path)

        if self.waterBill:
            if os.path.isfile(self.waterBill.path):
                os.remove(self.waterBill.path)

        if self.loi:
            if os.path.isfile(self.loi.path):
                os.remove(self.loi.path)

        if self.agreement:
            if os.path.isfile(self.agreement.path):
                os.remove(self.agreement.path)

        super().delete(*args, **kwargs)

class Room_Data(models.Model):
    property = models.ForeignKey(Property_Data, related_name="property", on_delete=models.CASCADE)
    buildingLevel = models.CharField()
    roomNo = models.CharField(max_length=255, blank=True, null=True)
    roomType = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(default='Pending')
    is_basement = models.BooleanField(default=False, editable=False)

    def save(self, *args, **kwargs):
        self.is_basement = "basement" in self.buildingLevel.lower()
        super().save(*args, **kwargs)

class Bed_Data(models.Model):
    room = models.ForeignKey(Room_Data, related_name="room", on_delete=models.CASCADE)
    bedLabel = models.CharField(max_length=255, blank=True, null=True)
    balconyAccess = models.CharField(max_length=255, blank=True, null=True)
    bathAccess = models.CharField(max_length=255, blank=True, null=True)
    roomType = models.CharField(max_length=255, blank=True, null=True)
    energyPlan = models.CharField(max_length=255, blank=True, null=True)
    hallAccess = models.CharField(max_length=255, blank=True, null=True)
    kitchenAccess = models.CharField(max_length=255, blank=True, null=True)
    roomSqft = models.CharField(max_length=255, blank=True, null=True)
    tataSkyNo = models.CharField(max_length=255, blank=True, null=True)
    wifiNo = models.CharField(max_length=255, blank=True, null=True)
    bescomMeterNo = models.CharField(max_length=255, blank=True, null=True)
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
    aadharFrontCopy = models.FileField(upload_to='documents/tenant-documents/%Y/%m/%d/', blank=True, null=True)
    aadharBackCopy = models.FileField(upload_to='documents/tenant-documents/%Y/%m/%d/', blank=True, null=True)
    aadharStatus = models.CharField(max_length=255, blank=True, null=True)
    panNumber = models.CharField(max_length=255, blank=True, null=True)
    panFrontCopy = models.FileField(upload_to='documents/tenant-documents/%Y/%m/%d/', blank=True, null=True)
    panBackCopy = models.FileField(upload_to='documents/tenant-documents/%Y/%m/%d/', blank=True, null=True)
    panStatus = models.CharField(max_length=255, blank=True, null=True)
    checkIn = models.CharField(max_length=255, blank=True, null=True)
    checkOut = models.CharField(max_length=255, blank=True, null=True)
    totalDepositPaid = models.CharField(max_length=255, blank=True, null=True)
    rentPerMonth = models.CharField(max_length=255, blank=True, null=True)
    salesStatus = models.CharField(default='Pending')
    moveInChecklistStatus = models.CharField(default='Pending')
    moveInFeedbackStatus = models.CharField(default='Pending')
    moveOutChecklistStatus = models.CharField(default='Pending')
    moveOutFeedbackStatus = models.CharField(default='Pending')
    rentStatus = models.CharField(default='Not Received')
    transferType = models.CharField(max_length=255, blank=True, null=True)
    utrNumber = models.CharField(max_length=255, blank=True, null=True)
    transferredDate = models.CharField(max_length=255, blank=True, null=True)
    last_updated = models.DateTimeField(auto_now=True)

class Property_Detail(models.Model):
    livingRoom = models.ImageField(upload_to='images/property-images/', blank=True, null=True)
    bedRoom = models.ImageField(upload_to='images/property-images/', blank=True, null=True)
    kitchenArea = models.ImageField(upload_to='images/property-images/', blank=True, null=True)
    bathroom = models.ImageField(upload_to='images/property-images/', blank=True, null=True)
    commonArea = models.ImageField(upload_to='images/property-images/', blank=True, null=True)
    productImg = models.ImageField(upload_to='images/property-images/')
    propertyName = models.CharField()
    propertyLocation = models.CharField()
    propertyAddress = models.TextField(blank=True, null=True)
    propertyRoomRent = models.CharField(blank=True, null=True)
    propertyDescription = models.TextField(blank=True, null=True)
    propertyPathname = models.CharField(blank=True, null=True)
    propertyIframeLink = models.TextField(blank=True, null=True)

class Neighbourhood_Image(models.Model):
    property = models.ForeignKey(Property_Detail, related_name="neighbourhoodImages", on_delete=models.CASCADE)
    images = models.ImageField(upload_to='images/neighbourhood-images/', blank=True, null=True)

class Price_Board_Detail(models.Model):
    property = models.ForeignKey(Property_Detail, related_name="priceBoardDetails", on_delete=models.CASCADE)
    roomType = models.CharField(blank=True, null=True)
    roomRent = models.CharField(blank=True, null=True)