from django.urls import path
from . import views
from .views import CheckUserExistsAPIView

urlpatterns = [
    path("activos/", views.ActivoListCreate.as_view(), name="lista-activo"),
    path('usuarios/exists/<str:username>/', CheckUserExistsAPIView.as_view(), name='check-user-exists'),
    path("activos/delete/<int:pk>/", views.ActivoDelete.as_view(), name="borrar-activo"),
    path('health/', views.health_check, name='health_check'),
]