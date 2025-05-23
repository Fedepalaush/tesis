-- Crear la tabla si no existe
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

-- Crear índice para acelerar consultas por ticker y fecha
CREATE INDEX IF NOT EXISTS idx_ticker_date ON api_stockdata (ticker, date);

-- Agregar restricción de unicidad si no existe aún
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'unique_ticker_date'
          AND conrelid = 'api_stockdata'::regclass
    ) THEN
        ALTER TABLE api_stockdata
        ADD CONSTRAINT unique_ticker_date UNIQUE (ticker, date);
    END IF;
END$$;
