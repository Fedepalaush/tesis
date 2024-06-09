from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework import viewsets
from .models import Activo
from .serializers import ActivoSerializer
from rest_framework.response import Response
import yfinance as yf
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
                    date_format = '%Y-%m-%d %H:%M'  # Include hour and minute
                elif interval == '1wk':
                    period = '3y'
                    date_format = '%Y-%m-%d'
                else:
                    return JsonResponse({'error': 'Invalid interval.'}, status=400)

                historical_data = yf.Ticker(ticker).history(period=period, interval=interval)
                
                # Calculate RSI
                historical_data['RSI'] = ta.rsi(historical_data.Close, period=14)
                historical_data['EMA200'] = ta.ema(historical_data.Close, period=200)
                historical_data.dropna(inplace=True)
                
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
                        'rsi': row['RSI'],  # Assuming RSI is calculated with a period of 14
                        'ema_200': row['EMA200']  # Assuming RSI is calculated with a period of 14
                    })
                return JsonResponse({'data': data})
            else:
                return JsonResponse({'error': 'Parameter "timeframe" is required.'}, status=400)
        else:
            return JsonResponse({'error': 'Parameter "ticker" is required.'}, status=400)
    else:
        return JsonResponse({'error': 'Only GET requests are allowed.'}, status=400)

@csrf_exempt
def get_fundamental_info(request):
    if request.method == 'GET':
        ticker = request.GET.get('ticker', None)
        
        if ticker:
            # Create Ticker object using yfinance
            cashflows = yf.Ticker(ticker).get_cashflow()  # Getting cashflow data
            balance = yf.Ticker(ticker).get_balance_sheet()
            income = yf.Ticker(ticker).get_income_stmt()
            balance.dropna(inplace=True)
            cashflows = cashflows.to_json(date_format='iso')
            balance = balance.to_json(date_format='iso')
            income = income.to_json(date_format='iso')
            # Fundamental data to be included in the response
            fundamental_data = {

                'cash_flow': cashflows,
                'balance':balance,
                'income':income
            }
            

            return JsonResponse({'data': fundamental_data})
        else:
            return JsonResponse({'error': 'Parameter "ticker" is required.'}, status=400)
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
                activo.precioActual = precio_actual
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
        tickers = ['MSFT', 'AAPL', 'KO', 'NVDA', 'TSLA', 'BA']
        interval = request.GET.get('timeframe', '1d')  # Default to '1d' if not provided

        if interval not in ['1d', '1wk', '1mo']:
            return JsonResponse({'error': 'Invalid interval.'}, status=400)

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