from django.test import TestCase
from unittest.mock import patch, MagicMock
from backend.api.models import Activo

class TestActivoModel(TestCase):
    def test_activo_creation(self):
        # Crear un objeto Activo
        activo = Activo.objects.create(nombre="Test Activo", tipo="Acción")

        # Verificar que el objeto se creó correctamente
        self.assertEqual(activo.nombre, "Test Activo")
        self.assertEqual(activo.tipo, "Acción")

    @patch('backend.api.models.Activo.objects.filter')
    def test_activo_filtering(self, mock_filter):
        # Simular el comportamiento de filter
        mock_filter.return_value = [MagicMock(nombre="Activo 1"), MagicMock(nombre="Activo 2")]

        # Llamar al método de filtrado
        activos = Activo.objects.filter(tipo="Acción")

        # Verificar que se llamó a filter con el argumento correcto
        mock_filter.assert_called_once_with(tipo="Acción")
        self.assertEqual(len(activos), 2)
        self.assertEqual(activos[0].nombre, "Activo 1")
        self.assertEqual(activos[1].nombre, "Activo 2")
