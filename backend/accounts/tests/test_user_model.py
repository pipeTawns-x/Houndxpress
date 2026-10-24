from django.conf import settings
from django.contrib import admin
from django.contrib.admin.utils import flatten_fieldsets
from django.contrib.auth import get_user_model
from django.test import RequestFactory, SimpleTestCase

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
