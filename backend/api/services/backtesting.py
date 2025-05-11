import json
import pandas as pd
from datetime import datetime
from ..models import StockData
from .estrategias.custom_strategy import CustomStrategy
from backtesting import Backtest

def run_backtest_service(data):
    """
    Lógica para ejecutar el backtest.
    """

    # Validación de datos de entrada
    required_fields = ['ticker', 'inicio', 'fin', 'rapida', 'lenta', 'tp_percentage', 'sl_percentage', 'strategies', 'initial_cash']
    for field in required_fields:
        if field not in data:
            return {'error': f'Missing field: {field}'}

    ticker = data['ticker']
    inicio = data['inicio']
    fin = data['fin']
    rapida = data['rapida']
    lenta = data['lenta']
    tp_percentage = data['tp_percentage']
    sl_percentage = data['sl_percentage']
    strategies = data['strategies']
    initial_cash = data["initial_cash"]

    # Validar y convertir las fechas
    try:
        inicio = datetime.strptime(inicio, '%Y-%m-%d')
        fin = datetime.strptime(fin, '%Y-%m-%d')
    except ValueError:
        return {'error': 'Invalid date format. Use YYYY-MM-DD.'}

    # Obtener datos de la base de datos
    queryset = StockData.objects.filter(
        ticker=ticker,
        date__range=[inicio, fin]
    ).order_by('date')
    if not queryset.exists():
        return {'error': 'No data found for the given ticker and date range.'}

    # Convertir los resultados del queryset a un DataFrame de pandas
    data = pd.DataFrame.from_records(queryset.values('date', 'open_price', 'high_price', 'low_price', 'close_price', 'volume'))
    
    # Convertir la columna 'date' a datetime
    data['date'] = pd.to_datetime(data['date'], errors='coerce')
    data.set_index('date', inplace=True)  # Establecer la fecha como índice
    data.columns = ['Open', 'High', 'Low', 'Close', 'Volume']  # Ajustar los nombres de las columnas

    # Configurar estrategia personalizada
    CustomStrategy.rapida = rapida
    CustomStrategy.lenta = lenta
    CustomStrategy.tp_percentage = tp_percentage
    CustomStrategy.sl_percentage = sl_percentage
    CustomStrategy.use_sma_cross = strategies.get('smaCross', False)
    CustomStrategy.use_rsi = strategies.get('rsi', False)
    CustomStrategy.rsi_params = strategies.get('rsiParams', {'overboughtLevel': 70, 'oversoldLevel': 30})
    # Ejecutar el backtest
    bt = Backtest(data, CustomStrategy, cash=int(initial_cash))
    stats = bt.run()

    # Convertir estadísticas adicionales en un diccionario
    stats_dict = {
        'Start': stats['Start'].strftime('%Y-%m-%d'),
        'End': stats['End'].strftime('%Y-%m-%d'),
        'Duration': str(stats['Duration']),
        'Exposure Time [%]': stats['Exposure Time [%]'],
        'Equity Final [$]': stats['Equity Final [$]'],
        'Equity Peak [$]': stats['Equity Peak [$]'],
        'Return [%]': stats['Return [%]'],
        'Buy & Hold Return [%]': stats['Buy & Hold Return [%]'],
        'Return (Ann.) [%]': stats['Return (Ann.) [%]'],
        'Volatility (Ann.) [%]': stats['Volatility (Ann.) [%]'],
        'Sharpe Ratio': stats['Sharpe Ratio'],
        'Sortino Ratio': stats['Sortino Ratio'],
        'Calmar Ratio': stats['Calmar Ratio'],
        'Max. Drawdown [%]': stats['Max. Drawdown [%]'],
        'Avg. Drawdown [%]': stats['Avg. Drawdown [%]'],
        'Max. Drawdown Duration': str(stats['Max. Drawdown Duration']),
        'Avg. Drawdown Duration': str(stats['Avg. Drawdown Duration']),
        'Trades': stats['_trades'].to_dict(orient='records'),
        'Equity Curve': stats['_equity_curve'].to_dict(orient='records')
    }

    return stats_dict
