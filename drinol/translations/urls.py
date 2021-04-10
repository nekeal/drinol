from typing import Any, List

from django.urls import path

from drinol.translations.views import TranslationListApiView

urlpatterns: List[Any] = [
    path("", TranslationListApiView.as_view(), name="translation-list")
]
