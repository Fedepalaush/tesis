from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework import viewsets
from .models import Activo
from .serializers import ActivoSerializer
from rest_framework.response import Response
import yfinance as yf
import numpy as np
from decimal import Decimal
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import generics
from .serializers import UserSerializer
from django.contrib.auth import get_user_model
from django.db.models import F
from rest_framework.permissions import IsAuthenticated, AllowAny 
import pandas_ta as ta
import pandas as pd
from datetime import datetime
from backtesting import Strategy, Backtest
from backtesting.lib import crossover
from datetime import datetime, timedelta
from .services.agrupacion import agrupar_acciones
from rest_framework.decorators import api_view
from api.models import StockData
from .services.pivot import calculate_pivots
from django.db.models import Q
from django.core.cache import cache
import hashlib
from .services.ema_logic import obtener_ema_signals
from .services.activo_service import process_activo
from . services.fundamental import get_fundamental_data
from .services.backtesting import run_backtest_service
from .services.retornos_mensuales import calcular_retornos_mensuales
from .services.indicators import calculate_indicators, calculate_rsi, calculate_analytics, fetch_historical_data, calculate_sharpe_ratio
from .services.trends import check_ema_trend, calculate_score, calculate_triple_ema
from .services.signals import calculate_signal
from .services.utils import validate_date_range, detectar_cruce, evaluar_cruce
from .services.entrenamiento import entrenar_modelo_service  # importamos el servicio

from ta.momentum import RSIIndicator
from ta.trend import EMAIndicator
from ta.volatility import BollingerBands

from .ml_models.lstm import entrenar_lstm
from .ml_models.xgboost import entrenar_xgboost

from django.http import JsonResponse
import json

import os

LAST_EXECUTION_FILE = "last_execution.log"
      
@csrf_exempt
def get_activo(request):
    if request.method == 'GET':
        ticker = request.GET.get('ticker')
        start_date_str = request.GET.get('start_date')
        end_date_str = request.GET.get('end_date')

        # Validar parámetros
        if not ticker:
            return JsonResponse({'error': 'Parameter "ticker" is required.'}, status=400)

        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
            validate_date_range(start_date, end_date)
        except ValueError as e:
            return JsonResponse({'error': str(e)}, status=400)

        # Generar una clave única para el caché
        cache_key = f"get_activo_{ticker}_{start_date_str}_{end_date_str}"
        cached_data = cache.get(cache_key)

        if cached_data:
            # Retornar los datos desde el caché si están disponibles
            print(cached_data)
            return JsonResponse({'data': cached_data})

        # Si los datos no están en caché, proceder con el cálculo
        try:
            df = fetch_historical_data(ticker, start_date, end_date)

            if df.empty:
                return JsonResponse({'error': 'No data found for the provided ticker and date range.'}, status=404)
            data = calculate_analytics(df)
            cache.set(cache_key, data, timeout=3600)  # Cache por 1 hora
            return JsonResponse({'data': data})

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Only GET requests are allowed.'}, status=400)

@csrf_exempt
def get_retornos_mensuales(request):
    if request.method == 'GET':
        try:
            ticker = request.GET.get('ticker', 'AAPL')  # Ticker por defecto: AAPL
            years = int(request.GET.get('years', 10))  # Años por defecto: 10

            # Generar una clave única para la caché
            cache_key = f"retornos_mensuales_{ticker}_{years}"
            cached_data = cache.get(cache_key)

            if cached_data:
                # Si los datos están en caché, retornarlos directamente
                return JsonResponse({'data': cached_data})

            # Llamar al servicio para calcular los retornos mensuales
            data_for_plotly = calcular_retornos_mensuales(ticker, years)

            if not data_for_plotly:
                return JsonResponse({'error': 'No data found for the provided ticker'}, status=400)

            # Guardar los datos procesados en caché por 1 hora
            cache.set(cache_key, data_for_plotly, timeout=3600)

            return JsonResponse({'data': data_for_plotly})

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Only GET requests are allowed.'}, status=400)

@csrf_exempt
def get_fundamental_info(request):
    if request.method == 'GET':
        ticker = request.GET.get('ticker', None)
        
        if not ticker:
            return JsonResponse({'error': 'Parameter "ticker" is required.'}, status=400)

        try:
            data = get_fundamental_data(ticker)
            return JsonResponse({'data': data})
        except ValueError as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Only GET requests are allowed.'}, status=400)

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class CheckUserExistsAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, username, *args, **kwargs):
        cache_key = f"user_exists_{username}"
        exists = cache.get(cache_key)

        if exists is None:  # Si no está en caché, realizar la consulta
            exists = get_user_model().objects.filter(username=username).exists()
            cache.set(cache_key, exists, timeout=3600)  # Guardar en caché por 1 hora

        return JsonResponse({'exists': exists})

