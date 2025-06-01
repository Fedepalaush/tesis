import unittest
from unittest.mock import patch, MagicMock
from django.test import TestCase
from backend.api.services.fundamental import get_fundamental_data

class TestFundamentalService(TestCase):
    @patch('backend.api.services.fundamental.yf.Ticker')
    @patch('backend.api.services.fundamental.cache')
    def test_get_fundamental_data_cached(self, mock_cache, mock_ticker):
        # Simular comportamiento de caché
        mock_cache.get.return_value = {'mocked': 'data'}

        # Llamar al servicio
        resultado = get_fundamental_data('AAPL')

        # Verificar que se utilizó el caché
        mock_cache.get.assert_called_once_with('fundamental_info_AAPL')
        self.assertEqual(resultado, {'mocked': 'data'})

    @patch('backend.api.services.fundamental.yf.Ticker')
    @patch('backend.api.services.fundamental.cache')
    def test_get_fundamental_data_no_cache(self, mock_cache, mock_ticker):
        # Simular comportamiento de caché
        mock_cache.get.return_value = None

        # Simular comportamiento de Ticker
        mock_ticker.return_value.get_cashflow.return_value = MagicMock(to_json=lambda: '{}')
        mock_ticker.return_value.get_balance_sheet.return_value = MagicMock(to_json=lambda: '{}')
        mock_ticker.return_value.get_income_stmt.return_value = MagicMock(to_json=lambda: '{}')

        # Llamar al servicio
        resultado = get_fundamental_data('AAPL')

        # Verificar que se llamó a set en el caché
        mock_cache.set.assert_called_once()
        self.assertIn('cash_flow', resultado)
        self.assertIn('balance', resultado)
        self.assertIn('income', resultado)
