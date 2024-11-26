
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
        """
        Calcula el porcentaje que representa un activo en la cartera total del usuario.
        
        :param obj: Puede ser una instancia del modelo Activo o un diccionario con los datos necesarios.
        :return: Porcentaje que representa el activo en la cartera total, redondeado a 2 decimales.
        """
        # Determinar si obj es un diccionario o un modelo
        if isinstance(obj, dict):
            # Acceso basado en claves para diccionarios
            precio_actual = obj.get('precioActual', 0) or obj.get('precioCompra', 0)
            cantidad = obj.get('cantidad', 0)
            usuario = obj.get('usuario')
        else:
            # Acceso basado en atributos para modelos
            precio_actual = getattr(obj, 'precioActual', 0) or getattr(obj, 'precioCompra', 0)
            cantidad = getattr(obj, 'cantidad', 0)
            usuario = getattr(obj, 'usuario', None)

        # Calcular el valor total del activo
        valor_activo = cantidad * precio_actual

        # Validar si el usuario es válido antes de continuar
        if not usuario:
            return 0.0

        # Obtener todos los activos del usuario
        activos_usuario = Activo.objects.filter(usuario=usuario)

        # Calcular el valor total de la cartera del usuario
        valor_total_cartera = sum(
            activo.cantidad * (activo.precioActual or activo.precioCompra) for activo in activos_usuario
        )

        # Evitar división por cero y calcular el porcentaje
        if valor_total_cartera > 0:
            porcentaje = (valor_activo / valor_total_cartera) * 100
            return round(porcentaje, 2)
        
        return 0.0

