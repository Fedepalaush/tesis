
from rest_framework.serializers import ModelSerializer
from ..models import Activo
from rest_framework import serializers

class ActivoSerializer(ModelSerializer):
    class Meta:
        model = Activo 
        fields = ('ticker', 'precio')


class Activo2Serializer(serializers.Serializer):
    ticker = serializers.CharField()
    precio = serializers.DecimalField(max_digits=10, decimal_places=2)   

