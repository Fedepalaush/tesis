
from rest_framework.serializers import ModelSerializer
from .models import Activo
from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework import serializers
import json
    
class UserSerializer(serializers.ModelSerializer):
        class Meta:
            model = User
            fields = ["id", "username", "password"]
            extra_kwargs = {"password": {"write_only":True}}

        def create(self,validated_data):
            user = User.objects.create_user(**validated_data)
            return user    

class ActivoSerializer(serializers.ModelSerializer):
    recomendacion = serializers.SerializerMethodField()
    porcentaje_cartera = serializers.SerializerMethodField()

    class Meta:
        model = Activo
        fields = ("id", 'ticker', "cantidad", 'precioCompra', 'precioActual', 'precioVenta', 'fechaCompra', 'fechaVenta', 'usuario', 'recomendacion', 'porcentaje_cartera')
        extra_kwargs = {'usuario': {"read_only": True}}

    def get_recomendacion(self, obj):
        recomendacion = obj.get('recomendacion') if isinstance(obj, dict) else getattr(obj, 'recomendacion', None)
        if recomendacion:
            try:
                return json.loads(recomendacion)
            except (TypeError, json.JSONDecodeError):
                return None
        return None
    
    def get_porcentaje_cartera(self, obj):
        # Obtener el precio actual del activo
        precio_actual = obj.precioActual or obj.precioCompra
        # Calcular el valor total del activo en la cartera
        valor_activo = obj.cantidad * precio_actual
        
        # Obtener la suma total de la cartera del usuario
        usuario = obj.usuario
        activos_usuario = Activo.objects.filter(usuario=usuario)
        valor_total_cartera = sum(activo.cantidad * (activo.precioActual or activo.precioCompra) for activo in activos_usuario)
        
        if valor_total_cartera > 0:
            # Calcular el porcentaje que representa este activo
            return round((valor_activo / valor_total_cartera) * 100, 2)
        return 0.0

