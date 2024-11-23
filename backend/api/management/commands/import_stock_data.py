import yfinance as yf
from django.core.management.base import BaseCommand
from api.models import StockData
from datetime import datetime, timedelta

class Command(BaseCommand):
    help = 'Import daily stock data from Yahoo Finance'

    def handle(self, *args, **kwargs):
        tickers = ['AAL', 'AAPL']  
        
        for ticker in tickers:
            self.stdout.write(f'Procesando {ticker}...')

            # Obtener la última fecha disponible en la base de datos
            last_record = StockData.objects.filter(ticker=ticker).order_by('-date').first()
            
            if last_record:
                start_date = last_record.date.date() + timedelta(days=1)  # Día siguiente al último registrado
            else:
                start_date = datetime.strptime('2015-01-01', '%Y-%m-%d').date()
            
            end_date = datetime.now().date()

            # Descargar nuevos datos solo si start_date es antes de end_date
            if start_date < end_date:
                self.stdout.write(f'Descargando datos desde {start_date} hasta {end_date} para {ticker}...')
                stock_data = yf.download(ticker, start=start_date, end=end_date)
                print('Esto es envidia')

                for index, row in stock_data.iterrows():
                    print(index)
                    
                    # Ignorar filas con datos incompletos
                    if not row[['Open', 'High', 'Low', 'Close', 'Volume']].isnull().any():
                        StockData.objects.update_or_create(
                            ticker=ticker,
                            date=index,  # El índice es la fecha en stock_data
                            defaults={
                                'open_price': row['Open'],
                                'high_price': row['High'],
                                'low_price': row['Low'],
                                'close_price': row['Close'],
                                'volume': int(row['Volume']),  # Asegurarse de que es un entero
                            }
                            
                        )
                self.stdout.write(self.style.SUCCESS(f'Datos actualizados para {ticker}.'))
            else:
                self.stdout.write(f'No hay datos nuevos para {ticker}.')