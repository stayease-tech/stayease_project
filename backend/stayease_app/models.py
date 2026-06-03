from django.db import models

# Create your models here.
class Normal_Enquirie(models.Model):
    """Represents a general enquiry submitted via the public contact form.

    Stores visitor name, contact details, and their message comments.
    """

    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    email = models.EmailField(max_length=255)
    comments = models.TextField()
    submittedAt = models.CharField()

    def __str__(self):
        return f"Enquiry from {self.name} ({self.email})"
    
class Visit_Enquirie(models.Model):
    """Represents a property visit request submitted via the public enquiry form.

    Links a visitor's contact details to a specific property they wish to visit.
    """

    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    email = models.EmailField(max_length=255)
    property = models.CharField()
    submittedAt = models.CharField()

    def __str__(self):
        return f"Enquiry from {self.name} ({self.email})"