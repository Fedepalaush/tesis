// src/components/TickerFormControls.js
import React from 'react';

const TickerFormControls = ({
  tickers,
  ticker,
  startDate,
  endDate,
  handleTickerChange,
  handleStartDateChange,
  handleEndDateChange,
}) => {
  return (
    <div className="mb-4 flex items-center flex-wrap gap-2 sm:gap-4">
      <div>
        <label htmlFor="ticker" className="mr-2 font-semibold text-white">
          Ticker:
        </label>
        <select
          id="ticker"
          value={ticker}
          onChange={handleTickerChange}
          className="bg-gray-800 text-white p-2 rounded-md border border-gray-700 focus:outline-none focus:border-blue-500"
        >
          {tickers.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="startDate" className="mr-2 text-white">
          Fecha de inicio:
        </label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={handleStartDateChange}
          className="bg-gray-800 text-white p-2 rounded-md border border-gray-700 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="endDate" className="mr-2 text-white">
          Fecha de fin:
        </label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          onChange={handleEndDateChange}
          className="bg-gray-800 text-white p-2 rounded-md border border-gray-700 focus:outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );
};

export default TickerFormControls;