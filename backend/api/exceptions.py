"""
Excepciones personalizadas para la aplicación.

Este módulo contiene las definiciones de excepciones personalizadas
para manejar errores específicos de la aplicación de manera clara y consistente.
"""
from typing import Any, Dict, Optional


class BaseAppException(Exception):
    """
    Excepción base para todas las excepciones de la aplicación.
    
    Proporciona una estructura común para todas las excepciones personalizadas,
    incluyendo código de error, mensaje y detalles adicionales.
    """
    
    def __init__(self, message: str, code: str = "error", details: Optional[Dict[str, Any]] = None):
        """
        Inicializa una nueva excepción de aplicación.
        
        Args:
            message (str): Mensaje descriptivo del error.
            code (str, optional): Código identificador del error. Defaults to "error".
            details (Optional[Dict[str, Any]], optional): Detalles adicionales del error.
                Defaults to None.
        """
        self.message = message
        self.code = code
        self.details = details or {}
        super().__init__(self.message)
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convierte la excepción a un diccionario para su representación en API.
        
        Returns:
            Dict[str, Any]: Representación de la excepción como diccionario.
        """
        result = {
            "code": self.code,
            "message": self.message,
        }
        
        if self.details:
            result["details"] = self.details
            
        return result


class NotFoundException(BaseAppException):
    """
    Excepción para recursos no encontrados.
    
    Se lanza cuando se intenta acceder a un recurso que no existe.
    """
    
    def __init__(self, resource_name: str, resource_id: Any = None):
        """
        Inicializa una excepción de recurso no encontrado.
        
        Args:
            resource_name (str): Nombre del tipo de recurso no encontrado.
            resource_id (Any, optional): Identificador del recurso. Defaults to None.
        """
        message = f"{resource_name} no encontrado"
        if resource_id is not None:
            message = f"{resource_name} con id '{resource_id}' no encontrado"
            
        super().__init__(
            message=message,
            code="not_found",
            details={"resource": resource_name, "id": resource_id}
        )


class ValidationException(BaseAppException):
    """
    Excepción para errores de validación de datos.
    
    Se lanza cuando los datos proporcionados no cumplen con las validaciones requeridas.
    """
    
    def __init__(self, message: str, field_errors: Optional[Dict[str, str]] = None):
        """
        Inicializa una excepción de validación.
        
        Args:
            message (str): Mensaje descriptivo del error.
            field_errors (Optional[Dict[str, str]], optional): Errores específicos por campo.
                Defaults to None.
        """
        details = {}
        if field_errors:
            details["field_errors"] = field_errors
            
        super().__init__(
            message=message,
            code="validation_error",
            details=details
        )


class BusinessLogicException(BaseAppException):
    """
    Excepción para errores de lógica de negocio.
    
    Se lanza cuando se viola alguna regla de negocio en la aplicación.
    """
    
    def __init__(self, message: str, rule: Optional[str] = None):
        """
        Inicializa una excepción de lógica de negocio.
        
        Args:
            message (str): Mensaje descriptivo del error.
            rule (Optional[str], optional): Regla de negocio violada. Defaults to None.
        """
        details = {}
        if rule:
            details["rule"] = rule
            
        super().__init__(
            message=message,
            code="business_rule_violation",
            details=details
        )


class ExternalServiceException(BaseAppException):
    """
    Excepción para errores en servicios externos.
    
    Se lanza cuando ocurre un error al interactuar con servicios externos
    como APIs de terceros, bases de datos externas, etc.
    """
    
    def __init__(self, service_name: str, message: str, original_error: Optional[Exception] = None):
        """
        Inicializa una excepción de servicio externo.
        
        Args:
            service_name (str): Nombre del servicio externo.
            message (str): Mensaje descriptivo del error.
            original_error (Optional[Exception], optional): Excepción original capturada.
                Defaults to None.
        """
        details = {"service": service_name}
        if original_error:
            details["original_error"] = str(original_error)
            
        super().__init__(
            message=message,
            code="external_service_error",
            details=details
        )
