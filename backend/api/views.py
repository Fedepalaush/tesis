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
from datetime import datetime, timedelta
from .logica.agrupacion import agrupar_acciones
from rest_framework.decorators import api_view
from api.models import StockData
from django.db.models import Q
from .logica.ema_logic import obtener_ema_signals


from django.http import JsonResponse
import json

def check_ema_trend(historical_data):
    last3_ema9 = historical_data['EMA9'].tail(3).values
    last3_ema21 = historical_data['EMA21'].tail(3).values

    is_approaching_from_below = all(last3_ema9[i] < last3_ema21[i] for i in range(3))
    is_approaching_from_above = all(last3_ema9[i] > last3_ema21[i] for i in range(3))

    if is_approaching_from_below:
        return 1
    elif is_approaching_from_above:
        return 2
    else:
        return 0

def calculate_score(data):
    # Calcular las medias móviles
    data['SMA_50'] = data['Close'].rolling(window=50).mean()
    data['SMA_200'] = data['Close'].rolling(window=200).mean()
    data['EMA_9'] = data['Close'].ewm(span=9, adjust=False).mean()
    data['EMA_21'] = data['Close'].ewm(span=21, adjust=False).mean()
    data['EMA_12'] = data['Close'].ewm(span=12, adjust=False).mean()
    data['EMA_26'] = data['Close'].ewm(span=26, adjust=False).mean()

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

def calculate_signal(data, short_span, long_span, days_to_consider):

    # Calcular las medias móviles
    short_ema_col = f'EMA_{short_span}'
    long_ema_col = f'EMA_{long_span}'
    
    data[short_ema_col] = data['Close'].ewm(span=short_span, adjust=False).mean()
    data[long_ema_col] = data['Close'].ewm(span=long_span, adjust=False).mean()

    # Señales de cruce
    data['Cross'] = np.where(data[short_ema_col] > data[long_ema_col], 1, -1)
    
    # Señal de cruce en los días recientes según lo indicado
    data['Signal'] = data['Cross'].diff()

    # Obtener las señales de los días más recientes
    recent_signals = data['Signal'].tail(days_to_consider)


    # Verificar si contiene tanto un cruce al alza como a la baja
    contains_upward_cross = (recent_signals == 2).any()
    contains_downward_cross = (recent_signals == -2).any()

    # Si hay ambos cruces (al alza y a la baja), devolver 0 (neutral)
    if contains_upward_cross and contains_downward_cross:
        return 0  # Neutral (ambos cruces presentes)
    # Si hay solo cruce al alza
    elif contains_upward_cross:
        return 1  # Señal verde (cruce al alza)
    # Si hay solo cruce a la baja
    elif contains_downward_cross:
        return -1  # Señal roja (cruce a la baja)
    else:
        return 0  # Neutral (sin cruce)
    
def detectar_cruce(ema4_prev, ema9_prev, ema18_prev, ema4_curr, ema9_curr, ema18_curr):
    # Detectar cruce al alza
    if ema4_prev <= ema9_prev and ema4_prev <= ema18_prev and ema4_curr > ema9_curr and ema4_curr > ema18_curr:
        return 1  # Cruce al alza de EMA4 a EMA9 y EMA18
    # Detectar cruce a la baja
    elif ema4_prev >= ema9_prev and ema4_prev >= ema18_prev and ema4_curr < ema9_curr:
        return 2  # Cruce a la baja de EMA4 a EMA9
    return 0  # No hay cruce significativo
    
def evaluar_cruce(triple):
    tiene_uno = False
    tiene_dos = False

    for item in triple:
        valor = item.get('Cruce')
        if valor == 1:
            tiene_uno = True
        elif valor == 2:
            tiene_dos = True

    if tiene_dos and not tiene_uno:
        return 2
    elif tiene_uno:
        return 1
    else:
        return 0 

    
def calculate_triple_ema(data):
    # Calcular las medias móviles
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


