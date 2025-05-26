// src/pages/KMeans.js
import React, { useState } from "react";
import Plot from "react-plotly.js";
import BaseLayout from "../components/BaseLayout";
import { tickersBM } from "../constants";

import { useKMeansLogic } from "../hooks/useKMeansLogic";
import TickerSelector from "../components/TickerSelector";
import ParametrosSelector from "../components/ParametrosSelector";

const KMeans = () => {
  const [tickers] = useState(tickersBM);
  const [selectedTickers, setSelectedTickers] = useState([]);
  const [parametrosSeleccionados, setParametrosSeleccionados] = useState([]);
  const [startDate, setStartDate] = useState(
    new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [notification, setNotification] = useState("");

  // Usamos el hook que contiene la lógica principal
  const { acciones, loading, error, handleSubmit, traces, layout } = useKMeansLogic(
    selectedTickers,
    parametrosSeleccionados,
    startDate,
    endDate
  );

  // Manejadores para Tickers
  const handleAddTicker = (e) => {
    const ticker = e.target.value;
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

  // Manejador parámetros
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
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 bg-gray-800 rounded"
              min={startDate}
            />
          </div>
        </div>

        {/* Selección tickers */}
        <TickerSelector
          tickers={tickers}
          selectedTickers={selectedTickers}
          onAddTicker={handleAddTicker}
          onRemoveTicker={handleRemoveTicker}
          onAddAll={handleAddAllTickers}
          onRemoveAll={handleRemoveAllTickers}
          notification={notification}
        />

        {/* Parámetros */}
        <ParametrosSelector
          parametrosSeleccionados={parametrosSeleccionados}
          onChange={manejarCambioParametro}
        />

        {/* Botón para generar */}
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded w-full max-w-xs"
          disabled={loading}
        >
          {loading ? "Cargando..." : "Generar agrupamiento"}
        </button>

        {/* Error */}
        {error && <p className="text-red-500">{error}</p>}

        {/* Gráfico */}
        {acciones.length > 0 && (
          <Plot
            data={traces}
            layout={layout}
            style={{ width: "100%", height: "600px" }}
            config={{ responsive: true }}
          />
        )}
      </div>
    </BaseLayout>
  );
};

export default KMeans;
