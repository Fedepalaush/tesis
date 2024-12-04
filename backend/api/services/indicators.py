import numpy as np
import pandas as pd
import pandas_ta as taf
from .trends import check_ema_trend, calculate_triple_ema, calculate_score
from .signals import calculate_signal
import pandas_ta as ta
from api.models import StockData


def calculate_sma(data, period):
    return ta.sma(data['close_price'], length=period)

def calculate_ema(data, period):
    return ta.ema(data['close_price'], length=period)

def calculate_rsi(data, period=14):
    return ta.rsi(data['close_price'], length=period)

def calculate_indicators(data):

    data['SMA_50'] = calculate_sma(data, 50)
    data['SMA_200'] = calculate_sma(data, 200)
    data['EMA_9'] = calculate_ema(data, 9)
    data['EMA_21'] = calculate_ema(data, 21)
    data['EMA_12'] = calculate_ema(data, 12)
    data['EMA_26'] = calculate_ema(data, 26)
    data['RSI'] = calculate_rsi(data)
    data['EMA_200'] = calculate_ema(data, 200)
    return data

def validate_date_range(start_date, end_date):
    if start_date > end_date:
        raise ValueError('Start date must be earlier than end date.')

def fetch_historical_data(ticker, start_date, end_date):
    historical_data = StockData.objects.filter(
        ticker=ticker, date__range=(start_date, end_date)
    ).order_by('date')

    df = pd.DataFrame.from_records(
        historical_data.values('date', 'open_price', 'high_price', 'low_price', 'close_price', 'volume')
    )
    return df

def calculate_analytics(df):
    # Calcular indicadores y agregar columnas necesarias
    df['RSI'] = calculate_rsi(df)  # Reemplaza con tu lógica real de RSI
    df['EMA_200'] = calculate_ema(df, 200)  # Reemplaza con tu lógica real de EMA
    df['EMA_21'] = calculate_ema(df, 21)
    df['EMA_9'] = calculate_ema(df, 9)

    # Tendencias y otras métricas
    tendencia219 = check_ema_trend(df)
    emaRapidaSemaforo = calculate_signal(df, short_span=9, long_span=21, days_to_consider=3)
    emaMediaSemaforo = calculate_signal(df, short_span=50, long_span=100, days_to_consider=5)
    emaLentaSemaforo = calculate_signal(df, short_span=50, long_span=200, days_to_consider=9)
    tripleEma = calculate_triple_ema(df)
    scoreEma = calculate_score(df)

    # Limpiar datos
    df.dropna(inplace=True)
    data = []
    for _, row in df.iterrows():
        data.append({
            'date': row.date,
            'open_price': row['open_price'],
            'high_price': row['high_price'],
            'low_price': row['low_price'],
            'close_price': row['close_price'],
            'rsi': row['RSI'],
            'ema_200': row['EMA_200'],
            'ema_21': row['EMA_21'],
            'ema_9': row['EMA_9'],
            'tendencia219': tendencia219,
            'scoreEma': scoreEma,
            'emaRapidaSemaforo': emaRapidaSemaforo,
            'emaMediaSemaforo': emaMediaSemaforo,
            'emaLentaSemaforo': emaLentaSemaforo,
            'tripleEma': tripleEma,
        })
    return data