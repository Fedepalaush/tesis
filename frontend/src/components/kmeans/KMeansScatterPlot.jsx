import React from "react";
import Plot from "react-plotly.js";

/**
 * Componente para visualizar resultados de agrupamiento K-Means
 */
const KMeansScatterPlot = ({ clusterData, selectedParameters }) => {
  console.log(clusterData)
  // Validación segura
  const data = Array.isArray(clusterData) ? clusterData : [];

  if (data.length === 0) {
    return (
      <div className="bg-gray-900 p-8 rounded-lg shadow text-center">
        <p className="text-gray-400">No hay datos para mostrar</p>
        <p className="text-sm text-gray-500 mt-2">
          Ejecuta el agrupamiento para ver los resultados
        </p>
      </div>
    );
  }

  const coloresClusters = [
    "rgba(255, 99, 132, 0.7)",
    "rgba(54, 162, 235, 0.7)",
    "rgba(75, 192, 192, 0.7)",
    "rgba(153, 102, 255, 0.7)",
    "rgba(255, 159, 64, 0.7)",
    "rgba(255, 206, 86, 0.7)",
    "rgba(231, 233, 237, 0.7)"
  ];

  const [xParam, yParam] =
    selectedParameters && selectedParameters.length === 2
      ? selectedParameters
      : ["mean_return", "volatility"];

  const clusters = [...new Set(data.map((d) => d.Cluster))];

  const traces = clusters.map((cluster, idx) => {
    const items = data.filter((d) => d.Cluster === cluster);
    return {
      x: items.map((d) => d[xParam]),
      y: items.map((d) => d[yParam]),
      mode: "markers",
      type: "scatter",
      name: `Cluster ${cluster}`,
      marker: {
        color: coloresClusters[idx % coloresClusters.length],
        size: 12,
        line: {
          width: 2,
          color: "rgba(255, 255, 255, 0.3)"
        }
      },
      text: items.map(
        (d) =>
          `${d.index}<br>${xParam}: ${d[xParam]?.toFixed(4)}<br>${yParam}: ${d[yParam]?.toFixed(4)}`
      ),
      hoverinfo: "text",
      hovertemplate: "%{text}<extra></extra>"
    };
  });

  const layout = {
    title: {
      text: `Agrupamiento K-Means: ${xParam} vs ${yParam}`,
      font: { color: "white", size: 18 }
    },
    xaxis: {
      title: {
        text: xParam.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        font: { color: "white" }
      },
      gridcolor: "rgba(255, 255, 255, 0.1)",
      tickfont: { color: "white" }
    },
    yaxis: {
      title: {
        text: yParam.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        font: { color: "white" }
      },
      gridcolor: "rgba(255, 255, 255, 0.1)",
      tickfont: { color: "white" }
    },
    autosize: true,
    font: { color: "white" },
    plot_bgcolor: "rgba(0, 0, 0, 0.8)",
    paper_bgcolor: "rgba(0, 0, 0, 0.9)",
    legend: {
      font: { color: "white" },
      bgcolor: "rgba(0, 0, 0, 0.5)"
    },
    margin: { t: 60, r: 30, b: 60, l: 80 }
  };

  const config = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ["pan2d", "lasso2d", "select2d"],
    displaylogo: false
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow">
      <div className="mb-4">
        <h3 className="text-white text-lg font-medium mb-2">Resultados del Agrupamiento</h3>
        <div className="flex flex-wrap gap-4 text-sm text-gray-300">
          <span>Total de activos: {data.length}</span>
          <span>Clusters encontrados: {clusters.length}</span>
          <span>Parámetros: {xParam} vs {yParam}</span>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <Plot
          data={traces}
          layout={layout}
          config={config}
          style={{ width: "100%", height: "600px" }}
          useResizeHandler={true}
        />
      </div>

      <div className="mt-4">
        <h4 className="text-white font-medium mb-2">Resumen por Cluster:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {clusters.map((cluster, idx) => {
            const items = data.filter((d) => d.Cluster === cluster);
            return (
              <div
                key={cluster}
                className="bg-gray-800 p-3 rounded border-l-4"
                style={{
                  borderLeftColor: coloresClusters[idx % coloresClusters.length]
                }}
              >
                <div className="text-white font-medium">Cluster {cluster}</div>
                <div className="text-sm text-gray-300">
                  {items.length} activo{items.length !== 1 ? "s" : ""}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {items.slice(0, 3).map((d) => d.index).join(", ")}
                  {items.length > 3 && "…"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default KMeansScatterPlot;
