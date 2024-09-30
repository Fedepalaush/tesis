import React, { useEffect, useState } from "react";
import axios from "axios";
import Plot from "react-plotly.js";
import BaseLayout from "../components/BaseLayout";

const SoportesResistencias = () => {
  const [data, setData] = useState([]);
  const [historical, setHistorical] = useState([]);
  const [limites, setLimites] = useState();
  const [selectedTicker, setSelectedTicker] = useState("AAPL"); // Ticker seleccionado

  // Establecer un límite para la distancia entre líneas horizontales
  const LIMIT_DISTANCE = limites; // Puedes ajustar este valor según sea necesario

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Enviar el ticker seleccionado al backend
        const response = await axios.get("http://localhost:8000/get_pivot_points/", {
          params: { ticker: selectedTicker }
        });
        setData(response.data.data);
        setHistorical(response.data.historical);
        console.log(response.data.data);
        setLimites(response.data.limites);
        console.log(limites);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedTicker]); // Volver a ejecutar cada vez que cambie el ticker seleccionado

  if (data.length === 0 || historical.length === 0) {
    return <div>Loading...</div>;
  }

  // Crear datos para gráfico de velas japonesas
  const candlestickData = {
    x: historical.map((entry) => entry.date),
    open: historical.map((entry) => entry.open_price),
    high: historical.map((entry) => entry.high_price),
    low: historical.map((entry) => entry.low_price),
    close: historical.map((entry) => entry.close_price),
    type: "candlestick",
    increasing: { line: { color: "green" } },
    decreasing: { line: { color: "red" } },
  };

  // Datos para puntos pivote
  const pivotScatter = {
    x: data.map((entry) => entry.time),
    y: data.map((entry) => entry.pointpos),
    mode: "markers",
    marker: { size: 10, color: "MediumPurple" },
    name: "Pivot Points",
  };

  // Determinar el rango de fechas visible
  const startDate = new Date(historical[0].date);
  const endDate = new Date(historical[historical.length - 1].date);

  // Filtrar los puntos pivote que caen dentro del rango visible
  const filteredPivotLines = data.filter((entry) => {
    const pivotDate = new Date(entry.time);
    return pivotDate >= startDate && pivotDate <= endDate;
  });

  // Lista para almacenar los niveles de las líneas horizontales ya trazadas
  const drawnLevels = [];

  // Datos para líneas horizontales de pivote
  const pivotLines = filteredPivotLines.reduce((acc, entry) => {
    // Verificar si la diferencia con algún nivel ya trazado es mayor que el límite
    const isFarEnough = drawnLevels.every(level => Math.abs(entry.pointpos - level) > LIMIT_DISTANCE);

    if (isFarEnough) {
      // Agregar la nueva línea y el nivel a la lista
      drawnLevels.push(entry.pointpos);
      acc.push({
        x: [historical[0].date, historical[historical.length - 1].date],
        y: [entry.pointpos, entry.pointpos],
        mode: "lines",
        line: { color: "MediumPurple", width: 2, dash: "dash" },
        name: `Pivot Point: ${entry.type}`,
      });
    }

    return acc;
  }, []);

  return (
    <BaseLayout>
      <div className="flex flex-col justify-center items-center h-full">
        {/* Selector de ticker */}
        <div className="w-full max-w-sm mb-4">
          <select
            value={selectedTicker}
            onChange={(e) => setSelectedTicker(e.target.value)}
            className="p-2 border rounded w-full"
          >
            <option value="AAPL">Apple (AAPL)</option>
            <option value="GOOGL">Google (GOOGL)</option>
            <option value="MSFT">Microsoft (MSFT)</option>
            {/* Agrega más opciones según sea necesario */}
          </select>
        </div>

        {/* Gráfico */}
        <div className="w-full flex justify-center">
          <div className="w-3/4"> {/* El contenedor ocupa el 75% del ancho disponible */}
            <Plot
              data={[candlestickData, pivotScatter, ...pivotLines]}
              layout={{
                xaxis: { rangeslider: { visible: false }, type: "date" },
                yaxis: { title: "Price" },
                paper_bgcolor: "black",
                plot_bgcolor: "black",
                showlegend: false,
              }}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default SoportesResistencias;
