"""URL configuration for the Hound Express backend."""

from django.contrib import admin
from django.urls import include, path
from django.views.generic import RedirectView

from config.admin_throttle import throttled_admin_login

urlpatterns = [
    path("", RedirectView.as_view(pattern_name="health", permanent=False)),
    # Must precede admin.site.urls, which serves this same path with no limit.
    path("admin/login/", throttled_admin_login),
    path("admin/", admin.site.urls),
    path("", include("tracking.api.urls")),
    path("api/v1/auth/", include("accounts.api.urls")),
    path("api/v1/", include("core.urls")),
]
