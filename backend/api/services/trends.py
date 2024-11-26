import numpy as np
import pandas_ta as ta
from ..logica.ema_logic import obtener_ema_signals

def check_ema_trend(data):
    last3_ema9 = data['EMA_9'].tail(3).values
    last3_ema21 = data['EMA_21'].tail(3).values

    is_approaching_from_below = all(last3_ema9[i] < last3_ema21[i] for i in range(3))
    is_approaching_from_above = all(last3_ema9[i] > last3_ema21[i] for i in range(3))

    if is_approaching_from_below:
        return 1
    elif is_approaching_from_above:
        return 2
    else:
        return 0

def detectar_cruce(ema4_prev, ema9_prev, ema18_prev, ema4_curr, ema9_curr, ema18_curr):
    if ema4_prev <= ema9_prev and ema4_prev <= ema18_prev and ema4_curr > ema9_curr and ema4_curr > ema18_curr:
        return 1  # Cruce al alza
    elif ema4_prev >= ema9_prev and ema4_prev >= ema18_prev and ema4_curr < ema9_curr:
        return 2  # Cruce a la baja
    return 0

def calculate_score(data):
    # Calcular las medias móviles
    print('dataaa')
    print(data)
    data['SMA_50'] = data['close_price'].rolling(window=50).mean()
    data['SMA_200'] = data['close_price'].rolling(window=200).mean()
    data['EMA_9'] = data['close_price'].ewm(span=9, adjust=False).mean()
    data['EMA_21'] = data['close_price'].ewm(span=21, adjust=False).mean()
    data['EMA_12'] = data['close_price'].ewm(span=12, adjust=False).mean()
    data['EMA_26'] = data['close_price'].ewm(span=26, adjust=False).mean()

    # Señales de cruce
    data['Golden_Cross'] = np.where((data['SMA_50'] > data['SMA_200']), 1, 0)
    data['Death_Cross'] = np.where((data['SMA_50'] < data['SMA_200']), -1, 0)
    data['Cross_9_21'] = np.where((data['EMA_9'] > data['EMA_21']), 1, -1)
    data['Cross_12_26'] = np.where((data['EMA_12'] > data['EMA_26']), 1, -1)
    
    # Ponderaciones
    golden_death_weight = 0.5
    cross_9_21_weight = 0.25
    cross_12_26_weight = 0.25

    # Calcular el puntaje total
    data['Score'] = (golden_death_weight * (data['Golden_Cross'] + data['Death_Cross']) +
                     cross_9_21_weight * data['Cross_9_21'] +
                     cross_12_26_weight * data['Cross_12_26'])

    # Normalizar el puntaje a un rango de 0 a 100
    data['Score'] = ((data['Score'] + 1) / 2) * 100
    # Devolver el puntaje más reciente
    return data['Score'].iloc[-1] if not data.empty else None



def calculate_triple_ema(data):
    # Calcular las medias móviles
    print(data)
    data['EMA_4'] = ta.ema(data['Close'], length=4)
    data['EMA_9'] = ta.ema(data['Close'], length=9)
    data['EMA_18'] = ta.ema(data['Close'], length=18)

    # Aplica la función detectar_cruce para cada fila del DataFrame, comparando con la fila anterior
    data['Cruce'] = data.apply(lambda row: detectar_cruce(
        data['EMA_4'].shift(1)[row.name], data['EMA_9'].shift(1)[row.name], data['EMA_18'].shift(1)[row.name],
        row['EMA_4'], row['EMA_9'], row['EMA_18']), axis=1)
    
    # Retorna un diccionario con las fechas y los valores de cruce
    result = data[['Cruce']].tail(5).to_dict(orient='records')
    return result

