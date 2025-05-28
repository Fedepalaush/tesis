// components/DateRangeSelector.js
import React from "react";

const DateRangeSelector = ({ startDate, endDate, setStartDate, setEndDate }) => (
  <div className="grid md:grid-cols-2 gap-4 bg-gray-900 p-4 rounded-lg shadow">
    <div>
      <label className="block mb-1">Fecha de Inicio:</label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="w-full p-2 bg-gray-800 rounded"
      />
    </div>
    <div>
      <label className="block mb-1">Fecha de Fin:</label>
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="w-full p-2 bg-gray-800 rounded"
      />
    </div>
  </div>
);

export default DateRangeSelector;
