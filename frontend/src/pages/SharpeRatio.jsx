// pages/SharpePlot.js
import React, { useState, useEffect } from "react";
import BaseLayout from "../components/BaseLayout";
import SectorSelector from "../components/SectorSelector";
import YearsSelectors from "../components/YearsSelector";
import SharpePlotGraph from "../components/SharpePlotGraph";
import LoadingIndicator from "../components/LoadingIndicator";
import { fetchSharpeRatioData } from "../api"; // Importa la función desde api.js

const SharpePlot = () => {
  const [sharpeData, setSharpeData] = useState([]);
  const [selectedSector, setSelectedSector] = useState("Information Technology");
  const [loading, setLoading] = useState(false);
  const [xYears, setXYears] = useState(5); // Años para el eje X
  const [yYears, setYYears] = useState(2); // Años para el eje Y

  useEffect(() => {
    fetchData(selectedSector, xYears, yYears); // Llamada inicial con los años seleccionados
  }, [selectedSector, xYears, yYears]); // Llamada cada vez que cambian el sector o los años

  const fetchData = async (sector, xYears, yYears) => {
    setLoading(true); // Indicar que la carga está en progreso
    try {
      const data = await fetchSharpeRatioData(sector, xYears, yYears);
      setSharpeData(data);
    } catch (error) {
      console.error("Error al obtener datos del Sharpe Ratio:", error);
    } finally {
      setLoading(false); // Indicar que la carga ha terminado
    }
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
        <SectorSelector selectedSector={selectedSector} handleSectorChange={handleSectorChange} />
        <YearsSelectors
          xYears={xYears}
          yYears={yYears}
          handleXYearsChange={handleXYearsChange}
          handleYYearsChange={handleYYearsChange}
        />
        {loading ? (
          <LoadingIndicator />
        ) : (
          <SharpePlotGraph
            sharpeData={sharpeData}
            xYears={xYears}
            yYears={yYears}
            selectedSector={selectedSector}
          />
        )}
      </div>
    </BaseLayout>
  );
};

export default SharpePlot;
