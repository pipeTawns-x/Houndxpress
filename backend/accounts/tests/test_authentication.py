"""Session and account controls from OWASP ASVS 5.0 level 1, sections 6.3 and 7."""

import json
from importlib import import_module
from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test import Client, TestCase
from django.utils.crypto import get_random_string

DEMO_FIXTURE = Path(__file__).resolve().parents[2] / "tracking" / "fixtures" / "demo_guides.json"
ADMIN_URL = "/admin/"
LOGIN_URL = "/admin/login/"
LOGOUT_URL = "/admin/logout/"


def session_exists(session_key: str) -> bool:
    return import_module(settings.SESSION_ENGINE).SessionStore().exists(session_key)


class SessionTests(TestCase):
    def setUp(self):
        self.credential = get_random_string(20)
        self.staff = get_user_model().objects.create_user(
            username="supervisor", password=self.credential, is_staff=True
        )

    def session_key(self, client: Client) -> str:
        return client.cookies[settings.SESSION_COOKIE_NAME].value

    def test_session_key_rotates_on_login(self):  # ASVS 7.2.4
        session = self.client.session
        session["visited"] = True
        session.save()
        key_before_login = self.session_key(self.client)

        response = self.client.post(
            LOGIN_URL,
            {"username": "supervisor", "password": self.credential, "next": ADMIN_URL},
        )

        self.assertRedirects(response, ADMIN_URL)
        self.assertNotEqual(self.session_key(self.client), key_before_login)
        self.assertFalse(session_exists(key_before_login))

    def test_logout_invalidates_the_session(self):  # ASVS 7.4.1
        self.client.force_login(self.staff)
        key = self.session_key(self.client)
        self.assertEqual(self.client.get(ADMIN_URL).status_code, 200)

        self.client.post(LOGOUT_URL)

        self.assertFalse(session_exists(key))
        replay = Client()
        replay.cookies[settings.SESSION_COOKIE_NAME] = key
        self.assertRedirects(replay.get(ADMIN_URL), f"{LOGIN_URL}?next={ADMIN_URL}")

    def test_deactivated_user_loses_access(self):  # ASVS 7.4.2
        self.client.force_login(self.staff)
        self.assertEqual(self.client.get(ADMIN_URL).status_code, 200)

        self.staff.is_active = False
        self.staff.save(update_fields=["is_active"])

        self.assertRedirects(self.client.get(ADMIN_URL), f"{LOGIN_URL}?next={ADMIN_URL}")


class DefaultAccountTests(TestCase):
    def test_demo_fixture_creates_no_users(self):  # ASVS 6.3.2
        user_model = get_user_model()
        entries = json.loads(DEMO_FIXTURE.read_text(encoding="ascii"))
        self.assertNotIn(user_model._meta.label_lower, {entry["model"] for entry in entries})

        call_command("loaddata", "demo_guides", verbosity=0)
        self.assertEqual(user_model.objects.count(), 0)
