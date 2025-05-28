"""
Utilidades para servicios financieros.

Este módulo contiene funciones de utilidad para el procesamiento
y análisis de datos financieros.
"""
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Union, Tuple
import pandas as pd
from django.db.models import QuerySet

def validate_date_range(start_date: datetime, end_date: datetime, min_days: int = 365) -> None:
    """
    Valida que el rango de fechas cumpla con un mínimo de días.
    
    Args:
        start_date (datetime): Fecha de inicio.
        end_date (datetime): Fecha de fin.
        min_days (int, optional): Mínimo de días requeridos. Defaults to 365.
        
    Raises:
        ValueError: Si el rango es menor al mínimo requerido.
    """
    if (end_date - start_date).days < min_days:
        raise ValueError(f"El rango de fechas debe ser de al menos {min_days} días.")

def calculate_percentage_change(initial_value: float, final_value: float) -> float:
    """
    Calcula el cambio porcentual entre dos valores.
    
    Args:
        initial_value (float): Valor inicial.
        final_value (float): Valor final.
        
    Returns:
        float: Porcentaje de cambio.
    """
    if initial_value == 0:
        return 0
    return ((final_value - initial_value) / initial_value) * 100

def detectar_cruce(ema4_prev: float, ema9_prev: float, ema18_prev: float, 
                  ema4_curr: float, ema9_curr: float, ema18_curr: float) -> int:
    """
    Detecta cruces entre medias móviles exponenciales.
    
    Args:
        ema4_prev (float): Valor previo de EMA4.
        ema9_prev (float): Valor previo de EMA9.
        ema18_prev (float): Valor previo de EMA18.
        ema4_curr (float): Valor actual de EMA4.
        ema9_curr (float): Valor actual de EMA9.
        ema18_curr (float): Valor actual de EMA18.
        
    Returns:
        int: 1 para cruce al alza, 2 para cruce a la baja, 0 sin cruce.
    """
    # Detectar cruce al alza
    if ema4_prev <= ema9_prev and ema4_prev <= ema18_prev and ema4_curr > ema9_curr and ema4_curr > ema18_curr:
        return 1  # Cruce al alza de EMA4 a EMA9 y EMA18
    # Detectar cruce a la baja
    elif ema4_prev >= ema9_prev and ema4_prev >= ema18_prev and ema4_curr < ema9_curr:
        return 2  # Cruce a la baja de EMA4 a EMA9
    return 0  # No hay cruce significativo
    
def evaluar_cruce(triple: List[Dict[str, Any]]) -> int:
    """
    Evalúa el resultado de varios cruces para determinar la tendencia.
    
    Args:
        triple (List[Dict[str, Any]]): Lista de diccionarios con resultados de cruces.
        
    Returns:
        int: 1 para tendencia alcista, 2 para tendencia bajista, 0 sin tendencia clara.
    """
    tiene_uno = False
    tiene_dos = False

    for item in triple:
        valor = item.get('Cruce')
        if valor == 1:
            tiene_uno = True
        elif valor == 2:
            tiene_dos = True

    if tiene_dos and not tiene_uno:
        return 2  # Tendencia bajista
    elif tiene_uno:
        return 1  # Tendencia alcista
    else:
        return 0  # Sin tendencia clara
    
def dataframe_from_historical_data(historical_data: QuerySet) -> pd.DataFrame:
    """
    Convierte un QuerySet de datos históricos a un DataFrame de pandas.
    
    Args:
        historical_data (QuerySet): QuerySet con datos históricos.
        
    Returns:
        pd.DataFrame: DataFrame con los datos históricos.
    """
    return pd.DataFrame.from_records(
        historical_data.values('date', 'open_price', 'high_price', 'low_price', 'close_price', 'volume')
    )    