from django.contrib import admin
from .models import  MoveInChecklistDetail, MoveInFeedback, MoveOutChecklistDetail, MoveOutFeedback

# Register your models here.
admin.site.register(MoveInChecklistDetail)
admin.site.register(MoveInFeedback)
admin.site.register(MoveOutChecklistDetail)
admin.site.register(MoveOutFeedback)
