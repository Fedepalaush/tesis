import React, { useState } from "react";
import axios from "axios";
import { tickersBM } from '../constants';
import BaseLayout from "../components/BaseLayout";

const months = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const availableTickers = tickersBM;

const DividendCalendar = () => {
  const [selectedTickers, setSelectedTickers] = useState([]);
  const [dividendosPorMes, setDividendosPorMes] = useState({});
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTickerChange = (event) => {
    const ticker = event.target.value;
    if (ticker && !selectedTickers.includes(ticker)) {
      setSelectedTickers([...selectedTickers, ticker]);
    }
  };

  const handleAddAllTickers = () => {
    setSelectedTickers(availableTickers);
    setNotification("Todos los tickers han sido añadidos.");
  };

  const handleRemoveTicker = (ticker) => {
    setSelectedTickers(selectedTickers.filter((t) => t !== ticker));
  };

  const handleRemoveAllTickers = () => {
    setSelectedTickers([]);
    setNotification("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams();
      selectedTickers.forEach((ticker) => params.append("tickers", ticker));

      const response = await axios.get("http://localhost:8000/obtener_dividendos/", { params });

      setDividendosPorMes(response.data.dividendos);
      setError("");
    } catch (err) {
      setError("Error al obtener los datos de dividendos.");
    } finally {
      setLoading(false);
    }
  };

  const tickersDisponibles = availableTickers.filter(ticker => !selectedTickers.includes(ticker));

  return (
    <BaseLayout>
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Calendario de Dividendos</h1>
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 mb-4">
        <select 
          onChange={handleTickerChange} 
          defaultValue="" 
          disabled={tickersDisponibles.length === 0}
          className="border rounded p-2"
        >
          <option value="" disabled>Selecciona un ticker</option>
          {tickersDisponibles.map((ticker) => (
            <option key={ticker} value={ticker}>{ticker}</option>
          ))}
        </select>
        <button 
          type="button" 
          onClick={handleAddAllTickers} 
          disabled={tickersDisponibles.length === 0} 
          className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Añadir Todos
        </button>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Generar Calendario
        </button>
      </form>

      {notification && <p className="text-green-500">{notification}</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="flex flex-wrap gap-2 mb-4">
        {selectedTickers.map((ticker) => (
          <span key={ticker} className="bg-gray-200 px-3 py-1 rounded-lg">
            {ticker} <span className="text-red-500 cursor-pointer" onClick={() => handleRemoveTicker(ticker)}>✖</span>
          </span>
        ))}
      </div>

      {selectedTickers.length > 0 && (
        <button className="bg-red-500 text-white px-4 py-2 rounded mb-4" onClick={handleRemoveAllTickers}>
          Eliminar Todos
        </button>
      )}

      {loading && <div className="loader animate-spin border-4 border-gray-300 border-t-blue-500 rounded-full w-10 h-10 mx-auto"></div>}

      {!loading && (
        <div className="grid grid-cols-3 gap-4">
          {months.map((month, index) => (
            <div key={index} className="border p-4 rounded-lg shadow">
              <h3 className="font-bold">{month}</h3>
              <p><strong>{dividendosPorMes[index]?.total ? `$${dividendosPorMes[index].total.toFixed(2)}` : "Sin pagos"}</strong></p>
              <ul className="list-disc ml-4">
                {dividendosPorMes[index]?.detalles?.map(({ empresa, monto }, i) => (
                  <li key={i} className="text-sm">
                    {empresa}: <span className="font-semibold">${monto.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
    </BaseLayout>
  );
};

export default DividendCalendar;
