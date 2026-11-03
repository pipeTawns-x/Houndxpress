"""Security controls promised by the ASVS checklist, exercised through the public interface."""

from unittest import mock

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import identify_hasher
from django.core.cache import cache
from django.db import OperationalError
from django.test import Client, TestCase, override_settings
from django.utils.crypto import get_random_string

from tracking import services
from tracking.models import Guide, StatusHistory

GUIDES_URL = "/api/v1/guides/"
TRACK_URL = "/api/v1/public/track/"
API_LOGIN_URL = "/api/v1/auth/login/"
ME_URL = "/api/v1/auth/me/"
SQL_INJECTION = "' OR 1=1 --"
# OWASP Password Storage Cheat Sheet minimum for PBKDF2-HMAC-SHA256.
MINIMUM_PBKDF2_ITERATIONS = 600_000
# Text that only appears when an internal detail reaches the client.
INTERNAL_MARKERS = [
    "Traceback",
    "RuntimeError",
    "OperationalError",
    "internal-marker",
    ".py",
    "/srv",
]


class AsvsControlTestCase(TestCase):
    def setUp(self):
        # DRF keeps the throttle history in the default cache, which outlives each test.
        cache.clear()
        self.addCleanup(cache.clear)
        self.credential = get_random_string(20)
        self.staff = get_user_model().objects.create_superuser(
            username="operator", password=self.credential, department="customs"
        )

    def create_guide(self, number, destination="Monterrey"):
        return services.create_guide(
            {
                "tracking_number": number,
                "origin": "Tijuana",
                "destination": destination,
                "recipient": "Persona",
            },
            self.staff,
        )


class SqlInjectionTests(AsvsControlTestCase):  # Checklist row 1
    def setUp(self):
        super().setUp()
        self.guide = self.create_guide("21" + "1" * 14)
        self.client.force_login(self.staff)

    def assert_no_rows_changed(self):
        self.assertEqual((Guide.objects.count(), StatusHistory.objects.count()), (1, 1))

    def test_search_filter_treats_the_payload_as_text(self):
        response = self.client.get(GUIDES_URL, {"search": SQL_INJECTION})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["results"], [])
        self.assert_no_rows_changed()

    def test_search_filter_finds_the_payload_only_where_it_is_stored(self):
        stored = self.create_guide("21" + "2" * 14, destination=SQL_INJECTION)

        response = self.client.get(GUIDES_URL, {"search": SQL_INJECTION})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            [result["trackingNumber"] for result in response.json()["results"]],
            [stored.tracking_number],
        )

    def test_other_list_parameters_ignore_the_payload(self):
        for parameter in ["archived", "page_size", "cursor"]:
            with self.subTest(parameter=parameter):
                response = self.client.get(GUIDES_URL, {parameter: SQL_INJECTION})
                self.assertEqual(response.status_code, 200)
                self.assertEqual(
                    [result["trackingNumber"] for result in response.json()["results"]],
                    [self.guide.tracking_number],
                )

    def test_public_tracking_rejects_the_payload(self):
        response = Client().get(TRACK_URL, {"numbers": SQL_INJECTION})

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["code"], "validation_error")
        self.assertNotIn(self.guide.tracking_number, response.content.decode())

    def test_guide_route_rejects_the_payload(self):
        response = self.client.put(
            f"{GUIDES_URL}{SQL_INJECTION}/",
            {"stage": "vehicle_loaded"},
            content_type="application/json",
        )

        self.assertIn(response.status_code, {400, 404})
        self.assert_no_rows_changed()

    def test_login_rejects_the_payload(self):
        client = Client()
        for field, values in [
            ("username", {"username": SQL_INJECTION, "password": "not-the-password"}),
            ("password", {"username": "operator", "password": SQL_INJECTION}),
        ]:
            with self.subTest(field=field):
                response = client.post(API_LOGIN_URL, values, content_type="application/json")
                self.assertEqual(response.status_code, 403)
                self.assertNotIn("_auth_user_id", client.session)

    def test_admin_search_treats_the_payload_as_text(self):
        response = self.client.get("/admin/tracking/guide/", {"q": SQL_INJECTION})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context["cl"].result_count, 0)
        self.assert_no_rows_changed()


