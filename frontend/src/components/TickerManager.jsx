// src/components/TickerSelector.js
import React from "react";

const TickerManager = ({
  tickers,
  selectedTickers,
  onAddTicker,
  onRemoveTicker,
  onAddAll,
  onRemoveAll,
  notification,
}) => {
  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <select onChange={onAddTicker} className="p-2 bg-gray-800 rounded" value="">
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
        <button onClick={onAddAll} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Agregar todos
        </button>
        <button onClick={onRemoveAll} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
          Eliminar todos
        </button>
      </div>

      {notification && <p className="text-green-500">{notification}</p>}

      <div className="flex flex-wrap gap-2 mt-2">
        {selectedTickers.map((ticker) => (
          <div key={ticker} className="bg-gray-700 px-3 py-1 rounded flex items-center space-x-2">
            <span>{ticker}</span>
            <button onClick={() => onRemoveTicker(ticker)} className="text-red-500 hover:text-red-700">
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TickerManager;
