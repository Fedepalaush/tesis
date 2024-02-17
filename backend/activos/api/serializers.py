
from rest_framework.serializers import ModelSerializer
from ..models import Activo
from rest_framework import serializers

class ActivoSerializer(ModelSerializer):
    class Meta:
        model = Activo 
        fields = ('ticker', 'precio')


class Activo2Serializer(serializers.Serializer):
    ticker = serializers.CharField()
    prices = serializers.ListField(child=serializers.DecimalField(max_digits=20, decimal_places=3))   

