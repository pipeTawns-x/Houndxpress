import re
from datetime import timedelta
from pathlib import Path

from django.contrib import admin
from django.core.exceptions import ValidationError
from django.core.management import call_command
from django.db import IntegrityError, connection, models, transaction
from django.db.models import ProtectedError
from django.test import RequestFactory, TestCase
from django.utils import timezone

from accounts.models import Department, User
from tracking.admin import StatusHistoryInline
from tracking.models import Guide, ServiceLevel, Stage, StatusHistory

TRACKING_NUMBER_FORMAT = re.compile(r"^(21\d{14}|[A-Z0-9]{22})$")
FIXTURE_PATH = Path(__file__).resolve().parent.parent / "fixtures" / "demo_guides.json"


def make_guide(tracking_number="C" * 22, **extra):
    return Guide.objects.create(
        tracking_number=tracking_number,
        origin="Miami, FL",
        destination="Monterrey, NL",
        recipient="Destinatario de prueba",
        **extra,
    )


class ServerClockMixin:
    """Comprueba que una marca de tiempo la asignó el servidor, no quien la proporcionó."""

    def long_ago(self):
        return timezone.now() - timedelta(days=30)

    def assertIsNow(self, value):
        self.assertLess(abs(timezone.now() - value), timedelta(seconds=5))


