"""Campos explícitos: los identificadores internos nunca salen por la API."""

from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from tracking.models import ServiceLevel, Stage
from tracking.values import ALLOWED_LOCATIONS, TrackingNumber


class TrackingNumberField(serializers.CharField):
    def to_internal_value(self, data):
        value = super().to_internal_value(data)
        try:
            return TrackingNumber(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.messages) from exc


class CreateGuideSerializer(serializers.Serializer):
    trackingNumber = TrackingNumberField(source="tracking_number", max_length=22)
    origin = serializers.CharField(max_length=100)
    destination = serializers.CharField(max_length=100)
    recipient = serializers.CharField(max_length=255)
    serviceLevel = serializers.ChoiceField(
        source="service_level",
        choices=ServiceLevel.choices,
        default=ServiceLevel.STANDARD,
    )


class AdvanceGuideSerializer(serializers.Serializer):
    stage = serializers.ChoiceField(choices=Stage.choices)
    location = serializers.ChoiceField(choices=ALLOWED_LOCATIONS, required=False, allow_blank=True)


class PublicHistorySerializer(serializers.Serializer):
    stage = serializers.CharField()
    timestamp = serializers.DateTimeField()
    # Las ubicaciones antiguas fuera del catálogo siguen siendo privadas.
    location = serializers.SerializerMethodField()

    def get_location(self, obj):
        return obj.location if obj.location in ALLOWED_LOCATIONS else ""


class HistorySerializer(PublicHistorySerializer):
    location = serializers.CharField()
    updatedBy = serializers.CharField(source="updated_by.username", default=None)
    department = serializers.CharField()
    note = serializers.CharField()


class GuideSerializer(serializers.Serializer):
    trackingNumber = serializers.CharField(source="tracking_number")
    origin = serializers.CharField()
    destination = serializers.CharField()
    recipient = serializers.CharField()
    serviceLevel = serializers.CharField(source="service_level")
    currentStatus = serializers.CharField(source="current_stage")
    isArchived = serializers.BooleanField(source="is_archived")
    createdAt = serializers.DateTimeField(source="created_at")
    updatedAt = serializers.DateTimeField(source="updated_at")
    history = HistorySerializer(source="status_history", many=True)


class PublicGuideSerializer(serializers.Serializer):
    trackingNumber = serializers.CharField(source="tracking_number")
    currentStatus = serializers.CharField(source="current_stage")
    history = PublicHistorySerializer(source="status_history", many=True)


class TrackQuerySerializer(serializers.Serializer):
    numbers = serializers.CharField()

    def validate_numbers(self, value):
        numbers = value.split(",")
        if not 1 <= len(numbers) <= 10:
            raise serializers.ValidationError("Se requieren de 1 a 10 números.")
        return [TrackingNumberField().run_validation(number) for number in numbers]
