import pandas as pd
import pandas_ta as ta  # TA-Lib para análisis técnico
from api.models import StockData  # Ajusta esto a tu aplicación

# Función unificada para detectar cruces
def detectar_cruce(ema_prev, ema_curr, num_emas):
    if num_emas == 2:
        ema_short_prev, ema_long_prev = ema_prev
        ema_short_curr, ema_long_curr = ema_curr

        if ema_short_prev <= ema_long_prev and ema_short_curr > ema_long_curr:
            return 1  # Cruce al alza
        elif ema_short_prev >= ema_long_prev and ema_short_curr < ema_long_curr:
            return 2  # Cruce a la baja

    elif num_emas == 3:
        ema4_prev, ema9_prev, ema18_prev = ema_prev
        ema4_curr, ema9_curr, ema18_curr = ema_curr

        if ema4_prev <= ema9_prev and ema4_prev <= ema18_prev and ema4_curr > ema9_curr and ema4_curr > ema18_curr:
            return 1  # Cruce al alza
        elif ema4_prev >= ema9_prev and ema4_prev >= ema18_prev and ema4_curr < ema9_curr:
            return 2  # Cruce a la baja

    return 0  # No hay cruce

# Función para calcular las EMAs y detectar cruces
def calculate_ema(data, ema_periods, use_triple):
    if use_triple:
        # Calcular tres EMAs
        ema4, ema9, ema18 = ema_periods
        data['EMA_4'] = ta.ema(data['Close'], length=ema4)
        data['EMA_9'] = ta.ema(data['Close'], length=ema9)
        data['EMA_18'] = ta.ema(data['Close'], length=ema18)

        # Detectar cruces con triple EMA
        data['Cruce'] = data.apply(
            lambda row: detectar_cruce(
                (data['EMA_4'].shift(1)[row.name], data['EMA_9'].shift(1)[row.name], data['EMA_18'].shift(1)[row.name]),
                (row['EMA_4'], row['EMA_9'], row['EMA_18']),
                num_emas=3
            ), axis=1
        )
    else:
        # Calcular dos EMAs
        ema_short, ema_long = ema_periods
        data['EMA_short'] = ta.ema(data['Close'], length=ema_short)
        data['EMA_long'] = ta.ema(data['Close'], length=ema_long)

        # Detectar cruces con doble EMA
        data['Cruce'] = data.apply(
            lambda row: detectar_cruce(
                (data['EMA_short'].shift(1)[row.name], data['EMA_long'].shift(1)[row.name]),
                (row['EMA_short'], row['EMA_long']),
                num_emas=2
            ), axis=1
        )

    # Devolver los últimos 5 registros para análisis
    return data[['Cruce']].tail(5).to_dict(orient='records')

# Evaluar si se detectaron señales de compra o venta
def evaluar_cruce(triple):
    tiene_uno = any(item['Cruce'] == 1 for item in triple)
    tiene_dos = any(item['Cruce'] == 2 for item in triple)

    if tiene_dos and not tiene_uno:
        return 2  # Señal de venta
    elif tiene_uno:
        return 1  # Señal de compra
    return 0  # No hay señal

# Función principal para obtener señales de cruce
def obtener_ema_signals(tickers, ema_periods, use_triple):
    signals = []  # Almacenar las señales generadas
    for ticker in tickers:
        # Obtener los datos históricos del modelo StockData
        historical_data = StockData.objects.filter(ticker=ticker).order_by('date')

        # Convertir el queryset en un DataFrame de Pandas
        df = pd.DataFrame.from_records(historical_data.values(
            'date', 'open_price', 'high_price', 'low_price', 'close_price', 'volume'))

        # Cambiar los nombres de las columnas para adaptarse a la librería pandas_ta
        df.rename(columns={
            'date': 'Date',
            'open_price': 'Open',
            'high_price': 'High',
            'low_price': 'Low',
            'close_price': 'Close',
            'volume': 'Volume'
        }, inplace=True)

        # Calcular las EMAs y detectar cruces
        cruces_detectados = calculate_ema(df, ema_periods, use_triple)
        resultado_cruce = evaluar_cruce(cruces_detectados)

        # Definir la señal con base en el cruce detectado
        signal_text = "COMPRA" if resultado_cruce == 1 else "VENTA" if resultado_cruce == 2 else ""

        # Si hay una señal válida, preparar los datos para graficar
        if signal_text:
            # Datos de velas y EMAs para graficar
            candles = df[['Date', 'Open', 'High', 'Low', 'Close']].tail(60).to_dict(orient='records')

            # Seleccionar las columnas de las EMAs en función de si es doble o triple cruce
            if use_triple:
                ema_values = df[['Date', 'EMA_4', 'EMA_9', 'EMA_18']].tail(60).to_dict(orient='records')
            else:
                ema_values = df[['Date', 'EMA_short', 'EMA_long']].tail(60).to_dict(orient='records')

            # Añadir la señal a la lista
            signals.append({
                "ticker": ticker,
                "signal": signal_text,
                "candles": candles,
                "ema_values": ema_values
            })

    return signals
