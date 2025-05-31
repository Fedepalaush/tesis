"""
Vistas de utilidad para la aplicación API.

Este módulo contiene vistas de utilidad que no encajan en otras categorías.
"""
import os
from django.http import JsonResponse
from rest_framework.permissions import AllowAny

from api.utils.cedear_scraper import obtener_tickers_cedears
from api.views.base import CachedAPIView


LAST_EXECUTION_FILE = "last_execution.log"


class HealthCheckView(CachedAPIView):
    """
    Vista para la comprobación de salud.
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        """
        Realizar comprobación de salud.
        
        Args:
            request: El objeto de solicitud HTTP.
            
        Returns:
            Response: El objeto de respuesta HTTP con el estado de salud.
        """
        return self.success_response(data={"status": "OK"})


class LastExecutionDateView(CachedAPIView):
    """
    Vista para recuperar la fecha de última ejecución.
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        """
        Obtener la fecha de última ejecución.
        
        Args:
            request: El objeto de solicitud HTTP.
            
        Returns:
            Response: El objeto de respuesta HTTP con la fecha de última ejecución.
        """
        last_exec = self._get_last_execution()

        if last_exec:
            return self.success_response(data={"last_execution": last_exec})
        else:
            return self.success_response(data={"last_execution": "No hay registros previos."})
    
    def _get_last_execution(self):
        """
        Obtener la última ejecución desde un archivo.
        
        Returns:
            str: La fecha de última ejecución o None si no se encuentra.
        """
        if os.path.exists(LAST_EXECUTION_FILE):
            with open(LAST_EXECUTION_FILE, "r") as f:
                return f.read().strip()
        return None


class TickersView(CachedAPIView):
    """
    Vista para recuperar tickers disponibles.
    """
    permission_classes = [AllowAny]
    cache_timeout = 86400  # 24 horas
    
    def get(self, request):
        """
        Obtener tickers disponibles.
        
        Args:
            request: El objeto de solicitud HTTP.
            
        Returns:
            Response: El objeto de respuesta HTTP con tickers.
        """
        # Intentar obtener de caché
        cache_key = self.get_cache_key()
        cached_response = self.get_cached_response(cache_key)
        if cached_response:
            return cached_response
            
        # Si no está en caché, obtener tickers
        tickers = obtener_tickers_cedears()
        print(tickers)
        
        # Almacenar en caché y devolver respuesta
        return self.cache_response(cache_key, {"tickers": tickers}, timeout=self.cache_timeout)
