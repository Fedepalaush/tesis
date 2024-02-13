from rest_framework.viewsets import ModelViewSet
from ..models import Activo
from .serializers import ActivoSerializer

class ActivoViewSet (ModelViewSet):
    queryset = Activo.objects.all()
    serializer_class = ActivoSerializer  