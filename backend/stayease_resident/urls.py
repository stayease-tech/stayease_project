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
    path('payments/payu/success/', views.payu_success, name='payu_success'),
    path('payments/payu/failure/', views.payu_failure, name='payu_failure'),
    path('payments/payu/webhook/', views.payu_webhook, name='payu_webhook'),
    path('payments/payu/si-consent/', views.resident_si_consent_init, name='resident_si_consent_init'),
    path('payments/payu/si-success/', views.payu_si_success, name='payu_si_success'),
    path('payments/payu/si-failure/', views.payu_si_failure, name='payu_si_failure'),
    path('payments/mandate/status/', views.resident_mandate_status, name='resident_mandate_status'),
    path('payments/mandate/cancel/', views.resident_mandate_cancel, name='resident_mandate_cancel'),

    # Complaints
    path('complaints/', views.resident_complaints, name='resident_complaints'),
    path('complaints/submit/', views.resident_complaint_submit, name='resident_complaint_submit'),
    path('complaints/<int:pk>/', views.resident_complaint_detail, name='resident_complaint_detail'),

    # Lease Agreement
    path('lease/', views.resident_lease, name='resident_lease'),

    # Push notifications
    path('register-push-token/', views.resident_register_push_token, name='resident_register_push_token'),
]
