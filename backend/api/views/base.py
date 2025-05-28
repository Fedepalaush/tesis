"""
Vistas base para la aplicación API.

Este módulo define clases base para las vistas API que proporcionan
funcionalidad común y aseguran un comportamiento consistente en toda la aplicación.
"""
from typing import Dict, Any, Optional
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.cache import cache
from django.http import JsonResponse

class BaseAPIView(APIView):
    """
    Clase base para todas las vistas API.
    
    Proporciona funcionalidad común como formato de respuesta,
    manejo de errores y soporte de caché.
    """
    
    def get_cache_key(self, **params) -> str:
        """
        Genera una clave de caché basada en el nombre de la vista y los parámetros.
        
        Args:
            **params: Parámetros a incluir en la clave de caché.
            
        Returns:
            str: Una cadena de clave de caché.
        """
        view_name = self.__class__.__name__
        param_str = "_".join(f"{k}_{v}" for k, v in sorted(params.items()) if v is not None)
        return f"{view_name}_{param_str}"
    
    def get_from_cache(self, cache_key: str) -> Optional[Any]:
        """
        Obtiene datos del caché.
        
        Args:
            cache_key (str): La clave de caché a buscar.
            
        Returns:
            Optional[Any]: Los datos en caché o None si no se encuentran.
        """
        return cache.get(cache_key)
    
    def set_in_cache(self, cache_key: str, data: Any, timeout: int = 3600) -> None:
        """
        Almacena datos en caché.
        
        Args:
            cache_key (str): La clave de caché para almacenar los datos.
            data (Any): Los datos a almacenar en caché.
            timeout (int, optional): Tiempo de expiración del caché en segundos. 
                                    Predeterminado a 3600 (1 hora).
        """
        cache.set(cache_key, data, timeout=timeout)
    
    def success_response(self, data: Any = None, status_code: int = status.HTTP_200_OK, 
                         message: str = "Éxito") -> Response:
        """
        Crea una respuesta de éxito estandarizada.
        
        Args:
            data (Any, optional): Los datos a incluir en la respuesta. Predeterminado a None.
            status_code (int, optional): Código de estado HTTP. Predeterminado a 200.
            message (str, optional): Mensaje de éxito. Predeterminado a "Éxito".
            
        Returns:
            Response: Un objeto Response de REST framework.
        """
        response_data = {
            "status": "success",
            "message": message
        }
        
        if data is not None:
            response_data["data"] = data
            
        return Response(response_data, status=status_code)
    
    def error_response(self, message: str, status_code: int = status.HTTP_400_BAD_REQUEST, 
                       errors: Any = None) -> Response:
        """
        Crea una respuesta de error estandarizada.
        
        Args:
            message (str): Mensaje de error.
            status_code (int, optional): Código de estado HTTP. Predeterminado a 400.
            errors (Any, optional): Información detallada de error. Predeterminado a None.
            
        Returns:
            Response: Un objeto Response de REST framework.
        """
        response_data = {
            "status": "error",
            "message": message
        }
        
        if errors is not None:
            response_data["errors"] = errors
            
        return Response(response_data, status=status_code)


class CachedAPIView(BaseAPIView):
    """
    Clase base para vistas API con soporte de caché integrado.
    
    Proporciona métodos para implementar fácilmente caché para respuestas API.
    """
    
    cache_timeout = 3600  # Tiempo de expiración predeterminado (1 hora)
    
    def get_cached_response(self, cache_key: str, **kwargs) -> Optional[Response]:
        """
        Obtiene una respuesta en caché si está disponible.
        
        Args:
            cache_key (str): La clave de caché a buscar.
            **kwargs: Parámetros adicionales para la creación de respuesta.
            
        Returns:
            Optional[Response]: Una respuesta en caché o None si no se encuentra.
        """
        cached_data = self.get_from_cache(cache_key)
        if cached_data is not None:
            return self.success_response(data=cached_data, **kwargs)
        return None
    
    def cache_response(self, cache_key: str, data: Any, timeout: Optional[int] = None) -> Response:
        """
        Almacena datos en caché y devuelve una respuesta de éxito.
        
        Args:
            cache_key (str): La clave de caché para almacenar los datos.
            data (Any): Los datos a almacenar en caché y a incluir en la respuesta.
            timeout (Optional[int], optional): Tiempo de expiración del caché en segundos. 
                    Predeterminado a self.cache_timeout.
            
        Returns:
            Response: Un objeto Response de REST framework.
        """
        self.set_in_cache(cache_key, data, timeout or self.cache_timeout)
        return self.success_response(data=data)
