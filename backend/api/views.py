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


from django.http import JsonResponse
import json

@csrf_exempt
def get_activo(request):
    if request.method == 'GET':
        ticker = request.GET.get('ticker', None)
        interval = request.GET.get('timeframe', None)
        
        if ticker:
            if interval:
                if interval == '1d':
                    period = '1y'
                    date_format = '%Y-%m-%d'
                elif interval == '1h':
                    period = '1mo'
                    date_format = '%Y-%m-%d %H:%M'
                elif interval == '1wk':
                    period = '3y'
                    date_format = '%Y-%m-%d'
                else:
                    return JsonResponse({'error': 'Invalid interval.'}, status=400)

                historical_data = yf.Ticker(ticker).history(period=period, interval=interval)
                
                # Calculate technical indicators
                historical_data['RSI'] = ta.rsi(historical_data.Close, length=14)
                historical_data['EMA200'] = ta.ema(historical_data.Close, length=200)
                historical_data['EMA9'] = ta.ema(historical_data.Close, length=9)
                historical_data['EMA21'] = ta.ema(historical_data.Close, length=21)
                historical_data.dropna(inplace=True)
                
                print(historical_data)
                
                data = []
                for date, row in historical_data.iterrows():
                    if interval == '1h':
                        formatted_date = date.strftime(date_format)
                    else:
                        formatted_date = date.strftime(date_format.split()[0])
                    
                    data.append({
                        'date': formatted_date,
                        'open_price': row['Open'],
                        'high_price': row['High'],
                        'low_price': row['Low'],
                        'close_price': row['Close'],
                        'rsi': row['RSI'],
                        'ema_200': row['EMA200'],
                        'ema_21': row['EMA21'],
                        'ema_9': row['EMA9'],
                    })
            
                return JsonResponse({'data': data})
            else:
                return JsonResponse({'error': 'Parameter "timeframe" is required.'}, status=400)
        else:
            return JsonResponse({'error': 'Parameter "ticker" is required.'}, status=400)
    else:
        return JsonResponse({'error': 'Only GET requests are allowed.'}, status=400)




@csrf_exempt
def get_retornos_mensuales(request):
    if request.method == 'GET':
        try:
            ticker = request.GET.get('ticker', 'AAPL')  # Obtener el ticker de los parámetros de la solicitud
            data = yf.download(ticker, period="10y", interval="1d")

            # Calcular los retornos mensuales
            data['Month'] = data.index.to_period('M')
            monthly_returns = data['Adj Close'].resample('M').ffill().pct_change()

            # Crear una tabla pivot para los retornos mensuales
            monthly_returns = monthly_returns.to_frame().reset_index()
            monthly_returns['Year'] = monthly_returns['Date'].dt.year
            monthly_returns['Month'] = monthly_returns['Date'].dt.month

            pivot_table = monthly_returns.pivot_table(values='Adj Close', index='Year', columns='Month')

            # Convertir la tabla pivot a un formato adecuado para Plotly
            data_for_plotly = []
            for year in pivot_table.index:
                for month in pivot_table.columns:
                    value = pivot_table.loc[year, month]
                    data_for_plotly.append({
                        'year': year,
                        'month': month,
                        'return': value if pd.notna(value) else None
                    })
            
            return JsonResponse({'data': data_for_plotly})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Only GET requests are allowed.'}, status=400)

@csrf_exempt
def get_fundamental_info(request):
    if request.method == 'GET':
        ticker = request.GET.get('ticker', None)
        
        if not ticker:
            return JsonResponse({'error': 'Parameter "ticker" is required.'}, status=400)

        try:
            # Crear objeto Ticker usando yfinance
            ticker_obj = yf.Ticker(ticker)
            
            # Obtener datos financieros
            cashflows = ticker_obj.get_cashflow()
            balance = ticker_obj.get_balance_sheet()
            income = ticker_obj.get_income_stmt()

            # Función para eliminar columnas con más de 10 NaNs
            def drop_columns_with_many_nans(df):
                if not df.empty:
                    return df.dropna(axis=1, thresh=len(df) - 10)
                else:
                    return df

            # Eliminar columnas con más de 10 NaNs
            cashflows = drop_columns_with_many_nans(cashflows)
            balance = drop_columns_with_many_nans(balance)
            income = drop_columns_with_many_nans(income)

            # Convertir DataFrames a JSON
            cashflows_json = cashflows.to_json(date_format='iso') if not cashflows.empty else None
            balance_json = balance.to_json(date_format='iso') if not balance.empty else None
            income_json = income.to_json(date_format='iso') if not income.empty else None

            # Datos fundamentales para incluir en la respuesta
            fundamental_data = {
                'cash_flow': cashflows_json,
                'balance': balance_json,
                'income': income_json
            }

            return JsonResponse({'data': fundamental_data})
        
        except Exception as e:
            return JsonResponse({'error': f'Failed to retrieve data for {ticker}: {str(e)}'}, status=500)
    
    else:
        return JsonResponse({'error': 'Only GET requests are allowed.'}, status=400)
    

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class CheckUserExistsAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, username, *args, **kwargs):
        exists = get_user_model().objects.filter(username=username).exists()
        return JsonResponse({'exists': exists})

