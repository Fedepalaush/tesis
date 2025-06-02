from api.views.analytics_views import FundamentalInfoView
from django.contrib import admin

import pandas as pd
from django.urls import path, include

from api import views


urlpatterns = [
    path("admin/", admin.site.urls),

    # Documentación API
    
    #path('api-auth/', include('rest_framework.urls')),

    path("api/", include("api.urls")),

]
