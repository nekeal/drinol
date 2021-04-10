from .base import *

SECRET_KEY = "secret_key"

# ------------- DATABASES -------------
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": env("POSTGRES_DB", "drinol"),
        "USER": env("POSTGRES_USER", "drinol"),
        "PASSWORD": env("POSTGRES_PASSWORD", "drinol"),
        "HOST": env("POSTGRES_HOST", "localhost"),
    }
}