class ActivoListCreate(generics.ListCreateAPIView):
    serializer_class = ActivoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Obtener todos los activos del usuario
        activos = Activo.objects.filter(usuario=user)

        # Actualizar el precio actual de cada activo
        for activo in activos:
            symbol = activo.ticker  # Asumiendo que hay un campo 'symbol' en tu modelo Activo
            precio_actual = self.get_precio_actual(symbol)
            activo.precioActual = precio_actual
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

@csrf_exempt
def get_correlation_matrix(request):
    if request.method == 'GET':
        tickers = request.GET.getlist('tickers')
        interval = request.GET.get('timeframe', '1d')  # Default to '1d' if not provided

        if interval not in ['1d', '1wk', '1mo']:
            return JsonResponse({'error': 'Invalid interval.'}, status=400)

        if not tickers:
            return JsonResponse({'error': 'Tickers are required.'}, status=400)

        # Define the period based on the interval
        if interval == '1d':
            period = '1y'
        elif interval == '1wk':
            period = '3y'
        elif interval == '1mo':
            period = '10y'
        
        data_frames = {}
        for ticker in tickers:
            ticker_data = yf.Ticker(ticker).history(period=period, interval=interval)
            data_frames[ticker] = ticker_data['Close']
        
        # Combine the close prices into a single DataFrame
        combined_data = pd.DataFrame(data_frames)
        
        # Drop rows with any NaN values
        combined_data.dropna(inplace=True)
        
        # Calculate the correlation matrix
        correlation_matrix = combined_data.corr()
        
        # Convert the correlation matrix to a dictionary format suitable for JSON response
        correlation_data = correlation_matrix.to_dict()
        
        return JsonResponse({'correlation_matrix': correlation_data})
    else:
        return JsonResponse({'error': 'Only GET requests are allowed.'}, status=400)
    

def sharpe_ratio(request):
    # Tu lógica para calcular el Sharpe ratio
    # Esto incluiría la obtención de datos, cálculos y preparación de los datos para pasar al template

    # Ejemplo básico de datos de prueba
    sharpe_data = [
        {'ticker': 'MSFT', 'sharpe_2Y': 1.5, 'sharpe_5Y': 2.0},
        {'ticker': 'AAPL', 'sharpe_2Y': 1.8, 'sharpe_5Y': 2.2},
        # Más datos aquí...
    ]

    # Devolver los datos como una respuesta JSON
    return JsonResponse({'sharpe_data': sharpe_data})

class CustomStrategy(Strategy):
    rapida = 10
    lenta = 20
    tp_percentage = 0.10
    sl_percentage = 0.08
    use_sma_cross = False
    use_rsi = False
    rsi_params = {'overboughtLevel': 70, 'oversoldLevel': 30}

    def init(self):
        close = pd.Series(self.data.Close)

        if self.use_sma_cross:
            self.ema_rapida = self.I(ta.ema, close, self.rapida)
            self.ema_lenta = self.I(ta.ema, close, self.lenta)

        if self.use_rsi:
            self.rsi = self.I(ta.rsi, close)

    def next(self):
        last_close = self.data.Close[-1]

        if self.position:
            # Si hay una posición abierta, verificar condiciones de cierre
            if (self.use_sma_cross and crossover(self.ema_lenta, self.ema_rapida)) or (self.use_rsi and self.rsi > self.rsi_params['overboughtLevel']):
                self.position.close()
            return

        # Condiciones de compra
        if self.use_sma_cross and self.use_rsi:
            if crossover(self.ema_rapida, self.ema_lenta) and (self.rsi < self.rsi_params['oversoldLevel']):
                
                self.buy(tp=last_close * (1 + self.tp_percentage), sl=last_close * (1 - self.sl_percentage))
        elif self.use_sma_cross:
            if crossover(self.ema_rapida, self.ema_lenta):
                self.buy(tp=last_close * (1 + self.tp_percentage), sl=last_close * (1 - self.sl_percentage))
        elif self.use_rsi:
            if self.rsi < self.rsi_params['oversoldLevel']:
                self.buy(tp=last_close * (1 + self.tp_percentage), sl=last_close * (1 - self.sl_percentage))

