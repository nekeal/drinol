from django.db.models import QuerySet
from django.utils.translation import get_language
from rest_framework import serializers

from drinol.translations.models import Translation


class TranslationSerializer(serializers.Serializer):
    language_code = serializers.SerializerMethodField(source="get_language_code")
    translation = serializers.SerializerMethodField()

    @staticmethod
    def get_language_code(qs: QuerySet[Translation]):
        return get_language()

    @staticmethod
    def get_translation(qs: QuerySet[Translation]):
        return {obj.key: obj.value for obj in qs}

    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass
