"""Brute-force limit on the Django admin login (OWASP ASVS 5.0 6.1.1, 6.3.1)."""

from urllib.parse import urlencode

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import Client, TestCase, override_settings
from django.utils.crypto import get_random_string

from accounts.api.views import LoginThrottle

ADMIN_LOGIN_URL = "/admin/login/"
API_LOGIN_URL = "/api/v1/auth/login/"
WRONG_CREDENTIALS = {"username": "supervisor", "password": "not-the-password"}


# Every attempt runs the password hasher; the default one would cost this class 20 seconds.
@override_settings(PASSWORD_HASHERS=["django.contrib.auth.hashers.MD5PasswordHasher"])
class AdminLoginThrottleTests(TestCase):
    def setUp(self):
        # DRF keeps the throttle history in the default cache, which outlives each test.
        cache.clear()
        self.addCleanup(cache.clear)
        self.credential = get_random_string(20)
        self.staff = get_user_model().objects.create_user(
            username="supervisor", password=self.credential, is_staff=True
        )

    def exhaust_limit(self, **extra):
        for _ in range(LoginThrottle().num_requests):
            response = self.client.post(ADMIN_LOGIN_URL, WRONG_CREDENTIALS, **extra)
            self.assertEqual(response.status_code, 200)

    def test_rate_matches_the_api_login_rate(self):
        self.assertEqual(LoginThrottle().num_requests, 5)
        self.assertEqual(LoginThrottle().duration, 60)

    def test_post_beyond_the_limit_returns_429(self):
        self.exhaust_limit()

        response = self.client.post(ADMIN_LOGIN_URL, WRONG_CREDENTIALS)

        self.assertEqual(response.status_code, 429)
        self.assertEqual(response["Content-Type"], "text/plain; charset=utf-8")
        self.assertEqual(
            response.content.decode(),
            "Demasiados intentos de inicio de sesión. Espere antes de reintentar.",
        )
        self.assertGreater(int(response["Retry-After"]), 0)
        self.assertIn("no-store", response["Cache-Control"])

    def test_valid_credentials_beyond_the_limit_do_not_log_in(self):
        self.exhaust_limit()

        response = self.client.post(
            ADMIN_LOGIN_URL, {"username": "supervisor", "password": self.credential}
        )

        self.assertEqual(response.status_code, 429)
        self.assertNotIn("_auth_user_id", self.client.session)

    def test_valid_credentials_within_the_limit_still_log_in(self):
        response = self.client.post(
            ADMIN_LOGIN_URL,
            {"username": "supervisor", "password": self.credential, "next": "/admin/"},
        )

        self.assertRedirects(response, "/admin/")
        self.assertEqual(self.client.session["_auth_user_id"], str(self.staff.pk))

    def test_put_cannot_log_in_around_the_limit(self):
        self.exhaust_limit()

        response = self.client.put(
            ADMIN_LOGIN_URL,
            urlencode({"username": "supervisor", "password": self.credential}),
            content_type="application/x-www-form-urlencoded",
        )

        self.assertEqual(response.status_code, 200)
        self.assertNotIn("_auth_user_id", self.client.session)

    def test_get_is_free_and_consumes_no_attempts(self):
        for _ in range(LoginThrottle().num_requests + 1):
            self.assertEqual(self.client.get(ADMIN_LOGIN_URL).status_code, 200)

        self.exhaust_limit()

        response = self.client.get(ADMIN_LOGIN_URL)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'name="password"')

    def test_rotating_x_forwarded_for_does_not_reset_the_limit(self):
        for index in range(LoginThrottle().num_requests):
            response = self.client.post(
                ADMIN_LOGIN_URL, WRONG_CREDENTIALS, HTTP_X_FORWARDED_FOR=f"203.0.113.{index}"
            )
            self.assertEqual(response.status_code, 200)

        response = self.client.post(
            ADMIN_LOGIN_URL, WRONG_CREDENTIALS, HTTP_X_FORWARDED_FOR="198.51.100.7"
        )
        self.assertEqual(response.status_code, 429)

    def test_another_client_keeps_its_own_limit(self):
        self.exhaust_limit()

        response = self.client.post(ADMIN_LOGIN_URL, WRONG_CREDENTIALS, REMOTE_ADDR="198.51.100.7")

        self.assertEqual(response.status_code, 200)

    def test_admin_and_api_logins_share_one_budget(self):
        self.exhaust_limit()

        response = self.client.post(API_LOGIN_URL, WRONG_CREDENTIALS)

        self.assertEqual(response.status_code, 429)
        self.assertEqual(response.json()["code"], "throttled")

    def test_api_attempts_count_against_the_admin_login(self):
        for _ in range(LoginThrottle().num_requests):
            response = self.client.post(API_LOGIN_URL, WRONG_CREDENTIALS)
            self.assertEqual(response.status_code, 403)

        response = self.client.post(ADMIN_LOGIN_URL, WRONG_CREDENTIALS)

        self.assertEqual(response.status_code, 429)

    def test_api_login_still_limits_on_its_own(self):
        num_requests = LoginThrottle().num_requests
        for _ in range(num_requests):
            response = self.client.post(API_LOGIN_URL, WRONG_CREDENTIALS)
            self.assertEqual(response.status_code, 403)

        response = self.client.post(API_LOGIN_URL, WRONG_CREDENTIALS)

        self.assertEqual(response.status_code, 429)
        self.assertEqual(response.json()["code"], "throttled")

    def test_post_without_csrf_is_rejected_before_counting(self):
        client = Client(enforce_csrf_checks=True)
        for _ in range(LoginThrottle().num_requests + 1):
            self.assertEqual(client.post(ADMIN_LOGIN_URL, WRONG_CREDENTIALS).status_code, 403)

        self.assertEqual(self.client.post(ADMIN_LOGIN_URL, WRONG_CREDENTIALS).status_code, 200)
