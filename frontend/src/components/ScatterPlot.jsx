// components/ScatterPlot.js
import Plot from "react-plotly.js";

const ScatterPlot = ({ acciones, xParam, yParam }) => {
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

  return <Plot data={traces} layout={layout} />;
};

export default ScatterPlot;
