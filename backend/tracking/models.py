"""Modelos de dominio para el seguimiento de guías de transporte.

La API pública de Django mantiene las reglas de dominio en las operaciones ORM
ordinarias: ``save``, ``save_base(raw=False)``, ``bulk_create``, ``bulk_update``,
``update``, ``update_or_create``, ``get_or_create``, los managers de los modelos y
sus QuerySet. Las inserciones masivas con ``ignore_conflicts`` o ``update_conflicts``
están rechazadas porque pueden saltarse la validación o degradar la etapa de una guía
existente. La etapa de una guía solo avanza al registrar una etapa válida y
consecutiva en ``StatusHistory``; ``StatusHistory`` es de solo inserción. La base de
datos también restringe ``Guide.current_stage`` a los valores de la enumeración.

Las rutas de confianza quedan fuera de este alcance: SQL directo mediante
``Manager.raw`` o ``cursor.execute``, el constructor genérico
``django.db.models.QuerySet(model=...)`` y ``save_base(raw=True)`` usado por
``loaddata``. Estas rutas evitan o pueden omitir las validaciones del modelo y del
QuerySet, por lo que no son equivalentes a la superficie pública protegida.

Cerrar por completo esas rutas desde los modelos no es posible sin disparadores de
base de datos o permisos de escritura por rol que restrinjan el acceso directo a
SQL y a las operaciones masivas. Como mitigación, el entorno debe utilizar
credenciales de base de datos con privilegios mínimos, restringir el acceso humano
directo a la base de datos, limitar las operaciones masivas a servicios autorizados
y mantener una auditoría de los cambios de etapa.
"""

from contextvars import ContextVar

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.db import models, router, transaction
from django.utils import timezone

TRACKING_NUMBER_VALIDATOR = RegexValidator(
    r"^(21[0-9]{14}|[A-Z0-9]{22})$",
    "Número de guía inválido: 16 dígitos que empiezan con 21 o 22 caracteres alfanuméricos "
    "en mayúscula.",
)


class Stage(models.TextChoices):
    CARGO_RECEIVED = "cargo_received", "Recepción de carga"
    VEHICLE_LOADED = "vehicle_loaded", "Vehículo cargado"
    VEHICLE_RELEASED = "vehicle_released", "Vehículo liberado"
    VEHICLE_IN_TRANSIT = "vehicle_in_transit", "Vehículo en camino"
    CARGO_DELIVERED = "cargo_delivered", "Carga entregada"


class ServiceLevel(models.TextChoices):
    STANDARD = "standard", "Estándar"
    PRIORITY = "priority", "Prioritario"


_STAGE_UPDATE_AUTHORIZATION: ContextVar[tuple[str, str, str] | None] = ContextVar(
    "_stage_update_authorization", default=None
)


def _validate_stage_transition(history_count, stage):
    stages = list(Stage.values)
    if history_count >= len(stages):
        raise ValidationError("La guía ya fue entregada, no admite más etapas.")
    expected = stages[history_count]
    if stage != expected:
        raise ValidationError(
            f"Etapa inválida: la siguiente etapa de la guía es «{Stage(expected).label}»."
        )


def _validate_history_prefix(history_stages):
    """Verifica que el historial existente sea un prefijo exacto de las etapas."""
    expected = list(Stage.values)[: len(history_stages)]
    if history_stages != expected:
        raise ValidationError(
            "El historial de la guía no forma un prefijo exacto de la secuencia válida de etapas."
        )


def _current_stage_for_history(history_count):
    if history_count == 0:
        return Stage.CARGO_RECEIVED
    return Stage.values[history_count - 1]


def _validate_guide_stage(history_count, current_stage):
    expected = _current_stage_for_history(history_count)
    if current_stage != expected:
        raise ValidationError(
            "La etapa actual de la guía no coincide con la secuencia de su historial."
        )


def _advance_current_stage(guide, expected_stage, new_stage, using):
    """Avanza la etapa con un UPDATE condicional y autorización interna."""
    authorization = _STAGE_UPDATE_AUTHORIZATION.set((using, expected_stage, new_stage))
    try:
        updated = (
            Guide._base_manager.using(using)
            .filter(pk=guide.pk, current_stage=expected_stage)
            .update(current_stage=new_stage, updated_at=timezone.now())
        )
    finally:
        _STAGE_UPDATE_AUTHORIZATION.reset(authorization)
    if updated != 1:
        raise ValidationError(
            "La etapa actual de la guía cambió durante el registro del historial."
        )
    guide.current_stage = new_stage


