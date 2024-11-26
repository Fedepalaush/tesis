import numpy as np
import pandas as pd
import pandas_ta as ta

def calculate_sma(data, period):
    return ta.sma(data['close_price'], length=period)

def calculate_ema(data, period):
    return ta.ema(data['close_price'], length=period)

def calculate_rsi(data, period=14):
    return ta.rsi(data['close_price'], length=period)

def calculate_indicators(data):

    data['SMA_50'] = calculate_sma(data, 50)
    data['SMA_200'] = calculate_sma(data, 200)
    data['EMA_9'] = calculate_ema(data, 9)
    data['EMA_21'] = calculate_ema(data, 21)
    data['EMA_12'] = calculate_ema(data, 12)
    data['EMA_26'] = calculate_ema(data, 26)
    data['RSI'] = calculate_rsi(data)
    data['EMA_200'] = calculate_ema(data, 200)
    return data
