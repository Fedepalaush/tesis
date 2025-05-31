from backtesting import Strategy, Backtest
import pandas_ta as ta
import pandas as pd
from backtesting.lib import crossover
import traceback

class CustomStrategy(Strategy):
    rapida = 10
    lenta = 20
    tp_percentage = 0.10
    sl_percentage = 0.08
    use_sma_cross = False
    use_rsi = False
    rsi_params = {'overboughtLevel': 70, 'oversoldLevel': 30}

    def init(self):
        # self.data.df es el DataFrame original con índice datetime y columnas

        # Aseguramos que close sea una Serie pandas float
        close = self.data.df['Close'].astype(float)

        # Guardamos los indicadores solo si están habilitados
        if self.use_sma_cross:
            self.ema_rapida = self.I(ta.ema, close, self.rapida)
            self.ema_lenta = self.I(ta.ema, close, self.lenta)

        if self.use_rsi:
            self.rsi = self.I(ta.rsi, close)

    def next(self):
        try:
            last_close = float(self.data.Close[-1])

            if self.position:
                if self.use_sma_cross:
                    print('EMA rápida última:', self.ema_rapida[-1], 'EMA lenta última:', self.ema_lenta[-1])
                if self.use_rsi:
                    print('RSI última:', self.rsi[-1])

                # Condiciones para cerrar posición
                if self.use_sma_cross and crossover(self.ema_lenta, self.ema_rapida):
                    self.position.close()
                elif self.use_rsi and self.rsi[-1] > self.rsi_params['overboughtLevel']:
                    self.position.close()
                return

            # Condiciones para abrir posición
            if self.use_sma_cross and self.use_rsi:
                if crossover(self.ema_rapida, self.ema_lenta) and (self.rsi[-1] < self.rsi_params['oversoldLevel']):
                    self.buy(tp=last_close * (1 + self.tp_percentage), sl=last_close * (1 - self.sl_percentage))
            elif self.use_sma_cross:
                if crossover(self.ema_rapida, self.ema_lenta):
    
                    self.buy(tp=last_close * (1 + self.tp_percentage), sl=last_close * (1 - self.sl_percentage))
            elif self.use_rsi:

                if self.rsi[-1] < self.rsi_params['oversoldLevel']:

                    self.buy(tp=last_close * (1 + self.tp_percentage), sl=last_close * (1 - self.sl_percentage))
            else:
                print('No se usa ni SMA cross ni RSI para comprar.')

        except Exception as e:
            print('Error en next():', e)
            traceback.print_exc()
            raise
