"""Operational endpoints. They report whether the service can serve; no business logic."""

from django.db import Error, connections
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


def database_is_available(alias: str = "default") -> bool:
    """Return True when the database answers a trivial query."""
    try:
        with connections[alias].cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except Error:
        return False
    return True


class HealthView(APIView):
    """Public liveness check that also proves the database is reachable."""

    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        if database_is_available():
            return Response({"status": "ok", "database": "ok"})
        return Response(
            {"status": "error", "database": "unavailable"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