class GuideQuerySet(models.QuerySet):
    def update(self, **kwargs):
        if "current_stage" in kwargs:
            authorization = _STAGE_UPDATE_AUTHORIZATION.get()
            if (
                authorization is None
                or authorization[0] != self.db
                or authorization[2] != kwargs.get("current_stage")
                or set(kwargs) != {"current_stage", "updated_at"}
            ):
                raise ValidationError(
                    "La etapa actual de la guía solo puede cambiar al registrar historial."
                )
        return super().update(**kwargs)

    def bulk_update(self, objs, fields, batch_size=None):
        if "current_stage" in fields:
            raise ValidationError(
                "La etapa actual de la guía solo puede cambiar al registrar historial."
            )
        return super().bulk_update(objs, fields, batch_size=batch_size)

    def bulk_create(
        self,
        objs,
        batch_size=None,
        ignore_conflicts=False,
        update_conflicts=False,
        update_fields=None,
        unique_fields=None,
    ):
        if ignore_conflicts:
            raise ValidationError("No se permiten inserciones masivas que ignoren conflictos.")
        if update_conflicts:
            raise ValidationError(
                "No se permiten actualizaciones masivas de guías existentes: "
                "la etapa actual solo puede cambiar al registrar historial."
            )
        objs = list(objs)
        for guide in objs:
            guide.current_stage = Stage.CARGO_RECEIVED
        return super().bulk_create(
            objs,
            batch_size=batch_size,
            ignore_conflicts=ignore_conflicts,
            update_conflicts=update_conflicts,
            update_fields=update_fields,
            unique_fields=unique_fields,
        )


class Guide(models.Model):
    tracking_number = models.CharField(
        max_length=22, unique=True, validators=[TRACKING_NUMBER_VALIDATOR]
    )
    origin = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    recipient = models.CharField(max_length=255)
    service_level = models.CharField(
        max_length=10, choices=ServiceLevel.choices, default=ServiceLevel.STANDARD, blank=True
    )
    current_stage = models.CharField(
        max_length=20, choices=Stage.choices, default=Stage.CARGO_RECEIVED
    )
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = GuideQuerySet.as_manager()

    class Meta:
        base_manager_name = "objects"
        ordering = ["-created_at"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(tracking_number__regex=r"^(21[0-9]{14}|[A-Z0-9]{22})$"),
                name="tracking_number_format",
            ),
            models.CheckConstraint(
                condition=models.Q(current_stage__in=Stage.values),
                name="current_stage_valid",
            ),
        ]

    def __str__(self):
        return self.tracking_number

    def save_base(
        self,
        raw=False,
        force_insert=False,
        force_update=False,
        using=None,
        update_fields=None,
    ):
        if raw:
            return super().save_base(
                raw=True,
                force_insert=force_insert,
                force_update=force_update,
                using=using,
                update_fields=update_fields,
            )

        using = using or router.db_for_write(type(self), instance=self)
        with transaction.atomic(using=using):
            persisted = (
                Guide._base_manager.using(using)
                .select_for_update()
                .filter(pk=self.pk)
                .values("current_stage", "created_at")
                .first()
            )
            if persisted is None:
                self.current_stage = Stage.CARGO_RECEIVED
                self._state.adding = True
            else:
                self._state.adding = False
                self.created_at = persisted["created_at"]
                if self.current_stage != persisted["current_stage"]:
                    raise ValidationError(
                        "La etapa actual de la guía solo puede cambiar al registrar historial."
                    )
            return super().save_base(
                raw=False,
                force_insert=force_insert,
                force_update=force_update,
                using=using,
                update_fields=update_fields,
            )


