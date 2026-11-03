"""Historial de las guías creadas en el admin y de las guías antiguas sin historial."""

from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import Client, TestCase
from django.utils.crypto import get_random_string
from rest_framework.test import APITestCase

from tracking.models import Guide, Stage, StageTransitionAttempt, StatusHistory

ADD_URL = "/admin/tracking/guide/add/"
BASE = "/api/v1/guides/"
NUMBER = "21" + "3" * 14


def add_form(**overrides):
    return {
        "tracking_number": NUMBER,
        "origin": "Tijuana",
        "destination": "Monterrey",
        "recipient": "Persona",
        "service_level": "standard",
        # El inline de historial es de solo lectura, pero el admin exige su formulario de gestión.
        "status_history-TOTAL_FORMS": "0",
        "status_history-INITIAL_FORMS": "0",
        "status_history-MIN_NUM_FORMS": "0",
        "status_history-MAX_NUM_FORMS": "0",
        **overrides,
    }


class AdminGuideCreationTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.admin_user = get_user_model().objects.create_superuser(
            username="supervisor", password=get_random_string(20), department="customs"
        )

    def setUp(self):
        self.client.force_login(self.admin_user)

    def test_admin_add_form_ignores_archived_flag(self):
        response = self.client.post(ADD_URL, add_form(is_archived="on"))

        self.assertEqual(response.status_code, 302)
        guide = Guide.objects.get(tracking_number=NUMBER)
        self.assertFalse(guide.is_archived)
        self.assertEqual(guide.status_history.count(), 1)

    def test_admin_can_still_archive_an_existing_guide(self):
        self.client.post(ADD_URL, add_form())
        guide = Guide.objects.get(tracking_number=NUMBER)

        form = add_form(is_archived="on")
        form.pop("tracking_number")
        response = self.client.post(f"/admin/tracking/guide/{guide.pk}/change/", form)

        self.assertEqual(response.status_code, 302)
        guide.refresh_from_db()
        self.assertTrue(guide.is_archived)
        self.assertEqual(guide.status_history.count(), 1)

    def test_admin_creation_records_first_history_row(self):
        response = self.client.post(ADD_URL, add_form())

        self.assertEqual(response.status_code, 302, response.content)
        guide = Guide.objects.get(tracking_number=NUMBER)
        self.assertEqual(guide.current_stage, Stage.CARGO_RECEIVED)
        history = StatusHistory.objects.get(guide=guide)
        self.assertEqual(history.stage, Stage.CARGO_RECEIVED)
        self.assertEqual(history.updated_by, self.admin_user)
        self.assertEqual(history.department, "customs")
        self.assertIsNotNone(history.timestamp)

    def test_guide_created_in_admin_advances_through_the_api(self):
        self.client.post(ADD_URL, add_form())

        response = self.client.put(
            f"{BASE}{NUMBER}/", {"stage": Stage.VEHICLE_LOADED}, content_type="application/json"
        )

        self.assertEqual(response.status_code, 200, response.content)
        self.assertEqual(response.json()["currentStatus"], Stage.VEHICLE_LOADED)
        self.assertEqual(
            list(StatusHistory.objects.order_by("pk").values_list("stage", flat=True)),
            [Stage.CARGO_RECEIVED, Stage.VEHICLE_LOADED],
        )

    def test_admin_creation_rolls_back_the_guide_if_history_fails(self):
        client = Client(raise_request_exception=False)
        client.force_login(self.admin_user)

        with patch("tracking.services.StatusHistory.objects.create", side_effect=RuntimeError):
            response = client.post(ADD_URL, add_form())

        self.assertEqual(response.status_code, 500)
        self.assertEqual((Guide.objects.count(), StatusHistory.objects.count()), (0, 0))

    def test_admin_edit_adds_no_history_row(self):
        self.client.post(ADD_URL, add_form())
        guide = Guide.objects.get(tracking_number=NUMBER)

        response = self.client.post(
            f"/admin/tracking/guide/{guide.pk}/change/", add_form(destination="Saltillo")
        )

        self.assertEqual(response.status_code, 302, response.content)
        guide.refresh_from_db()
        self.assertEqual(guide.destination, "Saltillo")
        self.assertEqual(guide.status_history.count(), 1)


class GuideWithoutHistoryTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.staff = get_user_model().objects.create_user(
            username="operator", is_staff=True, department="customs"
        )

    def setUp(self):
        cache.clear()
        self.client.force_authenticate(self.staff)
        self.guide = Guide.objects.create(
            tracking_number=NUMBER, origin="Tijuana", destination="Monterrey", recipient="Persona"
        )

    def assert_conflict_without_changes(self, stage):
        updated_at = Guide.objects.get(pk=self.guide.pk).updated_at
        response = self.client.put(f"{BASE}{NUMBER}/", {"stage": stage}, format="json")

        self.assertEqual(response.status_code, 409, response.content)
        self.assertEqual(
            response.json(),
            {
                "detail": "La operación entra en conflicto con el estado de la guía.",
                "code": "invalid_transition",
                "currentStatus": Stage.CARGO_RECEIVED,
            },
        )
        self.assertEqual(response["Cache-Control"], "no-store")
        guide = Guide.objects.get(pk=self.guide.pk)
        self.assertEqual(guide.current_stage, Stage.CARGO_RECEIVED)
        self.assertEqual(guide.updated_at, updated_at)
        self.assertEqual(StatusHistory.objects.count(), 0)
        # El catálogo de motivos de la auditoría no incluye este caso: queda solo en el log.
        self.assertEqual(StageTransitionAttempt.objects.count(), 0)

    def test_advance_returns_conflict_instead_of_server_error(self):
        with self.assertLogs("tracking.services", level="WARNING") as logs:
            self.assert_conflict_without_changes(Stage.VEHICLE_LOADED)
        self.assertIn("motivo=missing_history", logs.output[0])

    def test_same_stage_does_not_claim_success_without_history(self):
        self.assert_conflict_without_changes(Stage.CARGO_RECEIVED)

    def test_archived_guide_without_history_keeps_the_archived_rejection(self):
        self.guide.is_archived = True
        self.guide.save(update_fields=["is_archived", "updated_at"])

        response = self.client.put(f"{BASE}{NUMBER}/", {"stage": Stage.VEHICLE_LOADED})

        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.json()["code"], "invalid_transition")
        self.assertEqual(StageTransitionAttempt.objects.get().reason, "archived")
        self.assertEqual(StatusHistory.objects.count(), 0)
