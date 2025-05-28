"""
Repositorio para el manejo de activos financieros.

Este módulo implementa el patrón Repository para encapsular
toda la lógica de acceso a datos relacionada con los activos financieros.
"""
from typing import List, Optional, Dict, Any, Union
from datetime import date, datetime

from django.db.models import QuerySet, Q, F, Sum, Avg
from django.db.models.functions import TruncMonth

from api.models import Activo, StockData


class ActivoRepository:
    """
    Repositorio para operaciones de acceso a datos de Activos.
    
    Esta clase encapsula todas las operaciones de base de datos relacionadas
    con el modelo Activo, siguiendo el patrón Repository.
    """
    
    @staticmethod
    def get_all() -> QuerySet:
        """
        Obtiene todos los activos en la base de datos.
        
        Returns:
            QuerySet: QuerySet con todos los activos.
        """
        return Activo.objects.all()
    
    @staticmethod
    def get_by_id(activo_id: int) -> Optional[Activo]:
        """
        Obtiene un activo por su ID.
        
        Args:
            activo_id (int): ID del activo a buscar.
            
        Returns:
            Optional[Activo]: El activo encontrado o None si no existe.
        """
        try:
            return Activo.objects.get(id=activo_id)
        except Activo.DoesNotExist:
            return None
    
    @staticmethod
    def get_by_ticker(ticker: str) -> Optional[Activo]:
        """
        Obtiene un activo por su ticker.
        
        Args:
            ticker (str): Ticker del activo a buscar.
            
        Returns:
            Optional[Activo]: El activo encontrado o None si no existe.
        """
        try:
            return Activo.objects.get(ticker=ticker)
        except Activo.DoesNotExist:
            return None
    
    @staticmethod
    def create(activo_data: Dict[str, Any]) -> Activo:
        """
        Crea un nuevo activo en la base de datos.
        
        Args:
            activo_data (Dict[str, Any]): Datos del activo a crear.
            
        Returns:
            Activo: El activo creado.
        """
        return Activo.objects.create(**activo_data)
    
    @staticmethod
    def update(activo_id: int, activo_data: Dict[str, Any]) -> Optional[Activo]:
        """
        Actualiza un activo existente.
        
        Args:
            activo_id (int): ID del activo a actualizar.
            activo_data (Dict[str, Any]): Datos actualizados del activo.
            
        Returns:
            Optional[Activo]: El activo actualizado o None si no existe.
        """
        try:
            activo = Activo.objects.get(id=activo_id)
            for key, value in activo_data.items():
                setattr(activo, key, value)
            activo.save()
            return activo
        except Activo.DoesNotExist:
            return None
    
    @staticmethod
    def delete(activo_id: int) -> bool:
        """
        Elimina un activo de la base de datos.
        
        Args:
            activo_id (int): ID del activo a eliminar.
            
        Returns:
            bool: True si se eliminó correctamente, False si no existe.
        """
        try:
            activo = Activo.objects.get(id=activo_id)
            activo.delete()
            return True
        except Activo.DoesNotExist:
            return False


class StockDataRepository:
    """
    Repositorio para operaciones de acceso a datos de StockData.
    
    Esta clase encapsula todas las operaciones de base de datos relacionadas
    con el modelo StockData, siguiendo el patrón Repository.
    """
    
    @staticmethod
    def get_data_by_ticker(ticker: str, start_date: Optional[Union[date, datetime]] = None, 
                          end_date: Optional[Union[date, datetime]] = None) -> QuerySet:
        """
        Obtiene datos históricos de un activo por su ticker, opcionalmente filtrados por fechas.
        
        Args:
            ticker (str): Ticker del activo.
            start_date (Optional[Union[date, datetime]], optional): Fecha de inicio del rango. 
                Defaults to None.
            end_date (Optional[Union[date, datetime]], optional): Fecha de fin del rango. 
                Defaults to None.
            
        Returns:
            QuerySet: QuerySet con los datos históricos filtrados.
        """
        query = StockData.objects.filter(ticker=ticker)
        
        if start_date:
            query = query.filter(date__gte=start_date)
        
        if end_date:
            query = query.filter(date__lte=end_date)
        
        return query.order_by('date')
    
    @staticmethod
    def get_latest_data_by_ticker(ticker: str) -> Optional[StockData]:
        """
        Obtiene el dato más reciente de un activo por su ticker.
        
        Args:
            ticker (str): Ticker del activo.
            
        Returns:
            Optional[StockData]: El dato más reciente o None si no hay datos.
        """
        try:
            return StockData.objects.filter(ticker=ticker).latest('date')
        except StockData.DoesNotExist:
            return None
    
    @staticmethod
    def create_or_update(stock_data: Dict[str, Any]) -> StockData:
        """
        Crea o actualiza un registro de datos de stock.
        
        Args:
            stock_data (Dict[str, Any]): Datos del stock a crear o actualizar.
            
        Returns:
            StockData: El objeto StockData creado o actualizado.
        """
        ticker = stock_data.get('ticker')
        date_value = stock_data.get('date')
        
        obj, created = StockData.objects.update_or_create(
            ticker=ticker,
            date=date_value,
            defaults=stock_data
        )
        
        return obj
    
    @staticmethod
    def bulk_create(stock_data_list: List[Dict[str, Any]]) -> List[StockData]:
        """
        Crea múltiples registros de datos de stock en una sola operación.
        
        Args:
            stock_data_list (List[Dict[str, Any]]): Lista de datos de stock a crear.
            
        Returns:
            List[StockData]: Lista de objetos StockData creados.
        """
        objects = [StockData(**data) for data in stock_data_list]
        return StockData.objects.bulk_create(objects)
