import React from "react";
import Plot from "react-plotly.js";

const GaugeChart = ({ title, currentValue, minValue = 0, maxValue = 50, orden = "normal" }) => {
  const plotBgColor = "#000"; // Fondo oscuro
  const defaultColors = [plotBgColor, "#f25829", "#f2a529", "#eff229", "#85e043", "#2bad4e"];
  const defaultText = ["", "<b>Muy Alto</b>", "<b>Alto</b>", "<b>Medio</b>", "<b>Bajo</b>", "<b>Muy bajo</b>"];

  // Conditionally reverse the colors and text
  const quadrantColors = orden === "inverso" ? [plotBgColor].concat(defaultColors.slice(1).reverse()) : defaultColors;

  const nQuadrants = quadrantColors.length - 1;

  const handLength = Math.sqrt(2) / 4;
  const handAngle = Math.PI * (1 - (Math.max(minValue, Math.min(maxValue, currentValue)) - minValue) / (maxValue - minValue));

  const values = [0.5].concat(Array(nQuadrants).fill(1 / (2 * nQuadrants)));

  return (
    <div className="w-full mx-auto flex justify-center items-center mt-4">
      <Plot
        data={[
          {
            type: "pie",
            values: values,
            rotation: 90,
            hole: 0.5,
            marker: {
              colors: quadrantColors
            },
            text: defaultText,
            textinfo: "text",
            hoverinfo: "skip"
          }
        ]}
        layout={{
          showlegend: false,
          margin: { b: 0, t: 10, l: 10, r: 10 },
          width: 400,
          height: 300,
          paper_bgcolor: plotBgColor,
          annotations: [
            {
              text: `<b>${title}:</b><br>${currentValue.toFixed(2)}`,
              x: 0.5, 
              xanchor: "center", 
              xref: "paper",
              y: 0.25, 
              yanchor: "bottom", 
              yref: "paper",
              font: { color: 'white' }, // Texto blanco
              showarrow: false
            }
          ],
          shapes: [
            {
              type: "circle",
              x0: 0.48, x1: 0.52,
              y0: 0.48, y1: 0.52,
              fillcolor: "#fff",
              line: { color: "#fff" }
            },
            {
              type: "line",
              x0: 0.5, x1: 0.5 + handLength * Math.cos(handAngle),
              y0: 0.5, y1: 0.5 + handLength * Math.sin(handAngle),
              line: { color: "#fff", width: 4 }
            }
          ]
        }}
      />
    </div>
  );
};

export default GaugeChart;
