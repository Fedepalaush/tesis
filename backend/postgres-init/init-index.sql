CREATE TABLE IF NOT EXISTS api_stockdata (
    id SERIAL PRIMARY KEY,
    ticker TEXT NOT NULL,
    date DATE NOT NULL,
    open_price NUMERIC,
    high_price NUMERIC,
    low_price NUMERIC,
    close_price NUMERIC,
    volume BIGINT
);

CREATE INDEX IF NOT EXISTS idx_ticker_date ON api_stockdata (ticker, date);