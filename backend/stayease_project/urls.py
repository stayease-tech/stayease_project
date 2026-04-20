"""
URL configuration for stayease_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from stayease_accounts.views import MobileLoginView, MobilePartnerLoginView
from stayease_tenant.views import TenantLoginView

urlpatterns = [
    path('admin/', admin.site.urls),
    # Mobile API auth
    path('api/token/', MobileLoginView.as_view(), name='token_obtain'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/partner-login/', MobilePartnerLoginView.as_view(), name='partner_login'),
    path('api/tenant-login/', TenantLoginView.as_view(), name='tenant_login'),
    # Web app routes
    path('supply/', include('stayease_supply.urls')),
    path('sales/', include('stayease_sales.urls')),
    path('accounts/', include('stayease_accounts.urls')),
    path('operations/', include('stayease_operations.urls')),
    path('partners/', include('stayease_partners.urls')),
    path('tenant-portal/', include('stayease_tenant.urls')),
    path('contract/', include('property_details.urls')),
    path('tenant-details/', include('tenant_details.urls')),
]

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
urlpatterns += [
    path('', include('stayease_app.urls')),
]
