"""Django settings for the Hound Express backend.

Every value comes from environment variables, optionally loaded from backend/.env.
With no variables at all the project runs in local development mode.

https://docs.djangoproject.com/en/5.2/topics/settings/
https://docs.djangoproject.com/en/5.2/ref/settings/
"""

import os
from pathlib import Path

from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Variables already set in the environment win over the file. A missing file is fine.
load_dotenv(os.environ.get("DJANGO_ENV_FILE") or BASE_DIR / ".env")


def env_bool(name: str, default: bool) -> bool:
    raw = os.environ.get(name, "").strip().lower()
    if not raw:
        return default
    if raw in {"1", "true", "yes", "on"}:
        return True
    if raw in {"0", "false", "no", "off"}:
        return False
    raise ImproperlyConfigured(f"{name} must be true or false, got {raw!r}.")


def env_list(name: str, default: list[str]) -> list[str]:
    raw = os.environ.get(name, "").strip()
    if not raw:
        return default
    return [item.strip() for item in raw.split(",") if item.strip()]


# --- Core -------------------------------------------------------------------------------

DEBUG = env_bool("DJANGO_DEBUG", True)

# Local development only. Production mode (DJANGO_DEBUG=false) refuses to start with it.
DEV_ONLY_SECRET_KEY = "django-insecure-dev-only-never-use-this-key-outside-local-development"

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "").strip()
if not SECRET_KEY:
    if not DEBUG:
        raise ImproperlyConfigured("DJANGO_SECRET_KEY is required when DJANGO_DEBUG is false.")
    SECRET_KEY = DEV_ONLY_SECRET_KEY
elif not DEBUG and SECRET_KEY.startswith("django-insecure"):
    raise ImproperlyConfigured(
        "DJANGO_SECRET_KEY must not be an insecure development key when DJANGO_DEBUG is false."
    )

ALLOWED_HOSTS = env_list(
    "DJANGO_ALLOWED_HOSTS", ["localhost", "127.0.0.1", "[::1]"] if DEBUG else []
)
if not DEBUG and not ALLOWED_HOSTS:
    raise ImproperlyConfigured("DJANGO_ALLOWED_HOSTS is required when DJANGO_DEBUG is false.")

if not DEBUG:
    # Production only: local development keeps plain HTTP and the default cookie names.
    # With these values `manage.py check --deploy` reports no issues.
    SECURE_SSL_REDIRECT = True
    # HSTS for one year, subdomains included, ready for the preload list (ASVS 3.4.1).
    # Browsers then refuse plain HTTP for the whole domain, so serve every subdomain over
    # HTTPS before the first deployment.
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    # Secure cookies with the __Host- prefix (ASVS 3.3.1): the browser accepts them only over
    # HTTPS, for this exact host and path /, so a subdomain cannot set or overwrite them.
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_NAME = "__Host-sessionid"
    CSRF_COOKIE_NAME = "__Host-csrftoken"

# --- Applications -----------------------------------------------------------------------

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "accounts.apps.AccountsConfig",
    "core.apps.CoreConfig",
    "tracking.apps.TrackingConfig",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# --- Database ---------------------------------------------------------------------------

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
        # IMMEDIATE takes the write lock at BEGIN, so a second writer waits instead of failing.
        "OPTIONS": {"transaction_mode": "IMMEDIATE", "timeout": 20},
    }
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --- Authentication ---------------------------------------------------------------------

# Swappable user model, set before the first migration (see accounts/models.py).
AUTH_USER_MODEL = "accounts.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    # OWASP ASVS 5.0 6.2.1 requires at least 8 characters and strongly recommends 15.
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {"min_length": 12},
    },
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    # NumericPasswordValidator stays out: ASVS 6.2.5 forbids rules on which characters a
    # password may contain, and length plus the common-password list already apply.
]

# --- Internationalization ---------------------------------------------------------------

LANGUAGE_CODE = "es-mx"
# With USE_TZ on, datetimes are always stored in UTC. TIME_ZONE only sets the default
# display zone; UTC is a neutral choice for sites on both sides of the border.
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# --- Static files -----------------------------------------------------------------------

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# --- Django REST Framework --------------------------------------------------------------

REST_FRAMEWORK = {
    # Secure by default: every endpoint requires a session unless it opts out explicitly.
    "DEFAULT_AUTHENTICATION_CLASSES": ["rest_framework.authentication.SessionAuthentication"],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
    # JSON first: curl gets JSON, a browser gets the browsable API. The JSON renderer adds
    # `charset=utf-8` to the Content-Type (ASVS 4.1.1; see config/renderers.py).
    "DEFAULT_RENDERER_CLASSES": [
        "config.renderers.UTF8JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ],
    # Request limits per client (ASVS 6.1.1). UserRateThrottle also counts anonymous clients
    # by IP address, so both rates leave room for a health probe every few seconds. The
    # history lives in the default cache. The admin login is a Django view, not a DRF one,
    # so these limits do not cover it.
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {"anon": "60/minute", "user": "120/minute"},
    # Identify clients by REMOTE_ADDR. X-Forwarded-For comes from the client, so trusting it
    # would let anyone reset their limit. Set it to the proxy count once deployment adds one.
    "NUM_PROXIES": 0,
}
