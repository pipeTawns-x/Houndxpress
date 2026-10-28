from datetime import UTC, datetime
from unittest import mock

from django.conf import settings
from django.contrib import admin
from django.contrib.admin.utils import flatten_fieldsets
from django.contrib.auth import get_user_model
from django.test import RequestFactory, SimpleTestCase, TestCase
from django.utils.crypto import get_random_string

from accounts.models import User


class UserModelTests(SimpleTestCase):
    def test_auth_user_model_is_accounts_user(self):
        self.assertEqual(settings.AUTH_USER_MODEL, "accounts.User")
        self.assertIs(get_user_model(), User)
        self.assertEqual(User._meta.db_table, "accounts_user")

    def test_user_model_is_registered_in_admin(self):
        self.assertTrue(admin.site.is_registered(User))

    def test_department_is_listed_and_editable_in_user_admin(self):
        model_admin = admin.site._registry[User]
        request = RequestFactory().get("/admin/")
        request.user = User(is_active=True, is_superuser=True)
        self.assertIn("department", model_admin.list_display)
        self.assertIn("department", flatten_fieldsets(model_admin.fieldsets))
        self.assertIn("department", flatten_fieldsets(model_admin.add_fieldsets))
        self.assertIn("department", model_admin.get_form(request, User()).base_fields)
        self.assertIn("department", model_admin.get_form(request).base_fields)


class UserTimestampTests(TestCase):
    def test_updated_at_is_set_by_server_and_moves_on_save(self):
        created = datetime(2026, 1, 1, tzinfo=UTC)
        edited = datetime(2026, 1, 2, tzinfo=UTC)
        with mock.patch("django.utils.timezone.now", return_value=created):
            user = User.objects.create_user(username="operator", password=get_random_string(20))
        self.assertEqual(user.updated_at, created)

        with mock.patch("django.utils.timezone.now", return_value=edited):
            user.first_name = "Ana"
            user.save()
        user.refresh_from_db()
        self.assertEqual(user.updated_at, edited)
