"""Sesiones Django con CSRF obligatorio también en el inicio de sesión."""

from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from rest_framework.authentication import SessionAuthentication
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle, SimpleRateThrottle
from rest_framework.views import APIView

from tracking.api.errors import ContractResponseMixin


def user_data(user):
    return {"username": user.username, "isStaff": user.is_staff, "department": user.department}


class LoginThrottle(SimpleRateThrottle):
    scope = "login"
    rate = None

    def get_cache_key(self, request, view):
        return self.cache_format % {"scope": self.scope, "ident": self.get_ident(request)}


class CSRFView(ContractResponseMixin, APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        return Response({"csrfToken": get_token(request._request)})


class LoginView(ContractResponseMixin, APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [AnonRateThrottle, LoginThrottle]

    def post(self, request):
        SessionAuthentication().enforce_csrf(request)
        data = request.data if isinstance(request.data, dict) else {}
        username = data.get("username")
        password = data.get("password")
        user = None
        if isinstance(username, str) and isinstance(password, str):
            user = authenticate(request=request._request, username=username, password=password)
        if user is None:
            raise PermissionDenied("Credenciales inválidas.")
        login(request._request, user)
        return Response(user_data(user))


class LogoutView(ContractResponseMixin, APIView):
    def post(self, request):
        logout(request._request)
        return Response(status=204)


class MeView(ContractResponseMixin, APIView):
    def get(self, request):
        return Response(user_data(request.user))
