"""
Middleware para el manejo de excepciones de la aplicación.

Este módulo contiene middleware para capturar y procesar excepciones
de manera consistente en toda la aplicación.
"""
import logging
import traceback
import json
from typing import Any, Dict

from django.http import JsonResponse
from django.conf import settings
from django.core.exceptions import ValidationError
from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.exceptions import APIException
from rest_framework import status

from api.exceptions import BaseAppException, NotFoundException, ValidationException

logger = logging.getLogger(__name__)


class ExceptionMiddleware:
    """
    Middleware para capturar y procesar excepciones.
    
    Convierte excepciones no manejadas en respuestas JSON consistentes.
    """
    
    def __init__(self, get_response):
        """
        Inicializa el middleware.
        
        Args:
            get_response: Función para obtener la respuesta.
        """
        self.get_response = get_response

    def __call__(self, request):
        """
        Procesa la solicitud y captura excepciones.
        
        Args:
            request: Solicitud HTTP.
            
        Returns:
            Respuesta HTTP.
        """
        try:
            response = self.get_response(request)
            return response
        except Exception as e:
            return self.handle_exception(e, request)

    def handle_exception(self, exc: Exception, request) -> JsonResponse:
        """
        Maneja las excepciones y genera respuestas JSON apropiadas.
        
        Args:
            exc (Exception): Excepción capturada.
            request: Solicitud HTTP.
            
        Returns:
            JsonResponse: Respuesta JSON con detalles del error.
        """
        # Manejar excepciones personalizadas de la aplicación
        if isinstance(exc, BaseAppException):
            return self._handle_app_exception(exc)
        
        # Manejar excepciones de validación de Django
        if isinstance(exc, ValidationError):
            validation_exc = ValidationException(
                message="Error de validación", 
                field_errors=self._format_validation_errors(exc)
            )
            return self._handle_app_exception(validation_exc)
        
        # Manejar excepciones de DRF
        if isinstance(exc, APIException):
            return self._handle_drf_exception(exc)
        
        # Manejar cualquier otra excepción como error interno
        return self._handle_internal_error(exc)
    
    def _handle_app_exception(self, exc: BaseAppException) -> JsonResponse:
        """
        Maneja excepciones personalizadas de la aplicación.
        
        Args:
            exc (BaseAppException): Excepción personalizada.
            
        Returns:
            JsonResponse: Respuesta JSON con detalles del error.
        """
        status_code = self._get_status_code_for_app_exception(exc)
        return JsonResponse(exc.to_dict(), status=status_code)
    
    def _handle_drf_exception(self, exc: APIException) -> JsonResponse:
        """
        Maneja excepciones de Django REST Framework.
        
        Args:
            exc (APIException): Excepción de DRF.
            
        Returns:
            JsonResponse: Respuesta JSON con detalles del error.
        """
        response = drf_exception_handler(exc, None)
        if response is not None:
            return response
        
        return JsonResponse(
            {
                "code": "api_error",
                "message": str(exc),
                "details": {}
            },
            status=exc.status_code
        )
    
    def _handle_internal_error(self, exc: Exception) -> JsonResponse:
        """
        Maneja excepciones no clasificadas como errores internos.
        
        Args:
            exc (Exception): Excepción no clasificada.
            
        Returns:
            JsonResponse: Respuesta JSON con detalles del error.
        """
        # Registrar el error completo para depuración
        logger.error(
            f"Error interno del servidor: {str(exc)}",
            exc_info=True,
            extra={"traceback": traceback.format_exc()}
        )
        
        # En producción, no exponer detalles del error
        details = {}
        if settings.DEBUG:
            details = {
                "exception_type": exc.__class__.__name__,
                "traceback": traceback.format_exc().split("\n")
            }
        
        return JsonResponse(
            {
                "code": "internal_error",
                "message": "Error interno del servidor",
                "details": details
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    def _get_status_code_for_app_exception(self, exc: BaseAppException) -> int:
        """
        Determina el código de estado HTTP para una excepción personalizada.
        
        Args:
            exc (BaseAppException): Excepción personalizada.
            
        Returns:
            int: Código de estado HTTP.
        """
        if isinstance(exc, NotFoundException):
            return status.HTTP_404_NOT_FOUND
        elif isinstance(exc, ValidationException):
            return status.HTTP_400_BAD_REQUEST
        else:
            return status.HTTP_500_INTERNAL_SERVER_ERROR
    
    def _format_validation_errors(self, exc: ValidationError) -> Dict[str, str]:
        """
        Formatea los errores de validación de Django.
        
        Args:
            exc (ValidationError): Excepción de validación.
            
        Returns:
            Dict[str, str]: Errores formateados por campo.
        """
        if hasattr(exc, 'error_dict'):
            return {field: str(errors[0]) for field, errors in exc.error_dict.items()}
        else:
            return {"non_field_errors": str(exc)}


def custom_exception_handler(exc: Exception, context: Dict[str, Any]) -> JsonResponse:
    """
    Manejador personalizado de excepciones para Django REST Framework.
    
    Args:
        exc (Exception): Excepción capturada.
        context (Dict[str, Any]): Contexto de la excepción.
        
    Returns:
        JsonResponse: Respuesta JSON con detalles del error.
    """
    # Primero intentar el manejador de DRF
    response = drf_exception_handler(exc, context)
    
    # Si DRF no maneja la excepción, usar nuestro manejador personalizado
    if response is None:
        middleware = ExceptionMiddleware(lambda req: None)
        return middleware.handle_exception(exc, None)
    
    return response
