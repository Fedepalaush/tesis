"""
Vistas de activos para la aplicación API.

Este módulo contiene vistas relacionadas con activos financieros.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db.models import F

from api.models import Activo
from api.serializers import ActivoSerializer
from api.services.activo_service import ActivoService
from api.services.indicators import fetch_historical_data, calculate_analytics, validate_date_range
from api.views.base import CachedAPIView


class ActivoDetailView(CachedAPIView):
    """
    Vista para obtener información detallada sobre un activo específico.
    """
    permission_classes = [AllowAny]
    def post(self, request):
        """
        Obtiene información detallada para un ticker específico.
        
        Args:
            request: El objeto de solicitud HTTP.
            
        Returns:
            Response: El objeto de respuesta HTTP con datos del activo.
        """
        return self.get(request)
    def get(self, request):
        """
        Obtiene información detallada para un ticker específico.
        
        Args:
            request: El objeto de solicitud HTTP.
            
        Returns:
            Response: El objeto de respuesta HTTP con datos del activo.
        """
        ticker = request.GET.get('ticker')
        start_date_str = request.GET.get('start_date')
        end_date_str = request.GET.get('end_date')

        # Validar parámetros
        if not ticker:
            return self.error_response('El parámetro "ticker" es obligatorio.', status.HTTP_400_BAD_REQUEST)

        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
            validate_date_range(start_date, end_date)
        except ValueError as e:
            return self.error_response(str(e), status.HTTP_400_BAD_REQUEST)

        # Intentar obtener de caché
        cache_key = self.get_cache_key(ticker=ticker, start_date=start_date_str, end_date=end_date_str)
        cached_response = self.get_cached_response(cache_key)
        if cached_response:
            return cached_response

        try:
            # Obtener datos históricos
            df = fetch_historical_data(ticker, start_date, end_date)

            if df.empty:
                return self.error_response(
                    'No se encontraron datos para el ticker y rango de fechas proporcionados.',
                    status.HTTP_404_NOT_FOUND
                )

            # Calcular analíticas
            data = calculate_analytics(df)
            
            # Almacenar en caché y devolver respuesta
            return self.cache_response(cache_key, data)

        except Exception as e:
            return self.error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)


class ActivoListCreateView(generics.ListCreateAPIView):
    """
    Vista para listar y crear activos con cálculos personalizados.
    """
    serializer_class = ActivoSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs) -> Response:
        """
        Listar activos con valores calculados y totales.
        
        Args:
            request: El objeto de solicitud HTTP.
            
        Returns:
            Response: El objeto de respuesta HTTP con datos de activos.
        """
        user = request.user
        activos = Activo.objects.filter(usuario=user)

        tickers = []
        total_actual_cartera = 0

        # Primera pasada: calcular valor total de la cartera
        for activo in activos:
            service = ActivoService()
            processed_data = service.process_activo(activo)
            if processed_data:
                precio_actual = processed_data.get('precioActual', activo.precioActual)
                cantidad = activo.cantidad
                total_actual_cartera += precio_actual * cantidad

        # Segunda pasada: procesar cada activo con sus cálculos
        for activo in activos:
            service = ActivoService()
            processed_data = service.process_activo(activo)
            if processed_data:
                precio_compra = activo.precioCompra
                cantidad = activo.cantidad
                precio_actual = processed_data.get('precioActual', activo.precioActual)
                total_inversion = precio_compra * cantidad
                total_actual = precio_actual * cantidad
                ganancia = total_actual - total_inversion
                ganancia_porcentaje = (ganancia / total_inversion) * 100 if total_inversion != 0 else 0
                recomendacion = processed_data.get('recomendacion', activo.recomendacion)
                porcentaje_cartera = (total_actual / total_actual_cartera) * 100 if total_actual_cartera != 0 else 0

                tickers.append({
                    "ticker": activo.ticker,
                    "cantidad": cantidad,
                    "precioCompra": precio_compra,
                    "precioActual": precio_actual,
                    "total_inversion": total_inversion,
                    "total_actual": total_actual,
                    "ganancia_porcentaje": ganancia_porcentaje,
                    "ganancia": ganancia,
                    "recomendacion": recomendacion,
                    "porcentaje_cartera": porcentaje_cartera
                })

        # Totales generales
        total_invertido = sum(ticker['total_inversion'] for ticker in tickers)
        diferencia_total = sum(ticker['ganancia'] for ticker in tickers)

        return Response({
            "activos": tickers,
            "total_invertido": total_invertido,
            "diferencia_total": diferencia_total,

        })

    def perform_create(self, serializer) -> None:
        """
        Crear un nuevo activo o actualizar uno existente.
        
        Args:
            serializer: El serializador de activo con datos validados.
        """
        if serializer.is_valid():
            ticker = serializer.validated_data['ticker']
            cantidad_comprada = serializer.validated_data['cantidad']
            precio_compra = serializer.validated_data['precioCompra']
            
            try:
                # Intentar actualizar un activo existente
                activo_existente = Activo.objects.get(ticker=ticker, usuario=self.request.user)
                cantidad_anterior = activo_existente.cantidad
                precio_compra_anterior = activo_existente.precioCompra
                
                # Calcular precio promedio ponderado
                nuevo_precio_compra = ((precio_compra_anterior * cantidad_anterior) + 
                                      (precio_compra * cantidad_comprada)) / (cantidad_anterior + cantidad_comprada)
                
                # Actualizar activo existente
                activo_existente.cantidad = F('cantidad') + cantidad_comprada
                activo_existente.precioCompra = nuevo_precio_compra
                activo_existente.save()
            except Activo.DoesNotExist:
                # Crear nuevo activo
                activo = serializer.save(usuario=self.request.user)
                activo.precioActual = precio_compra
                activo.save()
        else:
            print(serializer.errors)



class ActivoDeleteView(generics.DestroyAPIView):
    """
    Vista para eliminar un activo.
    """
    serializer_class = ActivoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Obtiene el queryset filtrado por el usuario actual.
        
        Returns:
            QuerySet: El queryset filtrado.
        """
        user = self.request.user
        return Activo.objects.filter(usuario=user)
