import React from "react";

const DataSelector = ({ tickers, selectedTicker, handleTickerChange, selectedYears, handleYearsChange }) => {
  return (
    <div className="mb-4">
      {/* Dropdown para seleccionar ticker */}
      <div className="mb-4">
        <select
          value={selectedTicker}
          onChange={handleTickerChange}
          className="bg-gray-800 text-white p-2 rounded-md border border-gray-700 focus:outline-none focus:border-blue-500"
        >
          {tickers.map((activo) => (
            <option key={activo} value={activo}>
              {activo}
            </option>
          ))}
        </select>
      </div>

      {/* Dropdown para seleccionar cantidad de años */}
      <div className="mb-4">
        <label className="mr-2">Años:</label>
        <select
          value={selectedYears}
          onChange={handleYearsChange}
          className="bg-gray-800 text-white p-2 rounded-md border border-gray-700 focus:outline-none focus:border-blue-500"
        >
          {[...Array(20).keys()].map((year) => (
            <option key={year + 1} value={year + 1}>
              {year + 1} Año{year + 1 > 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DataSelector;
