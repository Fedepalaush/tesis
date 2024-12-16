// components/SectorSelector.js
import React from "react";

const SectorSelector = ({ selectedSector, handleSectorChange }) => {
  return (
    <select
      value={selectedSector}
      onChange={handleSectorChange}
      className="mb-4 p-2 bg-gray-800 text-white"
    >
      <option value="Todos">Todos</option>
      <option value="Industrials">Industrials</option>
      <option value="Consumer Discretionary">Consumer Discretionary</option>
      <option value="Information Technology">Information Technology</option>
      <option value="Financials">Financials</option>
      <option value="Health Care">Health Care</option>
      <option value="Communication Services">Communication Services</option>
      <option value="Materials">Materials</option>
      <option value="Utilities">Utilities</option>
      <option value="Energy">Energy</option>
      <option value="Consumer Staples">Consumer Staples</option>
      <option value="Real Estate">Real Estate</option>
    </select>
  );
};

export default SectorSelector;
