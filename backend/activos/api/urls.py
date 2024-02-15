from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ActivoViewSet, Activo2ViewSet

activo_router = DefaultRouter()
activo_router.register(r'activos', ActivoViewSet, basename='activo')
activo_router.register(r'activos2', Activo2ViewSet, basename='activo2')
