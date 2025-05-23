from api.views import get_fundamental_info
from django.contrib import admin
from backtesting import Strategy, Backtest
from backtesting.lib import crossover
import pandas as pd
import pandas_ta as ta
import yfinance as yf
from graphene_django.views import GraphQLView
from django.views.decorators.csrf import csrf_exempt
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from api import views

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    #path('api-auth/', include('rest_framework.urls')),

    path('api/', include('api.urls')),
    path('activo/', views.ActivoAPIView.as_view(), name='get_activo'),
    path('get_fundamental/', get_fundamental_info, name='get_fundamental'),
    path("graphql", csrf_exempt(GraphQLView.as_view(graphiql=True))),
    path('api/portfolio/metrics/', views.portfolio_metrics, name='portfolio-metrics'),
    path('api/tickers/', views.obtener_tickers, name='obtener_tickers'),

    path('api/get_correlation_matrix', views.get_correlation_matrix, name='get_correlation_matrix'),
    path('sharpe-ratio/', views.sharpe_ratio, name='sharpe_ratio'),
    path('get_retornos_mensuales', views.get_retornos_mensuales, name='get_retornos_mensuales'),
    path('run_backtest/', views.run_backtest, name='run_backtest'),
    path('get_pivot_points/', views.get_pivot_points, name='get_pivot_points'),
    path('agrupamiento/', views.obtener_agrupamiento, name='obtener_agrupamiento'),
    path('get_ema_signals/', views.get_ema_signals, name='get_ema_signals'),
    path('obtener_dividendos/', views.obtener_dividendos, name='obtener_dividendos'),
    
    path("entrenar/", views.entrenar_modelo),
    
    path('last-execution/', views.last_execution_date, name='last-execution'),
    
]
