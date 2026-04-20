from django.http import JsonResponse
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
    path('', views.index_page, name='index_page'),
    path('normal-enquiry/', views.normal_enquiry, name='normal_enquiry'),
    path('visit-enquiry/', views.visit_enquiry, name='visit_enquiry'),
    re_path(r'^.*$', catch_all_view),
]
