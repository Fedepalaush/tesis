from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework import viewsets
from ..models import Activo
from .serializers import ActivoSerializer, Activo2Serializer
from rest_framework.response import Response
import yfinance as yf
from decimal import Decimal
from django.views.decorators.csrf import csrf_exempt

from django.http import JsonResponse
import json

class ActivoViewSet (ModelViewSet):
    queryset = Activo.objects.all()
    serializer_class = ActivoSerializer  

class Activo2ViewSet(viewsets.ViewSet):
        
    def list(self, request):
        aapl_data = yf.Ticker('AAPL').history(period='1y').iloc[1:10].Close
        msft_data = yf.Ticker('MSFT').history(period='1y').iloc[1:10].Close

# Rounding each value to three decimal places and converting to list
        yahoo_aapl = [round(Decimal(price), 3) for price in aapl_data]
        yahoo_msft = [round(Decimal(price), 3) for price in msft_data]
        
        data = [
            {'ticker': 'AAPL', 'prices': yahoo_aapl},
            {'ticker': 'MSFT', 'prices': yahoo_msft}
        ]
        
        serializer = Activo2Serializer(data=data, many=True)
        serializer.is_valid(raise_exception=True)
        
        return Response(serializer.validated_data)

    def create(self, request):
        serializer = Activo2Serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        # Implement retrieve logic here
        pass

    def update(self, request, pk=None):
        # Implement update logic here
        pass

    def partial_update(self, request, pk=None):
        # Implement partial update logic here
        pass

    def destroy(self, request, pk=None):
        # Implement destroy logic here
        pass  


@csrf_exempt
def my_custom_view(request):
    if request.method == 'GET':
        parametro = request.GET.get('parametro', None)
        if parametro:
            historical_data = yf.Ticker(parametro).history(period='1y')
            data = []
            for date, row in historical_data.iterrows():
                data.append({
                    'date': date.strftime('%Y-%m-%d'),
                    'open_price': row['Open'],
                    'high_price': row['High'],
                    'low_price': row['Low'],
                    'close_price': row['Close']
                })
            return JsonResponse({'data': data})
        else:
            return JsonResponse({'error': 'Parameter "parametro" is required.'}, status=400)
    else:
        return JsonResponse({'error': 'Only GET requests are allowed.'}, status=400)