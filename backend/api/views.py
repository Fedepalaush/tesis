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
from django.db.models import F
from rest_framework.permissions import IsAuthenticated, AllowAny 


from django.http import JsonResponse
import json


@csrf_exempt
def my_custom_view(request):
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
                        'close_price': row['Close']
                    })
                return JsonResponse({'data': data})
            else:
                return JsonResponse({'error': 'Parameter "timeframe" is required.'}, status=400)
        else:
            return JsonResponse({'error': 'Parameter "ticker" is required.'}, status=400)
    else:
        return JsonResponse({'error': 'Only GET requests are allowed.'}, status=400)
    

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


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
                print()
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

