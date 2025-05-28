"""
Analytics views for the API app.

This module contains views related to financial analytics, indicators, and metrics.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime
import json
import pandas as pd
import numpy as np
import hashlib
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from api.models import StockData
from api.services.retornos_mensuales import calcular_retornos_mensuales
from api.services.fundamental import get_fundamental_data
from api.services.backtesting import run_backtest_service
from api.services.indicators import calculate_sharpe_ratio
from api.services.pivot import calculate_pivots
from api.services.agrupacion import agrupar_acciones
from api.services.ema_logic import obtener_ema_signals
from api.services.entrenamiento import entrenar_modelo_service
from api.viewsModule.base import CachedAPIView


class RetornosMensualesView(CachedAPIView):
    """
    View for retrieving monthly returns data.
    """
    permission_classes = []
    
    def get(self, request):
        """
        Get monthly returns data for a ticker.
        
        Args:
            request: The HTTP request object.
            
        Returns:
            Response: The HTTP response object with monthly returns data.
        """
        try:
            ticker = request.GET.get('ticker', 'AAPL')  # Default ticker: AAPL
            years = int(request.GET.get('years', 10))  # Default years: 10

            # Generate cache key
            cache_key = self.get_cache_key(ticker=ticker, years=years)
            cached_response = self.get_cached_response(cache_key)
            if cached_response:
                return cached_response

            # Call service to calculate monthly returns
            data_for_plotly = calcular_retornos_mensuales(ticker, years)

            if not data_for_plotly:
                return self.error_response('No data found for the provided ticker', status.HTTP_400_BAD_REQUEST)

            # Cache and return response
            return self.cache_response(cache_key, data_for_plotly)

        except Exception as e:
            return self.error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)


class FundamentalInfoView(CachedAPIView):
    """
    View for retrieving fundamental information for a ticker.
    """
    permission_classes = []
    
    def get(self, request):
        """
        Get fundamental information for a ticker.
        
        Args:
            request: The HTTP request object.
            
        Returns:
            Response: The HTTP response object with fundamental data.
        """
        ticker = request.GET.get('ticker')
        
        if not ticker:
            return self.error_response('Parameter "ticker" is required.', status.HTTP_400_BAD_REQUEST)

        try:
            # Generate cache key
            cache_key = self.get_cache_key(ticker=ticker)
            cached_response = self.get_cached_response(cache_key)
            if cached_response:
                return cached_response

            # Get fundamental data
            data = get_fundamental_data(ticker)
            
            # Cache and return response
            return self.cache_response(cache_key, data)
        except ValueError as e:
            return self.error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)


class CorrelationMatrixView(CachedAPIView):
    """
    View for calculating correlation matrices for tickers.
    """
    permission_classes = []
    
    def get(self, request):
        """
        Get correlation matrix for a list of tickers.
        
        Args:
            request: The HTTP request object.
            
        Returns:
            Response: The HTTP response object with correlation matrix.
        """
        tickers = request.GET.getlist('tickers')
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')

        if not tickers:
            return self.error_response('Tickers are required.', status.HTTP_400_BAD_REQUEST)

        if not start_date or not end_date:
            return self.error_response('Start and end dates are required.', status.HTTP_400_BAD_REQUEST)

        # Generate cache key
        cache_key = hashlib.md5(f"{','.join(sorted(tickers))}_{start_date}_{end_date}".encode()).hexdigest()
        cached_data = self.get_from_cache(cache_key)
        if cached_data:
            return JsonResponse({'correlation_matrix': cached_data})

        try:
            # Import yfinance here to avoid circular imports
            import yfinance as yf
            
            data_frames = {}
            for ticker in tickers:
                # Get data based on provided dates
                ticker_data = yf.Ticker(ticker).history(start=start_date, end=end_date)
                data_frames[ticker] = ticker_data['Close']

            # Combine close prices in a single DataFrame
            combined_data = pd.DataFrame(data_frames)

            # Remove rows with NaN values
            combined_data.dropna(inplace=True)

            # Calculate correlation matrix
            correlation_matrix = combined_data.corr()

            # Convert correlation matrix to dictionary format for JSON response
            correlation_data = correlation_matrix.to_dict()

            # Store result in cache with 1 hour expiration
            self.set_in_cache(cache_key, correlation_data, timeout=3600)

            return JsonResponse({'correlation_matrix': correlation_data})
        
        except Exception as e:
            return self.error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)


class SharpeRatioView(CachedAPIView):
    """
    View for calculating Sharpe ratio.
    """
    permission_classes = []
    
    def get(self, request):
        """
        Get Sharpe ratio for a sector.
        
        Args:
            request: The HTTP request object.
            
        Returns:
            Response: The HTTP response object with Sharpe ratio data.
        """
        # Parameters
        sector = request.GET.get('sector', 'Information Technology')
        x_years = int(request.GET.get('x_years', 5))
        y_years = int(request.GET.get('y_years', 2))
        
        # Generate cache key
        cache_key = self.get_cache_key(sector=sector, x_years=x_years, y_years=y_years)
        cached_response = self.get_cached_response(cache_key)
        if cached_response:
            return cached_response

        # Call service to calculate Sharpe ratio
        sharpe_data = calculate_sharpe_ratio(sector, x_years, y_years)

        # Check if an error occurred
        if isinstance(sharpe_data, dict) and 'error' in sharpe_data:
            return self.error_response(sharpe_data['error'], status.HTTP_400_BAD_REQUEST)

        # Cache and return response
        return self.cache_response(cache_key, {'sharpe_data': sharpe_data})


class BacktestView(CachedAPIView):
    """
    View for running backtests.
    """
    permission_classes = []
    
    def post(self, request):
        """
        Run a backtest with provided parameters.
        
        Args:
            request: The HTTP request object.
            
        Returns:
            Response: The HTTP response object with backtest results.
        """
        try:
            data = request.data

            # Call service to run backtest
            result = run_backtest_service(data)

            # Check if an error occurred
            if 'error' in result:
                return self.error_response(result['error'], status.HTTP_400_BAD_REQUEST)

            return self.success_response(data=result)
        except Exception as e:
            return self.error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)


class PivotPointsView(CachedAPIView):
    """
    View for calculating pivot points.
    """
    permission_classes = []
    
    def get(self, request):
        """
        Get pivot points for a ticker.
        
        Args:
            request: The HTTP request object.
            
        Returns:
            Response: The HTTP response object with pivot points.
        """
        # Get ticker from request parameters
        ticker = request.GET.get('ticker', 'AAPL')  # Default to AAPL if not provided
        
        # Generate cache key
        cache_key = self.get_cache_key(ticker=ticker)
        cached_response = self.get_cached_response(cache_key)
        if cached_response:
            return cached_response

        # Get historical data from model
        stock_data = StockData.objects.filter(ticker=ticker).values().order_by('date')

        # Calculate pivots using service function
        pivot_data = calculate_pivots(stock_data)

        # Cache and return response
        return self.cache_response(cache_key, pivot_data)


class AgrupamientoView(CachedAPIView):
    """
    View for clustering stocks.
    """
    permission_classes = []
    
    def get(self, request):
        """
        Get clustering results for tickers.
        
        Args:
            request: The HTTP request object.
            
        Returns:
            Response: The HTTP response object with clustering results.
        """
        tickers_param = request.GET.get('tickers')
        tickers = tickers_param.split(',')
        parametros_seleccionados = request.GET.get('parametros', '').split(',')
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')

        # Generate cache key
        cache_key = hashlib.md5(
            f"agrupamiento_{','.join(tickers)}_{start_date}_{end_date}_{','.join(parametros_seleccionados)}".encode()
        ).hexdigest()
        cached_data = self.get_from_cache(cache_key)
        if cached_data:
            return JsonResponse(cached_data, safe=False)

        try:
            agrupamiento = agrupar_acciones(tickers, parametros_seleccionados, start_date, end_date)
            agrupamiento = agrupamiento.reset_index()
            agrupamiento_json = agrupamiento.to_dict(orient='records')

            # Store in cache
            self.set_in_cache(cache_key, agrupamiento_json, timeout=3600)

            return JsonResponse(agrupamiento_json, safe=False, status=200)
        except Exception as e:
            return self.error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)


class EMASignalsView(CachedAPIView):
    """
    View for calculating EMA signals.
    """
    permission_classes = []
    
    def get(self, request):
        """
        Get EMA signals for tickers.
        
        Args:
            request: The HTTP request object.
            
        Returns:
            Response: The HTTP response object with EMA signals.
        """
        # Get tickers and EMA periods from request
        tickers = request.GET.getlist('tickers[]')
        ema4 = int(request.GET.get('ema4', 4))
        ema9 = int(request.GET.get('ema9', 9))
        ema18 = int(request.GET.get('ema18', 18))
        use_triple = request.GET.get('useTriple', 'false').lower() == 'true'

        # Generate a unique cache key based on parameters
        cache_key = hashlib.md5(
            f"ema_signals_{','.join(tickers)}_{ema4}_{ema9}_{ema18}_{use_triple}".encode()
        ).hexdigest()

        # Check if result is already in cache
        cached_data = self.get_from_cache(cache_key)
        if cached_data:
            return JsonResponse(cached_data)

        # Call function that calculates signals
        try:
            if use_triple:
                signals_with_data = obtener_ema_signals(tickers, [ema4, ema9, ema18], use_triple=True)
            else:
                signals_with_data = obtener_ema_signals(tickers, [ema4, ema9], use_triple=False)

            # Create result as a dictionary including signals
            result = {"signals": signals_with_data}

            # Store result in cache (e.g., for 1 hour)
            self.set_in_cache(cache_key, result, timeout=3600)

            # Return result as JSON
            return JsonResponse(result)

        except Exception as e:
            return self.error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)


class DividendosView(CachedAPIView):
    """
    View for retrieving dividend information.
    """
    permission_classes = []
    
    def get(self, request):
        """
        Get dividend information for tickers.
        
        Args:
            request: The HTTP request object.
            
        Returns:
            Response: The HTTP response object with dividend information.
        """
        tickers = request.GET.getlist("tickers")  # Get list of tickers
        
        # Generate cache key
        cache_key = self.get_cache_key(tickers=",".join(tickers))
        cached_response = self.get_cached_response(cache_key)
        if cached_response:
            return cached_response
        
        # Import yfinance here to avoid circular imports
        import yfinance as yf
        from datetime import datetime
        
        resultados = {}
        año_anterior = datetime.now().year - 1  # Last year
        # Change the structure of dividendos_por_mes to store total and company details
        dividendos_por_mes = {i: {"total": 0, "detalles": []} for i in range(12)}  # Dictionary to store dividends by month

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
                        mes_pago = fecha_pago.month - 1  # Convert to 0-11 index
                        dividendos_por_mes[mes_pago]["total"] += monto  # Sum dividend amounts
                        dividendos_por_mes[mes_pago]["detalles"].append({"empresa": ticker, "monto": monto})  # Save details

            except Exception as e:
                resultados[ticker] = {"error": str(e)}
                continue
                
        # Cache and return response
        data = {"dividendos": dividendos_por_mes}
        self.set_in_cache(cache_key, data, timeout=3600)
        return JsonResponse(data)


class EntrenarModeloView(CachedAPIView):
    """
    View for training models.
    """
    permission_classes = []
    
    def post(self, request):
        """
        Train a model with provided parameters.
        
        Args:
            request: The HTTP request object.
            
        Returns:
            Response: The HTTP response object with training results.
        """
        try:
            data = request.data

            resultado = entrenar_modelo_service(data)
            if 'error' in resultado:
                return self.error_response(resultado['error'], status.HTTP_400_BAD_REQUEST)

            return self.success_response(data=resultado)
        except Exception as e:
            return self.error_response(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)


class PortfolioMetricsView(CachedAPIView):
    """
    View for calculating portfolio metrics.
    """
    permission_classes = []
    
    def post(self, request):
        """
        Calculate portfolio metrics.
        
        Args:
            request: The HTTP request object.
            
        Returns:
            Response: The HTTP response object with portfolio metrics.
        """
        activos = request.data.get("activos", [])
        indice = request.data.get("indice_referencia", "^GSPC")

        if not activos:
            return self.error_response("No hay activos", status.HTTP_400_BAD_REQUEST)

        tickers = [a["ticker"] for a in activos]
        tickers_unicos = list(set(tickers + [indice]))

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
            return self.error_response("No hay datos disponibles", status.HTTP_400_BAD_REQUEST)

        precios = pd.concat(precios_dict.values(), axis=1, keys=precios_dict.keys())
        precios = precios.dropna()

        if precios.shape[0] < 10:
            return self.error_response("No hay suficientes datos para calcular métricas móviles", status.HTTP_400_BAD_REQUEST)

        rendimientos = precios.pct_change().dropna()

        try:
            # Calculate weights
            pesos = np.array([
                a["cantidad"] * precios[a["ticker"]].iloc[-1] for a in activos
            ])
            pesos = pesos / np.sum(pesos)

            activos_tickers = [a["ticker"] for a in activos]
            rend_port = rendimientos[activos_tickers].dot(pesos)
            rend_indice = rendimientos[indice]

            # Take the last 7 available dates
            ultimos_dias = rend_port.index[-7:]

            volatilidades = []
            betas = []
            fechas = []

            for fecha in ultimos_dias:
                ventana_inicio = rend_port.index.get_loc(fecha) - 4  # 5-day window
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
                return self.error_response("No se pudo calcular métricas móviles", status.HTTP_400_BAD_REQUEST)

            return self.success_response(data={
                "fechas": fechas,
                "volatilidades": volatilidades,
                "betas": betas
            })

        except Exception as e:
            print("❌ Error al calcular métricas móviles:", str(e))
            return self.error_response("No se pudo calcular las métricas", status.HTTP_500_INTERNAL_SERVER_ERROR)
