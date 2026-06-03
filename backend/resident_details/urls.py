# Copyright (c) 2026 Aravind Adari. All rights reserved.

from django.urls import path, re_path
from django.views.generic import TemplateView
from . import views

urlpatterns = [
    path('resident-table/', views.resident_table, name='resident_table'),
    path('resident-data/', views.resident_data, name='resident_data'),
    path('resident-success/', views.resident_success, name='resident_success'),
    path('<str:property_id>/', views.resident_details, name='resident_details'),
]
