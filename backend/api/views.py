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
        return Activo.objects.filter(usuario=user)
    
    def perform_create(self,serializer):
        if serializer.is_valid():
            serializer.save(usuario=self.request.user)
        else:
            print(serializer.errors)    

class ActivoDelete(generics.DestroyAPIView):
    serializer_class = ActivoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Activo.objects.filter(usuario=user)  

