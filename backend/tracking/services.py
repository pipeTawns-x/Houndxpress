"""Casos de uso: fachada transaccional sobre las invariantes del modelo."""

import logging

from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError, transaction
from django.db.models import Count, Prefetch, Q
from rest_framework.exceptions import NotFound, ValidationError

from tracking.api.errors import Conflict
from tracking.models import Guide, Stage, StageTransitionAttempt, StatusHistory
from tracking.values import TrackingNumber

logger = logging.getLogger(__name__)


def history_prefetch():
    return Prefetch(
        "status_history", queryset=StatusHistory.objects.select_related("updated_by").order_by("pk")
    )


def list_guides(*, search="", archived=False):
    queryset = Guide.objects.filter(is_archived=archived)
    search = search.strip()
    if search:
        queryset = queryset.filter(
            Q(tracking_number__icontains=search) | Q(destination__icontains=search)
        )
    return queryset.prefetch_related(history_prefetch())


def get_guide(number, *, lock=False):
    queryset = Guide.objects.all()
    queryset = (
        queryset.select_for_update() if lock else queryset.prefetch_related(history_prefetch())
    )
    try:
        return queryset.get(tracking_number=TrackingNumber(number))
    except DjangoValidationError as exc:
        raise ValidationError("Número de guía inválido.") from exc
    except Guide.DoesNotExist as exc:
        raise NotFound() from exc


def create_guide(data, user):
    number = data["tracking_number"]
    try:
        with transaction.atomic():
            guide = Guide.objects.create(**data)
            StatusHistory.objects.create(
                guide=guide,
                stage=Stage.CARGO_RECEIVED,
                updated_by=user,
                department=user.department,
            )
    except IntegrityError:
        existing = Guide.objects.filter(tracking_number=number).first()
        if existing:
            raise Conflict("duplicate", existing.current_stage) from None
        raise
    return get_guide(number)


def advance_guide(number, data, user):
    rejection = None
    with transaction.atomic():
        guide = get_guide(number, lock=True)
        stage = data["stage"]
        current_index = Stage.values.index(guide.current_stage)
        requested_index = Stage.values.index(stage)
        if guide.is_archived:
            rejection = "archived"
        elif stage == guide.current_stage:
            return get_guide(number)
        elif guide.current_stage == Stage.CARGO_DELIVERED:
            rejection = "delivered"
        elif requested_index < current_index:
            rejection = "backwards"
        elif requested_index != current_index + 1:
            rejection = "skip"
        if rejection:
            StageTransitionAttempt.objects.create(
                guide=guide,
                requested_stage=stage,
                current_stage=guide.current_stage,
                attempted_by=user,
                reason=rejection,
            )
            logger.warning(
                "Transición rechazada: guía=%s etapa=%s actual=%s actor=%s motivo=%s",
                guide.tracking_number,
                stage,
                guide.current_stage,
                user.pk,
                rejection,
            )
        else:
            StatusHistory.objects.create(
                guide=guide,
                stage=stage,
                location=data.get("location", ""),
                updated_by=user,
                department=user.department,
            )
    # El rechazo se lanza después de confirmar su auditoría.
    if rejection:
        raise Conflict("invalid_transition", guide.current_stage)
    return get_guide(number)


def archive_guide(number):
    with transaction.atomic():
        guide = get_guide(number, lock=True)
        if not guide.is_archived:
            guide.is_archived = True
            guide.save(update_fields=["is_archived", "updated_at"])


def guide_summary():
    counts = Guide.objects.filter(is_archived=False).aggregate(
        total=Count("pk"),
        active=Count("pk", filter=~Q(current_stage=Stage.CARGO_DELIVERED)),
        inTransit=Count("pk", filter=Q(current_stage=Stage.VEHICLE_IN_TRANSIT)),
        delivered=Count("pk", filter=Q(current_stage=Stage.CARGO_DELIVERED)),
    )
    return {**counts, "withAlert": 0}


def public_guides(numbers):
    return {
        guide.tracking_number: guide for guide in list_guides().filter(tracking_number__in=numbers)
    }
