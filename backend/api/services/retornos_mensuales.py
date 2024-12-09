# api/services/retornos_mensuales.py
import pandas as pd
from ..models import StockData

def calcular_retornos_mensuales(ticker: str, years: int):
    # Consultar los datos históricos del ticker desde la base de datos
    stock_data = StockData.objects.filter(
        ticker=ticker,
        date__gte=pd.Timestamp.now() - pd.DateOffset(years=years)
    ).values('date', 'close_price').order_by('date')

    # Convertir los datos a un DataFrame
    df = pd.DataFrame(list(stock_data))

    if df.empty:
        return None  # No hay datos disponibles

    # Procesar los datos
    df['date'] = pd.to_datetime(df['date'])
    df.set_index('date', inplace=True)

    # Calcular los retornos mensuales
    df['Month'] = df.index.to_period('M')
    monthly_returns = df['close_price'].resample('M').ffill().pct_change()

    # Crear una tabla pivot para retornos mensuales
    monthly_returns = monthly_returns.to_frame().reset_index()
    monthly_returns['Year'] = monthly_returns['date'].dt.year
    monthly_returns['Month'] = monthly_returns['date'].dt.month

    pivot_table = monthly_returns.pivot_table(values='close_price', index='Year', columns='Month')

    # Convertir la tabla pivot a un formato adecuado para la respuesta JSON
    data_for_plotly = []
    for year in pivot_table.index:
        for month in pivot_table.columns:
            value = pivot_table.loc[year, month]
            data_for_plotly.append({
                'year': year,
                'month': month,
                'return': value if pd.notna(value) else None
            })

    return data_for_plotly
