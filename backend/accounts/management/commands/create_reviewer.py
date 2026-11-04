"""Cuenta local para revisar el panel sin versionar ninguna contraseña."""

import secrets

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError

from accounts.models import Department

USERNAME = "revisor"


class Command(BaseCommand):
    help = "Crea o renueva la cuenta local de revisión e imprime una contraseña nueva."

    def handle(self, *args, **options):
        # Imprimir una contraseña en la terminal solo es aceptable en desarrollo.
        if not settings.DEBUG:
            raise CommandError("create_reviewer solo corre en desarrollo (DJANGO_DEBUG=true).")

        password = secrets.token_urlsafe(18)
        user, _ = get_user_model().objects.get_or_create(username=USERNAME)
        user.is_active = True
        user.is_staff = True
        # El panel pide is_staff; el admin además pide permisos para mostrar los modelos.
        user.is_superuser = True
        user.department = Department.OPERATIONS
        user.set_password(password)
        user.save()

        self.stdout.write("Cuenta de revisión lista.")
        self.stdout.write(f"Usuario: {USERNAME}")
        self.stdout.write(f"Contraseña: {password}")
        self.stdout.write("No se vuelve a mostrar. Si la pierdes, corre de nuevo este comando.")
