"""URL configuration for the Hound Express backend."""

from django.contrib import admin
from django.urls import include, path
from django.views.generic import RedirectView

urlpatterns = [
    path("", RedirectView.as_view(pattern_name="health", permanent=False)),
    path("admin/", admin.site.urls),
    path("api/v1/", include("core.urls")),
]
