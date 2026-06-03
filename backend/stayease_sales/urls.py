from django.urls import path
from . import views

urlpatterns = [
    path("auth-check/", views.auth_check, name="auth_check"),
    path('login-data/', views.login_view, name='login_view'),
    path("logout/", views.logout_view, name="logout"),
    path('get-user-activity-data/', views.get_user_activity_data, name='get_user_activity_data'),
    path("get-beds-data/", views.get_beds_data, name="get_beds_data"),
    path("resident-form-submit/", views.resident_form_submit, name="resident_form_submit"),
    path("resident-data-update/<str:id>/", views.resident_data_update, name="resident_data_update"),
    path("rent-data-update/<str:id>/", views.rent_data_update, name="rent_data_update"),
    path("leads-form-submit/", views.leads_form_submit, name="leads_form_submit"),
    path("get-leads-data/", views.get_leads_data, name="get_leads_data"),
    path("leads-data-update/<str:id>/", views.leads_data_update, name="leads_data_update"),
    path("leads-data-delete/<str:id>/", views.leads_data_delete, name="leads_data_delete"),
    path('send/', views.upload_and_send),
    path('documents/', views.get_documents),
    path('requests/', views.get_requests),
    path('upload-lease/<str:resident_id>/', views.upload_lease_agreement, name='upload_lease_agreement'),
    path('enable-portal/<str:resident_id>/', views.enable_resident_portal, name='enable_resident_portal'),
    path('refunds/eligible/', views.get_refund_eligible_transactions, name='get_refund_eligible_transactions'),
    path('refunds/initiate/', views.initiate_refund, name='initiate_refund'),
    path('refunds/history/', views.get_refund_history, name='get_refund_history'),
]
