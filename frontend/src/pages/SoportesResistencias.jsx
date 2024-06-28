import React, { useEffect, useState } from "react";
import axios from "axios";
import Plot from "react-plotly.js";
import BaseLayout from "../components/BaseLayout";

const SoportesResistencias = () => {
  const [data, setData] = useState([]);
  const [historical, setHistorical] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:8000/get_pivot_points/");
        setData(response.data.data); // Establecer los datos de puntos pivote
        setHistorical(response.data.historical); // Establecer los datos históricos
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Verificar si data o historical tienen contenido antes de renderizar el componente
  if (data.length === 0 || historical.length === 0) {
    return <div>Loading...</div>; // Mostrar un mensaje de carga mientras se obtienen los datos
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

  // Datos para líneas de pivote
  const pivotLines = data.map((entry) => ({
    type: "line",
    xref: "paper",
    yref: "y",
    x0: historical[0].date,
    y0: entry.pointpos,
    x1: historical[historical.length - 1].date,
    y1: entry.pointpos,
    line: { color: "MediumPurple", width: 2, dash: "dash" },
  }));

  return (
    <BaseLayout>
      <div className="flex justify-center items-center h-full">
        <Plot
          data={[candlestickData, pivotScatter, ...pivotLines]}
          layout={{
            xaxis: { rangeslider: { visible: false }, type: "date" },
            yaxis: { title: "Price" },
            paper_bgcolor: "black",
            plot_bgcolor: "black",
            showlegend: true,
            legend: { x: 0.02, y: 0.98, bgcolor: "rgba(0,0,0,0)" },
          }}
        />
      </div>
    </BaseLayout>
  );
};

export default SoportesResistencias;