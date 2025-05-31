import pandas as pd
from decimal import Decimal
from datetime import datetime

def calculate_pivots(stock_data):
    # Convertir los datos a un DataFrame
    df = pd.DataFrame(list(stock_data))
    df.drop(['id', 'ticker'], axis=1, inplace=True)
    df.columns = ['time', 'open', 'high', 'low', 'close', 'volume']

    # Eliminar filas con volumen igual a 0
    df = df[df['volume'] != 0]
    df.reset_index(drop=True, inplace=True)

    # Asegurar que los valores sean float (en caso de que vengan como Decimal)
    for col in ['open', 'high', 'low', 'close', 'volume']:
        df[col] = df[col].astype(float)

    # Función para calcular el tipo de pivote
    def pivotid(df1, l, n1, n2):
        if l - n1 < 0 or l + n2 >= len(df1):
            return 0
        pividlow = all(df1.low[l] <= df1.low[i] for i in range(l - n1, l + n2 + 1))
        pividhigh = all(df1.high[l] >= df1.high[i] for i in range(l - n1, l + n2 + 1))
        if pividlow and pividhigh:
            return 3
        elif pividlow:
            return 1
        elif pividhigh:
            return 2
        return 0

    # Calcular la columna 'pivot'
    df['pivot'] = df.apply(lambda x: pivotid(df, x.name, 10, 10), axis=1)

    # Función para calcular la posición del punto pivote
    def pointpos(x):
        if x['pivot'] == 1:
            return x['low'] - 1e-3
        elif x['pivot'] == 2:
            return x['high'] + 1e-3
        return None

    # Calcular la columna 'pointpos'
    df['pointpos'] = df.apply(lambda row: pointpos(row), axis=1)

    # Filtrar últimos 300 datos
    dfpl = df[-300:-1]

    # Identificar puntos pivote no nulos
    pivot_points = dfpl.dropna(subset=['pointpos'])

    # Lista con datos de puntos pivote
    data = []

    # Datos históricos para graficar
    historical = dfpl.apply(lambda row: {
        'date': row['time'].strftime('%Y-%m-%d %H:%M:%S') if isinstance(row['time'], datetime) else str(row['time']),
        'open_price': row['open'],
        'high_price': row['high'],
        'low_price': row['low'],
        'close_price': row['close'],
    }, axis=1).tolist()

    # Calcular límites
    count = int(dfpl['pointpos'].count())
    if count > 0:
        limites = (dfpl['pointpos'].max() - dfpl['pointpos'].min()) / count
    else:
        limites = 0.001

    # Buscar puntos pivote similares (líneas horizontales)
    for i in range(len(pivot_points)):
        for j in range(i + 1, len(pivot_points)):
            point_i = pivot_points.iloc[i]
            point_j = pivot_points.iloc[j]

            if (
                point_i['pointpos'] > point_i['high'] and
                point_j['pointpos'] > point_j['high'] and
                abs(point_i['pointpos'] - point_j['pointpos']) < limites
            ):
                data.append({
                    'time': point_i['time'].strftime('%Y-%m-%d %H:%M:%S') if isinstance(point_i['time'], datetime) else str(point_i['time']),
                    'pointpos': float(point_i['pointpos']),
                    'type': 'high'
                })

            elif (
                point_i['pointpos'] < point_i['low'] and
                point_j['pointpos'] < point_j['low'] and
                abs(point_i['pointpos'] - point_j['pointpos']) < limites
            ):
                data.append({
                    'time': point_i['time'].strftime('%Y-%m-%d %H:%M:%S') if isinstance(point_i['time'], datetime) else str(point_i['time']),
                    'pointpos': float(point_i['pointpos']),
                    'type': 'low'
                })

    return {
        'data': data,
        'historical': historical,
        'limites': limites
    }
