# utils.py (o cualquier archivo donde quieras definirla)
from datetime import datetime, timedelta
import yfinance as yf
from ..models import StockData

def import_stock_data():
    tickers = ['AAL', 'ZM']
    
    for ticker in tickers:
        last_date = StockData.objects.filter(ticker=ticker).order_by('-date').first()
        start_date = last_date.date + timedelta(days=1) if last_date else datetime.strptime('2015-01-01', '%Y-%m-%d').date()
        end_date = datetime.now().date()

        if start_date < end_date:
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
    print("Importación de datos de acciones completada.")
