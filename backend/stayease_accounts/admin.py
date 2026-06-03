from django.contrib import admin
from .models import  Vendor_Detail, RawdataFile, Rawdata_Detail, Expense_Detail, Expense_Category_Detail, Fixed_Expense_Detail, Liability_Detail, OtherFile, DropdownConfig


@admin.register(DropdownConfig)
class DropdownConfigAdmin(admin.ModelAdmin):
    list_display = ['group', 'value', 'sort_order']
    list_filter = ['group']
    search_fields = ['group', 'value']
    ordering = ['group', 'sort_order']


# Register your models here.
admin.site.register(Vendor_Detail)
admin.site.register(RawdataFile)
admin.site.register(Rawdata_Detail)
admin.site.register(Expense_Detail)
admin.site.register(Expense_Category_Detail)
admin.site.register(Fixed_Expense_Detail)
admin.site.register(Liability_Detail)
admin.site.register(OtherFile)
