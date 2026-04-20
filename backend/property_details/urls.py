from django.urls import path, re_path
from django.views.generic import TemplateView
from . import views

urlpatterns = [
    path('property-table/', views.property_table, name='property_table'),
    path('submit-contract/', views.submit_contract, name='submit_contract'),
    re_path(r'^contract.*$', TemplateView.as_view(template_name='index.html')),
]
