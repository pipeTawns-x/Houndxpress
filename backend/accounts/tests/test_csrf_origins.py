from django.conf import settings
from django.test import Client, SimpleTestCase, TestCase, override_settings

LOGIN_URL = "/api/v1/auth/login/"
CSRF_URL = "/api/v1/auth/csrf/"


class TrustedOriginsTests(SimpleTestCase):
    def test_local_proxies_are_trusted_in_development(self):
        self.assertIn("http://127.0.0.1:5173", settings.CSRF_TRUSTED_ORIGINS)
        self.assertIn("http://localhost:8080", settings.CSRF_TRUSTED_ORIGINS)


class LoginThroughProxyTests(TestCase):
    def post_login(self, origin):
        client = Client(enforce_csrf_checks=True)
        token = client.get(CSRF_URL).cookies[settings.CSRF_COOKIE_NAME].value
        return client.post(
            LOGIN_URL,
            {"username": "nadie", "password": "no-existe"},
            content_type="application/json",
            headers={"origin": origin, "x-csrftoken": token},
        )

    def test_login_from_the_web_proxy_passes_csrf(self):
        response = self.post_login("http://127.0.0.1:5173")
        self.assertNotIn("CSRF", response.content.decode())

    @override_settings(CSRF_TRUSTED_ORIGINS=[])
    def test_login_from_an_untrusted_origin_is_refused(self):
        response = self.post_login("http://127.0.0.1:5173")
        self.assertEqual(response.status_code, 403)
        self.assertIn("CSRF", response.content.decode())
