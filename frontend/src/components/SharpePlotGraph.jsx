// components/SharpePlotGraph.js
import React from "react";
import Plot from "react-plotly.js";

const SharpePlotGraph = ({ sharpeData, xYears, yYears, selectedSector }) => {
  return (
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
  );
};

export default SharpePlotGraph;
