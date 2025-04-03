from django.utils import timezone
from datetime import timedelta
import json
import pandas as pd
from django.core.cache import cache

from ..models import StockData
from .indicators import calculate_triple_ema, calculate_rsi
from .utils import evaluar_cruce
from .utils import dataframe_from_historical_data
from ..repositories.stock_data_repository import StockDataRepository

def cache_decorator(func):
    def wrapper(*args, **kwargs):
        cache_key = f"{func.__name__}_{args}_{kwargs}"
        cached_data = cache.get(cache_key)
        if cached_data:
            return cached_data
        result = func(*args, **kwargs)
        cache.set(cache_key, result, timeout=3600)
        return result
    return wrapper

class ActivoService:
    def __init__(self):
        self.stock_data_repository = StockDataRepository()

    @cache_decorator
    def process_activo(self, activo):
        """
        Procesa los datos para un activo específico y actualiza sus valores.
        """
        # Obtener datos históricos
        historical_data = self.stock_data_repository.get_historical_data(activo.ticker, timezone.now() - timedelta(days=365))

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

        # Retornar datos procesados
        return {
            'precioActual': precio_actual,
            'recomendacion': recomendacion
        }
