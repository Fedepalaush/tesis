from rest_framework.routers import DefaultRouter
from activos.api.urls import activo_router
from django.urls import path, include

router = DefaultRouter()
router.registry.extend(activo_router.registry)

urlpatterns = [
    path ('', include(router.urls))
]