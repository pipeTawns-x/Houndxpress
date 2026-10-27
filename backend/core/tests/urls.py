"""Test-only URLconf: the project routes plus one endpoint that keeps the API defaults."""

from django.urls import path
from rest_framework.response import Response
from rest_framework.views import APIView

from config.urls import urlpatterns as project_urlpatterns

PROTECTED_URL = "/test-only/protected/"


class ProtectedView(APIView):
    """Declares no permissions, so it gets the project defaults: a session is required."""

    def get(self, request):
        return Response({"username": request.user.get_username()})

    def post(self, request):
        return Response({"username": request.user.get_username()})


urlpatterns = [
    path(PROTECTED_URL.lstrip("/"), ProtectedView.as_view()),
    *project_urlpatterns,
]
