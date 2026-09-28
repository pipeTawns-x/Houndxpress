from django.conf import settings
from django.contrib import admin
from django.contrib.auth import get_user_model
from django.test import SimpleTestCase

from accounts.models import User


class UserModelTests(SimpleTestCase):
    def test_auth_user_model_is_accounts_user(self):
        self.assertEqual(settings.AUTH_USER_MODEL, "accounts.User")
        self.assertIs(get_user_model(), User)
        self.assertEqual(User._meta.db_table, "accounts_user")

    def test_user_model_is_registered_in_admin(self):
        self.assertTrue(admin.site.is_registered(User))
