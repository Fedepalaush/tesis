import yfinance as yf
from django.core.cache import cache

def get_fundamental_data(ticker):
    # Usar cache para obtener datos si están disponibles
    cache_key = f'fundamental_info_{ticker}'
    cached_data = cache.get(cache_key)

    if cached_data:
        return cached_data

    try:
        # Crear objeto Ticker usando yfinance
        ticker_obj = yf.Ticker(ticker)
        
        # Obtener datos financieros
        cashflows = ticker_obj.get_cashflow()
        balance = ticker_obj.get_balance_sheet()
        income = ticker_obj.get_income_stmt()

        # Función para eliminar columnas con más de 10 NaNs
        def drop_columns_with_many_nans(df):
            if not df.empty:
                return df.dropna(axis=1, thresh=len(df) - 10)
            return df

        # Eliminar columnas con más de 10 NaNs
        cashflows = drop_columns_with_many_nans(cashflows)
        balance = drop_columns_with_many_nans(balance)
        income = drop_columns_with_many_nans(income)

        # Convertir DataFrames a JSON
        cashflows_json = cashflows.to_json(date_format='iso') if not cashflows.empty else None
        balance_json = balance.to_json(date_format='iso') if not balance.empty else None
        income_json = income.to_json(date_format='iso') if not income.empty else None

        # Extraer deuda a largo y corto plazo
        long_term_debt = (
            balance.get('LongTermDebt').values[0]
            if 'LongTermDebt' in balance.columns else 0
        )
        current_debt = (
            balance.get('CurrentDebt').values[0]
            if 'CurrentDebt' in balance.columns else 0
        )

        # Datos fundamentales para incluir en la respuesta
        fundamental_data = {
            'cash_flow': cashflows_json,
            'balance': balance_json,
            'income': income_json,
            'long_term_debt': long_term_debt,
            'current_debt': current_debt
        }

        # Almacenar en cache por 1 hora (3600 segundos)
        cache.set(cache_key, fundamental_data, timeout=3600)

        return fundamental_data

    except Exception as e:
        raise ValueError(f'Failed to retrieve data for {ticker}: {str(e)}')

