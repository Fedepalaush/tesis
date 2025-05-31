import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import { fetchEMASignals } from "../api";
import BaseLayout from "../components/BaseLayout";
import { useTickers } from "../TickersContext";

const MediasMoviles = () => {
  const [ema4, setEma4] = useState(4);
  const [ema9, setEma9] = useState(9);
  const [ema18, setEma18] = useState(18);
  const [useTriple, setUseTriple] = useState(true);
  const { tickers } = useTickers();
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSignals([]);
  }, [useTriple]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const responseData = await fetchEMASignals(
        tickers,
        ema4,
        ema9,
        ema18,
        useTriple
      );
      setSignals(responseData.signals);
    } catch (error) {
      console.error("Error fetching signals:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseLayout>
      <div className="bg-black min-h-screen py-8 px-4 md:px-16 text-white">
        <h1 className="text-3xl font-bold mb-6 text-center">Medias Móviles</h1>

        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-900 p-6 rounded-lg shadow-md">
          <div>
            <label className="block mb-1">Tipo de EMA:</label>
            <select
              value={useTriple ? "triple" : "doble"}
              onChange={(e) => setUseTriple(e.target.value === "triple")}
              className="w-full p-2 rounded bg-gray-800 border border-gray-600 focus:outline-none"
            >
              <option value="doble">Doble EMA</option>
              <option value="triple">Triple EMA</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">EMA4:</label>
            <input
              type="number"
              value={ema4}
              onChange={(e) => setEma4(Number(e.target.value))}
              className="w-full p-2 rounded bg-gray-800 border border-gray-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block mb-1">EMA9:</label>
            <input
              type="number"
              value={ema9}
              onChange={(e) => setEma9(Number(e.target.value))}
              className="w-full p-2 rounded bg-gray-800 border border-gray-600 focus:outline-none"
            />
          </div>

          {useTriple && (
            <div>
              <label className="block mb-1">EMA18:</label>
              <input
                type="number"
                value={ema18}
                onChange={(e) => setEma18(Number(e.target.value))}
                className="w-full p-2 rounded bg-gray-800 border border-gray-600 focus:outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded w-full transition duration-300"
          >
            Obtener señales
          </button>
        </form>

        <div className="mt-10">
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500" />
            </div>
          ) : signals.length > 0 ? (
            signals.map((signal, index) => (
              <div key={index} className="mb-10 bg-gray-900 rounded-lg p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-2">{signal.ticker}</h2>
                <p className="mb-4">Señal: <span className="font-semibold">{signal.signal}</span></p>
                <Plot
                  data={[
                    {
                      x: signal.candles.map(c => c.Date),
                      close: signal.candles.map(c => c.Close),
                      high: signal.candles.map(c => c.High),
                      low: signal.candles.map(c => c.Low),
                      open: signal.candles.map(c => c.Open),
                      type: "candlestick",
                      name: signal.ticker,
                    },
                    {
                      x: signal.ema_values.map(ema => ema.Date),
                      y: signal.ema_values.map(ema => ema.EMA_4 || ema.EMA_short),
                      type: "scatter",
                      mode: "lines",
                      name: useTriple ? `EMA ${ema4}` : `EMA Short ${ema4}`,
                      line: { color: "green" },
                    },
                    {
                      x: signal.ema_values.map(ema => ema.Date),
                      y: signal.ema_values.map(ema => ema.EMA_9 || ema.EMA_long),
                      type: "scatter",
                      mode: "lines",
                      name: useTriple ? `EMA ${ema9}` : `EMA Long ${ema9}`,
                      line: { color: "orange" },
                    },
                    useTriple && {
                      x: signal.ema_values.map(ema => ema.Date),
                      y: signal.ema_values.map(ema => ema.EMA_18),
                      type: "scatter",
                      mode: "lines",
                      name: `EMA ${ema18}`,
                      line: { color: "red" },
                    },
                  ].filter(Boolean)}
                  layout={{
                    autosize: true,
                    title: `${signal.ticker}`,
                    plot_bgcolor: "black",
                    paper_bgcolor: "black",
                    font: { color: "#fff" },
                    xaxis: { type: "category" },
                  }}
                  style={{ width: "100%", height: "400px" }}
                />
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400">No hay señales disponibles.</p>
          )}
        </div>
      </div>
    </BaseLayout>
  );
};

export default MediasMoviles;
