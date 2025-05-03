import React from "react";
import Plot from "react-plotly.js";

const SharpePlotGraph = ({ sharpeData, xYears, yYears, selectedSector, sectorLabel }) => {
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
          title: `Sharpe ratio ${yYears}y vs ${xYears}y: ${sectorLabel} (S&P 500)`,
          xaxis: { title: `Sharpe Ratio (${xYears} años)` },
          yaxis: { title: `Sharpe Ratio (${yYears} años)` },
          plot_bgcolor: "rgb(0, 0, 0)",
          paper_bgcolor: "rgb(0, 0, 0)",
          font: { color: "#FFFFFF" },
        }}
      />
    </div>
  );
};

export default SharpePlotGraph;
