# settings.py
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-secret-key-change-me")
DEBUG = os.environ.get("DJANGO_DEBUG", "1") == "1"

ALLOWED_HOSTS = ["*"]  # ajustar em produção

# Application definition
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "rest_framework",
    "corsheaders",

    "messages_app",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    # corsheaders middleware deve ficar o mais alto possível (antes do CommonMiddleware)
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",

    # Se usar sessões/csrf, SessionMiddleware normalmente deve vir antes de CsrfViewMiddleware:
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",

    "django.middleware.locale.LocaleMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "chat_project.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": { "context_processors": [
            "django.template.context_processors.debug",
            "django.template.context_processors.request",
            "django.contrib.auth.context_processors.auth",
            "django.contrib.messages.context_processors.messages",
        ]},
    },
]

WSGI_APPLICATION = "chat_project.wsgi.application"

# Database: default SQLite. To use Postgres, set DATABASE_URL or change engine here.
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# Password validation (defaults)
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Django REST Framework: pagination default
REST_FRAMEWORK = {
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 10,  # default page size (frontend can request ?page=2)
}

# -------------------
# CORS / segurança
# -------------------

# Use apenas ORIGENS específicas — NÃO usar '*' quando enviar cookies (credentials).
# Liste aqui as origens do seu front-end de desenvolvimento.
# adicionar/ajustar:
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# IMPORTANTE: não deixe CORS_ALLOW_ALL_ORIGINS = True quando CORS_ALLOW_CREDENTIALS = True
# Remova / comente a linha CORS_ALLOW_ALL_ORIGINS = True
# ou controle via variável de ambiente dev:
CORS_ALLOW_ALL_ORIGINS = False


# Cabeçalhos/Methods permitidos (opcional — geralmente os padrões já funcionam, mas explícito é melhor)
from corsheaders.defaults import default_headers, default_methods
CORS_ALLOW_HEADERS = list(default_headers) + [
    # adicione headers customizados se necessário
    "X-CSRFToken",
]
CORS_ALLOW_METHODS = list(default_methods)

# Se o frontend fizer preflight e usar Credenciais, expor esses headers também (opcional)
CORS_EXPOSE_HEADERS = ["Content-Type", "X-CSRFToken"]

# CSRF trusted origins (Django >= 4 requer schema na origem)
# Adicione a origem do frontend para que o CSRF aceite requisições vindas dele (quando usar cookies).
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Sessão / cookies (dev)
# Se estiver usando cookies cross-site, pode ser necessário ajustar SAMESITE.
# NOTE: para SameSite=None normalmente é necessário 'Secure' e HTTPS nos navegadores modernos.
# Mantemos valores seguros para dev local — ajuste conforme sua infra.
SESSION_COOKIE_SAMESITE = "Lax"      # ou 'None' se estiver usando https com Secure
CSRF_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_SECURE = False        # em produção use True (HTTPS)
CSRF_COOKIE_SECURE = False           # em produção use True

# -------------------
# Fim CORS / segurança
# -------------------
