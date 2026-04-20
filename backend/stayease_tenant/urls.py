from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('login/', views.TenantLoginView.as_view(), name='tenant_login'),

    # Dashboard
    path('dashboard/', views.tenant_dashboard, name='tenant_dashboard'),

    # Profile
    path('profile/', views.tenant_profile, name='tenant_profile'),
    path('profile/update/', views.tenant_profile_update, name='tenant_profile_update'),
    path('change-password/', views.tenant_change_password, name='tenant_change_password'),

    # KYC
    path('kyc/upload/', views.tenant_kyc_upload, name='tenant_kyc_upload'),
    path('kyc/status/', views.tenant_kyc_status, name='tenant_kyc_status'),

    # Rent / Invoices
    path('rent-history/', views.tenant_rent_history, name='tenant_rent_history'),
    path('invoices/<int:pk>/', views.tenant_invoice_detail, name='tenant_invoice_detail'),

    # Complaints
    path('complaints/', views.tenant_complaints, name='tenant_complaints'),
    path('complaints/submit/', views.tenant_complaint_submit, name='tenant_complaint_submit'),
    path('complaints/<int:pk>/', views.tenant_complaint_detail, name='tenant_complaint_detail'),

    # Lease Agreement
    path('lease/', views.tenant_lease, name='tenant_lease'),

    # Push notifications
    path('register-push-token/', views.tenant_register_push_token, name='tenant_register_push_token'),
]
