from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ActivoViewSet

activo_router = DefaultRouter()
activo_router.register(r'activos', ActivoViewSet)
