"""HTTP security controls from OWASP ASVS 5.0 level 1."""

from unittest import mock

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import Client, TestCase, override_settings
from django.utils.crypto import get_random_string
from rest_framework.settings import api_settings
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle

from core.tests.urls import PROTECTED_URL

HEALTH_URL = "/api/v1/health/"
# Slowest interval a liveness or readiness probe is expected to use.
PROBE_INTERVAL_SECONDS = 2


@override_settings(ROOT_URLCONF="core.tests.urls")
class ApiSecurityTestCase(TestCase):
    def setUp(self):
        # DRF keeps the throttle history in the default cache, which outlives each test.
        cache.clear()
        self.addCleanup(cache.clear)
        self.user = get_user_model().objects.create_user(
            username="operator", password=get_random_string(20)
        )


class ResponseHeaderTests(ApiSecurityTestCase):
    def test_api_sends_nosniff(self):  # ASVS 3.2.1
        response = self.client.get(HEALTH_URL)
        self.assertEqual(response["X-Content-Type-Options"], "nosniff")

    def test_api_sends_no_cors_headers(self):  # ASVS 3.4.2
        response = self.client.get(HEALTH_URL, HTTP_ORIGIN="https://attacker.example")
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.has_header("Access-Control-Allow-Origin"))

    def test_json_responses_declare_utf8_charset(self):  # ASVS 4.1.1
        cases = [("get", HEALTH_URL, 200), ("post", HEALTH_URL, 405), ("get", PROTECTED_URL, 403)]
        for method, url, expected_status in cases:
            with self.subTest(method=method, url=url):
                response = getattr(self.client, method)(url)
                self.assertEqual(response.status_code, expected_status)
                self.assertEqual(response["Content-Type"], "application/json; charset=utf-8")

    def test_browsable_api_is_still_served_to_browsers(self):
        response = self.client.get(HEALTH_URL, HTTP_ACCEPT="text/html")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "text/html; charset=utf-8")


class AccessControlTests(ApiSecurityTestCase):
    def test_post_requires_a_csrf_token(self):  # ASVS 3.5.1, 3.5.2
        client = Client(enforce_csrf_checks=True)
        client.force_login(self.user)

        rejected = client.post(PROTECTED_URL)
        self.assertEqual(rejected.status_code, 403)
        self.assertIn("CSRF", rejected.json()["detail"])

        token = get_random_string(32)
        client.cookies[settings.CSRF_COOKIE_NAME] = token
        accepted = client.post(PROTECTED_URL, HTTP_X_CSRFTOKEN=token)
        self.assertEqual(accepted.status_code, 200)

    def test_protected_view_without_session_returns_403(self):  # ASVS 8.2.1, 8.3.1
        self.assertEqual(self.client.get(PROTECTED_URL).status_code, 403)

        self.client.force_login(self.user)
        response = self.client.get(PROTECTED_URL)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"username": "operator"})


class ThrottlingTests(ApiSecurityTestCase):
    def test_anonymous_clients_are_throttled_after_the_anon_rate(self):  # ASVS 6.1.1 (API only)
        num_requests = AnonRateThrottle().num_requests
        for _ in range(num_requests):
            self.assertEqual(self.client.get(HEALTH_URL).status_code, 200)

        response = self.client.get(HEALTH_URL)
        self.assertEqual(response.status_code, 429)
        self.assertTrue(response.has_header("Retry-After"))

    def test_rotating_x_forwarded_for_does_not_reset_the_limit(self):  # ASVS 6.1.1
        # The client controls X-Forwarded-For; without a trusted proxy it must not pick the
        # identity the throttle counts against.
        num_requests = AnonRateThrottle().num_requests
        for index in range(num_requests):
            response = self.client.get(HEALTH_URL, HTTP_X_FORWARDED_FOR=f"203.0.113.{index}")
            self.assertEqual(response.status_code, 200)

        response = self.client.get(HEALTH_URL, HTTP_X_FORWARDED_FOR="198.51.100.7")
        self.assertEqual(response.status_code, 429)

    def test_authenticated_users_are_throttled_per_user(self):
        self.client.force_login(self.user)
        with mock.patch.object(UserRateThrottle, "THROTTLE_RATES", {"user": "2/minute"}):
            self.assertEqual(self.client.get(PROTECTED_URL).status_code, 200)
            self.assertEqual(self.client.get(PROTECTED_URL).status_code, 200)
            self.assertEqual(self.client.get(PROTECTED_URL).status_code, 429)

    def test_every_default_throttle_lets_a_health_probe_through(self):
        # UserRateThrottle also counts anonymous clients, keyed by IP address, so the health
        # probe has to fit within both rates.
        throttle_classes = api_settings.DEFAULT_THROTTLE_CLASSES
        self.assertEqual(throttle_classes, [AnonRateThrottle, UserRateThrottle])
        for throttle_class in throttle_classes:
            with self.subTest(throttle=throttle_class.__name__):
                throttle = throttle_class()
                self.assertGreaterEqual(
                    throttle.num_requests * PROBE_INTERVAL_SECONDS, throttle.duration
                )
