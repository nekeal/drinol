from rest_framework.generics import ListAPIView

from drinol.translations.models import Translation
from drinol.translations.serializers import TranslationSerializer


class TranslationListApiView(ListAPIView):
    queryset = Translation.objects.all()
    serializer_class = TranslationSerializer

    def get_serializer(self, *args, **kwargs):
        kwargs["many"] = False
        return super(TranslationListApiView, self).get_serializer(*args, **kwargs)
