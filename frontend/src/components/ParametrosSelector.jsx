// src/components/ParametrosSelector.js
import React from "react";

const ParametrosSelector = ({ parametrosSeleccionados, onChange }) => {
  const opciones = ["mean_return", "volatility", "max_drawdown"];

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow">
      <h3 className="mb-2">Selecciona Parámetros (máx. 2):</h3>
      <div className="flex gap-4">
        {opciones.map((param) => (
          <label key={param} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              value={param}
              onChange={onChange}
              checked={parametrosSeleccionados.includes(param)}
              disabled={parametrosSeleccionados.length >= 2 && !parametrosSeleccionados.includes(param)}
              className="accent-blue-500"
            />
            {param.replace("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
          </label>
        ))}
      </div>
    </div>
  );
};

export default ParametrosSelector;
