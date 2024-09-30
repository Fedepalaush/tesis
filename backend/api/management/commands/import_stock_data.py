import yfinance as yf
from django.core.management.base import BaseCommand
from api.models import StockData
from datetime import datetime, timedelta

class Command(BaseCommand):
    help = 'Import daily stock data from Yahoo Finance'

    def handle(self, *args, **kwargs):
        tickers = ['AAL', 'AAPL', 'ABEV', 'ABNB', 'ADBE', 'AEG', 'AMD', 'AMZN', 'ARCO', 'ARKK', 'AVY', 'BABA', 'BAD', 'BIDU', 'BITF', 'BP', 'BSBR', 'C', 'CCL', 'COIN', 'CRM', 'CSCO', 'CVS', 'CVX', 'DE', 'DESP', 'DIA', 'EEMD', 'ERJ', 'EWZ', 'FDX', 'FSLR', 'GE', 'GLOB', 'GM', 'GOOGL', 'GS', 'HD', 'HMY', 'HOG', 'HPQ', 'HUT', 'INTC', 'JMIA', 'JNJ', 'JPM', 'KMB', 'KO', 'KOD', 'LAC', 'LRCX', 'MCD', 'MDLZ', 'MELI', 'META', 'MOD', 'MRVL', 'MSFT', 'MSTR', 'NFLX', 'NGG', 'NIO', 'NKE', 'NVDA', 'PAGS', 'PANW', 'PBR', 'PEP', 'PFE', 'PHG', 'PYPL', 'QCOM', 'QQQ', 'QQQD', 'RIOT', 'ROKU', 'RTX', 'SATL', 'SBUX', 'SDA', 'SHEL', 'SHOP', 'SLB', 'SNOW', 'SONY', 'SPCE', 'SPGI', 'SPOT', 'SPY', 'SPYD', 'STNE', 'T', 'TD', 'TGT', 'TM', 'TRIP', 'TSLA', 'TSM', 'TTE', 'TWLO', 'TXN', 'UBER', 'UGP', 'UPST', 'V', 'VALE', 'VIST', 'WBA', 'WMT', 'X', 'XLF', 'XOM', 'XP', 'ZM']  

        for ticker in tickers:
            self.stdout.write(f'Procesando {ticker}...')

            # Obtener la última fecha disponible en la base de datos
            last_date = StockData.objects.filter(ticker=ticker).order_by('-date').first()
            
            if last_date:
                start_date = last_date.date + timedelta(days=1)  # Día siguiente al último registrado
            else:
                # Si no hay datos previos, convertir la fecha de inicio a objeto datetime.date
                start_date = datetime.strptime('2015-01-01', '%Y-%m-%d').date()  # Fecha inicial si no hay datos
            
            # Asegúrate de que end_date también sea datetime.date
            end_date = datetime.now().date()

            # Descargar nuevos datos solo si start_date es antes de end_date
            if start_date < end_date:
                self.stdout.write(f'Descargando datos desde {start_date} hasta {end_date} para {ticker}...')
                stock_data = yf.download(ticker, start=start_date, end=end_date)

                for index, row in stock_data.iterrows():
                    StockData.objects.update_or_create(
                        ticker=ticker,
                        date=index.date(),
                        defaults={
                            'open_price': row['Open'],
                            'high_price': row['High'],
                            'low_price': row['Low'],
                            'close_price': row['Close'],
                            'volume': row['Volume'],
                        }
                    )
                self.stdout.write(self.style.SUCCESS(f'Datos actualizados para {ticker}.'))
            else:
                self.stdout.write(f'No hay datos nuevos para {ticker}.')