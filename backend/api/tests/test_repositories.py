"""
Tests unitarios para los repositorios.

Este módulo contiene tests unitarios para los repositorios de la aplicación,
verificando su funcionamiento correcto.
"""
import pytest
from django.test import TestCase
from django.utils import timezone
from datetime import timedelta, date

from api.models import Activo, StockData
from api.repositories.activo_repository import ActivoRepository, StockDataRepository


class TestActivoRepository(TestCase):
    """Tests para ActivoRepository."""

    def setUp(self):
        """Configuración inicial para los tests."""
        # Crear activos de prueba
        Activo.objects.create(
            ticker="AAPL",
            nombre="Apple Inc.",
            cantidad=10,
            precioCompra=150.0,
            precioActual=160.0,
            fechaCompra=timezone.now().date()
        )
        
        Activo.objects.create(
            ticker="MSFT",
            nombre="Microsoft Corporation",
            cantidad=5,
            precioCompra=200.0,
            precioActual=210.0,
            fechaCompra=timezone.now().date()
        )
        
        self.repository = ActivoRepository()
    
    def test_get_all(self):
        """Test para el método get_all."""
        activos = self.repository.get_all()
        self.assertEqual(activos.count(), 2)
    
    def test_get_by_id(self):
        """Test para el método get_by_id."""
        activo = Activo.objects.get(ticker="AAPL")
        result = self.repository.get_by_id(activo.id)
        self.assertEqual(result.ticker, "AAPL")
        
        # Probar con ID que no existe
        result = self.repository.get_by_id(999)
        self.assertIsNone(result)
    
    def test_get_by_ticker(self):
        """Test para el método get_by_ticker."""
        result = self.repository.get_by_ticker("MSFT")
        self.assertEqual(result.nombre, "Microsoft Corporation")
        
        # Probar con ticker que no existe
        result = self.repository.get_by_ticker("INVALID")
        self.assertIsNone(result)
    
    def test_create(self):
        """Test para el método create."""
        activo_data = {
            "ticker": "GOOGL",
            "nombre": "Alphabet Inc.",
            "cantidad": 2,
            "precioCompra": 1500.0,
            "precioActual": 1550.0,
            "fechaCompra": timezone.now().date()
        }
        
        result = self.repository.create(activo_data)
        self.assertEqual(result.ticker, "GOOGL")
        self.assertEqual(result.nombre, "Alphabet Inc.")
        
        # Verificar que se guardó en la base de datos
        self.assertTrue(Activo.objects.filter(ticker="GOOGL").exists())
    
    def test_update(self):
        """Test para el método update."""
        activo = Activo.objects.get(ticker="AAPL")
        activo_data = {"precioActual": 170.0, "cantidad": 15}
        
        result = self.repository.update(activo.id, activo_data)
        self.assertEqual(result.precioActual, 170.0)
        self.assertEqual(result.cantidad, 15)
        
        # Verificar que se actualizó en la base de datos
        updated_activo = Activo.objects.get(id=activo.id)
        self.assertEqual(updated_activo.precioActual, 170.0)
        self.assertEqual(updated_activo.cantidad, 15)
        
        # Probar con ID que no existe
        result = self.repository.update(999, activo_data)
        self.assertIsNone(result)
    
    def test_delete(self):
        """Test para el método delete."""
        activo = Activo.objects.get(ticker="MSFT")
        result = self.repository.delete(activo.id)
        self.assertTrue(result)
        
        # Verificar que se eliminó de la base de datos
        self.assertFalse(Activo.objects.filter(ticker="MSFT").exists())
        
        # Probar con ID que no existe
        result = self.repository.delete(999)
        self.assertFalse(result)


class TestStockDataRepository(TestCase):
    """Tests para StockDataRepository."""

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
        
        for i in range(5):
            StockData.objects.create(
                ticker="MSFT",
                date=today - timedelta(days=i),
                open=200.0 + i,
                high=205.0 + i,
                low=195.0 + i,
                close=202.0 + i,
                volume=500000 + i * 10000
            )
        
        self.repository = StockDataRepository()
    
    def test_get_data_by_ticker(self):
        """Test para el método get_data_by_ticker."""
        # Sin filtros de fecha
        data = self.repository.get_data_by_ticker("AAPL")
        self.assertEqual(data.count(), 10)
        
        # Con filtros de fecha
        today = timezone.now().date()
        start_date = today - timedelta(days=5)
        data = self.repository.get_data_by_ticker("AAPL", start_date=start_date)
        self.assertEqual(data.count(), 6)  # Incluye hoy y los últimos 5 días
        
        # Ticker que no existe
        data = self.repository.get_data_by_ticker("INVALID")
        self.assertEqual(data.count(), 0)
    
    def test_get_latest_data_by_ticker(self):
        """Test para el método get_latest_data_by_ticker."""
        latest = self.repository.get_latest_data_by_ticker("AAPL")
        self.assertEqual(latest.date, timezone.now().date())
        
        # Ticker que no existe
        latest = self.repository.get_latest_data_by_ticker("INVALID")
        self.assertIsNone(latest)
    
    def test_create_or_update(self):
        """Test para el método create_or_update."""
        today = timezone.now().date()
        
        # Crear nuevo registro
        stock_data = {
            "ticker": "GOOGL",
            "date": today,
            "open": 1500.0,
            "high": 1510.0,
            "low": 1490.0,
            "close": 1505.0,
            "volume": 300000
        }
        
        result = self.repository.create_or_update(stock_data)
        self.assertEqual(result.ticker, "GOOGL")
        self.assertEqual(result.close, 1505.0)
        
        # Verificar que se guardó en la base de datos
        self.assertTrue(StockData.objects.filter(ticker="GOOGL").exists())
        
        # Actualizar registro existente
        stock_data["close"] = 1520.0
        result = self.repository.create_or_update(stock_data)
        self.assertEqual(result.close, 1520.0)
        
        # Verificar que se actualizó en la base de datos
        updated = StockData.objects.get(ticker="GOOGL", date=today)
        self.assertEqual(updated.close, 1520.0)
    
    def test_bulk_create(self):
        """Test para el método bulk_create."""
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
        
        results = self.repository.bulk_create(stock_data_list)
        self.assertEqual(len(results), 3)
        
        # Verificar que se guardaron en la base de datos
        self.assertEqual(StockData.objects.filter(ticker="AMZN").count(), 3)
