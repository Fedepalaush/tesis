// components/YearsSelector.js
import React from "react";

const YearsSelector = ({ value, onChange, label }) => (
  <select value={value} onChange={onChange} className="p-2 bg-gray-800 text-white">
    {[1, 2, 3, 4, 5].map((year) => (
      <option key={year} value={year}>
        {year} Años
      </option>
    ))}
  </select>
);

const YearsSelectors = ({ xYears, yYears, handleXYearsChange, handleYYearsChange }) => (
  <div className="flex mb-4">
    <YearsSelector
      value={xYears}
      onChange={handleXYearsChange}
      label={`X-axis (${xYears} Years)`}
    />
    <YearsSelector
      value={yYears}
      onChange={handleYYearsChange}
      label={`Y-axis (${yYears} Years)`}
    />
  </div>
);

export default YearsSelectors;
