import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import BaseLayout from "../components/BaseLayout";

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
      const response = await fetch(
        `http://localhost:8000/sharpe-ratio/?sector=${sector}&x_years=${xYears}&y_years=${yYears}`
      );
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

  const handleXYearsChange = (event) => {
    setXYears(event.target.value);
  };

  const handleYYearsChange = (event) => {
    setYYears(event.target.value);
  };

  return (
    <BaseLayout>
      <div className="flex flex-col justify-center items-center h-screen" style={{ backgroundColor: "black" }}>
        <select value={selectedSector} onChange={handleSectorChange} className="mb-4 p-2 bg-gray-800 text-white">
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
        <div className="flex mb-4">
          <select value={xYears} onChange={handleXYearsChange} className="mr-2 p-2 bg-gray-800 text-white">
            {[1, 2, 3, 4, 5].map((year) => (
              <option key={year} value={year}>
                {year} Años
              </option>
            ))}
          </select>
          <select value={yYears} onChange={handleYYearsChange} className="p-2 bg-gray-800 text-white">
            {[1, 2, 3, 4, 5].map((year) => (
              <option key={year} value={year}>
                {year} Años
              </option>
            ))}
          </select>
        </div>
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
                  x: sharpeData.map((entry) => entry[`Sharpe ${xYears}Y`]),
                  y: sharpeData.map((entry) => entry[`Sharpe ${yYears}Y`]),
                  text: sharpeData.map((entry) => entry["ticker"]),
                  textposition: "top center",
                  marker: {
                    color: sharpeData.map((entry) => {
                      const sharpeX = entry[`Sharpe ${xYears}Y`];
                      const sharpeY = entry[`Sharpe ${yYears}Y`];
                      if (sharpeX > 0 && sharpeY > 0) {
                        return "green"; // Ambos positivos
                      } else if (sharpeX < 0 && sharpeY < 0) {
                        return "red"; // Ambos negativos
                      } else {
                        return "yellow"; // Uno positivo, otro negativo
                      }
                    }),
                  },
                },
              ]}
              layout={{
                title: `Sharpe ratio ${yYears}y v ${xYears}y: ${selectedSector} SP500`,
                xaxis: { title: `Sharpe Ratio (${xYears} Years)` },
                yaxis: { title: `Sharpe Ratio (${yYears} Years)` },
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
