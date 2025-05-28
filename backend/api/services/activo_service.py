"""
Servicio para la gestión de activos financieros.

Este módulo implementa el patrón Service para encapsular toda
la lógica de negocio relacionada con los activos financieros.
"""
from typing import Dict, Any, Optional, List
from django.utils import timezone
from datetime import timedelta, date, datetime
import json
import pandas as pd
from django.core.cache import cache
import logging

from ..models import StockData, Activo
from ..repositories.activo_repository import ActivoRepository, StockDataRepository
from .indicators import calculate_triple_ema, calculate_rsi
from .utils import evaluar_cruce, dataframe_from_historical_data, calculate_percentage_change

logger = logging.getLogger(__name__)

class ActivoService:
    """
    Servicio para la gestión de activos financieros.
    
    Esta clase encapsula toda la lógica de negocio relacionada con
    los activos financieros, utilizando los repositorios para el acceso a datos.
    """
    
    def __init__(self):
        """
        Inicializa el servicio con sus repositorios dependientes.
        """
        self.activo_repository = ActivoRepository()
        self.stock_data_repository = StockDataRepository()
    
    def process_activo(self, activo):
        """
        Procesa los datos para un activo específico y actualiza sus valores.
        
        Args:
            activo (Activo): El activo a procesar.
            
        Returns:
            Dict[str, Any]: Diccionario con los datos procesados del activo.
        """
        cache_key = f"activo_{activo.id}_data"
        cached_data = cache.get(cache_key)

        if cached_data:
            return {
                'precioActual': cached_data['precioActual'],
                'recomendacion': cached_data['recomendacion']
            }
        
        # Obtener datos históricos
        historical_data = StockData.objects.filter(
            ticker=activo.ticker,
            date__gte=timezone.now() - timedelta(days=365)
        ).order_by('date')

        df = dataframe_from_historical_data(historical_data)

        if df.empty:
            return None

        # Cálculos
        triple = calculate_triple_ema(df)
        resultadoTriple = evaluar_cruce(triple)
        rsi_series = calculate_rsi(df, period=14)
        rsi = rsi_series.iloc[-1] if not rsi_series.empty else None

        # Datos procesados
        precio_actual = float(df['close_price'].iloc[-1])
        recomendacion_dict = {
            "resultadoTriple": resultadoTriple.tolist() if isinstance(resultadoTriple, pd.Series) else resultadoTriple,
            "rsi": float(rsi) if rsi is not None else None
        }
        recomendacion = json.dumps(recomendacion_dict)

        # Guardar en caché
        cache.set(cache_key, {
            'precioActual': precio_actual,
            'recomendacion': recomendacion
        }, timeout=3600)

        # Retornar datos procesados
        return {
            'precioActual': precio_actual,
            'recomendacion': recomendacion
        }
        
    def get_all_activos(self) -> List[Dict[str, Any]]:
        """
        Obtiene todos los activos con información enriquecida.
        
        Returns:
            List[Dict[str, Any]]: Lista de activos con información adicional.
        """
        activos = self.activo_repository.get_all()
        resultado = []
        
        for activo in activos:
            activo_dict = self._enrich_activo_data(activo)
            resultado.append(activo_dict)
        
        return resultado
    
    def get_activo_by_id(self, activo_id: int) -> Optional[Dict[str, Any]]:
        """
        Obtiene un activo por su ID con información enriquecida.
        
        Args:
            activo_id (int): ID del activo a buscar.
            
        Returns:
            Optional[Dict[str, Any]]: Activo con información adicional o None si no existe.
        """
        activo = self.activo_repository.get_by_id(activo_id)
        if not activo:
            return None
        
        return self._enrich_activo_data(activo)
    
    def create_activo(self, activo_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Crea un nuevo activo.
        
        Args:
            activo_data (Dict[str, Any]): Datos del activo a crear.
            
        Returns:
            Dict[str, Any]: El activo creado con información adicional.
        """
        # Validación de datos
        self._validate_activo_data(activo_data)
        
        # Crear el activo
        activo = self.activo_repository.create(activo_data)
        
        # Enriquecer la información
        return self._enrich_activo_data(activo)
    
    def update_activo(self, activo_id: int, activo_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Actualiza un activo existente.
        
        Args:
            activo_id (int): ID del activo a actualizar.
            activo_data (Dict[str, Any]): Datos actualizados del activo.
            
        Returns:
            Optional[Dict[str, Any]]: El activo actualizado o None si no existe.
        """
        # Validar que el activo existe
        activo = self.activo_repository.get_by_id(activo_id)
        if not activo:
            return None
        
        # Validación de datos
        self._validate_activo_data(activo_data, update=True)
        
        # Actualizar el activo
        activo = self.activo_repository.update(activo_id, activo_data)
        
        # Enriquecer la información
        return self._enrich_activo_data(activo)
    
    def delete_activo(self, activo_id: int) -> bool:
        """
        Elimina un activo.
        
        Args:
            activo_id (int): ID del activo a eliminar.
            
        Returns:
            bool: True si se eliminó correctamente, False si no existe.
        """
        return self.activo_repository.delete(activo_id)
    
    def get_activo_historical_data(self, ticker: str, 
                                  days: int = 30) -> List[Dict[str, Any]]:
        """
        Obtiene los datos históricos de un activo.
        
        Args:
            ticker (str): Ticker del activo.
            days (int, optional): Cantidad de días hacia atrás a consultar. 
                Defaults to 30.
            
        Returns:
            List[Dict[str, Any]]: Lista de datos históricos del activo.
        """
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        data = self.stock_data_repository.get_data_by_ticker(
            ticker, start_date, end_date
        )
        
        # Convertir a lista de diccionarios
        return [
            {
                'date': item.date,
                'open': item.open,
                'high': item.high,
                'low': item.low,
                'close': item.close,
                'volume': item.volume,
                'ticker': item.ticker
            }
            for item in data
        ]
    
    def update_activo_precio_actual(self, ticker: str) -> Optional[Activo]:
        """
        Actualiza el precio actual de un activo con base en los datos más recientes.
        
        Args:
            ticker (str): Ticker del activo a actualizar.
            
        Returns:
            Optional[Activo]: El activo actualizado o None si no existe.
        """
        activo = self.activo_repository.get_by_ticker(ticker)
        if not activo:
            logger.warning(f"Activo con ticker {ticker} no encontrado.")
            return None
        
        latest_data = self.stock_data_repository.get_latest_data_by_ticker(ticker)
        if not latest_data:
            logger.warning(f"No hay datos históricos para el ticker {ticker}.")
            return None
        
        # Actualizar el precio actual
        activo_data = {'precioActual': latest_data.close}
        return self.activo_repository.update(activo.id, activo_data)
    
    def _enrich_activo_data(self, activo: Activo) -> Dict[str, Any]:
        """
        Enriquece los datos de un activo con información adicional.
        
        Args:
            activo (Activo): El activo a enriquecer.
            
        Returns:
            Dict[str, Any]: Diccionario con los datos enriquecidos del activo.
        """
        result = {
            'id': activo.id,
            'ticker': activo.ticker,
            'nombre': activo.nombre,
            'cantidad': activo.cantidad,
            'precioCompra': activo.precioCompra,
            'precioActual': activo.precioActual,
            'fechaCompra': activo.fechaCompra,
            'fechaVenta': activo.fechaVenta,
            'recomendacion': activo.recomendacion
        }
        
        # Calcular rendimiento si hay precio actual
        if activo.precioActual and activo.precioCompra:
            result['rendimiento'] = calculate_percentage_change(
                activo.precioCompra, activo.precioActual
            )
            result['valor_actual'] = activo.cantidad * activo.precioActual
            result['valor_compra'] = activo.cantidad * activo.precioCompra
            result['ganancia_perdida'] = result['valor_actual'] - result['valor_compra']
        
        return result
    
    def _validate_activo_data(self, data: Dict[str, Any], update: bool = False) -> None:
        """
        Valida los datos de un activo.
        
        Args:
            data (Dict[str, Any]): Datos del activo a validar.
            update (bool, optional): Indica si es una actualización. 
                Defaults to False.
                
        Raises:
            ValueError: Si los datos no son válidos.
        """
        # Validar ticker
        if not update and ('ticker' not in data or not data['ticker']):
            raise ValueError("El ticker es obligatorio")
        
        # Validar nombre
        if not update and ('nombre' not in data or not data['nombre']):
            raise ValueError("El nombre es obligatorio")
        
        # Validar precio de compra
        if 'precioCompra' in data and data['precioCompra'] is not None:
            try:
                precio = float(data['precioCompra'])
                if precio <= 0:
                    raise ValueError("El precio de compra debe ser mayor que cero")
            except (ValueError, TypeError):
                raise ValueError("El precio de compra debe ser un número válido")
        
        # Validar cantidad
        if 'cantidad' in data and data['cantidad'] is not None:
            try:
                cantidad = float(data['cantidad'])
                if cantidad <= 0:
                    raise ValueError("La cantidad debe ser mayor que cero")
            except (ValueError, TypeError):
                raise ValueError("La cantidad debe ser un número válido")


class StockDataService:
    """
    Servicio para la gestión de datos históricos de activos.
    
    Esta clase encapsula toda la lógica de negocio relacionada con
    los datos históricos de activos financieros.
    """
    
    def __init__(self):
        """
        Inicializa el servicio con sus repositorios dependientes.
        """
        self.stock_data_repository = StockDataRepository()
    
    def import_stock_data(self, stock_data_list: List[Dict[str, Any]]) -> int:
        """
        Importa datos históricos de activos en lote.
        
        Args:
            stock_data_list (List[Dict[str, Any]]): Lista de datos históricos a importar.
            
        Returns:
            int: Cantidad de registros importados.
        """
        try:
            created_objects = self.stock_data_repository.bulk_create(stock_data_list)
            return len(created_objects)
        except Exception as e:
            logger.error(f"Error al importar datos históricos: {str(e)}")
            raise
    
    def get_data_for_analysis(self, ticker: str, 
                            start_date: Optional[date] = None,
                            end_date: Optional[date] = None) -> List[Dict[str, Any]]:
        """
        Obtiene datos históricos formateados para análisis.
        
        Args:
            ticker (str): Ticker del activo.
            start_date (Optional[date], optional): Fecha de inicio. Defaults to None.
            end_date (Optional[date], optional): Fecha de fin. Defaults to None.
            
        Returns:
            List[Dict[str, Any]]: Datos históricos formateados para análisis.
        """
        data = self.stock_data_repository.get_data_by_ticker(ticker, start_date, end_date)
        
        return [
            {
                'date': item.date,
                'open': float(item.open),
                'high': float(item.high),
                'low': float(item.low),
                'close': float(item.close),
                'volume': float(item.volume),
                'ticker': item.ticker
            }
            for item in data
        ]
