"""Reviewer account command: repeatable local access to the panel, no password in git."""

import re
from io import StringIO

from django.contrib.auth import authenticate, get_user_model
from django.core.management import CommandError, call_command
from django.test import TestCase, override_settings

USERNAME = "revisor"


def run_command() -> str:
    out = StringIO()
    call_command("create_reviewer", stdout=out)
    return out.getvalue()


def printed_password(output: str) -> str:
    return re.search(r"^Contraseña: (\S+)$", output, re.MULTILINE).group(1)


# The test runner forces DEBUG off; the command only runs in development.
@override_settings(DEBUG=True)
class CreateReviewerTests(TestCase):
    def test_new_account_reaches_panel_and_admin_with_printed_password(self):
        output = run_command()

        self.assertIn(f"Usuario: {USERNAME}", output)
        self.assertTrue(self.client.login(username=USERNAME, password=printed_password(output)))
        self.assertEqual(self.client.get("/api/v1/guides/").status_code, 200)
        self.assertEqual(self.client.get("/admin/tracking/guide/").status_code, 200)

    def test_password_is_long_random_and_only_its_hash_is_stored(self):
        first = printed_password(run_command())
        user = get_user_model().objects.get(username=USERNAME)

        self.assertGreaterEqual(len(first), 20)
        self.assertNotIn(first, user.password)
        self.assertNotEqual(first, printed_password(run_command()))

    def test_rerun_rotates_password_without_duplicating_the_account(self):
        old = printed_password(run_command())
        new = printed_password(run_command())

        self.assertEqual(get_user_model().objects.filter(username=USERNAME).count(), 1)
        self.assertIsNone(authenticate(username=USERNAME, password=old))
        self.assertIsNotNone(authenticate(username=USERNAME, password=new))

    def test_rerun_restores_access_of_a_disabled_account(self):
        run_command()
        get_user_model().objects.filter(username=USERNAME).update(is_active=False, is_staff=False)

        new = printed_password(run_command())

        self.assertTrue(self.client.login(username=USERNAME, password=new))
        self.assertEqual(self.client.get("/api/v1/guides/").status_code, 200)

    def test_refuses_outside_development_and_creates_nothing(self):
        with override_settings(DEBUG=False), self.assertRaisesMessage(CommandError, "desarrollo"):
            run_command()

        self.assertFalse(get_user_model().objects.filter(username=USERNAME).exists())
