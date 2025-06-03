// components/YearsSelector.js
import React from "react";

const YearsSelector = ({ value, onChange, label, id }) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={id} className="text-sm font-medium text-gray-300">
      {label}
    </label>
    <select 
      id={id}
      value={value} 
      onChange={onChange} 
      className="p-2 bg-gray-800 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      aria-label={`Seleccionar ${label}`}
    >
      {[1, 2, 3, 4, 5].map((year) => (
        <option key={year} value={year}>
          {year} Año{year !== 1 ? 's' : ''}
        </option>
      ))}
    </select>
  </div>
);

const YearsSelectors = ({ xYears, yYears, handleXYearsChange, handleYYearsChange }) => (
  <div className="flex gap-4 mb-4" role="group" aria-labelledby="years-selector-title">
    <fieldset className="contents">
      <legend id="years-selector-title" className="sr-only">
        Selección de años para análisis
      </legend>
      <YearsSelector
        id="x-years-selector"
        value={xYears}
        onChange={handleXYearsChange}
        label={`Eje X (${xYears} Años)`}
      />
      <YearsSelector
        id="y-years-selector"
        value={yYears}
        onChange={handleYYearsChange}
        label={`Eje Y (${yYears} Años)`}
      />
    </fieldset>
  </div>
);

export default YearsSelectors;
