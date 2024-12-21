import React from 'react';

const MultiTickerSelector = ({ tickers, selectedTickers, onTickerChange, onRemoveTicker }) => {
  return (
    <div>
      {/* Selector */}
      <div className="mb-4">
        <select
          onChange={(e) => {
            onTickerChange(e.target.value);
            e.target.value = ""; // Resetear el valor del selector
          }}
          className="p-2 bg-gray-800 text-white rounded"
        >
          <option value="">Selecciona un ticker</option>
          {tickers.filter((ticker) => !selectedTickers.includes(ticker)).map((ticker) => (
            <option key={ticker} value={ticker}>
              {ticker}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de tickers seleccionados */}
      <div className="mb-4 flex flex-wrap gap-2">
        {selectedTickers.map((ticker) => (
          <div
            key={ticker}
            className="flex items-center space-x-2 bg-gray-700 p-2 rounded"
          >
            <span>{ticker}</span>
            <button
              onClick={() => onRemoveTicker(ticker)}
              className="text-red-600 hover:text-red-800"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiTickerSelector;
