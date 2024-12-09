from django.utils import timezone
from datetime import timedelta
import json
import pandas as pd
from django.core.cache import cache

from ..models import StockData
from .indicators import calculate_triple_ema, calculate_rsi
from .utils import evaluar_cruce
from .utils import dataframe_from_historical_data

def process_activo(activo):
    """
    Procesa los datos para un activo específico y actualiza sus valores.
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
