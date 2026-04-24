from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('login/', views.residentLoginView.as_view(), name='resident_login'),

    # Dashboard
    path('dashboard/', views.resident_dashboard, name='resident_dashboard'),

    # Profile
    path('profile/', views.resident_profile, name='resident_profile'),
    path('profile/update/', views.resident_profile_update, name='resident_profile_update'),
    path('change-password/', views.resident_change_password, name='resident_change_password'),

    # KYC
    path('kyc/upload/', views.resident_kyc_upload, name='resident_kyc_upload'),
    path('kyc/status/', views.resident_kyc_status, name='resident_kyc_status'),

    # Rent / Invoices
    path('rent-history/', views.resident_rent_history, name='resident_rent_history'),
    path('invoices/<int:pk>/', views.resident_invoice_detail, name='resident_invoice_detail'),
    path('payments/payu/init/', views.resident_payu_init, name='resident_payu_init'),

    # Complaints
    path('complaints/', views.resident_complaints, name='resident_complaints'),
    path('complaints/submit/', views.resident_complaint_submit, name='resident_complaint_submit'),
    path('complaints/<int:pk>/', views.resident_complaint_detail, name='resident_complaint_detail'),

    # Lease Agreement
    path('lease/', views.resident_lease, name='resident_lease'),

    # Push notifications
    path('register-push-token/', views.resident_register_push_token, name='resident_register_push_token'),
]
