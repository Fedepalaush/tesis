import unittest
from backend.api.utils import some_utility_function

class TestUtils(unittest.TestCase):
    def test_some_utility_function(self):
        # Probar la función utilitaria con un caso válido
        resultado = some_utility_function("input válido")
        self.assertEqual(resultado, "resultado esperado")

    def test_some_utility_function_invalid(self):
        # Probar la función utilitaria con un caso inválido
        with self.assertRaises(ValueError):
            some_utility_function("input inválido")
