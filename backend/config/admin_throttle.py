"""Applies the API login limit to the Django admin login, which DRF throttles do not cover."""

import math

from django.contrib import admin
from django.http import HttpResponse
from django.views.decorators.cache import never_cache

from accounts.api.views import LoginThrottle


@never_cache
def throttled_admin_login(request):
    # Only POST carries credentials: Django parses no form data from any other method.
    if request.method == "POST":
        # Same class, so the admin and the API share one budget per client.
        throttle = LoginThrottle()
        if not throttle.allow_request(request, None):
            response = HttpResponse(
                "Demasiados intentos de inicio de sesión. Espere antes de reintentar.",
                status=429,
                content_type="text/plain; charset=utf-8",
            )
            wait = throttle.wait()
            if wait is not None:
                response["Retry-After"] = str(math.ceil(wait))
            return response
    return admin.site.login(request)
