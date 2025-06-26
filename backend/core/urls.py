from api.views.analytics_views import FundamentalInfoView
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static

import pandas as pd
from django.urls import path, include

from api import views


urlpatterns = [
    path("admin/", admin.site.urls),

    # Documentación API
    
    #path('api-auth/', include('rest_framework.urls')),

    path("api/", include("api.urls")),

]

# Servir archivos estáticos en desarrollo/producción
if settings.DEBUG or True:  # Siempre servir estáticos para Docker
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
