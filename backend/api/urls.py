from django.urls import path
from . import views
 
urlpatterns = [
path ("activos/", views.ActivoListCreate.as_view(), name="lista-activo"),
path("activos/delete/<int:pk>/", views.ActivoDelete.as_view(), name="borrar-activo")
]