from datetime import datetime, timedelta
import yfinance as yf
from django.core.management.base import BaseCommand
from django.db import transaction
from api.models import StockData
from concurrent.futures import ThreadPoolExecutor, as_completed

class Command(BaseCommand):
    help = 'Import daily stock data from Yahoo Finance'

    def fetch_and_save_stock_data(self, tickers, start_date, end_date):
        """Descargar y guardar datos del stock de manera sincrónica."""
        self.stdout.write(f'Descargando datos desde {start_date} hasta {end_date} para los tickers: {", ".join(tickers)}...')
        
        # Descargar datos del stock para todos los tickers de una sola vez
        stock_data = yf.download(
            tickers=tickers,
            start=start_date,
            end=end_date,
            threads=True,
            group_by='ticker'
        )

        updates = []
        
        for ticker in tickers:
            # Si hay datos para el ticker
            if ticker in stock_data:
                ticker_data = stock_data[ticker]
                
                for index, row in ticker_data.iterrows():
                    # Ignorar filas con datos incompletos
                    if not row[['Open', 'High', 'Low', 'Close', 'Volume']].isnull().any():
                        updates.append(
                            StockData(
                                ticker=ticker,
                                date=index.date(),  # Asegurarse de convertir el índice a fecha
                                open_price=row['Open'],
                                high_price=row['High'],
                                low_price=row['Low'],
                                close_price=row['Close'],
                                volume=int(row['Volume']),
                            )
                        )
        
        # Guardar los datos en la base de datos con multithreading
        self.save_to_db_multithreaded(updates)
        self.stdout.write(self.style.SUCCESS(f'Datos actualizados para los tickers: {", ".join(tickers)}.'))

    @staticmethod
    def save_to_db_multithreaded(updates, chunk_size=500, max_workers=5):
        """Guardar datos en la base de datos de manera transaccional usando multithreading."""
        def save_chunk(chunk):
            with transaction.atomic():
                created = StockData.objects.bulk_create(chunk, ignore_conflicts=True)
                return len(created)

        if updates:
            chunks = [updates[i:i + chunk_size] for i in range(0, len(updates), chunk_size)]
            total_inserted = 0

            with ThreadPoolExecutor(max_workers=max_workers) as executor:
                futures = {executor.submit(save_chunk, chunk): chunk for chunk in chunks}
                for future in as_completed(futures):
                    total_inserted += future.result()

            print(f'Se han insertado {total_inserted} registros.')
        else:
            print('No hay datos nuevos para guardar.')

    def handle(self, *args, **kwargs):
        tickers = ['AAL', 'AAPL', 'ABEV', 'ABNB', 'ADBE', 'AEG', 'AMD', 'AMZN', 'ARCO', 'ARKK', 'AVY', 'BABA', 'BAD', 'BIDU', 'BITF', 'BP', 'BSBR', 'C', 'CCL', 'COIN', 'CRM', 'CSCO', 'CVS', 'CVX', 'DE', 'DESP', 'DIA', 'EEMD', 'ERJ', 'EWZ', 'FDX', 'FSLR', 'GE', 'GLOB', 'GM', 'GOOGL', 'GS', 'HD', 'HMY', 'HOG', 'HPQ', 'HUT', 'INTC', 'JMIA', 'JNJ', 'JPM', 'KMB', 'KO', 'KOD', 'LAC', 'LRCX', 'MCD', 'MDLZ', 'MELI', 'META', 'MOD', 'MRVL', 'MSFT', 'MSTR', 'NFLX', 'NGG', 'NIO', 'NKE', 'NVDA', 'PAGS', 'PANW', 'PBR', 'PEP', 'PFE', 'PHG', 'PYPL', 'QCOM', 'QQQ', 'QQQD', 'RIOT', 'ROKU', 'RTX', 'SATL', 'SBUX', 'SDA', 'SHEL', 'SHOP', 'SLB', 'SNOW', 'SONY', 'SPCE', 'SPGI', 'SPOT', 'SPY', 'SPYD', 'STNE', 'T', 'TD', 'TGT', 'TM', 'TRIP', 'TSLA', 'TSM', 'TTE', 'TWLO', 'TXN', 'UBER', 'UGP', 'UPST', 'V', 'VALE', 'VIST', 'WBA', 'WMT', 'X', 'XLF', 'XOM', 'XP', 'ZM']  # Lista de tickers

        # Dividir los tickers en bloques de 50
        ticker_blocks = [tickers[i:i + 50] for i in range(0, len(tickers), 50)]

        # Obtener la última fecha disponible en la base de datos
        last_record = StockData.objects.order_by('-date').first()
        
        if last_record:
            start_date = last_record.date + timedelta(days=1)
        else:
            start_date = datetime.strptime('2015-01-01', '%Y-%m-%d').date()

        end_date = datetime.now().date()

        # Descargar y guardar los datos de todos los bloques de tickers
        for block in ticker_blocks:
            self.fetch_and_save_stock_data(block, start_date, end_date)