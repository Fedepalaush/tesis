"""
URL patterns for the API app.

This module defines the URL patterns for the API app, organized by functionality.
"""
from django.urls import path

from api.views.activo_views import ActivoDetailView, ActivoListCreateView, ActivoDeleteView
from api.views.user_views import CheckUserExistsView
from api.views.analytics_views import (
    RetornosMensualesView, FundamentalInfoView, CorrelationMatrixView,
    SharpeRatioView, BacktestView, PivotPointsView, AgrupamientoView,
    EMASignalsView, DividendosView, EntrenarModeloView, PortfolioMetricsView
)
from api.views.utility_views import HealthCheckView, LastExecutionDateView, TickersView

# URL patterns grouped by functionality
urlpatterns = [
    # Activos (Financial assets)
    path("activos/", ActivoListCreateView.as_view(), name="lista-activo"),
    path("activos/delete/<int:pk>/", ActivoDeleteView.as_view(), name="borrar-activo"),
    path("activo/", ActivoDetailView.as_view(), name="detalle-activo"),
    
    # Users
    path('usuarios/exists/<str:username>/', CheckUserExistsView.as_view(), name='check-user-exists'),
    
    # Analytics
    path('retornos-mensuales/', RetornosMensualesView.as_view(), name='retornos-mensuales'),
    path('fundamental/', FundamentalInfoView.as_view(), name='fundamental-info'),
    path('correlation-matrix/', CorrelationMatrixView.as_view(), name='correlation-matrix'),
    path('sharpe-ratio/', SharpeRatioView.as_view(), name='sharpe-ratio'),
    path('backtest/', BacktestView.as_view(), name='backtest'),
    path('pivot-points/', PivotPointsView.as_view(), name='pivot-points'),
    path('agrupamiento/', AgrupamientoView.as_view(), name='agrupamiento'),
    path('ema-signals/', EMASignalsView.as_view(), name='ema-signals'),
    path('dividendos/', DividendosView.as_view(), name='dividendos'),
    path('entrenar-modelo/', EntrenarModeloView.as_view(), name='entrenar-modelo'),
    path('portfolio-metrics/', PortfolioMetricsView.as_view(), name='portfolio-metrics'),
    
    # Utilities
    path('health/', HealthCheckView.as_view(), name='health_check'),
    path('last-execution/', LastExecutionDateView.as_view(), name='last-execution'),
    path('tickers/', TickersView.as_view(), name='tickers'),
]