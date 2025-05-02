import React, { useState } from "react";
import Plot from "react-plotly.js";
import BaseLayout from "../components/BaseLayout";
import { tickersBM } from "../constants";
import { obtenerDatosAgrupamiento } from "../api";

const KMeans = () => {
  const [tickers] = useState(tickersBM);
  const [selectedTickers, setSelectedTickers] = useState([]);
  const [parametrosSeleccionados, setParametrosSeleccionados] = useState([]);
  const [startDate, setStartDate] = useState(new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [acciones, setAcciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState("");
  const [error, setError] = useState(null);

  const handleTickerChange = (event) => {
    const ticker = event.target.value;
    if (ticker && !selectedTickers.includes(ticker)) {
      setSelectedTickers([...selectedTickers, ticker]);
    }
  };

  const handleRemoveTicker = (ticker) => {
    setSelectedTickers(selectedTickers.filter((t) => t !== ticker));
  };

  const handleAddAllTickers = () => {
    setSelectedTickers(tickers);
    setNotification("Todos los tickers fueron añadidos.");
  };

  const handleRemoveAllTickers = () => {
    setSelectedTickers([]);
    setNotification("");
  };

  const manejarCambioParametro = (e) => {
    const parametro = e.target.value;
    setParametrosSeleccionados((prev) =>
      prev.includes(parametro)
        ? prev.filter((p) => p !== parametro)
        : prev.length < 2
        ? [...prev, parametro]
        : (alert("Máximo 2 parámetros."), prev)
    );
  };

  const obtenerDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await obtenerDatosAgrupamiento(selectedTickers, parametrosSeleccionados, startDate, endDate);
      setAcciones(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (selectedTickers.length < 3) {
      alert("Selecciona al menos 3 tickers.");
      return;
    }
    obtenerDatos();
  };

  const coloresClusters = [
    "rgba(255, 99, 132, 0.5)",
    "rgba(54, 162, 235, 0.5)",
    "rgba(75, 192, 192, 0.5)",
    "rgba(153, 102, 255, 0.5)",
    "rgba(255, 159, 64, 0.5)",
  ];

  const [xParam, yParam] = parametrosSeleccionados.length === 2 ? parametrosSeleccionados : ["mean_return", "volatility"];

  const clusters = [...new Set(acciones.map((a) => a.Cluster))];

  const traces = clusters.map((cluster, idx) => {
    const filtered = acciones.filter((a) => a.Cluster === cluster);
    return {
      x: filtered.map((a) => a[xParam]),
      y: filtered.map((a) => a[yParam]),
      mode: "markers",
      type: "scatter",
      name: `Cluster ${cluster}`,
      marker: {
        color: coloresClusters[idx % coloresClusters.length],
        size: 10,
      },
      text: filtered.map((a) => a.index),
      hoverinfo: "text+x+y",
    };
  });

  const layout = {
    title: "Scatterplot de Acciones",
    xaxis: { title: xParam },
    yaxis: { title: yParam },
    autosize: true,
    font: { color: "white" },
    plot_bgcolor: "black",
    paper_bgcolor: "black",
  };

  return (
    <BaseLayout>
      <div className="bg-black text-white min-h-screen p-6 space-y-8">
        {/* Fechas y selección */}
        <div className="grid md:grid-cols-2 gap-4 bg-gray-900 p-4 rounded-lg shadow">
          <div>
            <label className="block mb-1">Fecha de Inicio:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 bg-gray-800 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Fecha de Fin:</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-2 bg-gray-800 rounded" />
          </div>
        </div>

        {/* Ticker Selector */}
        <div className="bg-gray-900 p-4 rounded-lg shadow space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <select onChange={handleTickerChange} className="p-2 bg-gray-800 rounded" value="">
              <option value="" disabled>
                Selecciona un ticker
              </option>
              {tickers
                .filter((t) => !selectedTickers.includes(t))
                .map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
            </select>
            <button onClick={handleAddAllTickers} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Agregar todos
            </button>
            <button onClick={handleRemoveAllTickers} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
              Eliminar todos
            </button>
          </div>

          {notification && <p className="text-green-500">{notification}</p>}

          <div className="flex flex-wrap gap-2 mt-2">
            {selectedTickers.map((ticker) => (
              <div key={ticker} className="bg-gray-700 px-3 py-1 rounded flex items-center space-x-2">
                <span>{ticker}</span>
                <button onClick={() => handleRemoveTicker(ticker)} className="text-red-500 hover:text-red-700">
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Parámetros */}
        <div className="bg-gray-900 p-4 rounded-lg shadow">
          <h3 className="mb-2">Selecciona Parámetros (máx. 2):</h3>
          <div className="flex gap-4">
            {["mean_return", "volatility", "max_drawdown"].map((param) => (
              <label key={param} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  value={param}
                  onChange={manejarCambioParametro}
                  checked={parametrosSeleccionados.includes(param)}
                  disabled={parametrosSeleccionados.length >= 2 && !parametrosSeleccionados.includes(param)}
                  className="accent-blue-500"
                />
                {param
                  .replace("_", " ")
                  .toLowerCase()
                  .replace(/^\w/, (c) => c.toUpperCase())}
              </label>
            ))}
          </div>
        </div>

        {/* Botón de envío */}
        <div>
          <button
            onClick={handleSubmit}
            disabled={loading || parametrosSeleccionados.length !== 2}
            className={`w-full md:w-auto px-6 py-2 rounded ${
              loading || parametrosSeleccionados.length !== 2 ? "bg-gray-600 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            } text-white`}
          >
            {loading ? "Cargando..." : "Ejecutar agrupamiento"}
          </button>
        </div>

        {/* Gráfico */}
        {error && <p className="text-red-500">{error}</p>}
        {parametrosSeleccionados.length !== 2 && <p className="text-yellow-500">Selecciona exactamente 2 parámetros para continuar.</p>}
        {parametrosSeleccionados.length === 2 && acciones.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <Plot data={traces} layout={layout} />
          </div>
        )}
      </div>
    </BaseLayout>
  );
};

export default KMeans;
