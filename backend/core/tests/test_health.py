from unittest import mock

from django.db import InterfaceError, OperationalError, connections
from django.test import TestCase

from core.views import database_is_available

HEALTH_URL = "/api/v1/health/"


class HealthEndpointTests(TestCase):
    def test_health_returns_ok_when_database_responds(self):
        response = self.client.get(HEALTH_URL)  # anonymous: AllowAny overrides the default
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok", "database": "ok"})

    def test_health_returns_503_when_database_is_unavailable(self):
        with mock.patch("core.views.database_is_available", return_value=False):
            response = self.client.get(HEALTH_URL)
        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json(), {"status": "error", "database": "unavailable"})

    def test_database_check_returns_false_on_database_error(self):
        with mock.patch.object(
            connections["default"], "cursor", side_effect=OperationalError("down")
        ):
            self.assertFalse(database_is_available())

    def test_health_returns_503_on_database_interface_error(self):
        with mock.patch.object(
            connections["default"], "cursor", side_effect=InterfaceError("connection closed")
        ):
            response = self.client.get(HEALTH_URL)
        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json(), {"status": "error", "database": "unavailable"})

    def test_health_rejects_write_methods(self):
        response = self.client.post(HEALTH_URL)
        self.assertEqual(response.status_code, 405)

    def test_root_redirects_to_health(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response["Location"], HEALTH_URL)