class StatusHistoryQuerySet(models.QuerySet):
    """Bloquea operaciones masivas que romperían la regla de solo inserción."""

    def delete(self):
        raise ValidationError("StatusHistory es de solo inserción, no se permite eliminar.")

    def update(self, **kwargs):
        raise ValidationError("StatusHistory es de solo inserción, no se permite actualizar.")

    def bulk_update(self, objs, fields, batch_size=None):
        raise ValidationError("StatusHistory es de solo inserción, no se permite actualizar.")

    def bulk_create(
        self,
        objs,
        batch_size=None,
        ignore_conflicts=False,
        update_conflicts=False,
        update_fields=None,
        unique_fields=None,
    ):
        if ignore_conflicts:
            raise ValidationError(
                "StatusHistory es de solo inserción, no se permite ignorar conflictos."
            )
        if update_conflicts:
            raise ValidationError("StatusHistory es de solo inserción, no se permite actualizar.")

        objs = list(objs)
        using = self.db
        with transaction.atomic(using=using):
            guide_ids = {obj.guide_id for obj in objs}
            guides = {
                guide.pk: guide
                for guide in Guide._base_manager.using(using)
                .select_for_update()
                .filter(pk__in=guide_ids)
                .order_by("pk")
            }
            history_stages = {guide_id: [] for guide_id in guide_ids}
            for guide_id, stage in (
                StatusHistory._base_manager.using(using)
                .filter(guide_id__in=guide_ids)
                .order_by("guide_id", "timestamp", "pk")
                .values_list("guide_id", "stage")
            ):
                history_stages[guide_id].append(stage)

            existing_counts = {}
            for guide_id, guide in guides.items():
                stages = history_stages[guide_id]
                _validate_history_prefix(stages)
                _validate_guide_stage(len(stages), guide.current_stage)
                existing_counts[guide_id] = len(stages)

            next_counts = dict(existing_counts)
            final_stages = {}
            for obj in objs:
                guide_id = obj.guide_id
                if guide_id not in guides:
                    raise ValidationError("La guía indicada no existe.")
                _validate_stage_transition(next_counts[guide_id], obj.stage)
                next_counts[guide_id] += 1
                final_stages[guide_id] = obj.stage

            created = super().bulk_create(
                objs,
                batch_size=batch_size,
                ignore_conflicts=False,
                update_conflicts=False,
                update_fields=None,
                unique_fields=None,
            )
            for guide_id, stage in final_stages.items():
                expected_stage = _current_stage_for_history(existing_counts[guide_id])
                _advance_current_stage(guides[guide_id], expected_stage, stage, using)
            for obj in objs:
                cached_guide = obj._state.fields_cache.get("guide")
                if cached_guide is not None:
                    cached_guide.current_stage = final_stages[obj.guide_id]
        return created


class StatusHistory(models.Model):
    guide = models.ForeignKey(Guide, on_delete=models.PROTECT, related_name="status_history")
    stage = models.CharField(max_length=20, choices=Stage.choices)
    timestamp = models.DateTimeField(auto_now_add=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.PROTECT
    )
    location = models.CharField(max_length=100, blank=True)
    note = models.TextField(blank=True)

    objects = StatusHistoryQuerySet.as_manager()

    class Meta:
        base_manager_name = "objects"
        constraints = [
            models.UniqueConstraint(fields=["guide", "stage"], name="unique_stage_per_guide")
        ]
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.guide} - {self.stage}"

    def save(self, **kwargs):
        kwargs["force_insert"] = True
        kwargs.pop("force_update", None)
        kwargs.pop("update_fields", None)
        return super().save(**kwargs)

    def save_base(
        self,
        raw=False,
        force_insert=False,
        force_update=False,
        using=None,
        update_fields=None,
    ):
        if raw:
            return super().save_base(
                raw=True,
                force_insert=force_insert,
                force_update=force_update,
                using=using,
                update_fields=update_fields,
            )

        if not self._state.adding:
            raise ValidationError("StatusHistory es de solo inserción, no se permite actualizar.")

        using = using or router.db_for_write(type(self), instance=self)
        with transaction.atomic(using=using):
            guide = Guide._base_manager.using(using).select_for_update().get(pk=self.guide_id)
            existing_stages = list(
                StatusHistory._base_manager.using(using)
                .filter(guide_id=self.guide_id)
                .order_by("timestamp", "pk")
                .values_list("stage", flat=True)
            )
            _validate_history_prefix(existing_stages)
            _validate_guide_stage(len(existing_stages), guide.current_stage)
            _validate_stage_transition(len(existing_stages), self.stage)
            super().save_base(
                raw=False,
                force_insert=True,
                force_update=False,
                using=using,
                update_fields=None,
            )
            expected_stage = _current_stage_for_history(len(existing_stages))
            _advance_current_stage(guide, expected_stage, self.stage, using)
        cached_guide = self._state.fields_cache.get("guide")
        if cached_guide is not None:
            cached_guide.current_stage = self.stage

    def delete(self, *args, **kwargs):
        raise ValidationError("StatusHistory es de solo inserción, no se permite eliminar.")
