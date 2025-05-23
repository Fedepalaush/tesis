"""
Django settings for core project.
Generado con Django 5.0.2.
"""

from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv
import os

# --------------------------------------------------------------------
# Carga de variables de entorno (.env montado en /backend/.env)
# --------------------------------------------------------------------
load_dotenv()                       # lee automáticamente .env
BASE_DIR = Path(__file__).resolve().parent.parent

# --------------------------------------------------------------------
# Seguridad y modo DEBUG
# --------------------------------------------------------------------
SECRET_KEY = os.getenv(
    "DJANGO_SECRET_KEY",
    "django-insecure-ve62lfrnexby#c*8tgdgq+^6xr9upxr_ueg3s3fgp*mfy7mh&t",
)

DEBUG = os.getenv("DJANGO_DEBUG", "False").lower() == "true"

ALLOWED_HOSTS = os.getenv("DJANGO_ALLOWED_HOSTS", "*").split(",")

# --------------------------------------------------------------------
# REST + JWT
# --------------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
}

# --------------------------------------------------------------------
# Apps instaladas
# --------------------------------------------------------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "api",
    "graphene_django",
    "django_cron",
    "rest_framework_simplejwt",
]

GRAPHENE = {"SCHEMA": "core.schema.schema"}

# --------------------------------------------------------------------
# CORS
# --------------------------------------------------------------------
CORS_ALLOWED_ORIGINS = [
    "http://localhost",
    "http://127.0.0.1",
    "http://0.0.0.0",
    "http://127.0.0.1:5173",
    "http://localhost:5173",
]
CORS_ORIGIN_ALLOW_ALL = True
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = ["http://localhost:5173"]

# --------------------------------------------------------------------
# Middleware
# --------------------------------------------------------------------
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "core.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "core.wsgi.application"

# --------------------------------------------------------------------
# Caché in-memory (desarrollo)
# --------------------------------------------------------------------
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "unique-cache-location",
    }
}

# --------------------------------------------------------------------
# Base de datos – Docker Compose
# --------------------------------------------------------------------
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("DB_NAME", "tesis"),
        "USER": os.getenv("DB_USER", "postgres"),
        "PASSWORD": os.getenv("DB_PASSWORD", "password"),
        "HOST": os.getenv("DB_HOST", "timescaledb"),  
        "PORT": os.getenv("DB_PORT", "5432"),
    }
}

# --------------------------------------------------------------------
# Static & media
# --------------------------------------------------------------------
STATIC_URL = "/static/"
#STATIC_ROOT = os.getenv("STATIC_ROOT", "/app/static")      # ✅ coincide con el volumen
STATIC_ROOT = '/static/'
MEDIA_URL = "/media/"
MEDIA_ROOT = os.getenv("MEDIA_ROOT", "/app/media")         # opcional si montas media

# --------------------------------------------------------------------
# Internationalización y misc.
# --------------------------------------------------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --------------------------------------------------------------------
# Cron
# --------------------------------------------------------------------
CRON_CLASSES = ["api.cron.ImportStockDataCronJob"]