class PasswordStorageTests(AsvsControlTestCase):  # Checklist row 6
    def assert_stored_as_strong_hash(self, user, password):
        self.assertNotEqual(user.password, password)
        self.assertNotIn(password, user.password)
        hasher = identify_hasher(user.password)
        self.assertEqual(hasher.algorithm, "pbkdf2_sha256")
        self.assertGreaterEqual(
            hasher.decode(user.password)["iterations"], MINIMUM_PBKDF2_ITERATIONS
        )
        self.assertTrue(user.check_password(password))

    def test_created_user_stores_a_strong_hash(self):
        stored = get_user_model().objects.get(username="operator")

        self.assert_stored_as_strong_hash(stored, self.credential)

    def test_same_password_produces_different_hashes(self):
        other = get_user_model().objects.create_user(username="other", password=self.credential)

        self.assertNotEqual(other.password, self.staff.password)

    def test_user_created_in_the_admin_stores_a_strong_hash(self):
        self.client.force_login(self.staff)
        password = get_random_string(20)

        response = self.client.post(
            "/admin/accounts/user/add/",
            {
                "username": "nuevo",
                "usable_password": "true",
                "password1": password,
                "password2": password,
                "department": "customs",
            },
        )

        self.assertEqual(response.status_code, 302, response.content)
        self.assert_stored_as_strong_hash(get_user_model().objects.get(username="nuevo"), password)

    def test_api_responses_never_include_the_password(self):
        client = Client()
        login = client.post(
            API_LOGIN_URL,
            {"username": "operator", "password": self.credential},
            content_type="application/json",
        )
        me = client.get(ME_URL)

        expected = {"username": "operator", "isStaff": True, "department": "customs"}
        for response in [login, me]:
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json(), expected)
            self.assertNotIn(self.staff.password, response.content.decode())


class DotfileExposureTests(TestCase):  # Checklist row 9; nginx is covered by the CI docker job.
    def test_django_serves_no_dotfiles(self):
        for path in ["/.git/HEAD", "/.git/config", "/.env", "/backend/.env", "/static/.env"]:
            with self.subTest(path=path):
                response = self.client.get(path)
                self.assertEqual(response.status_code, 404)
                self.assertNotIn(b"refs/heads", response.content)
                self.assertNotIn(b"SECRET", response.content)


@override_settings(DEBUG=False)
class ErrorDisclosureTests(AsvsControlTestCase):  # Checklist row 18
    def setUp(self):
        super().setUp()
        # With raise_request_exception off, the client returns the page a real client would see.
        self.anonymous = Client(raise_request_exception=False)
        self.operator = Client(raise_request_exception=False)
        self.operator.force_login(self.staff)

    def assert_no_internals(self, response):
        body = response.content.decode()
        for marker in INTERNAL_MARKERS:
            self.assertNotIn(marker, body)

    def test_unhandled_exception_returns_a_generic_500(self):
        error = RuntimeError("internal-marker /srv/app/backend/tracking/services.py")
        with mock.patch("tracking.services.guide_summary", side_effect=error):
            response = self.operator.get(f"{GUIDES_URL}summary/")

        self.assertEqual(response.status_code, 500)
        self.assert_no_internals(response)

    def test_database_error_returns_a_generic_500(self):
        error = OperationalError("no such table: internal-marker")
        with mock.patch("tracking.services.list_guides", side_effect=error):
            response = self.operator.get(GUIDES_URL)

        self.assertEqual(response.status_code, 500)
        self.assert_no_internals(response)

    def test_public_endpoint_failure_returns_a_generic_500(self):
        error = RuntimeError("internal-marker")
        with mock.patch("tracking.services.public_guides", side_effect=error):
            response = self.anonymous.get(TRACK_URL, {"numbers": "21" + "1" * 14})

        self.assertEqual(response.status_code, 500)
        self.assert_no_internals(response)

    def test_malformed_json_returns_the_generic_validation_error(self):
        response = self.anonymous.post(
            API_LOGIN_URL, '{"username": internal-marker', content_type="application/json"
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json(),
            {
                "detail": "Datos inválidos. Verifique los campos enviados.",
                "code": "validation_error",
            },
        )

    def test_unknown_route_does_not_list_the_url_patterns(self):
        response = self.anonymous.get("/internal-marker/")

        self.assertEqual(response.status_code, 404)
        self.assertNotIn(b"config.urls", response.content)
        self.assertNotIn(b"api/v1", response.content)
