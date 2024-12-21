import React from 'react';

const DateRangePicker = ({ startDate, endDate, onStartDateChange, onEndDateChange }) => (
  <div>
    <div className="mb-4">
      <label className="block text-sm mb-1">Fecha de Inicio:</label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        className="p-2 bg-gray-800 text-white rounded w-full"
      />
    </div>
    <div className="mb-4">
      <label className="block text-sm mb-1">Fecha de Fin:</label>
      <input
        type="date"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        className="p-2 bg-gray-800 text-white rounded w-full"
      />
    </div>
  </div>
);

export default DateRangePicker;