class ActivoListCreate(generics.ListCreateAPIView):
    serializer_class = ActivoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        activos = Activo.objects.filter(usuario=user)

        for activo in activos:
            # Delegar el procesamiento al servicio
            processed_data = process_activo(activo)
            if processed_data:
                activo.precioActual = processed_data['precioActual']
                activo.recomendacion = processed_data['recomendacion']
                activo.save()

        return activos

    
    def perform_create(self, serializer):
        if serializer.is_valid():
            ticker = serializer.validated_data['ticker']
            cantidad_comprada = serializer.validated_data['cantidad']
            precio_compra = serializer.validated_data['precioCompra']
            
            try:
                activo_existente = Activo.objects.get(ticker=ticker, usuario=self.request.user)
                cantidad_anterior = activo_existente.cantidad
                precio_compra_anterior = activo_existente.precioCompra
                nuevo_precio_compra = ((precio_compra_anterior * cantidad_anterior) + (precio_compra * cantidad_comprada)) / (cantidad_anterior + cantidad_comprada)
                activo_existente.cantidad = F('cantidad') + cantidad_comprada
                activo_existente.precioCompra = nuevo_precio_compra
                activo_existente.save()
            except Activo.DoesNotExist:
                activo = serializer.save(usuario=self.request.user)
                activo.precioActual = precio_compra
                activo.save()
        else:
            print(serializer.errors)

    def get_precio_actual(self, symbol):
        # Obtener datos históricos de yfinance
        data = yf.download(symbol, period="1d")
        # Tomar el último precio (último día en el período)
        ultimo_precio = round(data['Close'].iloc[-1],3)
        
        return ultimo_precio

class ActivoDelete(generics.DestroyAPIView):
    serializer_class = ActivoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Activo.objects.filter(usuario=user)  


from rest_framework.decorators import api_view
from rest_framework.response import Response
import pandas as pd
import numpy as np
from .models import StockData


@api_view(["POST"])
def portfolio_metrics(request):
    activos = request.data.get("activos", [])
    indice = request.data.get("indice_referencia", "^GSPC")

    if not activos:
        return Response({"error": "No hay activos"}, status=400)

    tickers = [a["ticker"] for a in activos]
    tickers_unicos = list(set(tickers + [indice]))

    print("✅ Tickers solicitados:", tickers_unicos)

    precios_dict = {}

    for ticker in tickers_unicos:
        data = StockData.objects.filter(ticker=ticker).values("date", "close_price").order_by("date")
        df = pd.DataFrame(data)

        if df.empty:
            print(f"⚠️ No hay datos para {ticker}")
            continue

        df["date"] = pd.to_datetime(df["date"])
        df = df.set_index("date")
        precios_dict[ticker] = df["close_price"]

    if not precios_dict:
        return Response({"error": "No hay datos disponibles"}, status=400)

    precios = pd.concat(precios_dict.values(), axis=1, keys=precios_dict.keys())
    precios = precios.dropna()

    if precios.shape[0] < 10:
        return Response({"error": "No hay suficientes datos para calcular métricas móviles"}, status=400)

    rendimientos = precios.pct_change().dropna()

    try:
        # Calcular pesos
        pesos = np.array([
            a["cantidad"] * precios[a["ticker"]].iloc[-1] for a in activos
        ])
        pesos = pesos / np.sum(pesos)

        activos_tickers = [a["ticker"] for a in activos]
        rend_port = rendimientos[activos_tickers].dot(pesos)
        rend_indice = rendimientos[indice]

        # Tomar las últimas 7 fechas disponibles
        ultimos_dias = rend_port.index[-7:]

        volatilidades = []
        betas = []
        fechas = []

        for fecha in ultimos_dias:
            ventana_inicio = rend_port.index.get_loc(fecha) - 4  # ventana de 5 días
            if ventana_inicio < 0:
                continue

            ventana_port = rend_port.iloc[ventana_inicio: ventana_inicio + 5]
            ventana_indice = rend_indice.iloc[ventana_inicio: ventana_inicio + 5]

            if len(ventana_port) < 3:
                continue

            vol = ventana_port.std()
            vol = vol * 100 
            beta = np.cov(ventana_port, ventana_indice)[0, 1] / ventana_indice.var()

            if np.isfinite(vol) and np.isfinite(beta):
                fechas.append(fecha.strftime("%Y-%m-%d"))
                volatilidades.append(vol)
                betas.append(beta)

        if not fechas:
            return Response({"error": "No se pudo calcular métricas móviles"}, status=400)

        return Response({
            "fechas": fechas,
            "volatilidades": volatilidades,
            "betas": betas
        })

    except Exception as e:
        print("❌ Error al calcular métricas móviles:", str(e))
        return Response({"error": "No se pudo calcular las métricas"}, status=500)



