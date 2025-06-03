// pages/SharpePlot.js
import React, { useState, useEffect } from "react";
import BaseLayout from "../components/BaseLayout";
import SectorSelector from "../components/SectorSelector";
import YearsSelectors from "../components/YearsSelector";
import SharpePlotGraph from "../components/SharpePlotGraph";
import LoadingIndicator from "../components/LoadingIndicator";
import { fetchSharpeRatioData } from "../api"; // Importa la función desde api.js
import { useAsyncOperationWithLoading } from '../hooks/useAsyncOperationWithLoading';
import { useNotification } from '../contexts/NotificationContext';

const sectorLabels = {
  "Todos": "Todos",
  "Industrials": "Industriales",
  "Consumer Discretionary": "Consumo Discrecional",
  "Information Technology": "Tecnología de la Información",
  "Financials": "Financieros",
  "Health Care": "Salud",
  "Communication Services": "Servicios de Comunicación",
  "Materials": "Materiales",
  "Utilities": "Servicios Públicos",
  "Energy": "Energía",
  "Consumer Staples": "Productos Básicos de Consumo",
  "Real Estate": "Bienes Raíces"
};

const SharpePlot = () => {
  const { showError, showSuccess } = useNotification();
  
  // Use global loading system
  const { execute, isLoading } = useAsyncOperationWithLoading({
    useGlobalLoading: true,
    showNotifications: true
  });

  const [sharpeData, setSharpeData] = useState([]);
  const [selectedSector, setSelectedSector] = useState("Information Technology");
  const [xYears, setXYears] = useState(5); // Años para el eje X
  const [yYears, setYYears] = useState(2); // Años para el eje Y

  useEffect(() => {
    fetchData(selectedSector, xYears, yYears); // Llamada inicial con los años seleccionados
  }, [selectedSector, xYears, yYears]); // Llamada cada vez que cambian el sector o los años

  const fetchData = async (sector, xYears, yYears) => {
    await execute(
      async () => {
        const data = await fetchSharpeRatioData(sector, xYears, yYears);
        setSharpeData(data);
        showSuccess(`Datos del Sharpe Ratio para ${sectorLabels[sector]} cargados exitosamente`);
      },
      `Cargando datos del Sharpe Ratio para ${sectorLabels[sector]}...`
    );
  };

  const handleSectorChange = (event) => {
    setSelectedSector(event.target.value);
  };

  const handleXYearsChange = (event) => {
    setXYears(event.target.value);
  };

  const handleYYearsChange = (event) => {
    setYYears(event.target.value);
  };

  return (
    <BaseLayout>
      <div className="flex flex-col justify-center items-center h-screen" style={{ backgroundColor: "black" }}>
        <h1>{selectedSector}</h1>
        <SectorSelector selectedSector={selectedSector} handleSectorChange={handleSectorChange} />
        <YearsSelectors
          xYears={xYears}
          yYears={yYears}
          handleXYearsChange={handleXYearsChange}
          handleYYearsChange={handleYYearsChange}
        />
        {isLoading ? (
          <LoadingIndicator />
        ) : (
<SharpePlotGraph
  sharpeData={sharpeData}
  xYears={xYears}
  yYears={yYears}
  selectedSector={selectedSector}
  sectorLabel={sectorLabels[selectedSector]}
/>

        )}
      </div>
    </BaseLayout>
  );
};

export default SharpePlot;
