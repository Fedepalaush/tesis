import numpy as np

def calculate_signal(data, short_span, long_span, days_to_consider):
    short_ema_col = f'EMA_{short_span}'
    long_ema_col = f'EMA_{long_span}'

    data[short_ema_col] = data['close_price'].ewm(span=short_span, adjust=False).mean()
    data[long_ema_col] = data['close_price'].ewm(span=long_span, adjust=False).mean()
    data['Cross'] = np.where(data[short_ema_col] > data[long_ema_col], 1, -1)
    data['Signal'] = data['Cross'].diff()

    recent_signals = data['Signal'].tail(days_to_consider)
    contains_upward_cross = (recent_signals == 2).any()
    contains_downward_cross = (recent_signals == -2).any()

    if contains_upward_cross and contains_downward_cross:
        return 0  # Neutral
    elif contains_upward_cross:
        return 1  # Cruce al alza
    elif contains_downward_cross:
        return -1  # Cruce a la baja
    return 0
