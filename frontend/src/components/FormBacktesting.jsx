import React from "react";

const FormBacktesting = ({ formData, handleChange }) => {
  return (
    <form className="mb-4">
      <div className="mb-2">
        <label className="text-white">Ticker:</label>
        <input
          type="text"
          name="ticker"
          value={formData.ticker}
          onChange={handleChange}
          className="ml-2 p-1 rounded-md bg-gray-800 text-white border border-gray-600"
        />
      </div>
      <div className="mb-2">
        <label className="text-white">Inicio:</label>
        <input
          type="date"
          name="inicio"
          value={formData.inicio}
          onChange={handleChange}
          className="ml-2 p-1 rounded-md bg-gray-800 text-white border border-gray-600"
        />
      </div>
      <div className="mb-2">
        <label className="text-white">Fin:</label>
        <input
          type="date"
          name="fin"
          value={formData.fin}
          onChange={handleChange}
          className="ml-2 p-1 rounded-md bg-gray-800 text-white border border-gray-600"
        />
      </div>
      <div className="mb-2">
        <label className="text-white">TP %:</label>
        <input
          type="number"
          step="0.01"
          name="tp_percentage"
          value={formData.tp_percentage}
          onChange={handleChange}
          className="ml-2 p-1 rounded-md bg-gray-800 text-white border border-gray-600"
        />
      </div>
      <div className="mb-2">
        <label className="text-white">SL %:</label>
        <input
          type="number"
          step="0.01"
          name="sl_percentage"
          value={formData.sl_percentage}
          onChange={handleChange}
          className="ml-2 p-1 rounded-md bg-gray-800 text-white border border-gray-600"
        />
      </div>
    </form>
  );
};

export default FormBacktesting;