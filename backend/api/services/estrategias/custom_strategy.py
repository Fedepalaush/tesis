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
            if (self.use_sma_cross and crossover(self.ema_lenta, self.ema_rapida)) or (self.use_rsi and self.rsi > self.rsi_params['overboughtLevel']):
                self.position.close()
            return

        if self.use_sma_cross and self.use_rsi:
            if crossover(self.ema_rapida, self.ema_lenta) and (self.rsi < self.rsi_params['oversoldLevel']):
                self.buy(tp=last_close * (1 + self.tp_percentage), sl=last_close * (1 - self.sl_percentage))
        elif self.use_sma_cross:
            if crossover(self.ema_rapida, self.ema_lenta):
                self.buy(tp=last_close * (1 + self.tp_percentage), sl=last_close * (1 - self.sl_percentage))
        elif self.use_rsi:
            if self.rsi < self.rsi_params['oversoldLevel']:
                self.buy(tp=last_close * (1 + self.tp_percentage), sl=last_close * (1 - self.sl_percentage))

    def set_strategy_params(self, rapida=None, lenta=None, tp_percentage=None, sl_percentage=None, use_sma_cross=None, use_rsi=None, rsi_params=None):
        if rapida is not None:
            self.rapida = rapida
        if lenta is not None:
            self.lenta = lenta
        if tp_percentage is not None:
            self.tp_percentage = tp_percentage
        if sl_percentage is not None:
            self.sl_percentage = sl_percentage
        if use_sma_cross is not None:
            self.use_sma_cross = use_sma_cross
        if use_rsi is not None:
            self.use_rsi = use_rsi
        if rsi_params is not None:
            self.rsi_params = rsi_params

    @staticmethod
    def create_sma_cross_strategy(rapida, lenta, tp_percentage, sl_percentage):
        strategy = CustomStrategy()
        strategy.set_strategy_params(rapida=rapida, lenta=lenta, tp_percentage=tp_percentage, sl_percentage=sl_percentage, use_sma_cross=True, use_rsi=False)
        return strategy

    @staticmethod
    def create_rsi_strategy(tp_percentage, sl_percentage, rsi_params):
        strategy = CustomStrategy()
        strategy.set_strategy_params(tp_percentage=tp_percentage, sl_percentage=sl_percentage, use_sma_cross=False, use_rsi=True, rsi_params=rsi_params)
        return strategy

    @staticmethod
    def create_combined_strategy(rapida, lenta, tp_percentage, sl_percentage, rsi_params):
        strategy = CustomStrategy()
        strategy.set_strategy_params(rapida=rapida, lenta=lenta, tp_percentage=tp_percentage, sl_percentage=sl_percentage, use_sma_cross=True, use_rsi=True, rsi_params=rsi_params)
        return strategy

class StrategyFactory:
    @staticmethod
    def create_strategy(strategy_type, **kwargs):
        if strategy_type == 'sma_cross':
            return CustomStrategy.create_sma_cross_strategy(**kwargs)
        elif strategy_type == 'rsi':
            return CustomStrategy.create_rsi_strategy(**kwargs)
        elif strategy_type == 'combined':
            return CustomStrategy.create_combined_strategy(**kwargs)
        else:
            raise ValueError(f"Unknown strategy type: {strategy_type}")

class StrategyContext:
    def __init__(self, strategy):
        self.strategy = strategy

    def execute(self, data):
        bt = Backtest(data, self.strategy, cash=10000, commission=.002)
        stats = bt.run()
        return stats

    def set_strategy(self, strategy):
        self.strategy = strategy

    def get_strategy(self):
        return self.strategy

    def update_strategy_params(self, **params):
        self.strategy.set_strategy_params(**params)
