import React, { useState, useEffect } from "react";
import axios from "axios";
import Plot from "react-plotly.js";
import { tickersBM } from "../ticker";
import BaseLayout from "../components/BaseLayout";

const MediasMoviles = () => {
  const [ema4, setEma4] = useState(4);
  const [ema9, setEma9] = useState(9);
  const [ema18, setEma18] = useState(18);
  const [useTriple, setUseTriple] = useState(true);
  const [tickers, setTickers] = useState(tickersBM);
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(false);

  // Efecto que se ejecuta cada vez que cambia useTriple
  useEffect(() => {
    setSignals([]); // Restablece las señales al cambiar el tipo de EMA
  }, [useTriple]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/get_ema_signals/", {
        params: {
          tickers,
          ema4,
          ema9,
          ema18: useTriple ? ema18 : undefined,
          useTriple,
        },
      });

      const responseData = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
      console.log(responseData);
      setSignals(response.data.signals);
    } catch (error) {
      console.error("Error fetching signals:", error);
    }
    setLoading(false);
  };

  return (
    <div>
      <BaseLayout>
        <div className="ml-16">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-white">Tipo de EMA:</label>
              <select
                value={useTriple ? "triple" : "doble"}
                onChange={(e) => setUseTriple(e.target.value === "triple")}
                className="mt-1 p-2 border border-gray-300 rounded bg-gray-800 text-white"
              >
                <option value="doble">Doble EMA</option>
                <option value="triple">Triple EMA</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-white">EMA4:</label>
              <input
                type="number"
                value={ema4}
                onChange={(e) => setEma4(Number(e.target.value))}
                className="mt-1 p-2 border border-gray-300 rounded bg-gray-800 text-white"
              />
            </div>

            <div className="mb-4">
              <label className="block text-white">EMA9:</label>
              <input
                type="number"
                value={ema9}
                onChange={(e) => setEma9(Number(e.target.value))}
                className="mt-1 p-2 border border-gray-300 rounded bg-gray-800 text-white"
              />
            </div>

            {useTriple && (
              <div className="mb-4">
                <label className="block text-white">EMA18:</label>
                <input
                  type="number"
                  value={ema18}
                  onChange={(e) => setEma18(Number(e.target.value))}
                  className="mt-1 p-2 border border-gray-300 rounded bg-gray-800 text-white"
                />
              </div>
            )}

            <button
              type="submit"
              className="text-white bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
            >
              Obtener señales
            </button>
          </form>

          <div className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div>
                {signals.length > 0 ? (
                  signals.map((signal, index) => (
                    <div key={index} className="mb-4 p-4 bg-gray-800 rounded">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {signal.ticker}
                      </h3>
                      <p className="text-white mb-2">Señal: {signal.signal}</p>
                      <Plot
                        data={[
                          {
                            x: signal.candles.map((candle) => candle.Date),
                            close: signal.candles.map((candle) => candle.Close),
                            high: signal.candles.map((candle) => candle.High),
                            low: signal.candles.map((candle) => candle.Low),
                            open: signal.candles.map((candle) => candle.Open),
                            type: "candlestick",
                            name: signal.ticker,
                          },
                          {
                            x: signal.ema_values.map((ema) => ema.Date),
                            y: signal.ema_values.map((ema) => ema.EMA_4 || ema.EMA_short),
                            type: "scatter",
                            mode: "lines",
                            name: useTriple ? `EMA ${ema4}` : `EMA Short ${ema4}`,
                            line: { color: "green" },
                          },
                          {
                            x: signal.ema_values.map((ema) => ema.Date),
                            y: signal.ema_values.map((ema) => ema.EMA_9 || ema.EMA_long),
                            type: "scatter",
                            mode: "lines",
                            name: useTriple ? `EMA ${ema9}` : `EMA Long ${ema9}`,
                            line: { color: "orange" },
                          },
                          useTriple && {
                            x: signal.ema_values.map((ema) => ema.Date),
                            y: signal.ema_values.map((ema) => ema.EMA_18),
                            type: "scatter",
                            mode: "lines",
                            name: `EMA ${ema18}`,
                            line: { color: "red" },
                          },
                        ].filter(Boolean)}
                        layout={{
                          autosize: true,
                          title: `${signal.ticker}`,
                          plot_bgcolor: "transparent",
                          paper_bgcolor: "transparent",
                          font: { color: "#fff" },
                          xaxis: { type: "category" },
                        }}
                        style={{ width: "100%", height: "400px" }}
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-white">No hay señales disponibles.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </BaseLayout>
    </div>
  );
};

export default MediasMoviles;
