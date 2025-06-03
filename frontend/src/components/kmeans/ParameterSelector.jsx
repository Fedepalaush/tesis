import React from 'react';

/**
 * Parameter selector component for KMeans analysis
 */
const ParameterSelector = ({ 
  selectedParameters, 
  onParameterChange 
}) => {
  const availableParameters = [
    { value: "mean_return", label: "Mean Return" },
    { value: "volatility", label: "Volatility" },
    { value: "max_drawdown", label: "Max Drawdown" }
  ];

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow">
      <h3 className="mb-3 text-white font-medium">
        Selecciona Parámetros (exactamente 2):
      </h3>
      
      <div className="flex flex-wrap gap-4">
        {availableParameters.map((param) => (
          <label 
            key={param.value} 
            className={`flex items-center gap-2 text-sm cursor-pointer p-2 rounded transition-colors ${
              selectedParameters.includes(param.value) 
                ? 'bg-blue-900 text-blue-200' 
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <input
              type="checkbox"
              value={param.value}
              onChange={onParameterChange}
              checked={selectedParameters.includes(param.value)}
              disabled={selectedParameters.length >= 2 && !selectedParameters.includes(param.value)}
              className="accent-blue-500"
            />
            <span>{param.label}</span>
          </label>
        ))}
      </div>

      <div className="mt-3 text-sm">
        {selectedParameters.length === 0 && (
          <p className="text-gray-400">Selecciona 2 parámetros para continuar</p>
        )}
        {selectedParameters.length === 1 && (
          <p className="text-yellow-400">Selecciona 1 parámetro más</p>
        )}
        {selectedParameters.length === 2 && (
          <p className="text-green-400">✓ Parámetros seleccionados: {selectedParameters.join(', ')}</p>
        )}
      </div>
    </div>
  );
};

export default ParameterSelector;
