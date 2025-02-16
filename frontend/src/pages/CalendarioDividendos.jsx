import React, { useState } from "react";
import axios from "axios";
import "../assets/styles.css";

const months = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const availableTickers = ["AAPL", "MSFT", "TSLA", "GOOGL", "AMZN", "NFLX"];

const DividendCalendar = () => {
  const [selectedTickers, setSelectedTickers] = useState([]);
  const [dividendosPorMes, setDividendosPorMes] = useState({});
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");

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
    try {
      const params = new URLSearchParams();
      selectedTickers.forEach((ticker) => params.append("tickers", ticker));

      const response = await axios.get("http://localhost:8000/obtener_dividendos/", { params });

      setDividendosPorMes(response.data.dividendos);
      setError("");
    } catch (err) {
      setError("Error al obtener los datos de dividendos.");
    }
  };

  // Tickers disponibles en el dropdown (excluye los seleccionados)
  const tickersDisponibles = availableTickers.filter(ticker => !selectedTickers.includes(ticker));

  return (
    <div className="container">
      <h1>Calendario de Dividendos</h1>
      <form onSubmit={handleSubmit}>
        <select onChange={handleTickerChange} defaultValue="" disabled={tickersDisponibles.length === 0}>
          <option value="" disabled>Selecciona un ticker</option>
          {tickersDisponibles.map((ticker) => (
            <option key={ticker} value={ticker}>{ticker}</option>
          ))}
        </select>
        <button type="button" onClick={handleAddAllTickers} disabled={tickersDisponibles.length === 0}>Añadir Todos</button>
        <button type="submit">Generar Calendario</button>
      </form>

      {notification && <p className="notification">{notification}</p>}
      {error && <p className="error">{error}</p>}

      {/* Contenedor de tickers en línea */}
      <div className="ticker-container">
        {selectedTickers.map((ticker) => (
          <span key={ticker} className="ticker">
            {ticker} <span className="remove-ticker" onClick={() => handleRemoveTicker(ticker)}>✖</span>
          </span>
        ))}
      </div>

      {selectedTickers.length > 0 && (
        <button className="remove-all" onClick={handleRemoveAllTickers}>Eliminar Todos</button>
      )}

      <div className="calendar">
        {months.map((month, index) => (
          <div key={index} className="calendar-month">
            <h3>{month}</h3>
            <p><strong>{dividendosPorMes[index]?.total ? `$${dividendosPorMes[index].total.toFixed(2)}` : "Sin pagos"}</strong></p>
            <ul className="company-list">
              {dividendosPorMes[index]?.detalles?.map(({ empresa, monto }, i) => (
                <li key={i} className="company-detail">
                  {empresa}: <span className="amount">${monto.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DividendCalendar;
