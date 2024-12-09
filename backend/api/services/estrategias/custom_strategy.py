from backtesting import Strategy, Backtest
import pandas_ta as ta
import pandas as pd
from backtesting.lib import crossover


class CustomStrategy(Strategy):
    rapida = 10
    lenta = 20
    tp_percentage = 0.10
    sl_percentage = 0.08
    use_sma_cross = False
    use_rsi = False
    rsi_params = {'overboughtLevel': 70, 'oversoldLevel': 30}

    def init(self):
        close = pd.Series(self.data.Close)

        if self.use_sma_cross:
            self.ema_rapida = self.I(ta.ema, close, self.rapida)
            self.ema_lenta = self.I(ta.ema, close, self.lenta)

        if self.use_rsi:
            self.rsi = self.I(ta.rsi, close)

    def next(self):
        last_close = self.data.Close[-1]

        if self.position:
            # Si hay una posición abierta, verificar condiciones de cierre
            if (self.use_sma_cross and crossover(self.ema_lenta, self.ema_rapida)) or (self.use_rsi and self.rsi > self.rsi_params['overboughtLevel']):
                self.position.close()
            return

        # Condiciones de compra
        if self.use_sma_cross and self.use_rsi:
            if crossover(self.ema_rapida, self.ema_lenta) and (self.rsi < self.rsi_params['oversoldLevel']):
                
                self.buy(tp=last_close * (1 + self.tp_percentage), sl=last_close * (1 - self.sl_percentage))
        elif self.use_sma_cross:
            if crossover(self.ema_rapida, self.ema_lenta):
                self.buy(tp=last_close * (1 + self.tp_percentage), sl=last_close * (1 - self.sl_percentage))
        elif self.use_rsi:
            if self.rsi < self.rsi_params['oversoldLevel']:
                self.buy(tp=last_close * (1 + self.tp_percentage), sl=last_close * (1 - self.sl_percentage))