from api.views.analytics_views import FundamentalInfoView
from django.contrib import admin
from backtesting import Strategy, Backtest
from backtesting.lib import crossover
import pandas as pd
import pandas_ta as ta
import yfinance as yf
from graphene_django.views import GraphQLView
from django.views.decorators.csrf import csrf_exempt
from django.urls import path, include

from api import views


urlpatterns = [
    path("admin/", admin.site.urls),

    # Documentación API
    
    #path('api-auth/', include('rest_framework.urls')),

    path('', include('api.urls')),

]
