import React, { useState } from "react";
import axios from "axios";
import Plot from "react-plotly.js";
import BaseLayout from "../components/BaseLayout";
import { tickersBM } from '../constants';
import { obtenerDatosAgrupamiento } from "../api";  // Importa la función de la API


const KMeans = () => {
  const [tickers, setTickers] = useState(tickersBM); // Predefined tickers list
  const [selectedTickers, setSelectedTickers] = useState([]); // Manage selected tickers
  const [parametrosSeleccionados, setParametrosSeleccionados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [acciones, setAcciones] = useState([]); // Data fetched from the backend
  const [notification, setNotification] = useState(""); // State for notification message

  const today = new Date();
  const defaultEndDate = today.toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD
  const defaultStartDate = new Date(today.setFullYear(today.getFullYear() - 1)).toISOString().split('T')[0]; // Un año atrás en formato YYYY-MM-DD
  
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  // Handle ticker selection and add directly to the list
  const handleTickerChange = (event) => {
    const ticker = event.target.value;
    if (ticker && !selectedTickers.includes(ticker)) {
      setSelectedTickers((prevSelectedTickers) => [...prevSelectedTickers, ticker]);
    }
  };

  // Add all available tickers to the selected tickers
  const handleAddAllTickers = () => {
    setSelectedTickers(tickers);
    setNotification("Todos los tickers han sido añadidos.");
  };

  // Remove selected ticker
  const handleRemoveTicker = (ticker) => {
    setSelectedTickers((prevSelectedTickers) => {
      const updatedTickers = prevSelectedTickers.filter((t) => t !== ticker);
      return updatedTickers;
    });
  };

  // Remove all selected tickers
  const handleRemoveAllTickers = () => {
    setSelectedTickers([]);
    setNotification("");
  };

  // Llamada para obtener datos de agrupamiento
  const obtenerDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await obtenerDatosAgrupamiento(selectedTickers, parametrosSeleccionados, startDate, endDate);
      setAcciones(data);  // Asigna los datos obtenidos al estado
    } catch (error) {
      setError(error.message);  // Muestra el mensaje de error
    } finally {
      setLoading(false);
    }
  };

  const manejarCambioParametro = (e) => {
    const parametro = e.target.value;

    setParametrosSeleccionados((prev) => {
      if (prev.includes(parametro)) {
        return prev.filter((item) => item !== parametro);
      } else if (prev.length < 2) {
        return [...prev, parametro];
      } else {
        alert("Solo puedes seleccionar un máximo de 2 parámetros.");
        return prev;
      }
    });
  };

  // Validate form and execute clustering
  const handleSubmit = () => {
    if (selectedTickers.length < 3) {
      alert("Selecciona al menos 3 tickers.");
      return;
    }
    obtenerDatos(); // Fetch data
  };

  // Cluster colors
  const coloresClusters = [
    "rgba(255, 99, 132, 0.5)",
    "rgba(54, 162, 235, 0.5)",
    "rgba(75, 192, 192, 0.5)",
    "rgba(153, 102, 255, 0.5)",
    "rgba(255, 159, 64, 0.5)",
  ];

  const [xParam, yParam] =
    parametrosSeleccionados.length >= 2 ? [parametrosSeleccionados[0], parametrosSeleccionados[1]] : ["mean_return", "volatility"];

  const clusters = [...new Set(acciones.map((accion) => accion.Cluster))];

  const traces = clusters.map((cluster, index) => ({
    x: acciones.filter((accion) => accion.Cluster === cluster).map((accion) => accion[xParam]),
    y: acciones.filter((accion) => accion.Cluster === cluster).map((accion) => accion[yParam]),
    mode: "markers",
    type: "scatter",
    name: `Cluster ${cluster}`,
    marker: {
      color: coloresClusters[index % coloresClusters.length],
      size: 10,
    },
    text: acciones.filter((accion) => accion.Cluster === cluster).map((accion) => accion.index),
    hoverinfo: "text+x+y",
  }));

  const layout = {
    title: "Scatterplot de Acciones",
    xaxis: {
      title: xParam,
    },
    yaxis: {
      title: yParam,
    },
    autosize: true,
    font: {
      color: "white",
    },
    plot_bgcolor: "black",
    paper_bgcolor: "black",
  };

  return (
    <BaseLayout>
      <div style={{ color: "white", backgroundColor: "black", padding: "20px" }}>
        {/* Ticker Selection */}
        <div>
          <div>
            <label>Fecha de Inicio:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 bg-gray-800 text-white rounded"
            />
          </div>
          <div>
            <label>Fecha de Fin:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 bg-gray-800 text-white rounded"
            />
          </div>

          <select
            value="" // Always set value to empty so it doesn't retain previous selection
            onChange={handleTickerChange}
            className="p-2 bg-gray-800 text-white rounded"
          >
            <option value="" disabled>
              Selecciona un ticker
            </option>
            {tickers
              .filter((ticker) => !selectedTickers.includes(ticker))
              .map((ticker) => (
                <option key={ticker} value={ticker}>
                  {ticker}
                </option>
              ))}
          </select>

          <button onClick={handleAddAllTickers} className="ml-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
            Agregar todos los tickers
          </button>

          {/* Remove all selected tickers button */}
          <button onClick={handleRemoveAllTickers} className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Eliminar todos los tickers
          </button>

          {/* Display notification message */}
          {notification && <div className="mt-4 text-green-500">{notification}</div>}

          {/* Display selected tickers only if not all are selected */}
          {selectedTickers.length < tickers.length && (
            <div className="mt-4 flex gap-2 overflow-x-auto">
              {selectedTickers.map((ticker) => (
                <div
                  key={ticker}
                  className="flex items-center space-x-2 bg-gray-700 p-1 rounded text-sm"
                  style={{ maxWidth: "150px", overflow: "hidden" }}
                >
                  <span className="truncate">{ticker}</span>
                  <button
                    onClick={() => handleRemoveTicker(ticker)}
                    className="text-red-600 hover:text-red-800"
                    style={{ fontSize: "1.2rem" }}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3>Selecciona Parámetros (máximo 2):</h3>
          <label>
            <input
              type="checkbox"
              value="mean_return"
              onChange={manejarCambioParametro}
              disabled={parametrosSeleccionados.length >= 2 && !parametrosSeleccionados.includes("mean_return")}
            />
            Mean Return
          </label>
          <label>
            <input
              type="checkbox"
              value="volatility"
              onChange={manejarCambioParametro}
              disabled={parametrosSeleccionados.length >= 2 && !parametrosSeleccionados.includes("volatility")}
            />
            Volatility
          </label>
          <label>
            <input
              type="checkbox"
              value="max_drawdown"
              onChange={manejarCambioParametro}
              disabled={parametrosSeleccionados.length >= 2 && !parametrosSeleccionados.includes("max_drawdown")}
            />
            Max Drawdown
          </label>
        </div>

        <div>
          <button
            onClick={handleSubmit}
            disabled={loading || parametrosSeleccionados.length !== 2}
            className={`px-4 py-2 rounded ${
              loading || parametrosSeleccionados.length !== 2 ? "bg-gray-400 cursor-not-allowed" : "bg-gray-600 hover:bg-gray-700"
            } text-white`}
          >
            {loading ? "Cargando..." : "Ejecutar agrupamiento"}
          </button>
        </div>

        {error && <div style={{ color: "red" }}>{error}</div>}

        {parametrosSeleccionados.length !== 2 && <p>Selecciona exactamente 2 parámetros para continuar</p>}

        {parametrosSeleccionados.length === 2 && acciones.length > 0 && (
          <div style={{ width: "100%", maxWidth: "800px", margin: "0 auto" }}>
            <Plot data={traces} layout={layout} />
          </div>
        )}
      </div>
    </BaseLayout>
  );
};

export default KMeans;
