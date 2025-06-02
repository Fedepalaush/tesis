from django.urls import path
from api.views import *
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

urlpatterns = [
    # Auth
    path("token/", TokenObtainPairView.as_view(), name="get_token"),
    path("token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("register/", RegisterUserView.as_view(), name="register"),

    # Schema / Docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # Activos
    path("activos/", ActivoListCreateView.as_view(), name="lista-activo"),
    path("activos/delete/<int:pk>/", ActivoDeleteView.as_view(), name="borrar-activo"),
    path("activo/", ActivoDetailView.as_view(), name="detalle-activo"),

    # Usuarios
    path('user/exists/<str:username>/', CheckUserExistsView.as_view(), name='check-user-exists'),

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
