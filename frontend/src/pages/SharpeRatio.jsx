import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import BaseLayout from "../components/BaseLayout";

const SharpePlot = () => {
  const [sharpeData, setSharpeData] = useState([]);
  const [selectedSector, setSelectedSector] = useState('Information Technology');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData(selectedSector); // Llamada inicial con el sector predeterminado
  }, [selectedSector]); // Llamada cada vez que cambia el sector

  const fetchData = async (sector) => {
    setLoading(true); // Indicar que la carga está en progreso
    try {
      const response = await fetch(`http://localhost:8000/sharpe-ratio/?sector=${sector}`);
      if (response.ok) {
        const data = await response.json();
        setSharpeData(data.sharpe_data);
      } else {
        console.error("Error al obtener datos desde el servidor");
      }
    } catch (error) {
      console.error("Error de red:", error);
    } finally {
      setLoading(false); // Indicar que la carga ha terminado
    }
  };

  const handleSectorChange = (event) => {
    setSelectedSector(event.target.value);
  };

  return (
    <BaseLayout>
      <div className="flex flex-col justify-center items-center h-screen" style={{ backgroundColor: "black" }}>
        <select 
          value={selectedSector} 
          onChange={handleSectorChange} 
          className="mb-4 p-2 bg-gray-800 text-white"
        >
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
        {loading ? (
          <p className="text-white">Cargando...</p>
        ) : (
          <div style={{ width: "90%", height: "100%" }}>
            <Plot
              style={{ width: "100%", height: "100%" }}
              data={[
                {
                  type: "scatter",
                  mode: "markers+text",
                  x: sharpeData.map((entry) => entry["Sharpe 5Y"]),
                  y: sharpeData.map((entry) => entry["Sharpe 2Y"]),
                  text: sharpeData.map((entry) => entry["Ticker"]),
                  textposition: "top center",
                  marker: { color: "blue" },
                },
              ]}
              layout={{
                title: `Sharpe ratio 2y v 5y: ${selectedSector} SP500`,
                xaxis: { title: "Sharpe Ratio (5 Years)" },
                yaxis: { title: "Sharpe Ratio (2 Years)" },
                plot_bgcolor: "rgb(0, 0, 0)", // Fondo negro
                paper_bgcolor: "rgb(0, 0, 0)", // Fondo negro
              }}
            />
          </div>
        )}
      </div>
    </BaseLayout>
  );
};

export default SharpePlot;
