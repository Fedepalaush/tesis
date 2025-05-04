from datetime import datetime, timedelta
import os
import yfinance as yf
from django.core.management.base import BaseCommand
from django.db import transaction
import pandas as pd
from api.models import StockData

LAST_EXECUTION_FILE = "last_execution.log"

def get_last_execution():
    """Obtener la última ejecución desde un archivo."""
    if os.path.exists(LAST_EXECUTION_FILE):
        with open(LAST_EXECUTION_FILE, "r") as f:
            return f.read().strip()
    return "No hay registros previos."

def save_last_execution():
    """Guardar la última ejecución en un archivo."""
    with open(LAST_EXECUTION_FILE, "w") as f:
        f.write(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

class Command(BaseCommand):
    help = 'Import daily stock data from Yahoo Finance'

    def fetch_and_save_stock_data(self, tickers, start_date, end_date, full_download=False):
        """Descargar y guardar datos del stock."""
        self.stdout.write(f'Descargando datos desde {start_date} hasta {end_date} para: {", ".join(tickers)}...')

        stock_data = yf.download(
            tickers=tickers,
            start=start_date,
            end=end_date,
            threads=True,
            group_by='ticker',
            auto_adjust=False
        )

        updates = []
        
        if isinstance(stock_data.columns, pd.MultiIndex):
            for ticker in tickers:
                if ticker in stock_data.columns.get_level_values(0):
                    ticker_data = stock_data[ticker]
                    for index, row in ticker_data.iterrows():
                        if not row[['Open', 'High', 'Low', 'Close', 'Volume']].isnull().any():
                            updates.append(
                                StockData(
                                    ticker=ticker,
                                    date=index.to_pydatetime(),
                                    open_price=row['Open'],
                                    high_price=row['High'],
                                    low_price=row['Low'],
                                    close_price=row['Close'],
                                    volume=int(row['Volume']),
                                )
                            )
        else:
            ticker = tickers[0] if isinstance(tickers, list) else tickers
            for index, row in stock_data.iterrows():
                if not row[['Open', 'High', 'Low', 'Close', 'Volume']].isnull().any():
                    updates.append(
                        StockData(
                            ticker=ticker,
                            date=index.to_pydatetime(),
                            open_price=row['Open'],
                            high_price=row['High'],
                            low_price=row['Low'],
                            close_price=row['Close'],
                            volume=int(row['Volume']),
                        )
                    )
        
        self.save_to_db(updates)
        self.stdout.write(self.style.SUCCESS(f'Datos actualizados para: {", ".join(tickers)}'))

    def save_to_db(self, updates, chunk_size=500):
        """Guardar datos en la base de datos por chunks."""
        if not updates:
            self.stdout.write('No hay datos nuevos para guardar.')
            return

        total_inserted = 0
        for i in range(0, len(updates), chunk_size):
            chunk = updates[i:i+chunk_size]
            with transaction.atomic():
                inserted = StockData.objects.bulk_create(
                    chunk,
                    update_conflicts=True,
                    update_fields=['open_price', 'high_price', 'low_price', 'close_price', 'volume'],
                    unique_fields=['ticker', 'date'],
                )
                total_inserted += len(inserted)
        self.stdout.write(f'Se han insertado/actualizado {total_inserted} registros.')

    def handle(self, *args, **kwargs):
        self.stdout.write(f'Última ejecución: {get_last_execution()}')

        tickers = ['^GSPC','AAL', 'AAPL', 'ABEV', 'ABNB', 'ADBE', 'AEG', 'AMD', 'AMZN', 'ARCO', 'ARKK', 'AVY', 'BABA', 'BIDU', 'BITF', 'BP', 'BSBR', 'C', 'CCL', 'COIN', 'CRM', 'CSCO', 'CVS', 'CVX', 'DE', 'DESP', 'DIA', 'ERJ', 'EWZ', 'FDX', 'FSLR', 'GE', 'GLOB', 'GM', 'GOOGL', 'GS', 'HD', 'HMY', 'HOG', 'HPQ', 'HUT', 'INTC', 'JMIA', 'JNJ', 'JPM', 'KMB', 'KO', 'KOD', 'LAC', 'LRCX', 'MCD', 'MDLZ', 'MELI', 'META', 'MOD', 'MRVL', 'MSFT', 'MSTR', 'NFLX', 'NGG', 'NIO', 'NKE', 'NVDA', 'PAGS', 'PANW', 'PBR', 'PEP', 'PFE', 'PHG', 'PYPL', 'QCOM', 'QQQ', 'QQQD', 'RIOT', 'ROKU', 'RTX', 'SATL', 'SBUX', 'SDA', 'SHEL', 'SHOP', 'SLB', 'SNOW','SPCE', 'SPGI', 'SPOT', 'SPY', 'SPYD', 'STNE', 'T', 'TD', 'TGT', 'TM', 'TRIP', 'TSLA', 'TSM', 'TTE', 'TWLO', 'TXN', 'UBER', 'UGP', 'UPST', 'V', 'VALE', 'VIST', 'WBA', 'WMT', 'X', 'XLF', 'XOM', 'XP', 'ZM', 'AE']

        ticker_blocks = [tickers[i:i + 50] for i in range(0, len(tickers), 50)]

        # Obtener los tickers ya almacenados en la base de datos
        stored_tickers = StockData.objects.values_list('ticker', flat=True).distinct()

        # Filtrar los nuevos tickers
        new_tickers = [ticker for ticker in tickers if ticker not in stored_tickers]

        # Para los tickers nuevos, descargamos toda la información desde el primer día
        if new_tickers:
            for ticker in new_tickers:
                self.stdout.write(f'Descargando datos completos para el nuevo ticker: {ticker}...')
                self.fetch_and_save_stock_data([ticker], datetime(2015, 1, 1).date(), datetime.now().date(), full_download=True)

        # Descargamos los datos faltantes para los tickers existentes
        last_record = StockData.objects.order_by('-date').first()
        if last_record:
            start_date = last_record.date + timedelta(days=1)
        else:
            start_date = datetime.strptime('2015-01-01', '%Y-%m-%d').date()

        end_date = datetime.now().date()

        for block in ticker_blocks:
            self.fetch_and_save_stock_data(block, start_date, end_date)

        save_last_execution()
