from django.urls import path, re_path
from django.views.generic import TemplateView
from . import views

urlpatterns = [
    path('tenant-table/', views.tenant_table, name='tenant_table'),
    path('tenant-data/', views.tenant_data, name='tenant_data'),
    path('tenant-success/', views.tenant_success, name='tenant_success'),
    path('<str:property_id>/', views.tenant_details, name='tenant_details'),
]
