// src/hooks/useKMeansLogic.js
import { useState, useMemo } from "react";
import { obtenerDatosAgrupamiento } from "../api";

export const useKMeansLogic = (selectedTickers, parametrosSeleccionados, startDate, endDate) => {
  const [acciones, setAcciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const coloresClusters = [
    "rgba(255, 99, 132, 0.5)",
    "rgba(54, 162, 235, 0.5)",
    "rgba(75, 192, 192, 0.5)",
    "rgba(153, 102, 255, 0.5)",
    "rgba(255, 159, 64, 0.5)",
  ];

  const obtenerDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await obtenerDatosAgrupamiento(selectedTickers, parametrosSeleccionados, startDate, endDate);
      setAcciones(data);
    } catch (err) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (selectedTickers.length < 3) {
      alert("Selecciona al menos 3 tickers.");
      return;
    }
    if (parametrosSeleccionados.length !== 2) {
      alert("Selecciona exactamente 2 parámetros.");
      return;
    }
    obtenerDatos();
  };

  const [xParam, yParam] = parametrosSeleccionados.length === 2
    ? parametrosSeleccionados
    : ["mean_return", "volatility"];

  const clusters = useMemo(() => [...new Set(acciones.map((a) => a.Cluster))], [acciones]);

  const traces = useMemo(() => {
    return clusters.map((cluster, idx) => {
      const filtered = acciones.filter((a) => a.Cluster === cluster);
      return {
        x: filtered.map((a) => a[xParam]),
        y: filtered.map((a) => a[yParam]),
        mode: "markers",
        type: "scatter",
        name: `Cluster ${cluster}`,
        marker: {
          color: coloresClusters[idx % coloresClusters.length],
          size: 10,
        },
        text: filtered.map((a) => a.index),
        hoverinfo: "text+x+y",
      };
    });
  }, [acciones, xParam, yParam, clusters]);

  const layout = useMemo(() => ({
    title: "Scatterplot de Acciones",
    xaxis: { title: xParam },
    yaxis: { title: yParam },
    autosize: true,
    font: { color: "white" },
    plot_bgcolor: "black",
    paper_bgcolor: "black",
  }), [xParam, yParam]);

  return {
    acciones,
    loading,
    error,
    handleSubmit,
    traces,
    layout,
  };
};
