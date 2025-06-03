import React from 'react';

/**
 * Date range selector component for KMeans analysis
 */
const DateRangeSelector = ({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange 
}) => {
  return (
    <div className="grid md:grid-cols-2 gap-4 bg-gray-900 p-4 rounded-lg shadow">
      <div>
        <label className="block mb-1 text-white">Fecha de Inicio:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="w-full p-2 bg-gray-800 text-white rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block mb-1 text-white">Fecha de Fin:</label>
        <input 
          type="date" 
          value={endDate} 
          onChange={(e) => onEndDateChange(e.target.value)} 
          className="w-full p-2 bg-gray-800 text-white rounded focus:ring-2 focus:ring-blue-500" 
        />
      </div>
    </div>
  );
};

export default DateRangeSelector;
