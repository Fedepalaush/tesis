
from rest_framework.serializers import ModelSerializer
from ..models import Activo

class ActivoSerializer(ModelSerializer):
    class Meta:
        model = Activo 
        fields = ('ticker', 'precio')