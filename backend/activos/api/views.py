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
     if request.method == 'POST':
      # Decode the bytes object to convert it into a string
      body_string = request.body.decode('utf-8')

# Parse the string as JSON
      data = json.loads(body_string)

# Access the parametro value
      parametro = data['params']['parametro']
          # If you're sending JSON data, use request.body to get the raw JSON string
        # Convert the JSON string to a Python dictionary using json.loads
        # For example:

        # Execute your function based on the parameter received
        # For example:
        # result = my_function(parametro)
        # Fetch historical data
      historical_data = yf.Ticker(parametro).history(period='1y')
        
        # Extract close prices
      close_prices = historical_data['Close'].tolist()
        
        # Return all close prices
      return JsonResponse({'close_prices': close_prices})
     else:
      return JsonResponse({'error': 'Only POST requests are allowed.'}, status=400)