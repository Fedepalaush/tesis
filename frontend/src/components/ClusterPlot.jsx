// components/ClusterPlot.js
import React from "react";
import Plot from "react-plotly.js";

const ClusterPlot = ({ acciones, parametrosSeleccionados }) => {
  if (parametrosSeleccionados.length !== 2) return null;

  const [xParam, yParam] = parametrosSeleccionados;

  const coloresClusters = [
    "rgba(255, 99, 132, 0.5)",
    "rgba(54, 162, 235, 0.5)",
    "rgba(75, 192, 192, 0.5)",
    "rgba(153, 102, 255, 0.5)",
    "rgba(255, 159, 64, 0.5)",
  ];

  const clusters = [...new Set(acciones.map((a) => a.Cluster))];

  const traces = clusters.map((cluster, idx) => {
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

  const layout = {
    title: "Scatterplot de Acciones",
    xaxis: { title: xParam },
    yaxis: { title: yParam },
    autosize: true,
    font: { color: "white" },
    plot_bgcolor: "black",
    paper_bgcolor: "black",
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Plot data={traces} layout={layout} />
    </div>
  );
};

export default ClusterPlot;
