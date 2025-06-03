import React from 'react';

/**
 * Ticker selector component for KMeans analysis
 */
const TickerSelector = ({ 
  tickers, 
  selectedTickers, 
  onTickerChange,
  onRemoveTicker,
  onAddAllTickers,
  onRemoveAllTickers,
  notification 
}) => {
  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <select 
          onChange={onTickerChange} 
          className="p-2 bg-gray-800 text-white rounded focus:ring-2 focus:ring-blue-500" 
          value=""
        >
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
        
        <button 
          onClick={onAddAllTickers} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          Agregar todos
        </button>
        
        <button 
          onClick={onRemoveAllTickers} 
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
        >
          Eliminar todos
        </button>
      </div>

      {notification && (
        <p className="text-green-500 text-sm">{notification}</p>
      )}

      <div className="flex flex-wrap gap-2 mt-2">
        {selectedTickers.map((ticker) => (
          <div 
            key={ticker} 
            className="bg-gray-700 px-3 py-1 rounded flex items-center space-x-2 hover:bg-gray-600 transition-colors"
          >
            <span className="text-white">{ticker}</span>
            <button 
              onClick={() => onRemoveTicker(ticker)} 
              className="text-red-400 hover:text-red-600 font-bold text-lg leading-none"
              aria-label={`Remove ${ticker}`}
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      {selectedTickers.length > 0 && (
        <p className="text-sm text-gray-300">
          {selectedTickers.length} ticker{selectedTickers.length !== 1 ? 's' : ''} seleccionado{selectedTickers.length !== 1 ? 's' : ''}
          {selectedTickers.length < 3 && (
            <span className="text-yellow-400 ml-2">
              (mínimo 3 requeridos)
            </span>
          )}
        </p>
      )}
    </div>
  );
};

export default TickerSelector;
