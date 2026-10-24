"""Cuentas de usuario para el personal de Hound Express."""

from django.contrib.auth.models import AbstractUser
from django.db import models


class Department(models.TextChoices):
    CUSTOMS = "customs", "Aduana"
    OPERATIONS = "operations", "Operaciones"
    SECURITY = "security", "Seguridad"
    KAM = "kam", "KAM"


class User(AbstractUser):
    """Modelo de usuario del proyecto, definido antes de la primera migración.

    Django solo permite sustituir el modelo de usuario sin un costo significativo antes de
    que exista alguna tabla, por lo que vive aquí desde el primer día. El departamento del
    personal se agrega en M54.
    """

    department = models.CharField(max_length=20, choices=Department.choices, blank=True)
