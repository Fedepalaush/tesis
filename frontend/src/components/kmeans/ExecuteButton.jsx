import React from 'react';

/**
 * Execute button component for KMeans analysis
 */
const ExecuteButton = ({ 
  onExecute, 
  isLoading, 
  isDisabled,
  selectedTickersCount,
  selectedParametersCount 
}) => {
  const getButtonText = () => {
    if (isLoading) return "Ejecutando agrupamiento...";
    if (selectedTickersCount < 3) return "Selecciona al menos 3 tickers";
    if (selectedParametersCount !== 2) return "Selecciona exactamente 2 parámetros";
    return "Ejecutar agrupamiento";
  };

  const getButtonStyle = () => {
    if (isLoading || isDisabled) {
      return "bg-gray-600 cursor-not-allowed";
    }
    return "bg-green-600 hover:bg-green-700 focus:bg-green-700";
  };

  return (
    <div className="space-y-3">
      <button
        onClick={onExecute}
        disabled={isLoading || isDisabled}
        className={`w-full md:w-auto px-6 py-3 rounded-lg font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${getButtonStyle()}`}
      >
        {getButtonText()}
      </button>

      {/* Help text */}
      <div className="text-sm space-y-1">
        {selectedTickersCount < 3 && (
          <p className="text-yellow-400">
            ⚠️ Se necesitan al menos 3 tickers para el agrupamiento
          </p>
        )}
        {selectedParametersCount !== 2 && (
          <p className="text-yellow-400">
            ⚠️ Selecciona exactamente 2 parámetros para continuar
          </p>
        )}
        {selectedTickersCount >= 3 && selectedParametersCount === 2 && !isLoading && (
          <p className="text-green-400">
            ✓ Listo para ejecutar el agrupamiento
          </p>
        )}
      </div>
    </div>
  );
};

export default ExecuteButton;
