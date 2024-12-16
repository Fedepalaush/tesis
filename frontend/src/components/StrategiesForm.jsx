import React from "react";

const StrategiesForm = ({ formData, handleChange }) => {
  return (
    <>
      <div className="mb-2">
        <label className="text-white">Cruce de Medias:</label>
        <input
          type="checkbox"
          name="smaCross"
          checked={formData.strategies.smaCross}
          onChange={handleChange}
          className="ml-2"
        />
        {formData.strategies.smaCross && (
          <>
            <div className="mb-2">
              <label className="text-white">Rápida:</label>
              <input
                type="number"
                name="rapida"
                value={formData.rapida}
                onChange={handleChange}
                className="ml-2 p-1 rounded-md bg-gray-800 text-white border border-gray-600"
              />
            </div>
            <div className="mb-2">
              <label className="text-white">Lenta:</label>
              <input
                type="number"
                name="lenta"
                value={formData.lenta}
                onChange={handleChange}
                className="ml-2 p-1 rounded-md bg-gray-800 text-white border border-gray-600"
              />
            </div>
          </>
        )}
      </div>
      <div className="mb-2">
        <label className="text-white">RSI:</label>
        <input
          type="checkbox"
          name="rsi"
          checked={formData.strategies.rsi}
          onChange={handleChange}
          className="ml-2"
        />
        {formData.strategies.rsi && (
          <>
            <div className="mb-2">
              <label className="text-white">Sobrecompra (%):</label>
              <input
                type="number"
                name="overboughtLevel"
                value={formData.strategies.rsiParams.overboughtLevel}
                onChange={handleChange}
                className="ml-2 p-1 rounded-md bg-gray-800 text-white border border-gray-600"
              />
            </div>
            <div className="mb-2">
              <label className="text-white">Sobreventa (%):</label>
              <input
                type="number"
                name="oversoldLevel"
                value={formData.strategies.rsiParams.oversoldLevel}
                onChange={handleChange}
                className="ml-2 p-1 rounded-md bg-gray-800 text-white border border-gray-600"
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default StrategiesForm;