@csrf_exempt
def get_correlation_matrix(request):
    if request.method == 'GET':
        tickers = request.GET.getlist('tickers')
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')

        if not tickers:
            return JsonResponse({'error': 'Tickers are required.'}, status=400)

        if not start_date or not end_date:
            return JsonResponse({'error': 'Start and end dates are required.'}, status=400)

        # Crear una clave de caché única basada en los parámetros de la solicitud
        cache_key = hashlib.md5(f"{','.join(sorted(tickers))}_{start_date}_{end_date}".encode()).hexdigest()

        # Verificar si ya existe una matriz de correlación en caché
        cached_data = cache.get(cache_key)
        if cached_data:
            return JsonResponse({'correlation_matrix': cached_data})

        try:
            data_frames = {}
            for ticker in tickers:
                # Obtener los datos basados en las fechas proporcionadas
                ticker_data = yf.Ticker(ticker).history(start=start_date, end=end_date)
                data_frames[ticker] = ticker_data['Close']

            # Combinar los precios de cierre en un único DataFrame
            combined_data = pd.DataFrame(data_frames)

            # Eliminar filas con valores NaN
            combined_data.dropna(inplace=True)

            # Calcular la matriz de correlación
            correlation_matrix = combined_data.corr()

            # Convertir la matriz de correlación a un formato de diccionario para la respuesta JSON
            correlation_data = correlation_matrix.to_dict()

            # Almacenar el resultado en caché con un tiempo de expiración de 1 hora
            cache.set(cache_key, correlation_data, timeout=3600)

            return JsonResponse({'correlation_matrix': correlation_data})
        
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Only GET requests are allowed.'}, status=400)

def sharpe_ratio(request):
    if request.method == 'GET':
        # Parámetros
        sector = request.GET.get('sector', 'Information Technology')
        x_years = int(request.GET.get('x_years', 5))
        y_years = int(request.GET.get('y_years', 2))

        # Llamar al servicio para calcular el ratio de Sharpe
        sharpe_data = calculate_sharpe_ratio(sector, x_years, y_years)

        # Verificar si ocurrió un error
        if isinstance(sharpe_data, dict) and 'error' in sharpe_data:
            return JsonResponse(sharpe_data, status=400)

        return JsonResponse({'sharpe_data': sharpe_data})

    return JsonResponse({'error': 'GET method required'}, status=405)



@csrf_exempt
def run_backtest(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            # Llamar al servicio para ejecutar el backtest
            result = run_backtest_service(data)

            # Verificar si ocurrió un error
            if 'error' in result:
                return JsonResponse(result, status=400)

            return JsonResponse(result)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON.'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Only POST requests are allowed.'}, status=400)
    

def get_pivot_points(request):
    # Obtener el ticker de los parámetros de la solicitud
    ticker = request.GET.get('ticker', 'AAPL')  # AAPL como valor predeterminado si no se proporciona

    # Obtener datos históricos del modelo
    stock_data = StockData.objects.filter(ticker=ticker).values().order_by('date')

    # Calcular pivotes usando la función del servicio
    pivot_data = calculate_pivots(stock_data)

    # Devolver los datos como respuesta JSON
    return JsonResponse(pivot_data, safe=False)


