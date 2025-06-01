from django.test import TestCase, Client
from django.urls import reverse

class TestViews(TestCase):
    def setUp(self):
        self.client = Client()

    def test_health_endpoint(self):
        # Probar el endpoint de salud
        response = self.client.get(reverse('health'))

        # Verificar que el código de respuesta sea 200
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})

    def test_activo_endpoint(self):
        # Probar el endpoint de activos
        response = self.client.get(reverse('activo-list'))

        # Verificar que el código de respuesta sea 200
        self.assertEqual(response.status_code, 200)
        self.assertIn("results", response.json())
