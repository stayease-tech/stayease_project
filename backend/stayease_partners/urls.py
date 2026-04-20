from django.urls import path, re_path
from django.views.generic import TemplateView
from . import views

urlpatterns = [
    path('send-otp/', views.send_otp, name='send_otp'),
    path('verify-otp/', views.verify_otp, name='verify_otp'),
    path('get-expense-data/', views.get_expense_data, name='get_expense_data'),
    path('get-overall-data/', views.get_overall_data, name='get_overall_data'),
    path('get-owner-data/', views.get_owner_data, name='get_owner_data'),
    path('get-property-data/', views.get_property_data, name='get_property_data'),
    re_path(r'^partners.*$', TemplateView.as_view(template_name='index.html')),
]