@csrf_exempt
def get_activo(request):
    if request.method == 'GET':
        ticker = request.GET.get('ticker', None)
        
        # Default date range: one year ago to today
        default_end_date = datetime.today()
        default_start_date = default_end_date - timedelta(days=365)

        start_date_str = request.GET.get('start_date', default_start_date.strftime('%Y-%m-%d'))
        end_date_str = request.GET.get('end_date', default_end_date.strftime('%Y-%m-%d'))
        
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d')

            # Check if the date range is at least 365 days
            if (end_date - start_date).days < 365:
                return JsonResponse({'error': 'Debe tener al menos 365 dias'}, status=400)

        except ValueError:
            return JsonResponse({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)
        print('Entrando')
        if ticker:
            try:
        # Obtener los datos históricos desde la base de datos
                historical_data = StockData.objects.filter(
                    ticker=ticker,
                    date__range=(start_date, end_date)
                ).order_by('date')

                # Convertir el queryset a un DataFrame de Pandas
                df = pd.DataFrame.from_records(historical_data.values('date', 'open_price', 'high_price', 'low_price', 'close_price', 'volume'))

                # Cambiar los nombres de las columnas a los esperados para ta-lib
                df.rename(columns={
                    'date': 'Date',
                    'open_price': 'Open',
                    'high_price': 'High',
                    'low_price': 'Low',
                    'close_price': 'Close',
                    'volume': 'Volume'
                }, inplace=True)
                
                # Convertir la columna 'Date' a índice si lo prefieres
                df.set_index('Date', inplace=True)
                print(df)
                # Calcular los indicadores técnicos usando talib
                print('ok')
                df['RSI'] = ta.rsi(df['Close'], length=14)
                df['EMA200'] = ta.ema(df['Close'], length=200)
                df['EMA9'] = ta.ema(df['Close'], length=9)
                df['EMA21'] = ta.ema(df['Close'], length=21)
                df['EMA50'] = ta.ema(df['Close'], length=50)  # Cambié de 40 a 50 ya que EMA40 no es común
                df['EMA4'] = ta.ema(df['Close'], length=4)
                df['EMA18'] = ta.ema(df['Close'], length=18)
                print(df)
                df.dropna(inplace=True)
                print(df)
                # Check EMA trend for the last 3 values
                tendencia219 = check_ema_trend(df)
                emaRapidaSemaforo = calculate_signal(df, short_span=9, long_span=21, days_to_consider=3)
                emaMediaSemaforo = calculate_signal(df, short_span=50, long_span=100, days_to_consider=5)
                emaLentaSemaforo = calculate_signal(df, short_span=50, long_span=200, days_to_consider=9)
                tripleEma = calculate_triple_ema(df)
                
                scoreEma = calculate_score(df)
                data = []
                date_format = '%Y-%m-%d'
                for date, row in df.iterrows():
                    formatted_date = date.strftime(date_format)
                    
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
                        'tendencia219': tendencia219,  # Use the trend value computed once
                        'scoreEma': scoreEma,
                        'emaRapidaSemaforo': emaRapidaSemaforo,
                        'emaMediaSemaforo': emaMediaSemaforo,
                        'emaLentaSemaforo': emaLentaSemaforo,
                        'tripleEma': tripleEma,
                    })
            
                return JsonResponse({'data': data})
            except Exception as e:
                return JsonResponse({'error': str(e)}, status=500)
        else:
            return JsonResponse({'error': 'Parameter "ticker" is required.'}, status=400)
    else:
        return JsonResponse({'error': 'Only GET requests are allowed.'}, status=400)



