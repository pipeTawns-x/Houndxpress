"""Settings are evaluated at import time, so each case boots Django in a fresh process."""

import os
import subprocess
import sys
import tempfile
from pathlib import Path

from django.test import SimpleTestCase

BACKEND_DIR = Path(__file__).resolve().parents[2]
STRONG_KEY = "test-only-" + "k" * 50
PROBE = (
    "import django; django.setup(); from django.conf import settings as s; "
    "print(s.DEBUG, s.SESSION_COOKIE_SECURE, s.CSRF_COOKIE_SECURE, s.SECURE_SSL_REDIRECT)"
)


def boot(**env: str) -> subprocess.CompletedProcess[str]:
    """Import the settings in a child process with only the given DJANGO_* variables."""
    child_env = {key: value for key, value in os.environ.items() if not key.startswith("DJANGO_")}
    with tempfile.TemporaryDirectory() as tmp:
        empty_env_file = Path(tmp) / ".env"
        empty_env_file.write_text("", encoding="utf-8")
        child_env.update(
            DJANGO_SETTINGS_MODULE="config.settings",
            DJANGO_ENV_FILE=str(empty_env_file),
            **env,
        )
        return subprocess.run(
            [sys.executable, "-c", PROBE],
            cwd=BACKEND_DIR,
            env=child_env,
            capture_output=True,
            text=True,
            timeout=60,
            check=False,
        )


class SettingsBootTests(SimpleTestCase):
    def test_boots_with_no_environment_variables(self):
        result = boot()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout.split(), ["True", "False", "False", "False"])

    def test_production_mode_requires_secret_key(self):
        result = boot(DJANGO_DEBUG="false")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("DJANGO_SECRET_KEY is required", result.stderr)

    def test_production_mode_rejects_insecure_secret_key(self):
        result = boot(
            DJANGO_DEBUG="false",
            DJANGO_SECRET_KEY="django-insecure-copied-from-a-tutorial",
            DJANGO_ALLOWED_HOSTS="hound.example",
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("insecure development key", result.stderr)

    def test_production_mode_requires_allowed_hosts(self):
        result = boot(DJANGO_DEBUG="false", DJANGO_SECRET_KEY=STRONG_KEY)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("DJANGO_ALLOWED_HOSTS is required", result.stderr)

    def test_production_mode_boots_with_required_variables(self):
        result = boot(
            DJANGO_DEBUG="false",
            DJANGO_SECRET_KEY=STRONG_KEY,
            DJANGO_ALLOWED_HOSTS="hound.example",
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout.split(), ["False", "True", "True", "True"])
