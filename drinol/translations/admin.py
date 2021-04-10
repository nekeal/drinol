from django.contrib import admin
from translated_fields import TranslatedFieldAdmin

from drinol.translations.models import Translation


@admin.register(Translation)
class TranslationAdmin(TranslatedFieldAdmin, admin.ModelAdmin):
    pass
