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
      <option value="Industrials">Industriales</option>
      <option value="Consumer Discretionary">Consumo Discrecional</option>
      <option value="Information Technology">Tecnología de la Información</option>
      <option value="Financials">Financieros</option>
      <option value="Health Care">Salud</option>
      <option value="Communication Services">Servicios de Comunicación</option>
      <option value="Materials">Materiales</option>
      <option value="Utilities">Servicios Públicos</option>
      <option value="Energy">Energía</option>
      <option value="Consumer Staples">Productos Básicos de Consumo</option>
      <option value="Real Estate">Bienes Raíces</option>
    </select>
  );
};

export default SectorSelector;
