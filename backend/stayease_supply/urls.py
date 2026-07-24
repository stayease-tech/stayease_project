from django.http import JsonResponse
from django.urls import path
from django.views.generic import TemplateView
from django.urls import path, re_path
from django.conf import settings
from . import views

def catch_all_view(request):
    """In production, serve index.html for SPA routing.
    In dev mode (no template), return a clean 404 JSON so Django doesn't crash."""
    if settings.DEBUG:
        return JsonResponse({'detail': 'Not found'}, status=404)
    return TemplateView.as_view(template_name='index.html')(request)

urlpatterns = [
    path("login-data/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("auth-check/", views.auth_check, name="auth_check"),
    path('get-user-activity-data/', views.get_user_activity_data, name='get_user_activity_data'),
    path('owner-form-submit/', views.owner_form_submit, name='owner_form_submit'),
    path('get-owner-data/', views.get_owner_data, name='get_owner_data'),
    path('owner-form-update/<str:id>/', views.owner_form_update, name='owner_form_update'),
    path('owner-form-delete/<str:id>/', views.owner_form_delete, name='owner_form_delete'),
    path('property-data-submit/<str:id>/', views.property_data_submit, name='property_data_submit'),
    path('get-property-data/<str:id>/', views.get_property_data, name='get_property_data'),
    path('property-form-update/<str:id>/', views.property_form_update, name='property_form_update'),
    path('property-form-delete/<str:id>/', views.property_form_delete, name='property_form_delete'),
    path('room-form-submit/<str:id>/', views.room_form_submit, name='room_form_submit'),
    path('get-room-data/<str:id>/', views.get_room_data, name='get_room_data'),
    path('room-data-update/<str:id>/', views.room_data_update, name='room_data_update'),
    path('property-form-submit/', views.property_form_submit, name='property_form_submit'),
    path('get-property-data/', views.get_property_details, name='get_property_details'),
    re_path(r'^.*$', catch_all_view),
]