@csrf_exempt
def run_backtest(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            # Validación de datos de entrada
            required_fields = ['ticker', 'inicio', 'fin', 'rapida', 'lenta', 'tp_percentage', 'sl_percentage', 'strategies']
            for field in required_fields:
                if field not in data:
                    return JsonResponse({'error': f'Missing field: {field}'}, status=400)

            ticker = data['ticker']
            inicio = data['inicio']
            fin = data['fin']
            rapida = data['rapida']
            lenta = data['lenta']
            tp_percentage = data['tp_percentage']
            sl_percentage = data['sl_percentage']
            strategies = data['strategies']

            # Validar y convertir las fechas
            try:
                inicio = datetime.strptime(inicio, '%Y-%m-%d')
                fin = datetime.strptime(fin, '%Y-%m-%d')
            except ValueError:
                return JsonResponse({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)

            # Descargar datos usando yfinance
            data = yf.download(ticker, start=inicio, end=fin)
            if data.empty:
                return JsonResponse({'error': 'No data fetched for the given ticker and date range.'}, status=404)
                
            data = data[['Open', 'High', 'Low', 'Close', 'Volume']]

            # Configurar estrategia personalizada
            CustomStrategy.rapida = rapida
            CustomStrategy.lenta = lenta
            CustomStrategy.tp_percentage = tp_percentage
            CustomStrategy.sl_percentage = sl_percentage
            CustomStrategy.use_sma_cross = strategies.get('smaCross', False)
            CustomStrategy.use_rsi = strategies.get('rsi', False)
            CustomStrategy.rsi_params = strategies.get('rsiParams', {'overboughtLevel': 70, 'oversoldLevel': 30})

            bt = Backtest(data, CustomStrategy, cash=10000)
            stats = bt.run()

            # Convertir estadísticas adicionales en un diccionario
            stats_dict = {
                'Start': stats['Start'].strftime('%Y-%m-%d'),
                'End': stats['End'].strftime('%Y-%m-%d'),
                'Duration': str(stats['Duration']),
                'Exposure Time [%]': stats['Exposure Time [%]'],
                'Equity Final [$]': stats['Equity Final [$]'],
                'Equity Peak [$]': stats['Equity Peak [$]'],
                'Return [%]': stats['Return [%]'],
                'Buy & Hold Return [%]': stats['Buy & Hold Return [%]'],
                'Return (Ann.) [%]': stats['Return (Ann.) [%]'],
                'Volatility (Ann.) [%]': stats['Volatility (Ann.) [%]'],
                'Sharpe Ratio': stats['Sharpe Ratio'],
                'Sortino Ratio': stats['Sortino Ratio'],
                'Calmar Ratio': stats['Calmar Ratio'],
                'Max. Drawdown [%]': stats['Max. Drawdown [%]'],
                'Avg. Drawdown [%]': stats['Avg. Drawdown [%]'],
                'Max. Drawdown Duration': str(stats['Max. Drawdown Duration']),
                'Avg. Drawdown Duration': str(stats['Avg. Drawdown Duration']),
                'Trades': stats['_trades'].to_dict(orient='records'),
                'Equity Curve': stats['_equity_curve'].to_dict(orient='records')
            }

            return JsonResponse(stats_dict)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON.'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Only POST requests are allowed.'}, status=400)
    
    

def get_pivot_points(request):
    # Obtener datos históricos de Yahoo Finance para AAPL
    df = yf.Ticker('AAPL').history(period='5y').reset_index()
    df = df[['Date', 'Open', 'High', 'Low', 'Close', 'Volume']]
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
            return np.nan

    # Aplicar la función pointpos para calcular 'pointpos' y agregarlo como columna
    df['pointpos'] = df.apply(lambda row: pointpos(row), axis=1)

    # Filtrar los últimos 300 registros para graficar
    dfpl = df[-300:-1]

    # Identificar todos los puntos pivote y las líneas trazadas
    pivot_points = dfpl.dropna(subset=['pointpos'])

    # Lista para almacenar los datos de los puntos pivote y líneas trazadas
    data_to_send = []

    # Calcular límites para las líneas trazadas
    limites = (dfpl['pointpos'].max() - dfpl['pointpos'].min()) / dfpl['pointpos'].count()

    # Recorrer cada punto pivote para verificar la condición y añadir datos a data_to_send
    for i in range(len(pivot_points)):
        for j in range(i + 1, len(pivot_points)):
            if (pivot_points.iloc[i]['pointpos'] > pivot_points.iloc[i]['high'] and
                pivot_points.iloc[j]['pointpos'] > pivot_points.iloc[j]['high'] and
                abs(pivot_points.iloc[i]['pointpos'] - pivot_points.iloc[j]['pointpos']) < limites):
                
                data_to_send.append({
                    'time': pivot_points.iloc[i]['time'].strftime('%Y-%m-%d %H:%M:%S'),
                    'pointpos': pivot_points.iloc[i]['pointpos'],
                    'type': 'high'
                })
            
            elif (pivot_points.iloc[i]['pointpos'] < pivot_points.iloc[i]['low'] and
                  pivot_points.iloc[j]['pointpos'] < pivot_points.iloc[j]['low'] and
                  abs(pivot_points.iloc[i]['pointpos'] - pivot_points.iloc[j]['pointpos']) < limites):
                
                data_to_send.append({
                    'time': pivot_points.iloc[i]['time'].strftime('%Y-%m-%d %H:%M:%S'),
                    'pointpos': pivot_points.iloc[i]['pointpos'],
                    'type': 'low'
                })

    # Devolver los datos como respuesta JSON
    return JsonResponse(data_to_send, safe=False)