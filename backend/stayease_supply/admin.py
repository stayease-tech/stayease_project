from django.contrib import admin
from .models import Owner_Data, Property_Data, Room_Data, Bed_Data

# Register your models here.
admin.site.register(Owner_Data)
admin.site.register(Property_Data)
admin.site.register(Room_Data)
admin.site.register(Bed_Data)
# admin.site.register(Property_Detail)
# admin.site.register(Neighbourhood_Image)
# admin.site.register(Price_Board_Detail)