"""Normalización del número de guía en los límites de la aplicación."""

from tracking.models import TRACKING_NUMBER_VALIDATOR

ALLOWED_LOCATIONS = (
    "Laredo, Texas",
    "Nuevo Laredo, Tamaulipas",
    "Miami, Florida",
    "Monterrey, Nuevo León",
    "Guadalajara, Jalisco",
    "Ciudad de México",
    "Bogotá, Colombia",
    "São Paulo, Brasil",
    "Santiago, Chile",
    "Buenos Aires, Argentina",
)


class TrackingNumber(str):
    def __new__(cls, value):
        normalized = str(value).strip().upper()
        TRACKING_NUMBER_VALIDATOR(normalized)
        return super().__new__(cls, normalized)