class GuideModelTest(ServerClockMixin, TestCase):
    def test_tracking_number_22_chars(self):
        guide = Guide(
            tracking_number="A" * 22,
            origin="Ciudad",
            destination="Destino",
            recipient="X",
            current_stage=Stage.CARGO_RECEIVED,
        )
        guide.full_clean()
        self.assertEqual(len(guide.tracking_number), 22)

    def test_tracking_number_16_digits_starting_with_21_is_valid(self):
        guide = Guide(
            tracking_number="2100000000000001",
            origin="Ciudad",
            destination="Destino",
            recipient="X",
        )
        guide.full_clean()

    def test_tracking_number_23_fails_full_clean(self):
        guide = Guide(
            tracking_number="A" * 23,
            origin="Ciudad",
            destination="Destino",
            recipient="X",
            current_stage=Stage.CARGO_RECEIVED,
        )
        with self.assertRaises(ValidationError):
            guide.full_clean()

    def test_invalid_tracking_numbers_are_rejected_by_validator_and_database(self):
        invalid_numbers = {
            "demasiado corto y no numérico": "abc",
            "22 caracteres en minúsculas": "a" * 22,
            "16 dígitos que no empiezan con 21": "2200000000000001",
        }
        for label, number in invalid_numbers.items():
            with self.subTest(label):
                guide = Guide(
                    tracking_number=number, origin="Ciudad", destination="Destino", recipient="X"
                )
                with self.assertRaises(ValidationError) as context:
                    guide.full_clean()
                self.assertIn("tracking_number", context.exception.message_dict)
                with self.assertRaises(IntegrityError), transaction.atomic():
                    make_guide(tracking_number=number)
        self.assertEqual(Guide.objects.count(), 0)

    def test_tracking_number_with_unicode_digits_fails_full_clean(self):
        guide = Guide(
            tracking_number="21" + "\u0661" * 14,
            origin="Ciudad",
            destination="Destino",
            recipient="X",
        )
        with self.assertRaises(ValidationError) as context:
            guide.full_clean()
        self.assertIn("tracking_number", context.exception.message_dict)

    def test_create_forces_initial_stage(self):
        guide = make_guide(
            tracking_number="E" * 22,
            current_stage=Stage.CARGO_DELIVERED,
        )
        guide.refresh_from_db()
        self.assertEqual(guide.current_stage, Stage.CARGO_RECEIVED)

    def test_bulk_create_forces_initial_stage(self):
        Guide.objects.bulk_create(
            [
                Guide(
                    tracking_number="F" * 22,
                    origin="Ciudad",
                    destination="Destino",
                    recipient="X",
                    current_stage=Stage.CARGO_DELIVERED,
                )
            ]
        )
        guide = Guide.objects.get(tracking_number="F" * 22)
        self.assertEqual(guide.current_stage, Stage.CARGO_RECEIVED)

    def test_bulk_create_update_conflicts_is_rejected(self):
        guide = make_guide()
        StatusHistory.objects.create(guide=guide, stage=Stage.CARGO_RECEIVED)
        StatusHistory.objects.create(guide=guide, stage=Stage.VEHICLE_LOADED)

        conflicting = Guide(
            tracking_number=guide.tracking_number,
            origin=guide.origin,
            destination=guide.destination,
            recipient=guide.recipient,
        )
        with self.assertRaises(ValidationError):
            Guide.objects.bulk_create([conflicting], update_conflicts=True)

        guide.refresh_from_db()
        self.assertEqual(guide.current_stage, Stage.VEHICLE_LOADED)

    def test_bulk_create_update_conflicts_without_update_fields_is_rejected(self):
        guide = make_guide()
        StatusHistory.objects.create(guide=guide, stage=Stage.CARGO_RECEIVED)
        StatusHistory.objects.create(guide=guide, stage=Stage.VEHICLE_LOADED)

        conflicting = Guide(
            tracking_number=guide.tracking_number,
            origin=guide.origin,
            destination=guide.destination,
            recipient=guide.recipient,
        )
        with self.assertRaises(ValidationError):
            Guide.objects.bulk_create(
                [conflicting],
                update_conflicts=True,
                update_fields=None,
                unique_fields=["tracking_number"],
            )

        guide.refresh_from_db()
        self.assertEqual(guide.current_stage, Stage.VEHICLE_LOADED)

    def test_bulk_create_update_conflicts_with_other_fields_is_rejected(self):
        guide = make_guide()
        StatusHistory.objects.create(guide=guide, stage=Stage.CARGO_RECEIVED)
        StatusHistory.objects.create(guide=guide, stage=Stage.VEHICLE_LOADED)

        conflicting = Guide(
            tracking_number=guide.tracking_number,
            origin=guide.origin,
            destination=guide.destination,
            recipient=guide.recipient,
        )
        with self.assertRaises(ValidationError):
            Guide.objects.bulk_create(
                [conflicting],
                update_conflicts=True,
                update_fields=["recipient"],
                unique_fields=["tracking_number"],
            )

        guide.refresh_from_db()
        self.assertEqual(guide.current_stage, Stage.VEHICLE_LOADED)
        self.assertEqual(guide.recipient, "Destinatario de prueba")

    def test_bulk_create_ignore_conflicts_is_rejected(self):
        guide = make_guide()
        conflicting = Guide(
            tracking_number=guide.tracking_number,
            origin=guide.origin,
            destination=guide.destination,
            recipient=guide.recipient,
        )
        with self.assertRaises(ValidationError):
            Guide.objects.bulk_create([conflicting], ignore_conflicts=True)

        self.assertEqual(Guide.objects.count(), 1)

    def test_base_manager_bulk_create_update_conflicts_is_rejected(self):
        guide = make_guide()
        conflicting = Guide(
            tracking_number=guide.tracking_number,
            origin=guide.origin,
            destination=guide.destination,
            recipient=guide.recipient,
        )
        with self.assertRaises(ValidationError):
            Guide._base_manager.bulk_create(
                [conflicting],
                update_conflicts=True,
                update_fields=["recipient"],
                unique_fields=["tracking_number"],
            )

        guide.refresh_from_db()
        self.assertEqual(guide.current_stage, Stage.CARGO_RECEIVED)
        self.assertEqual(Guide.objects.count(), 1)

    def test_save_existing_cannot_change_current_stage(self):
        guide = make_guide()
        guide.current_stage = Stage.VEHICLE_LOADED
        with self.assertRaises(ValidationError):
            guide.save()
        guide.refresh_from_db()
        self.assertEqual(guide.current_stage, Stage.CARGO_RECEIVED)

    def test_save_base_existing_cannot_change_current_stage(self):
        guide = make_guide()
        guide.current_stage = Stage.VEHICLE_LOADED
        with self.assertRaises(ValidationError):
            guide.save_base(raw=False)
        guide.refresh_from_db()
        self.assertEqual(guide.current_stage, Stage.CARGO_RECEIVED)

    def test_save_base_existing_same_stage_can_save_other_fields(self):
        guide = make_guide()
        guide.origin = "Origen actualizado"

        guide.save_base(raw=False)

        guide.refresh_from_db()
        self.assertEqual(guide.origin, "Origen actualizado")
        self.assertEqual(guide.current_stage, Stage.CARGO_RECEIVED)

    def test_database_rejects_unknown_current_stage(self):
        now = timezone.now()
        with (
            self.assertRaises(IntegrityError),
            transaction.atomic(),
            connection.cursor() as cursor,
        ):
            cursor.execute(
                """
                INSERT INTO tracking_guide (
                    tracking_number,
                    origin,
                    destination,
                    recipient,
                    service_level,
                    current_stage,
                    is_archived,
                    created_at,
                    updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                [
                    "K" * 22,
                    "Ciudad",
                    "Destino",
                    "X",
                    ServiceLevel.STANDARD,
                    "unknown_stage",
                    False,
                    now,
                    now,
                ],
            )
        self.assertEqual(Guide.objects.count(), 0)

    def test_queryset_update_cannot_change_current_stage(self):
        guide = make_guide()
        with self.assertRaises(ValidationError):
            Guide.objects.filter(pk=guide.pk).update(current_stage=Stage.VEHICLE_LOADED)
        guide.refresh_from_db()
        self.assertEqual(guide.current_stage, Stage.CARGO_RECEIVED)

    def test_bulk_update_cannot_change_current_stage(self):
        guide = make_guide()
        guide.current_stage = Stage.VEHICLE_LOADED
        with self.assertRaises(ValidationError):
            Guide.objects.bulk_update([guide], ["current_stage"])
        guide.refresh_from_db()
        self.assertEqual(guide.current_stage, Stage.CARGO_RECEIVED)

    def test_service_level_choices(self):
        guide = make_guide(
            tracking_number="B" * 22,
            service_level=ServiceLevel.PRIORITY,
            current_stage=Stage.CARGO_RECEIVED,
        )
        self.assertEqual(guide.service_level, ServiceLevel.PRIORITY)

    def test_service_level_labels_are_spanish(self):
        self.assertEqual(ServiceLevel.labels, ["Estándar", "Prioritario"])

    def test_created_and_updated_at_are_set_by_server(self):
        long_ago = self.long_ago()
        guide = make_guide(created_at=long_ago, updated_at=long_ago)
        self.assertIsNow(guide.created_at)
        self.assertIsNow(guide.updated_at)
        guide.refresh_from_db()
        self.assertIsNow(guide.created_at)
        self.assertIsNow(guide.updated_at)

    def test_updated_at_moves_on_save_but_created_at_does_not(self):
        guide = make_guide()
        created_at = guide.created_at
        guide.updated_at = self.long_ago()
        guide.is_archived = True
        guide.save()
        guide.refresh_from_db()
        self.assertIsNow(guide.updated_at)
        self.assertEqual(guide.created_at, created_at)


class StatusHistoryConstraintsTest(ServerClockMixin, TestCase):
    def setUp(self):
        self.guide = make_guide()

    def add(self, stage, **extra):
        return StatusHistory.objects.create(guide=self.guide, stage=stage, **extra)

    def test_unique_constraint_duplicate_stage(self):
        self.add(Stage.CARGO_RECEIVED)
        with self.assertRaises(ValidationError), transaction.atomic():
            StatusHistory.objects.bulk_create(
                [StatusHistory(guide=self.guide, stage=Stage.CARGO_RECEIVED)]
            )
        self.assertEqual(StatusHistory.objects.count(), 1)

    def test_append_only_save_raises(self):
        h = self.add(Stage.CARGO_RECEIVED)
        h.note = "cambio"
        with self.assertRaises(ValidationError):
            h.save()
        h.refresh_from_db()
        self.assertEqual(h.note, "")

    def test_append_only_save_base_existing_raises(self):
        h = self.add(Stage.CARGO_RECEIVED)
        h.note = "cambio"
        with self.assertRaises(ValidationError):
            h.save_base(raw=False)
        h.refresh_from_db()
        self.assertEqual(h.note, "")

    def test_save_base_new_with_skipped_stage_raises_without_inserting(self):
        history = StatusHistory(guide=self.guide, stage=Stage.VEHICLE_RELEASED)
        with self.assertRaises(ValidationError):
            history.save_base(raw=False)
        self.assertEqual(StatusHistory.objects.count(), 0)
        self.guide.refresh_from_db()
        self.assertEqual(self.guide.current_stage, Stage.CARGO_RECEIVED)

    def test_append_only_delete_raises(self):
        h = self.add(Stage.CARGO_RECEIVED)
        with self.assertRaises(ValidationError):
            h.delete()
        self.assertTrue(StatusHistory.objects.filter(pk=h.pk).exists())

    def test_protect_guide_with_history(self):
        self.add(Stage.CARGO_RECEIVED)
        with self.assertRaises(ProtectedError):
            self.guide.delete()
        self.assertTrue(Guide.objects.filter(pk=self.guide.pk).exists())

    def test_deleting_user_with_history_is_protected(self):
        clerk = User.objects.create_user(username="clerk", password="p")
        h = self.add(Stage.CARGO_RECEIVED, updated_by=clerk)
        with self.assertRaises(ProtectedError):
            clerk.delete()
        h.refresh_from_db()
        self.assertEqual(h.updated_by, clerk)

    def test_timestamp_set_by_server(self):
        h = self.add(Stage.CARGO_RECEIVED, timestamp=self.long_ago())
        self.assertIsNow(h.timestamp)
        h.refresh_from_db()
        self.assertIsNow(h.timestamp)

    def test_queryset_delete_raises(self):
        self.add(Stage.CARGO_RECEIVED)
        with self.assertRaises(ValidationError):
            StatusHistory.objects.all().delete()
        with self.assertRaises(ValidationError):
            self.guide.status_history.all().delete()
        self.assertEqual(StatusHistory.objects.count(), 1)

    def test_queryset_update_raises(self):
        h = self.add(Stage.CARGO_RECEIVED, note="x")
        with self.assertRaises(ValidationError):
            StatusHistory.objects.filter(pk=h.pk).update(note="cambiado")
        h.note = "cambiado"
        # bulk_update usa un bloque atómico sin punto de guardado; se envuelve para mantener
        # la prueba utilizable.
        with self.assertRaises(ValidationError), transaction.atomic():
            StatusHistory.objects.bulk_update([h], ["note"])
        h.refresh_from_db()
        self.assertEqual(h.note, "x")

    def test_bulk_create_upsert_raises(self):
        h = self.add(Stage.CARGO_RECEIVED, note="x")
        replacement = StatusHistory(
            pk=h.pk, guide=self.guide, stage=Stage.CARGO_RECEIVED, note="cambiado"
        )
        with self.assertRaises(ValidationError):
            StatusHistory.objects.bulk_create(
                [replacement],
                update_conflicts=True,
                update_fields=["note"],
                unique_fields=["id"],
            )
        h.refresh_from_db()
        self.assertEqual(h.note, "x")

    def test_explicit_new_pk_is_inserted(self):
        h = StatusHistory(pk=9999, guide=self.guide, stage=Stage.CARGO_RECEIVED)
        h.save()
        self.assertTrue(StatusHistory.objects.filter(pk=9999).exists())
        created = StatusHistory.objects.create(
            pk=10000, guide=self.guide, stage=Stage.VEHICLE_LOADED
        )
        self.assertEqual(created.pk, 10000)
        with self.assertRaises(ValidationError):
            h.save()

    def test_save_with_existing_pk_inserts_and_never_updates(self):
        h = self.add(Stage.CARGO_RECEIVED, note="original")
        clone = StatusHistory(
            pk=h.pk, guide=self.guide, stage=Stage.VEHICLE_LOADED, note="sobrescrito"
        )
        with self.assertRaises(IntegrityError), transaction.atomic():
            clone.save()
        with self.assertRaises(IntegrityError), transaction.atomic():
            clone.save(force_update=True, update_fields=["note"])
        h.refresh_from_db()
        self.assertEqual(h.stage, Stage.CARGO_RECEIVED)
        self.assertEqual(h.note, "original")
        self.guide.refresh_from_db()
        self.assertEqual(self.guide.current_stage, Stage.CARGO_RECEIVED)


class StageOrderTest(ServerClockMixin, TestCase):
    def setUp(self):
        self.guide = make_guide()

    def add(self, stage, guide=None):
        return StatusHistory.objects.create(guide=guide or self.guide, stage=stage)

    def add_through(self, last_stage):
        stages = list(Stage.values)
        for stage in stages[: stages.index(last_stage) + 1]:
            self.add(stage)

    def test_first_entry_must_be_cargo_received(self):
        for stage in list(Stage.values)[1:]:
            with self.subTest(stage), self.assertRaises(ValidationError):
                self.add(stage)
        self.assertEqual(self.guide.status_history.count(), 0)

    def test_skipping_a_stage_fails(self):
        self.add(Stage.CARGO_RECEIVED)
        with self.assertRaises(ValidationError):
            self.add(Stage.VEHICLE_RELEASED)
        self.assertEqual(self.guide.status_history.count(), 1)
        self.guide.refresh_from_db()
        self.assertEqual(self.guide.current_stage, Stage.CARGO_RECEIVED)

    def test_going_back_or_repeating_a_stage_fails(self):
        self.add_through(Stage.VEHICLE_RELEASED)
        for stage in (Stage.CARGO_RECEIVED, Stage.VEHICLE_LOADED, Stage.VEHICLE_RELEASED):
            with self.subTest(stage), self.assertRaises(ValidationError):
                self.add(stage)
        self.assertEqual(self.guide.status_history.count(), 3)
        self.guide.refresh_from_db()
        self.assertEqual(self.guide.current_stage, Stage.VEHICLE_RELEASED)

    def test_valid_next_stage_updates_current_stage(self):
        for stage in Stage:
            with self.subTest(stage):
                self.add(stage)
                # La instancia de la guía entregada a la entrada se mantiene sincronizada...
                self.assertEqual(self.guide.current_stage, stage)
                # ...y también la fila almacenada.
                self.assertEqual(Guide.objects.get(pk=self.guide.pk).current_stage, stage)

    def test_bulk_create_valid_batch_advances_guide(self):
        StatusHistory.objects.bulk_create(
            [
                StatusHistory(guide=self.guide, stage=Stage.CARGO_RECEIVED),
                StatusHistory(guide=self.guide, stage=Stage.VEHICLE_LOADED),
            ]
        )
        self.assertEqual(StatusHistory.objects.count(), 2)
        self.guide.refresh_from_db()
        self.assertEqual(self.guide.current_stage, Stage.VEHICLE_LOADED)

    def test_bulk_create_rejects_skipped_stage_without_inserting_rows(self):
        with self.assertRaises(ValidationError):
            StatusHistory.objects.bulk_create(
                [
                    StatusHistory(guide=self.guide, stage=Stage.CARGO_RECEIVED),
                    StatusHistory(guide=self.guide, stage=Stage.VEHICLE_IN_TRANSIT),
                ]
            )
        self.assertEqual(StatusHistory.objects.count(), 0)
        self.guide.refresh_from_db()
        self.assertEqual(self.guide.current_stage, Stage.CARGO_RECEIVED)

    def test_bulk_create_rejects_entries_after_cargo_delivered(self):
        self.add_through(Stage.CARGO_DELIVERED)
        with self.assertRaises(ValidationError), transaction.atomic():
            StatusHistory.objects.bulk_create(
                [StatusHistory(guide=self.guide, stage=Stage.CARGO_RECEIVED)]
            )
        self.assertEqual(StatusHistory.objects.count(), len(Stage))
        self.guide.refresh_from_db()
        self.assertEqual(self.guide.current_stage, Stage.CARGO_DELIVERED)

    def test_advancing_moves_updated_at(self):
        Guide.objects.filter(pk=self.guide.pk).update(updated_at=self.long_ago())
        self.add(Stage.CARGO_RECEIVED)
        self.guide.refresh_from_db()
        self.assertIsNow(self.guide.updated_at)

    def test_nothing_is_accepted_after_cargo_delivered(self):
        self.add_through(Stage.CARGO_DELIVERED)
        for stage in Stage:
            with self.subTest(stage), self.assertRaisesMessage(ValidationError, "ya fue entregada"):
                self.add(stage)
        self.assertEqual(self.guide.status_history.count(), len(Stage))
        self.guide.refresh_from_db()
        self.assertEqual(self.guide.current_stage, Stage.CARGO_DELIVERED)

    def test_each_guide_has_its_own_sequence(self):
        other = make_guide(tracking_number="D" * 22)
        self.add_through(Stage.VEHICLE_LOADED)
        self.add(Stage.CARGO_RECEIVED, guide=other)
        other.refresh_from_db()
        self.guide.refresh_from_db()
        self.assertEqual(other.current_stage, Stage.CARGO_RECEIVED)
        self.assertEqual(self.guide.current_stage, Stage.VEHICLE_LOADED)


class AdminReadOnlyTest(TestCase):
    def setUp(self):
        self.superuser = User.objects.create_superuser(username="root", password="p")
        self.request = RequestFactory().get("/admin/")
        self.request.user = self.superuser
        self.guide = make_guide(tracking_number="D" * 22)
        self.history = StatusHistory.objects.create(guide=self.guide, stage=Stage.CARGO_RECEIVED)

    def test_history_admin_is_read_only(self):
        model_admin = admin.site._registry[StatusHistory]
        self.assertFalse(model_admin.has_add_permission(self.request))
        self.assertFalse(model_admin.has_change_permission(self.request))
        self.assertFalse(model_admin.has_change_permission(self.request, self.history))
        self.assertFalse(model_admin.has_delete_permission(self.request))
        self.assertFalse(model_admin.has_delete_permission(self.request, self.history))
        self.assertTrue(model_admin.has_view_permission(self.request))

    def test_history_admin_has_no_bulk_delete_action(self):
        model_admin = admin.site._registry[StatusHistory]
        self.assertNotIn("delete_selected", model_admin.get_actions(self.request))

    def test_history_admin_loads_related_rows_in_one_query(self):
        model_admin = admin.site._registry[StatusHistory]
        self.assertEqual(model_admin.list_select_related, ["guide", "updated_by"])

    def test_history_inline_is_read_only(self):
        inline = StatusHistoryInline(Guide, admin.site)
        self.assertFalse(inline.has_add_permission(self.request, self.guide))
        self.assertFalse(inline.has_change_permission(self.request, self.guide))
        self.assertFalse(inline.has_delete_permission(self.request, self.guide))

    def test_guide_admin_locks_identity_fields_when_editing(self):
        model_admin = admin.site._registry[Guide]
        adding = model_admin.get_readonly_fields(self.request)
        editing = model_admin.get_readonly_fields(self.request, self.guide)
        self.assertNotIn("tracking_number", adding)
        self.assertIn("tracking_number", editing)
        for field in ("current_stage", "created_at", "updated_at"):
            self.assertIn(field, adding)
            self.assertIn(field, editing)


class UserDepartmentTest(TestCase):
    def test_department_choices(self):
        self.assertEqual(Department.values, ["customs", "operations", "security", "kam"])
        self.assertEqual(Department.labels, ["Aduana", "Operaciones", "Seguridad", "KAM"])

    def test_user_department(self):
        user = User.objects.create_user(username="u1", password="p", department=Department.CUSTOMS)
        user.full_clean()
        self.assertEqual(user.department, Department.CUSTOMS)


class FixtureTest(TestCase):
    def setUp(self):
        call_command("loaddata", "demo_guides", verbosity=0)

    def test_fixture_file_is_ascii(self):
        # loaddata lee las fixtures con la codificación de la configuración regional
        # (cp1252 en Windows).
        FIXTURE_PATH.read_bytes().decode("ascii")

    def test_loaddata_demo_guides(self):
        self.assertEqual(Guide.objects.count(), 4)
        self.assertEqual(
            set(Guide.objects.values_list("current_stage", flat=True)),
            {
                Stage.CARGO_RECEIVED,
                Stage.VEHICLE_RELEASED,
                Stage.VEHICLE_IN_TRANSIT,
                Stage.CARGO_DELIVERED,
            },
        )

    def test_guides_are_valid_and_use_real_tracking_format(self):
        for guide in Guide.objects.all():
            with self.subTest(guide=guide.tracking_number):
                guide.full_clean()
                self.assertRegex(guide.tracking_number, TRACKING_NUMBER_FORMAT)

    def test_history_is_consecutive_prefix_up_to_current_stage(self):
        all_stages = [stage.value for stage in Stage]
        for guide in Guide.objects.all():
            with self.subTest(guide=guide.tracking_number):
                history = list(guide.status_history.order_by("timestamp", "pk"))
                stages = [entry.stage for entry in history]
                expected = all_stages[: all_stages.index(guide.current_stage) + 1]
                self.assertEqual(stages, expected)
                timestamps = [entry.timestamp for entry in history]
                for earlier, later in zip(timestamps, timestamps[1:], strict=False):
                    self.assertLess(earlier, later)


class TrackingAuditGuaranteesTest(TestCase):
    def test_status_history_bulk_create_ignore_conflicts_is_rejected_for_empty_batch(self):
        with self.assertRaises(ValidationError):
            StatusHistory.objects.bulk_create([], ignore_conflicts=True)

    def test_status_history_bulk_create_update_conflicts_is_rejected_for_empty_batch(self):
        with self.assertRaises(ValidationError):
            StatusHistory.objects.bulk_create([], update_conflicts=True)

    def test_status_history_bulk_create_ignore_conflicts_does_not_insert(self):
        guide = make_guide()
        with self.assertRaises(ValidationError):
            StatusHistory.objects.bulk_create(
                [StatusHistory(guide=guide, stage=Stage.CARGO_RECEIVED)],
                ignore_conflicts=True,
            )
        self.assertEqual(StatusHistory.objects.count(), 0)

    def test_status_history_bulk_create_update_conflicts_does_not_insert(self):
        guide = make_guide()
        with self.assertRaises(ValidationError):
            StatusHistory.objects.bulk_create(
                [StatusHistory(guide=guide, stage=Stage.CARGO_RECEIVED)],
                update_conflicts=True,
                update_fields=["note"],
                unique_fields=["id"],
            )
        self.assertEqual(StatusHistory.objects.count(), 0)

    def test_guide_with_existing_pk_cannot_degrade_current_stage(self):
        guide = make_guide()
        StatusHistory.objects.create(guide=guide, stage=Stage.CARGO_RECEIVED)
        StatusHistory.objects.create(guide=guide, stage=Stage.VEHICLE_LOADED)

        degrading_guide = Guide(pk=guide.pk, current_stage=Stage.CARGO_RECEIVED)
        with self.assertRaises(ValidationError):
            degrading_guide.save()

        guide.refresh_from_db()
        self.assertEqual(guide.current_stage, Stage.VEHICLE_LOADED)

    def test_guide_with_existing_pk_and_same_stage_can_save_other_fields(self):
        """Una etapa idéntica permite guardar otros campos sin alterar el avance."""
        guide = make_guide()
        StatusHistory.objects.create(guide=guide, stage=Stage.CARGO_RECEIVED)
        StatusHistory.objects.create(guide=guide, stage=Stage.VEHICLE_LOADED)
        persisted_stage = Guide.objects.get(pk=guide.pk).current_stage

        Guide(
            pk=guide.pk,
            tracking_number=guide.tracking_number,
            origin="Origen actualizado",
            destination=guide.destination,
            recipient=guide.recipient,
            current_stage=persisted_stage,
        ).save()

        guide.refresh_from_db()
        self.assertEqual(guide.origin, "Origen actualizado")
        self.assertEqual(guide.current_stage, persisted_stage)

    def test_guide_base_manager_update_cannot_change_current_stage(self):
        guide = make_guide()
        with self.assertRaises(ValidationError):
            Guide._base_manager.filter(pk=guide.pk).update(
                current_stage=Stage.VEHICLE_LOADED,
            )
        guide.refresh_from_db()
        self.assertEqual(guide.current_stage, Stage.CARGO_RECEIVED)

    def test_guide_base_manager_bulk_create_forces_initial_stage(self):
        Guide._base_manager.bulk_create(
            [
                Guide(
                    tracking_number="H" * 22,
                    origin="Ciudad",
                    destination="Destino",
                    recipient="X",
                    current_stage=Stage.CARGO_DELIVERED,
                )
            ]
        )
        guide = Guide.objects.get(tracking_number="H" * 22)
        self.assertEqual(guide.current_stage, Stage.CARGO_RECEIVED)

    def test_status_history_base_manager_bulk_create_rejects_skipped_stage(self):
        guide = make_guide()
        with self.assertRaises(ValidationError):
            StatusHistory._base_manager.bulk_create(
                [
                    StatusHistory(guide=guide, stage=Stage.CARGO_RECEIVED),
                    StatusHistory(guide=guide, stage=Stage.VEHICLE_IN_TRANSIT),
                ]
            )
        self.assertEqual(StatusHistory.objects.count(), 0)

    def test_status_history_base_manager_bulk_update_cannot_mutate_existing_row(self):
        guide = make_guide()
        history = StatusHistory.objects.create(guide=guide, stage=Stage.CARGO_RECEIVED)
        history.note = "cambiado"
        with self.assertRaises(ValidationError):
            StatusHistory._base_manager.bulk_update([history], ["note"])
        history.refresh_from_db()
        self.assertEqual(history.note, "")
        self.assertEqual(history.stage, Stage.CARGO_RECEIVED)
        self.assertEqual(StatusHistory.objects.count(), 1)
        guide.refresh_from_db()
        self.assertEqual(guide.current_stage, Stage.CARGO_RECEIVED)

    def test_public_orm_paths_cannot_move_persisted_current_stage(self):
        guide = make_guide()
        persisted_stage = guide.current_stage

        guide.current_stage = Stage.VEHICLE_LOADED
        with self.assertRaises(ValidationError):
            guide.save()
        guide.refresh_from_db()
        self.assertEqual(guide.current_stage, persisted_stage)

        guide.current_stage = Stage.VEHICLE_LOADED
        with self.assertRaises(ValidationError):
            guide.save_base(raw=False)
        guide.refresh_from_db()
        self.assertEqual(guide.current_stage, persisted_stage)

        with self.assertRaises(ValidationError):
            Guide.objects.filter(pk=guide.pk).update(current_stage=Stage.VEHICLE_LOADED)
        guide.refresh_from_db()
        self.assertEqual(guide.current_stage, persisted_stage)

        guide.current_stage = Stage.VEHICLE_LOADED
        with self.assertRaises(ValidationError):
            Guide.objects.bulk_update([guide], ["current_stage"])
        guide.refresh_from_db()
        self.assertEqual(guide.current_stage, persisted_stage)

        with self.assertRaises(ValidationError):
            Guide.objects.update_or_create(
                pk=guide.pk,
                defaults={"current_stage": Stage.VEHICLE_LOADED},
            )
        guide.refresh_from_db()
        self.assertEqual(guide.current_stage, persisted_stage)

        fetched, created = Guide.objects.get_or_create(
            tracking_number=guide.tracking_number,
            defaults={"current_stage": Stage.VEHICLE_LOADED},
        )
        self.assertFalse(created)
        self.assertEqual(fetched.current_stage, persisted_stage)

        Guide.objects.bulk_create(
            [
                Guide(
                    tracking_number="L" * 22,
                    origin="Ciudad",
                    destination="Destino",
                    recipient="X",
                    current_stage=Stage.VEHICLE_LOADED,
                )
            ]
        )
        self.assertEqual(
            Guide.objects.get(tracking_number="L" * 22).current_stage,
            Stage.CARGO_RECEIVED,
        )
        guide.refresh_from_db()
        self.assertEqual(guide.current_stage, persisted_stage)

    def test_new_history_is_rejected_when_existing_prefix_is_inconsistent(self):
        guide = make_guide()
        models.QuerySet(model=StatusHistory).bulk_create(
            [StatusHistory(guide=guide, stage=Stage.VEHICLE_RELEASED)]
        )

        with self.assertRaises(ValidationError) as context:
            StatusHistory.objects.create(guide=guide, stage=Stage.VEHICLE_LOADED)

        self.assertRegex(str(context.exception), r"prefijo|secuencia")
        self.assertEqual(StatusHistory.objects.count(), 1)
        guide.refresh_from_db()
        self.assertEqual(guide.current_stage, Stage.CARGO_RECEIVED)

    def test_valid_status_history_transition_advances_guide(self):
        guide = make_guide()
        StatusHistory.objects.create(guide=guide, stage=Stage.CARGO_RECEIVED)
        StatusHistory.objects.create(guide=guide, stage=Stage.VEHICLE_LOADED)
        self.assertEqual(Guide.objects.get(pk=guide.pk).current_stage, Stage.VEHICLE_LOADED)

    def test_protected_base_managers_enforce_stage_rules(self):
        guide = make_guide()
        with self.assertRaises(ValidationError):
            Guide._base_manager.update(current_stage=Stage.VEHICLE_LOADED)
        guide.refresh_from_db()
        self.assertEqual(guide.current_stage, Stage.CARGO_RECEIVED)

        Guide._base_manager.bulk_create(
            [
                Guide(
                    tracking_number="M" * 22,
                    origin="Ciudad",
                    destination="Destino",
                    recipient="X",
                    current_stage=Stage.CARGO_DELIVERED,
                )
            ]
        )
        self.assertEqual(
            Guide.objects.get(tracking_number="M" * 22).current_stage,
            Stage.CARGO_RECEIVED,
        )

        other_guide = make_guide(tracking_number="N" * 22)
        with self.assertRaises(ValidationError):
            StatusHistory._base_manager.bulk_create(
                [StatusHistory(guide=other_guide, stage=Stage.VEHICLE_RELEASED)]
            )
        self.assertEqual(StatusHistory.objects.count(), 0)

    def test_fixture_loads_17_objects_and_remains_ascii(self):
        call_command("loaddata", "demo_guides", verbosity=0)
        self.assertEqual(Guide.objects.count(), 4)
        self.assertEqual(StatusHistory.objects.count(), 13)
        self.assertEqual(Guide.objects.count() + StatusHistory.objects.count(), 17)
        FIXTURE_PATH.read_bytes().decode("ascii")

    def test_admin_guide_creation_starts_at_cargo_received(self):
        request = RequestFactory().post("/admin/tracking/guide/add/")
        request.user = User.objects.create_superuser(username="admin", password="p")
        model_admin = admin.site._registry[Guide]
        guide = Guide(
            tracking_number="I" * 22,
            origin="Ciudad",
            destination="Destino",
            recipient="X",
            current_stage=Stage.CARGO_DELIVERED,
        )

        model_admin.save_model(request, guide, None, False)

        guide.refresh_from_db()
        self.assertEqual(guide.current_stage, Stage.CARGO_RECEIVED)
