from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework import viewsets
from ..models import Activo
from .serializers import ActivoSerializer, Activo2Serializer
from rest_framework.response import Response
import yfinance as yf

from django.http import JsonResponse
import json

class ActivoViewSet (ModelViewSet):
    queryset = Activo.objects.all()
    serializer_class = ActivoSerializer  

class Activo2ViewSet(viewsets.ViewSet):
    def list(self, request):
        yahoo = round(yf.Ticker('AAPL').history(period='1y').iloc[-1].Close,2)
        yahoo2 = round(yf.Ticker('KO').history(period='1y').iloc[-1].Close,2)
        
        data = [{'ticker': 'AAPL', 'precio':yahoo}, {'ticker': 'KO', 'precio': yahoo2}]  # Sample data
        serializer = Activo2Serializer(data=data, many=True)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data)

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

