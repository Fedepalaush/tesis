"""
Tests unitarios para los servicios.

Este módulo contiene tests unitarios para los servicios de la aplicación,
verificando su funcionamiento correcto.
"""
import pytest
import json
from unittest.mock import patch, MagicMock
from django.test import TestCase
from django.utils import timezone
from datetime import timedelta, date

from api.models import Activo, StockData
from api.services.activo_service import ActivoService, StockDataService
from api.exceptions import ValidationException, NotFoundException


class TestActivoService(TestCase):
    """Tests para ActivoService."""

    def setUp(self):
        """Configuración inicial para los tests."""
        # Crear activos de prueba
        self.activo1 = Activo.objects.create(
            ticker="AAPL",
            nombre="Apple Inc.",
            cantidad=10,
            precioCompra=150.0,
            precioActual=160.0,
            fechaCompra=timezone.now().date()
        )
        
        self.activo2 = Activo.objects.create(
            ticker="MSFT",
            nombre="Microsoft Corporation",
            cantidad=5,
            precioCompra=200.0,
            precioActual=210.0,
            fechaCompra=timezone.now().date()
        )
        
        self.service = ActivoService()
    
    @patch('api.services.activo_service.ActivoService._enrich_activo_data')
    def test_get_all_activos(self, mock_enrich):
        """Test para el método get_all_activos."""
        # Configurar el mock
        mock_enrich.side_effect = lambda activo: {
            'id': activo.id,
            'ticker': activo.ticker,
            'enriched': True
        }
        
        result = self.service.get_all_activos()
        self.assertEqual(len(result), 2)
        self.assertTrue(result[0]['enriched'])
        self.assertTrue(result[1]['enriched'])
        
        # Verificar que se llamó al método _enrich_activo_data para cada activo
        self.assertEqual(mock_enrich.call_count, 2)
    
    @patch('api.services.activo_service.ActivoService._enrich_activo_data')
    def test_get_activo_by_id(self, mock_enrich):
        """Test para el método get_activo_by_id."""
        # Configurar el mock
        mock_enrich.return_value = {
            'id': self.activo1.id,
            'ticker': 'AAPL',
            'enriched': True
        }
        
        result = self.service.get_activo_by_id(self.activo1.id)
        self.assertEqual(result['ticker'], 'AAPL')
        self.assertTrue(result['enriched'])
        
        # Verificar que se llamó al método _enrich_activo_data
        mock_enrich.assert_called_once()
        
        # Probar con ID que no existe
        result = self.service.get_activo_by_id(999)
        self.assertIsNone(result)
    
    def test_create_activo(self):
        """Test para el método create_activo."""
        activo_data = {
            "ticker": "GOOGL",
            "nombre": "Alphabet Inc.",
            "cantidad": 2,
            "precioCompra": 1500.0,
            "fechaCompra": timezone.now().date()
        }
        
        with patch('api.services.activo_service.ActivoService._validate_activo_data') as mock_validate:
            with patch('api.services.activo_service.ActivoService._enrich_activo_data') as mock_enrich:
                mock_enrich.return_value = {
                    'ticker': 'GOOGL',
                    'nombre': 'Alphabet Inc.',
                    'enriched': True
                }
                
                result = self.service.create_activo(activo_data)
                self.assertEqual(result['ticker'], 'GOOGL')
                self.assertTrue(result['enriched'])
                
                # Verificar que se llamaron los métodos de validación y enriquecimiento
                mock_validate.assert_called_once_with(activo_data)
                mock_enrich.assert_called_once()
    
    def test_update_activo(self):
        """Test para el método update_activo."""
        activo_data = {
            "precioActual": 170.0,
            "cantidad": 15
        }
        
        with patch('api.services.activo_service.ActivoService._validate_activo_data') as mock_validate:
            with patch('api.services.activo_service.ActivoService._enrich_activo_data') as mock_enrich:
                mock_enrich.return_value = {
                    'id': self.activo1.id,
                    'ticker': 'AAPL',
                    'precioActual': 170.0,
                    'cantidad': 15,
                    'enriched': True
                }
                
                result = self.service.update_activo(self.activo1.id, activo_data)
                self.assertEqual(result['precioActual'], 170.0)
                self.assertEqual(result['cantidad'], 15)
                
                # Verificar que se llamaron los métodos de validación y enriquecimiento
                mock_validate.assert_called_once_with(activo_data, update=True)
                mock_enrich.assert_called_once()
                
                # Probar con ID que no existe
                result = self.service.update_activo(999, activo_data)
                self.assertIsNone(result)
    
    def test_delete_activo(self):
        """Test para el método delete_activo."""
        result = self.service.delete_activo(self.activo1.id)
        self.assertTrue(result)
        
        # Verificar que se eliminó de la base de datos
        self.assertFalse(Activo.objects.filter(id=self.activo1.id).exists())
        
        # Probar con ID que no existe
        result = self.service.delete_activo(999)
        self.assertFalse(result)
    
    def test_process_activo(self):
        """Test para el método process_activo."""
        today = timezone.now().date()
        
        # Crear datos históricos para el test
        for i in range(10):
            StockData.objects.create(
                ticker="AAPL",
                date=today - timedelta(days=i),
                open=150.0 + i,
                high=155.0 + i,
                low=145.0 + i,
                close=152.0 + i,
                volume=1000000 + i * 10000
            )
        
        # Mockear la caché
        with patch('api.services.activo_service.cache') as mock_cache:
            # Simular que no hay datos en caché
            mock_cache.get.return_value = None
            
            # Mockear dataframe_from_historical_data
            with patch('api.services.activo_service.dataframe_from_historical_data') as mock_df:
                # Crear un DataFrame ficticio
                import pandas as pd
                df = pd.DataFrame({
                    'date': [today - timedelta(days=i) for i in range(10)],
                    'close_price': [152.0 + i for i in range(10)]
                })
                mock_df.return_value = df
                
                # Mockear calculate_triple_ema y evaluar_cruce
                with patch('api.services.activo_service.calculate_triple_ema') as mock_triple:
                    with patch('api.services.activo_service.evaluar_cruce') as mock_evaluar:
                        with patch('api.services.activo_service.calculate_rsi') as mock_rsi:
                            # Configurar mocks
                            mock_triple.return_value = [{'Cruce': 1}]
                            mock_evaluar.return_value = 1
                            mock_rsi.return_value = pd.Series([70.0])
                            
                            result = self.service.process_activo(self.activo1)
                            
                            # Verificar resultado
                            self.assertEqual(result['precioActual'], 161.0)  # El último valor en el DataFrame
                            self.assertIn("resultadoTriple", json.loads(result['recomendacion']))
                            self.assertIn("rsi", json.loads(result['recomendacion']))
                            
                            # Verificar que se guardó en caché
                            mock_cache.set.assert_called_once()
    
    def test_validate_activo_data(self):
        """Test para el método _validate_activo_data."""
        # Datos válidos
        valid_data = {
            "ticker": "GOOGL",
            "nombre": "Alphabet Inc.",
            "cantidad": 2,
            "precioCompra": 1500.0
        }
        
        # No debería lanzar excepción
        self.service._validate_activo_data(valid_data)
        
        # Datos inválidos - sin ticker
        invalid_data = {
            "nombre": "Alphabet Inc.",
            "cantidad": 2,
            "precioCompra": 1500.0
        }
        
        # Debería lanzar ValidationException
        with self.assertRaises(ValueError):
            self.service._validate_activo_data(invalid_data)
        
        # Datos inválidos - precio negativo
        invalid_data = {
            "ticker": "GOOGL",
            "nombre": "Alphabet Inc.",
            "cantidad": 2,
            "precioCompra": -1500.0
        }
        
        # Debería lanzar ValidationException
        with self.assertRaises(ValueError):
            self.service._validate_activo_data(invalid_data)
        
        # En modo actualización, no se requiere ticker
        update_data = {
            "precioActual": 1600.0
        }
        
        # No debería lanzar excepción
        self.service._validate_activo_data(update_data, update=True)


