"""User accounts for Hound Express staff."""

from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """Project user model, defined before the first migration.

    Django only lets the user model be swapped cheaply before any table exists, so it
    lives here from day one. The staff department is added in M54.
    """
