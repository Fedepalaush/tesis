import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
from api.models import StockData
from django.db.models import Q

def obtener_datos_acciones(tickers, start_date=None, end_date=None):
    datos = {}

    # Asegúrate de que los tickers están en el formato correcto
    tickers = [ticker.replace('.', '-') for ticker in tickers]
    for ticker in tickers:
        try:
            # Filtrar los datos desde la base de datos
            stock_data = StockData.objects.filter(
                Q(ticker=ticker) &
                Q(date__gte=start_date) &
                Q(date__lte=end_date)
            ).values('date', 'close_price').order_by('date')

            # Convertir los datos a un DataFrame
            df = pd.DataFrame(list(stock_data))
            
            if df.empty:
                print(f"{ticker}: No data found, symbol may be delisted")
                continue

            # Calcular los retornos
            df.set_index('date', inplace=True)
            datos[ticker] = df['close_price'].pct_change().dropna()
        
        except Exception as e:
            print(f"Error al obtener datos para {ticker}: {e}")
            continue
    
    return pd.DataFrame(datos)


def calcular_parametros(datos, parametros_seleccionados):
    parametros = pd.DataFrame()
    if 'mean_return' in parametros_seleccionados:
        parametros['mean_return'] = datos.mean() * 252  # Retorno promedio anualizado
    if 'volatility' in parametros_seleccionados:
        parametros['volatility'] = datos.std() * np.sqrt(252)  # Volatilidad anualizada
    if 'max_drawdown' in parametros_seleccionados:
        parametros['max_drawdown'] = (datos.cummin() - datos.cummax()).min()  # Drawdown máximo
    return parametros

def encontrar_k_optimo(datos, max_k=10):
    escalador = StandardScaler()
    datos_escalados = escalador.fit_transform(datos)

    max_k = min(max_k, datos.shape[0] - 1)  # Limitar el número de clusters si las muestras son pocas

    inercia = []
    silhouette_scores = []

    for k in range(2, max_k + 1):
        kmeans = KMeans(n_clusters=k, random_state=42)
        kmeans.fit(datos_escalados)
        inercia.append(kmeans.inertia_)
        score = silhouette_score(datos_escalados, kmeans.labels_)
        silhouette_scores.append(score)

    k_optimo = np.argmax(silhouette_scores) + 2
    return k_optimo

def agrupar_acciones(tickers, parametros_seleccionados, start_date=None, end_date=None):
    datos = obtener_datos_acciones(tickers, start_date, end_date)
    parametros = calcular_parametros(datos, parametros_seleccionados)
    k_optimo = encontrar_k_optimo(parametros)

    escalador = StandardScaler()
    parametros_escalados = escalador.fit_transform(parametros)

    kmeans = KMeans(n_clusters=k_optimo, random_state=42)
    clusters = kmeans.fit_predict(parametros_escalados)

    parametros['Cluster'] = clusters
    return parametros
