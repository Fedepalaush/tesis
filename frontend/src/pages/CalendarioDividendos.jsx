import React, { useState } from "react";
import BaseLayout from "../components/BaseLayout";
import { useTickers } from "../TickersContext";
import api from "../api";

const months = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const DividendCalendar = () => {
  const { tickers } = useTickers();
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
    setSelectedTickers(tickers);
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

      const response = await api.get("/obtener_dividendos/", { params });

      setDividendosPorMes(response.data.dividendos);
      setError("");
    } catch (err) {
      setError("Error al obtener los datos de dividendos.");
    } finally {
      setLoading(false);
    }
  };

  const tickersDisponibles = tickers.filter(ticker => !selectedTickers.includes(ticker));

  return (
    <BaseLayout>
      <div className="min-h-screen bg-black text-white py-8 px-4">
        <div className="max-w-4xl mx-auto bg-gray-900 p-6 rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold mb-6 text-white">📅 Calendario de Dividendos</h1>

          <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 mb-6">
            <select 
              onChange={handleTickerChange} 
              defaultValue="" 
              disabled={tickersDisponibles.length === 0}
              className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2"
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
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition disabled:opacity-50"
            >
              Añadir Todos
            </button>

            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded transition">
              Generar Calendario
            </button>
          </form>

          {notification && <p className="text-green-400 mb-4">{notification}</p>}
          {error && <p className="text-red-400 mb-4">{error}</p>}

          <div className="flex flex-wrap gap-2 mb-4">
            {selectedTickers.map((ticker) => (
              <span 
                key={ticker} 
                className="bg-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {ticker}
                <button 
                  onClick={() => handleRemoveTicker(ticker)} 
                  className="text-red-400 hover:text-red-200 font-bold"
                  aria-label={`Eliminar ${ticker}`}
                >
                  ✖
                </button>
              </span>
            ))}
          </div>

          {selectedTickers.length > 0 && (
            <button 
              className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded mb-6 transition"
              onClick={handleRemoveAllTickers}
            >
              Eliminar Todos
            </button>
          )}

          {loading && (
            <div className="flex justify-center my-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-opacity-75"></div>
            </div>
          )}

          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {months.map((month, index) => (
                <div key={index} className="bg-gray-800 p-4 rounded-lg shadow hover:shadow-xl transition">
                  <h3 className="text-lg font-semibold mb-2">{month}</h3>
                  <p className="mb-2">
                    <strong>
                      {dividendosPorMes[index]?.total ? `$${dividendosPorMes[index].total.toFixed(2)}` : "Sin pagos"}
                    </strong>
                  </p>
                  <ul className="list-disc ml-5 text-sm text-gray-300 space-y-1">
                    {dividendosPorMes[index]?.detalles?.map(({ empresa, monto }, i) => (
                      <li key={i}>
                        {empresa}: <span className="text-white font-medium">${monto.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </BaseLayout>
  );
};

export default DividendCalendar;
