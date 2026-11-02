"""Contrato HTTP y efectos persistidos de la API."""

from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.db import IntegrityError
from rest_framework.test import APIClient, APITestCase

from tracking.models import Guide, Stage, StatusHistory

BASE = "/api/v1/guides/"
NUMBER = "21" + "1" * 14
OTHER = "21" + "2" * 14


class GuideAPIFixture(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.staff = get_user_model().objects.create_user(
            username="operator", is_staff=True, department="customs"
        )
        cls.member = get_user_model().objects.create_user(username="member")

    def setUp(self):
        cache.clear()
        self.client.force_authenticate(self.staff)
        self.payload = {
            "trackingNumber": NUMBER,
            "origin": "Tijuana",
            "destination": "Monterrey",
            "recipient": "Persona",
        }

    def create(self):
        response = self.client.post(BASE, self.payload, format="json")
        self.assertEqual(response.status_code, 201, response.content)
        return response


class GuideAPITests(GuideAPIFixture):
    def test_create_normalizes_and_assigns_server_fields(self):
        self.payload.update(
            trackingNumber=" ab" + "c" * 20 + " ",
            timestamp="2000-01-01T00:00:00Z",
            department="kam",
            updatedBy="other",
        )
        response = self.create()
        history = StatusHistory.objects.get()
        self.assertEqual(response.data["trackingNumber"], "AB" + "C" * 20)
        self.assertNotIn("id", response.data)
        self.assertEqual(len(response.data["history"]), 1)
        self.assertEqual(Guide.objects.get().current_stage, Stage.CARGO_RECEIVED)
        self.assertEqual(history.updated_by, self.staff)
        self.assertEqual(history.department, "customs")
        self.assertNotEqual(history.timestamp.year, 2000)
        self.staff.department = "kam"
        self.staff.save()
        history.refresh_from_db()
        self.assertEqual(history.department, "customs")

    def test_atomic_create(self):
        with (
            patch("tracking.services.StatusHistory.objects.create", side_effect=IntegrityError),
            self.assertRaises(IntegrityError),
        ):
            self.client.post(BASE, self.payload, format="json")
        self.assertEqual((Guide.objects.count(), StatusHistory.objects.count()), (0, 0))

    def test_duplicate(self):
        self.create()
        response = self.client.post(BASE, self.payload, format="json")
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.data["code"], "duplicate")
        self.assertEqual(response.data["currentStatus"], Stage.CARGO_RECEIVED)
        self.assertEqual((Guide.objects.count(), StatusHistory.objects.count()), (1, 1))

    def test_validation(self):
        for key, value in [
            ("trackingNumber", "bad"),
            ("origin", " "),
            ("destination", " "),
            ("recipient", "x" * 256),
            ("serviceLevel", ""),
        ]:
            with self.subTest(key=key):
                response = self.client.post(BASE, {**self.payload, key: value}, format="json")
                self.assertEqual(response.status_code, 400)
                self.assertEqual(response.data["code"], "validation_error")
                self.assertIsInstance(response.data["detail"], str)
                self.assertEqual((Guide.objects.count(), StatusHistory.objects.count()), (0, 0))

    def test_advance_and_idempotency(self):
        self.create()
        response = self.client.put(
            BASE + NUMBER + "/",
            {
                "stage": Stage.VEHICLE_LOADED,
                "location": "Laredo, Texas",
                "timestamp": "2000-01-01T00:00:00Z",
                "department": "kam",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["currentStatus"], Stage.VEHICLE_LOADED)
        history = StatusHistory.objects.latest("pk")
        self.assertEqual(
            (history.updated_by, history.department, history.location),
            (self.staff, "customs", "Laredo, Texas"),
        )
        self.assertNotEqual(history.timestamp.year, 2000)
        updated = Guide.objects.get().updated_at
        retry = self.client.put(BASE + NUMBER + "/", {"stage": Stage.VEHICLE_LOADED})
        self.assertEqual(retry.status_code, 200)
        self.assertEqual(StatusHistory.objects.count(), 2)
        self.assertEqual(Guide.objects.get().updated_at, updated)

    def rejected(self, stage, reason):
        from tracking.models import StageTransitionAttempt

        before = StatusHistory.objects.count()
        current = Guide.objects.get().current_stage
        response = self.client.put(BASE + NUMBER + "/", {"stage": stage})
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.data["code"], "invalid_transition")
        self.assertEqual(response.data["currentStatus"], current)
        self.assertEqual(StatusHistory.objects.count(), before)
        self.assertEqual(Guide.objects.get().current_stage, current)
        attempt = StageTransitionAttempt.objects.latest("pk")
        self.assertEqual(
            (attempt.reason, attempt.attempted_by, attempt.requested_stage),
            (reason, self.staff, stage),
        )

    def test_skip(self):
        self.create()
        self.rejected(Stage.VEHICLE_RELEASED, "skip")

    def test_backwards(self):
        self.create()
        self.client.put(BASE + NUMBER + "/", {"stage": Stage.VEHICLE_LOADED})
        self.rejected(Stage.CARGO_RECEIVED, "backwards")

    def test_delivered(self):
        self.create()
        for stage in list(Stage.values)[1:]:
            self.assertEqual(
                self.client.put(BASE + NUMBER + "/", {"stage": stage}).status_code, 200
            )
        self.rejected(Stage.VEHICLE_IN_TRANSIT, "delivered")

    def test_archive(self):
        self.create()
        response = self.client.delete(BASE + NUMBER + "/")
        self.assertEqual(response.status_code, 204)
        self.assertEqual(response.content, b"")
        self.assertTrue(Guide.objects.get().is_archived)
        self.assertEqual(StatusHistory.objects.count(), 1)
        self.rejected(Stage.VEHICLE_LOADED, "archived")
        self.assertEqual(self.client.delete(BASE + NUMBER + "/").status_code, 204)

    def test_unknown(self):
        for method in [self.client.get, self.client.put, self.client.delete]:
            response = method(BASE + OTHER + "/")
            self.assertEqual(response.status_code, 404)
            self.assertEqual(response.data["code"], "not_found")
        self.assertEqual((Guide.objects.count(), StatusHistory.objects.count()), (0, 0))

    def test_nonstaff(self):
        self.client.force_authenticate(self.member)
        response = self.client.post(BASE, self.payload)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.data["code"], "permission_denied")
        self.assertEqual(Guide.objects.count(), 0)

    def test_anonymous(self):
        self.client.force_authenticate(None)
        response = self.client.post(BASE, self.payload)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.data["code"], "not_authenticated")
        self.assertEqual(Guide.objects.count(), 0)

    def test_reads_and_query_count(self):
        self.create()
        response = self.client.get(BASE + NUMBER + "/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["trackingNumber"], NUMBER)
        response = self.client.get(BASE + NUMBER + "/history/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        with self.assertNumQueries(2):
            response = self.client.get(BASE)
        self.assertEqual(len(response.data["results"]), 1)
        self.payload["trackingNumber"] = OTHER
        self.create()
        with self.assertNumQueries(2):
            response = self.client.get(BASE)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 2)

    def test_summary(self):
        self.create()
        for stage in list(Stage.values)[1:4]:
            self.client.put(BASE + NUMBER + "/", {"stage": stage})
        with self.assertNumQueries(1):
            response = self.client.get(BASE + "summary/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data, {"total": 1, "active": 1, "inTransit": 1, "delivered": 0, "withAlert": 0}
        )

    def test_aliases(self):
        response = self.client.post("/api/crear-guia/", self.payload, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(self.client.get(f"/api/obtener-guia/{NUMBER}/").status_code, 200)
        self.assertEqual(
            self.client.put(
                f"/api/actualizar-guia/{NUMBER}/", {"stage": Stage.VEHICLE_LOADED}
            ).status_code,
            200,
        )
        self.assertEqual(
            self.client.post(
                BASE + NUMBER + "/advance/", {"stage": Stage.VEHICLE_RELEASED}
            ).status_code,
            200,
        )
        self.assertEqual(StatusHistory.objects.count(), 3)
        self.assertEqual(self.client.delete(f"/api/eliminar-guia/{NUMBER}/").status_code, 204)

    def test_public_minimal_read_only(self):
        self.create()
        self.client.force_authenticate(None)
        response = self.client.get("/api/v1/public/track/", {"numbers": NUMBER + "," + OTHER})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(set(response.data[0]), {"trackingNumber", "currentStatus", "history"})
        self.assertEqual(set(response.data[0]["history"][0]), {"stage", "timestamp", "location"})
        self.assertEqual(response.data[1], {"trackingNumber": OTHER, "found": False})
        self.assertEqual(self.client.post("/api/v1/public/track/").status_code, 405)
        self.assertEqual((Guide.objects.count(), StatusHistory.objects.count()), (1, 1))

    def test_public_archived(self):
        self.create()
        self.client.delete(BASE + NUMBER + "/")
        self.client.force_authenticate(None)
        response = self.client.get("/api/v1/public/track/", {"numbers": NUMBER + "," + OTHER})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data,
            [{"trackingNumber": NUMBER, "found": False}, {"trackingNumber": OTHER, "found": False}],
        )

    def test_public_validation(self):
        self.client.force_authenticate(None)
        for numbers in ["", "bad", ",", ",".join([NUMBER] * 11)]:
            response = self.client.get("/api/v1/public/track/", {"numbers": numbers})
            self.assertEqual(response.status_code, 400)
            self.assertEqual(response.data["code"], "validation_error")

    def test_public_weighted_throttle(self):
        from tracking.api.throttles import PublicTrackThrottle

        self.client.force_authenticate(None)
        with patch.object(PublicTrackThrottle, "rate", "10/min"):
            response = self.client.get(
                "/api/v1/public/track/", {"numbers": ",".join([NUMBER] * 10)}
            )
            self.assertEqual(response.status_code, 200)
            response = self.client.get("/api/v1/public/track/", {"numbers": NUMBER})
            self.assertEqual(response.status_code, 429)
            self.assertEqual(response.data["code"], "throttled")


class SessionAPITests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.staff = get_user_model().objects.create_user(
            username="operator", password="a-test-password-only", is_staff=True
        )

    def setUp(self):
        cache.clear()
        self.client = APIClient(enforce_csrf_checks=True)

    def csrf(self):
        response = self.client.get("/api/v1/auth/csrf/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("csrftoken", response.cookies)
        return response.data["csrfToken"]

    def test_login_csrf(self):
        response = self.client.post(
            "/api/v1/auth/login/", {"username": "operator", "password": "a-test-password-only"}
        )
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.data["code"], "permission_denied")
        self.assertNotIn("_auth_user_id", self.client.session)

    def test_session_lifecycle(self):
        token = self.csrf()
        response = self.client.post(
            "/api/v1/auth/login/",
            {"username": "operator", "password": "a-test-password-only"},
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["username"], "operator")
        self.assertEqual(self.client.session["_auth_user_id"], str(self.staff.pk))
        self.assertEqual(self.client.get("/api/v1/auth/me/").data, response.data)
        self.assertEqual(self.client.post(BASE, {}).status_code, 403)
        self.assertEqual(Guide.objects.count(), 0)
        response = self.client.post(
            BASE,
            {"trackingNumber": NUMBER, "origin": "A", "destination": "B", "recipient": "C"},
            HTTP_X_CSRFTOKEN=self.csrf(),
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual((Guide.objects.count(), StatusHistory.objects.count()), (1, 1))
        self.assertEqual(StatusHistory.objects.get().updated_by, self.staff)
        self.assertEqual(self.client.post("/api/v1/auth/logout/").status_code, 403)
        response = self.client.post("/api/v1/auth/logout/", HTTP_X_CSRFTOKEN=self.csrf())
        self.assertEqual(response.status_code, 204)
        self.assertEqual(response.content, b"")
        self.assertNotIn("_auth_user_id", self.client.session)
        self.assertEqual(self.client.get("/api/v1/auth/me/").status_code, 403)

    def test_generic_failures(self):
        token = self.csrf()
        responses = []
        for username in ["operator", "absent"]:
            response = self.client.post(
                "/api/v1/auth/login/",
                {"username": username, "password": "incorrect"},
                HTTP_X_CSRFTOKEN=token,
            )
            self.assertEqual(response.status_code, 403)
            responses.append(response.data)
        self.assertEqual(responses[0], responses[1])
        for invalid_body in [[], None, "not-an-object"]:
            response = self.client.post(
                "/api/v1/auth/login/",
                invalid_body,
                format="json",
                HTTP_X_CSRFTOKEN=token,
            )
            self.assertEqual(response.status_code, 403)
            self.assertEqual(response.data, responses[0])
        self.assertNotIn("_auth_user_id", self.client.session)

    def test_login_throttle(self):
        from accounts.api.views import LoginThrottle

        token = self.csrf()
        with patch.object(LoginThrottle, "rate", "1/min"):
            data = {"username": "absent", "password": "incorrect"}
            self.assertEqual(
                self.client.post("/api/v1/auth/login/", data, HTTP_X_CSRFTOKEN=token).status_code,
                403,
            )
            response = self.client.post("/api/v1/auth/login/", data, HTTP_X_CSRFTOKEN=token)
            self.assertEqual(response.status_code, 429)
            self.assertEqual(response.data["code"], "throttled")


class AdditionalContractTests(GuideAPIFixture):
    def test_pagination_bounds(self):
        Guide.objects.bulk_create(
            [
                Guide(tracking_number=f"21{index:014d}", origin="A", destination="B", recipient="C")
                for index in range(105)
            ]
        )
        response = self.client.get(BASE)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 20)
        self.assertIsNotNone(response.data["next"])
        response = self.client.get(response.data["next"])
        self.assertEqual(len(response.data["results"]), 20)
        response = self.client.get(BASE, {"page_size": 1000})
        self.assertEqual(len(response.data["results"]), 100)

    def test_invalid_advancement_does_not_change_rows(self):
        self.create()
        for data in [{"stage": "unknown"}, {"stage": Stage.VEHICLE_LOADED, "location": "x" * 101}]:
            response = self.client.put(BASE + NUMBER + "/", data)
            self.assertEqual(response.status_code, 400)
            self.assertEqual(response.data["code"], "validation_error")
            self.assertEqual(StatusHistory.objects.count(), 1)
            self.assertEqual(Guide.objects.get().current_stage, Stage.CARGO_RECEIVED)

    def test_public_hides_unverified_location(self):
        self.create()
        legacy = StatusHistory.objects.create(
            guide=Guide.objects.get(),
            stage=Stage.VEHICLE_LOADED,
            location="Calle privada 123",
        )
        self.assertEqual(legacy.location, "Calle privada 123")
        self.client.force_authenticate(None)
        response = self.client.get("/api/v1/public/track/", {"numbers": NUMBER})
        self.assertEqual(response.status_code, 200)
        self.assertTrue(all(event["location"] == "" for event in response.data[0]["history"]))
        self.assertNotIn("Calle privada", str(response.data))
        legacy.refresh_from_db()
        self.assertEqual(legacy.location, "Calle privada 123")
        self.assertEqual(StatusHistory.objects.count(), 2)

    def test_archived_excluded_from_list_and_summary(self):
        self.create()
        self.client.delete(BASE + NUMBER + "/")
        self.assertEqual(self.client.get(BASE).data["results"], [])
        self.assertEqual(
            self.client.get(BASE + "summary/").data,
            {
                "total": 0,
                "active": 0,
                "inTransit": 0,
                "delivered": 0,
                "withAlert": 0,
            },
        )

    def test_every_staff_route_denies_nonstaff_and_anonymous(self):
        self.create()
        for user, code in [(self.member, "permission_denied"), (None, "not_authenticated")]:
            self.client.force_authenticate(user)
            for method, url in [
                ("get", BASE),
                ("get", BASE + "summary/"),
                ("get", BASE + NUMBER + "/"),
                ("put", BASE + NUMBER + "/"),
                ("delete", BASE + NUMBER + "/"),
                ("get", BASE + NUMBER + "/history/"),
                ("post", BASE + NUMBER + "/advance/"),
            ]:
                with self.subTest(user=user, url=url, method=method):
                    response = getattr(self.client, method)(url)
                    self.assertEqual(response.status_code, 403)
                    self.assertEqual(response.data["code"], code)
        self.assertFalse(Guide.objects.get().is_archived)
        self.assertEqual(StatusHistory.objects.count(), 1)

    def test_malformed_number_returns_validation_error(self):
        response = self.client.get(BASE + "bad/")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["code"], "validation_error")

    def test_no_sensitive_response_is_cached(self):
        self.create()
        response = self.client.get(BASE + NUMBER + "/")
        self.assertIn("no-store", response.get("Cache-Control", ""))

    def test_database_rejects_invalid_service_level(self):
        from django.db import transaction

        for value in ["", "invalid"]:
            with self.subTest(value=value), self.assertRaises(IntegrityError), transaction.atomic():
                Guide.objects.create(
                    tracking_number=OTHER,
                    origin="A",
                    destination="B",
                    recipient="C",
                    service_level=value,
                )
        self.assertEqual(Guide.objects.count(), 0)

    def test_history_validation_uses_insertion_order(self):
        from django.db import connection

        self.create()
        self.client.put(BASE + NUMBER + "/", {"stage": Stage.VEHICLE_LOADED})
        with connection.cursor() as cursor:
            cursor.execute(
                "UPDATE tracking_statushistory SET timestamp = %s WHERE stage = %s",
                ["2000-01-01 00:00:00", Stage.VEHICLE_LOADED],
            )
        response = self.client.put(BASE + NUMBER + "/", {"stage": Stage.VEHICLE_RELEASED})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Guide.objects.get().current_stage, Stage.VEHICLE_RELEASED)
        self.assertEqual(StatusHistory.objects.count(), 3)

    def test_access_log_redacts_an_encoded_public_track_path(self):
        import logging

        from config.logging import PublicTrackQueryFilter

        record = logging.LogRecord(
            "django.server",
            logging.INFO,
            "",
            0,
            '"%s" %s %s',
            (f"GET /api/v1/public/%74rack/?numbers={NUMBER} HTTP/1.1", "200", "90"),
            None,
        )
        self.assertTrue(PublicTrackQueryFilter().filter(record))
        self.assertNotIn(NUMBER, record.getMessage())

    def test_access_log_redacts_public_query_only(self):
        import logging

        from config.logging import PublicTrackQueryFilter

        record = logging.LogRecord(
            "django.server",
            logging.INFO,
            "",
            0,
            '"%s" %s %s',
            (f"GET /api/v1/public/track/?numbers={NUMBER} HTTP/1.1", "200", "90"),
            None,
        )
        self.assertTrue(PublicTrackQueryFilter().filter(record))
        self.assertNotIn(NUMBER, record.getMessage())
        self.assertIn("/api/v1/public/track/ HTTP/1.1", record.getMessage())
        other = logging.LogRecord(
            "django.server", logging.INFO, "", 0, "%s", ("GET /other/?page=2 HTTP/1.1",), None
        )
        PublicTrackQueryFilter().filter(other)
        self.assertIn("?page=2", other.getMessage())
