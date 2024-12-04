import pandas as pd

def calculate_pivots(stock_data):
    # Convertir los datos a un DataFrame
    df = pd.DataFrame(list(stock_data))
    df.drop(['id', 'ticker'], axis=1, inplace=True)
    df.columns = ['time', 'open', 'high', 'low', 'close', 'volume']

    # Eliminar filas con volumen igual a 0
    df = df[df['volume'] != 0]
    df.reset_index(drop=True, inplace=True)

    # Función para calcular el pivote
    def pivotid(df1, l, n1, n2):
        if l - n1 < 0 or l + n2 >= len(df1):
            return 0
        pividlow = 1
        pividhigh = 1
        for i in range(l - n1, l + n2 + 1):
            if df1.low[l] > df1.low[i]:
                pividlow = 0
            if df1.high[l] < df1.high[i]:
                pividhigh = 0
        if pividlow and pividhigh:
            return 3
        elif pividlow:
            return 1
        elif pividhigh:
            return 2
        else:
            return 0

    # Aplicar la función pivotid para calcular el pivote y agregarlo como columna 'pivot'
    df['pivot'] = df.apply(lambda x: pivotid(df, x.name, 10, 10), axis=1)

    # Función para calcular la posición del punto pivot
    def pointpos(x):
        if x['pivot'] == 1:
            return x['low'] - 1e-3
        elif x['pivot'] == 2:
            return x['high'] + 1e-3
        else:
            return None

    # Aplicar la función pointpos para calcular 'pointpos' y agregarlo como columna
    df['pointpos'] = df.apply(lambda row: pointpos(row), axis=1)

    # Filtrar todos los registros para graficar
    dfpl = df[-300:-1]

    # Identificar todos los puntos pivote y las líneas trazadas
    pivot_points = dfpl.dropna(subset=['pointpos'])

    # Lista para almacenar los datos de los puntos pivote
    data = []

    # Lista para almacenar todos los datos históricos
    historical = dfpl.apply(lambda row: {
        'date': row['time'].strftime('%Y-%m-%d %H:%M:%S'),
        'open_price': row['open'],
        'high_price': row['high'],
        'low_price': row['low'],
        'close_price': row['close'],
    }, axis=1).tolist()

    # Calcular límites para las líneas trazadas
    limites = (dfpl['pointpos'].max() - dfpl['pointpos'].min()) / dfpl['pointpos'].count()

    # Recorrer cada punto pivote para verificar la condición y añadir datos a data
    for i in range(len(pivot_points)):
        for j in range(i + 1, len(pivot_points)):
            if (pivot_points.iloc[i]['pointpos'] > pivot_points.iloc[i]['high'] and
                pivot_points.iloc[j]['pointpos'] > pivot_points.iloc[j]['high'] and
                abs(pivot_points.iloc[i]['pointpos'] - pivot_points.iloc[j]['pointpos']) < limites):
                
                data.append({
                    'time': pivot_points.iloc[i]['time'].strftime('%Y-%m-%d %H:%M:%S'),
                    'pointpos': float(pivot_points.iloc[i]['pointpos']),
                    'type': 'high'
                })
            
            elif (pivot_points.iloc[i]['pointpos'] < pivot_points.iloc[i]['low'] and
                  pivot_points.iloc[j]['pointpos'] < pivot_points.iloc[j]['low'] and
                  abs(pivot_points.iloc[i]['pointpos'] - pivot_points.iloc[j]['pointpos']) < limites):
                
                data.append({
                    'time': pivot_points.iloc[i]['time'].strftime('%Y-%m-%d %H:%M:%S'),
                    'pointpos': float(pivot_points.iloc[i]['pointpos']),
                    'type': 'low'
                })

    return {'data': data, 'historical': historical, 'limites': limites}