def obtener_agrupamiento(request):
    tickers_param = request.GET.get('tickers')
    tickers = tickers_param.split(',')
    parametros_seleccionados = request.GET.get('parametros', '').split(',')
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')

    # Generar clave de caché
    cache_key = hashlib.md5(f"agrupamiento_{','.join(tickers)}_{start_date}_{end_date}_{','.join(parametros_seleccionados)}".encode()).hexdigest()
    cached_data = cache.get(cache_key)
    if cached_data:
        return JsonResponse(cached_data, safe=False)

    try:
        agrupamiento = agrupar_acciones(tickers, parametros_seleccionados, start_date, end_date)
        agrupamiento = agrupamiento.reset_index()
        agrupamiento_json = agrupamiento.to_dict(orient='records')

        # Almacenar en caché
        cache.set(cache_key, agrupamiento_json, timeout=3600)

        return JsonResponse(agrupamiento_json, safe=False, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
def get_ema_signals(request):
    if request.method == "GET":
        # Recibir tickers y periodos de EMA desde la solicitud
        tickers = request.GET.getlist('tickers[]')
        ema4 = int(request.GET.get('ema4', 4))
        ema9 = int(request.GET.get('ema9', 9))
        ema18 = int(request.GET.get('ema18', 18))
        use_triple = request.GET.get('useTriple', 'false').lower() == 'true'

        # Generar una clave única para la caché basada en los parámetros
        cache_key = hashlib.md5(
            f"ema_signals_{','.join(tickers)}_{ema4}_{ema9}_{ema18}_{use_triple}".encode()
        ).hexdigest()

        # Verificar si ya existe un resultado en caché
        cached_data = cache.get(cache_key)
        if cached_data:
            return JsonResponse(cached_data)

        # Llamar a la función que calcula las señales
        try:
            if use_triple:
                signals_with_data = obtener_ema_signals(tickers, [ema4, ema9, ema18], use_triple=True)

            else:
                signals_with_data = obtener_ema_signals(tickers, [ema4, ema9], use_triple=False)


            # Asegúrate de que signals_with_data es serializable, de ser necesario convierte los objetos
            # Si es una lista de diccionarios, debería funcionar bien

            # Crear el resultado como un diccionario que incluya las señales
            result = {"signals": signals_with_data}

            # Almacenar el resultado en caché (ej. durante 1 hora)
            cache.set(cache_key, result, timeout=3600)

            # Retornar el resultado como un JSON
            return JsonResponse(result)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Only GET requests are allowed."}, status=400)


import yfinance as yf
from datetime import datetime, timedelta
from django.http import JsonResponse

import yfinance as yf
from datetime import datetime
from django.http import JsonResponse

def obtener_dividendos(request):
    tickers = request.GET.getlist("tickers")  # Obtener lista de tickers
    resultados = {}
    año_anterior = datetime.now().year - 1  # Año pasado
    # Cambiar la estructura de dividendos_por_mes para almacenar el total y los detalles de las empresas
    dividendos_por_mes = {i: {"total": 0, "detalles": []} for i in range(12)}  # Diccionario para almacenar dividendos por mes

    for ticker in tickers:
        try:
            accion = yf.Ticker(ticker)
            dividendos = accion.dividends

            if dividendos.empty:
                resultados[ticker] = {"error": "No se encontraron dividendos"}
                continue

            for fecha, monto in dividendos.items():
                fecha_pago = fecha.to_pydatetime()
                if fecha_pago.year == año_anterior:
                    mes_pago = fecha_pago.month - 1  # Convertir a índice 0-11
                    dividendos_por_mes[mes_pago]["total"] += monto  # Sumar montos de dividendos
                    dividendos_por_mes[mes_pago]["detalles"].append({"empresa": ticker, "monto": monto})  # Guardar los detalles

        except Exception as e:
            resultados[ticker] = {"error": str(e)}
            continue

    return JsonResponse({"dividendos": dividendos_por_mes})

@csrf_exempt
def entrenar_modelo(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            print("==> Datos recibidos en entrenar_modelo:", data)  # 👈 debug

            resultado = entrenar_modelo_service(data)
            print(resultado)
            if 'error' in resultado:
                return JsonResponse(resultado, status=400)

            return JsonResponse(resultado)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'JSON inválido.'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Solo se permiten solicitudes POST.'}, status=400)



def get_last_execution():
    """Obtener la última ejecución desde un archivo."""
    if os.path.exists(LAST_EXECUTION_FILE):
        with open(LAST_EXECUTION_FILE, "r") as f:
            return f.read().strip()
    return None

from django.http import JsonResponse

def last_execution_date(request):
    """ Devuelve la última fecha de ejecución desde el archivo log. """
    last_exec = get_last_execution()

    if last_exec:
        return JsonResponse({"last_execution": last_exec})
    else:
        return JsonResponse({"last_execution": "No hay registros previos."})