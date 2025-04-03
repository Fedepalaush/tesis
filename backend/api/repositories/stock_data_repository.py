from django.utils import timezone
from datetime import timedelta
from ..models import StockData

class StockDataRepository:
    def get_historical_data(self, ticker, start_date):
        """
        Obtiene datos históricos para un ticker específico desde una fecha de inicio.
        """
        return StockData.objects.filter(ticker=ticker, date__gte=start_date).order_by('date')

    def get_recent_data(self, ticker, days=30):
        """
        Obtiene datos recientes para un ticker específico en los últimos días.
        """
        start_date = timezone.now() - timedelta(days=days)
        return StockData.objects.filter(ticker=ticker, date__gte=start_date).order_by('date')

    def get_data_by_date_range(self, ticker, start_date, end_date):
        """
        Obtiene datos para un ticker específico dentro de un rango de fechas.
        """
        return StockData.objects.filter(ticker=ticker, date__range=(start_date, end_date)).order_by('date')
    
    def get_latest_data(self, ticker):
        """
        Obtiene el dato más reciente para un ticker específico.
        """
        return StockData.objects.filter(ticker=ticker).order_by('-date').first()

    def get_data_by_volume(self, ticker, min_volume):
        """
        Obtiene datos para un ticker específico con un volumen mínimo.
        """
        return StockData.objects.filter(ticker=ticker, volume__gte=min_volume).order_by('date')