class TestStockDataService(TestCase):
    """Tests para StockDataService."""

    def setUp(self):
        """Configuración inicial para los tests."""
        # Crear datos históricos de prueba
        today = timezone.now().date()
        
        for i in range(10):
            StockData.objects.create(
                ticker="AAPL",
                date=today - timedelta(days=i),
                open=150.0 + i,
                high=155.0 + i,
                low=145.0 + i,
                close=152.0 + i,
                volume=1000000 + i * 10000
            )
        
        self.service = StockDataService()
    
    def test_import_stock_data(self):
        """Test para el método import_stock_data."""
        today = timezone.now().date()
        stock_data_list = [
            {
                "ticker": "AMZN",
                "date": today - timedelta(days=i),
                "open": 3000.0 + i,
                "high": 3010.0 + i,
                "low": 2990.0 + i,
                "close": 3005.0 + i,
                "volume": 200000 + i * 1000
            }
            for i in range(3)
        ]
        
        count = self.service.import_stock_data(stock_data_list)
        self.assertEqual(count, 3)
        
        # Verificar que se guardaron en la base de datos
        self.assertEqual(StockData.objects.filter(ticker="AMZN").count(), 3)
        
        # Probar con error
        with patch('api.repositories.activo_repository.StockDataRepository.bulk_create') as mock_bulk_create:
            mock_bulk_create.side_effect = Exception("Test error")
            
            with self.assertRaises(Exception):
                self.service.import_stock_data(stock_data_list)
    
    def test_get_data_for_analysis(self):
        """Test para el método get_data_for_analysis."""
        today = timezone.now().date()
        start_date = today - timedelta(days=5)
        
        # Sin filtros de fecha
        data = self.service.get_data_for_analysis("AAPL")
        self.assertEqual(len(data), 10)
        
        # Con filtro de fecha de inicio
        data = self.service.get_data_for_analysis("AAPL", start_date=start_date)
        self.assertEqual(len(data), 6)  # Incluye hoy y los últimos 5 días
        
        # Verificar que los datos están formateados correctamente
        self.assertIn('date', data[0])
        self.assertIn('open', data[0])
        self.assertIn('high', data[0])
        self.assertIn('low', data[0])
        self.assertIn('close', data[0])
        self.assertIn('volume', data[0])
        self.assertIn('ticker', data[0])
        
        # Verificar que los valores numéricos son float
        self.assertIsInstance(data[0]['open'], float)
        self.assertIsInstance(data[0]['high'], float)
        self.assertIsInstance(data[0]['low'], float)
        self.assertIsInstance(data[0]['close'], float)
        self.assertIsInstance(data[0]['volume'], float)
