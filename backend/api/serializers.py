
from rest_framework.serializers import ModelSerializer
from .models import Activo
from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework import serializers
    
class UserSerializer(serializers.ModelSerializer):
        class Meta:
            model = User
            fields = ["id", "username", "password"]
            extra_kwargs = {"password": {"write_only":True}}

        def create(self,validated_data):
            user = User.objects.create_user(**validated_data)
            return user    

class ActivoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Activo 
        fields = ("id",'ticker', "cantidad" , 'precioCompra', 'precioActual', 'precioVenta', 'fechaCompra', 'fechaVenta', 'usuario')
        extra_kwargs = {'usuario' : {"read_only":True}}
