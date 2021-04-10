from django.db import models
from django.utils.translation import gettext_lazy as _
from translated_fields import TranslatedField, to_attribute


class Translation(models.Model):
    name = models.CharField(
        verbose_name=_("Translation's name"),
        max_length=255,
        help_text=_("Descriptive name of translation"),
        blank=True,
    )
    key = models.SlugField(
        verbose_name=_("Key"),
        max_length=255,
        help_text=_("Key used for translation recognition"),
    )
    value = TranslatedField(
        models.CharField(
            verbose_name=_("Value"),
            max_length=255,
            help_text=_("Value for translation"),
        )
    )

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _("Translation")
        verbose_name_plural = _("Translations")
