"""
Vistas de usuarios para la aplicación API.

Este módulo contiene vistas relacionadas con la gestión de usuarios y autenticación.
"""
from typing import Dict, Any
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from rest_framework.permissions import AllowAny

from api.serializers import UserSerializer
from api.views.base import CachedAPIView


class CheckUserExistsView(CachedAPIView):
    """
    Vista para comprobar si un usuario existe.
    """
    permission_classes = [AllowAny]

    def get(self, request, username, *args, **kwargs):
        """
        Comprueba si existe un usuario con el nombre de usuario dado.
        
        Args:
            request: El objeto de solicitud HTTP.
            username: El nombre de usuario a comprobar.
            
        Returns:
            Response: El objeto de respuesta HTTP con el resultado.
        """
        cache_key = self.get_cache_key(username=username)
        cached_data = self.get_from_cache(cache_key)

        if cached_data is not None:
            return self.success_response(data={"exists": cached_data})

        # Si no está en caché, realizar la consulta
        exists = get_user_model().objects.filter(username=username).exists()
        
        # Almacenar en caché por 1 hora
        self.set_in_cache(cache_key, exists, timeout=3600)

        return self.success_response(data={"exists": exists})
