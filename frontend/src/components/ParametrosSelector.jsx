// src/components/ParametrosSelector.js
import React from "react";

const ParametrosSelector = ({ parametrosSeleccionados, onChange }) => {
  const opciones = [
    { value: "mean_return", label: "Retorno promedio" },
    { value: "volatility", label: "Volatilidad" },
    { value: "max_drawdown", label: "Máximo drawdown" }
  ];

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow">
      <fieldset>
        <legend className="mb-2 text-base font-medium text-white">
          Selecciona Parámetros (máximo 2):
        </legend>
        <div className="flex gap-4" role="group" aria-describedby="params-help">
          {opciones.map((param) => {
            const isSelected = parametrosSeleccionados.includes(param.value);
            const isDisabled = parametrosSeleccionados.length >= 2 && !isSelected;
            
            return (
              <label 
                key={param.value} 
                className={`flex items-center gap-2 text-sm cursor-pointer ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-300'}`}
              >
                <input
                  type="checkbox"
                  value={param.value}
                  onChange={onChange}
                  checked={isSelected}
                  disabled={isDisabled}
                  className="accent-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                  aria-describedby={isDisabled ? "params-help" : undefined}
                />
                <span>{param.label}</span>
              </label>
            );
          })}
        </div>
        <div id="params-help" className="mt-2 text-xs text-gray-400">
          Puedes seleccionar hasta 2 parámetros para el análisis.
        </div>
      </fieldset>
    </div>
  );
};

export default ParametrosSelector;