@csrf_exempt
def get_retornos_mensuales(request):
    if request.method == 'GET':
        try:
            ticker = request.GET.get('ticker', 'AAPL')  # Obtener el ticker de los parámetros de la solicitud
            years = int(request.GET.get('years', 10))  # Obtener los años de los parámetros, valor por defecto 10

            # Filtrar los datos desde la base de datos para los últimos 'years' años
            stock_data = StockData.objects.filter(
                ticker=ticker,
                date__gte=pd.Timestamp.now() - pd.DateOffset(years=years)
            ).values('date', 'close_price').order_by('date')

            # Convertir los datos a un DataFrame
            df = pd.DataFrame(list(stock_data))

            if df.empty:
                return JsonResponse({'error': 'No data found for the provided ticker'}, status=400)

            # Convertir la columna 'date' a datetime y establecerla como índice
            df['date'] = pd.to_datetime(df['date'])
            df.set_index('date', inplace=True)

            # Calcular los retornos mensuales
            df['Month'] = df.index.to_period('M')
            monthly_returns = df['close_price'].resample('M').ffill().pct_change()

            # Crear una tabla pivot para los retornos mensuales
            monthly_returns = monthly_returns.to_frame().reset_index()
            monthly_returns['Year'] = monthly_returns['date'].dt.year
            monthly_returns['Month'] = monthly_returns['date'].dt.month

            pivot_table = monthly_returns.pivot_table(values='close_price', index='Year', columns='Month')

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

            # Extraer deuda a largo y corto plazo
            long_term_debt = balance.get('LongTermDebt').values[0] if 'LongTermDebt' in balance.columns else 0
            current_debt = balance.get('CurrentDebt').values[0] if 'CurrentDebt' in balance.columns else 0

            # Datos fundamentales para incluir en la respuesta
            fundamental_data = {
                'cash_flow': cashflows_json,
                'balance': balance_json,
                'income': income_json,
                'long_term_debt': long_term_debt,
                'current_debt': current_debt
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

        for activo in activos:
        # Obtener el histórico de precios de cierre
            data = yf.Ticker(activo.ticker).history(period='1y')
            triple = calculate_triple_ema(data)
            resultadoTriple = evaluar_cruce(triple)
            rsi = ta.rsi(data['Close'], timeperiod=14).iloc[-1]
            
            # Asignar el precio actual y la recomendación basada en el RSI y resultadoTriple
            activo.precioActual = data['Close'].iloc[-1]
            
            # Crear el diccionario con resultadoTriple y rsi
            recomendacion_dict = {
                "resultadoTriple": resultadoTriple,
                "rsi": rsi
            }
            
            # Convertir el diccionario a JSON y asignarlo a recomendacion
            activo.recomendacion = json.dumps(recomendacion_dict)
            
            # Guardar los cambios en el objeto
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
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')

        if not tickers:
            return JsonResponse({'error': 'Tickers are required.'}, status=400)
        
        if not start_date or not end_date:
            return JsonResponse({'error': 'Start and end dates are required.'}, status=400)

        data_frames = {}
        for ticker in tickers:
            # Obtener los datos basados en las fechas proporcionadas
            ticker_data = yf.Ticker(ticker).history(start=start_date, end=end_date)
            print(ticker_data)
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
    if request.method == 'GET':
        sector = request.GET.get('sector', 'Information Technology')
        x_years = int(request.GET.get('x_years', 5))
        y_years = int(request.GET.get('y_years', 2))
        print(sector.lower())
        # Obtener tickers dependiendo del sector o todos los tickers si sector es 'todos'
        if sector.lower() == 'todos':
            # Obtener todos los tickers de la base de datos
            sector_tickers = list(StockData.objects.values_list('ticker', flat=True).distinct())
        else:
            # Obtener tickers del sector específico desde Wikipedia
            tickers = pd.read_html("https://en.wikipedia.org/wiki/List_of_S%26P_500_companies")[0][['Symbol', 'GICS Sector', 'GICS Sub-Industry']]
            sector_tickers = tickers[tickers['GICS Sector'] == sector]['Symbol'].tolist()
            sector_tickers = [ticker.replace(".", "-") for ticker in sector_tickers]
            print(sector_tickers)

        # Si no hay tickers encontrados, retornar error
        if not sector_tickers:
            return JsonResponse({'error': 'Invalid sector or no tickers found'}, status=400)

        # Obtener precios de cierre desde la base de datos
        start = '2015-01-01'
        end = '2023-07-01'
        stock_prices = StockData.objects.filter(
            ticker__in=sector_tickers + ['^GSPC'],  # Incluyendo SP500 como referencia
            date__range=[start, end]
        ).values('ticker', 'date', 'close_price')

        # Convertir los datos de la base de datos a un DataFrame
        df = pd.DataFrame(stock_prices)
        if df.empty:
            return JsonResponse({'error': 'No data found for the provided tickers'}, status=400)

        # Pivotear para obtener los precios de cierre en formato adecuado (tickers como columnas)
        sp500_fin = df.pivot(index='date', columns='ticker', values='close_price').dropna(axis=1)

        # Calcular retornos diarios
        returns = sp500_fin.pct_change()[1:]

        # Calcular Sharpe ratios
        sharpe_x_years = (returns.iloc[-252 * x_years:].mean() / returns.iloc[-252 * x_years:].std())
        sharpe_y_years = (returns.iloc[-252 * y_years:].mean() / returns.iloc[-252 * y_years:].std())

        sharpe_df = pd.DataFrame({
            f'Sharpe {x_years}Y': sharpe_x_years,
            f'Sharpe {y_years}Y': sharpe_y_years
        })

        # Preparar los datos para enviar como JSON
        sharpe_data = sharpe_df.reset_index().rename(columns={'index': 'ticker'}).to_dict(orient='records')

        return JsonResponse({'sharpe_data': sharpe_data})

    return JsonResponse({'error': 'GET method required'})

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

            # Obtener datos de la base de datos
            queryset = StockData.objects.filter(
                ticker=ticker,
                date__range=[inicio, fin]
            ).order_by('date')
            print(queryset)
            if not queryset.exists():
                return JsonResponse({'error': 'No data found for the given ticker and date range.'}, status=404)

            # Convertir los resultados del queryset a un DataFrame de pandas
            data = pd.DataFrame.from_records(queryset.values('date', 'open_price', 'high_price', 'low_price', 'close_price', 'volume'))
            print('si')
            # Convertir la columna 'date' a datetime
            data['date'] = pd.to_datetime(data['date'], errors='coerce')
            data.set_index('date', inplace=True)  # Establecer la fecha como índice
            data.columns = ['Open', 'High', 'Low', 'Close', 'Volume']  # Ajustar los nombres de las columnas
            print(data)

            # Configurar estrategia personalizada
            CustomStrategy.rapida = rapida
            CustomStrategy.lenta = lenta
            CustomStrategy.tp_percentage = tp_percentage
            CustomStrategy.sl_percentage = sl_percentage
            CustomStrategy.use_sma_cross = strategies.get('smaCross', False)
            CustomStrategy.use_rsi = strategies.get('rsi', False)
            CustomStrategy.rsi_params = strategies.get('rsiParams', {'overboughtLevel': 70, 'oversoldLevel': 30})

            # Ejecutar el backtest
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
    # Obtener el ticker de los parámetros de la solicitud
    ticker = request.GET.get('ticker', 'AAPL')  # AAPL como valor predeterminado si no se proporciona

    # Obtener datos históricos de Yahoo Finance para el ticker seleccionado
    #df = yf.Ticker(ticker).history(period='5y').reset_index()
    stock_data = StockData.objects.filter(
        Q(ticker=ticker)
    ).values().order_by('date')

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
                    'pointpos': float(pivot_points.iloc[i]['pointpos']),  # Convertir a flotante si es necesario
                    'type': 'high'
                })
            
            elif (pivot_points.iloc[i]['pointpos'] < pivot_points.iloc[i]['low'] and
                  pivot_points.iloc[j]['pointpos'] < pivot_points.iloc[j]['low'] and
                  abs(pivot_points.iloc[i]['pointpos'] - pivot_points.iloc[j]['pointpos']) < limites):
                
                data.append({
                    'time': pivot_points.iloc[i]['time'].strftime('%Y-%m-%d %H:%M:%S'),
                    'pointpos': float(pivot_points.iloc[i]['pointpos']),  # Convertir a flotante si es necesario
                    'type': 'low'
                })

    # Devolver los datos como respuesta JSON
    return JsonResponse({'data': data, 'historical': historical, 'limites':limites}, safe=False)


def obtener_agrupamiento(request):
    tickers_param = request.GET.get('tickers')
    tickers = tickers_param.split(',')
    
    parametros_seleccionados = request.GET.get('parametros', '').split(',')
    
    start_date = request.GET.get('start_date', None)
    end_date = request.GET.get('end_date', None)

    try:
        agrupamiento = agrupar_acciones(tickers, parametros_seleccionados, start_date, end_date)
        agrupamiento = agrupamiento.reset_index()
        agrupamiento_json = agrupamiento.to_dict(orient='records')
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
        use_triple = request.GET.get('use_triple', 'false').lower() == 'true'  # Convertir a boolean

        # Llamar a la función que calcula las señales
        if use_triple:
            signals_with_data = obtener_ema_signals(tickers, [ema4, ema9, ema18], use_triple=True)
        else:
            signals_with_data = obtener_ema_signals(tickers, [ema4, ema9], use_triple=False)

        # Retornar las señales y datos de velas como respuesta JSON
        return JsonResponse({"signals": signals_with_data})