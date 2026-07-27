from django.urls import path
from . import views

urlpatterns = [
    path("auth-check/", views.auth_check, name="auth_check"),
    path('login-data/', views.login_view, name='login_view'),
    path("logout/", views.logout_view, name="logout"),
    path('get-user-activity-data/', views.get_user_activity_data, name='get_user_activity_data'),
    path('moveinchecklist-form-submit/', views.moveinchecklist_form_submit, name='moveinchecklist_form_submit'),
    path('get-checklistfeedback-data/', views.get_checklistfeedback_data, name='get_checklistfeedback_data'),
    path('moveinfeedback-form-submit/', views.moveinfeedback_form_submit, name='moveinfeedback_form_submit'),
    path('moveoutchecklist-form-submit/', views.moveoutchecklist_form_submit, name='moveoutchecklist_form_submit'),
    path('moveoutfeedback-form-submit/', views.moveoutfeedback_form_submit, name='moveoutfeedback_form_submit'),
    path('get-propertycomplaint-data/', views.get_propertycomplaint_data, name='get_propertycomplaint_data'),
    path('propertycomplaint-form-submit/', views.propertycomplaint_form_submit, name='propertycomplaint_form_submit'),
    path('complaint-update/<str:id>/', views.operations_form_update, name='operations_form_update'),
    path('feedback-form-submit/', views.feedback_form_submit, name='feedback_form_submit'),
    path('get-room-data/', views.get_room_data, name='get_room_data'),
    # KYC management
    path('kyc-pending/', views.get_kyc_pending, name='get_kyc_pending'),
    path('kyc-approve/<int:resident_id>/', views.kyc_approve, name='kyc_approve'),
    path('kyc-reject/<int:resident_id>/', views.kyc_reject, name='kyc_reject'),
]