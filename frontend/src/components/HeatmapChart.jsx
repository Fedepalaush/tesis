import React from "react";
import Plot from "react-plotly.js";

const HeatmapChart = ({ data, months, years, minReturn, maxReturn, text }) => {
  const z = years.map((year) => {
    return months.map((month, idx) => {
      const entry = data.find((d) => d.year === year && d.month === idx + 1);
      return entry ? entry.return * 100 : null; // Convertir a porcentaje
    });
  });

  return (
    <Plot
      data={[
        {
          z,
          x: months,
          y: years,
          type: "heatmap",
          hoverongaps: false,
          colorscale: [
            [0, "rgb(255,0,0)"], // Rojo más fuerte
            [0.5, "rgb(255,255,150)"], // Amarillo
            [1, "rgb(0,128,0)"], // Verde más fuerte
          ],
          zmin: minReturn,
          zmax: maxReturn,
          colorbar: {
            title: "Retorno Mensual (%)",
          },
          text,
          hoverinfo: "text",
          showscale: true,
        },
      ]}
      layout={{
        title: `Retorno Mensual de Durante los Últimos Años`,
        xaxis: {
          title: "Mes",
        },
        yaxis: {
          title: "Año",
        },
        height: 800,
        width: 1000,
        margin: {
          l: 50,
          r: 50,
          b: 50,
          t: 50,
          pad: 4,
        },
        annotations: text.flatMap((row, i) =>
          row.map((value, j) => ({
            x: months[j],
            y: years[i],
            text: value,
            xref: "x",
            yref: "y",
            showarrow: false,
            font: {
              color: "black",
            },
          }))
        ),
        plot_bgcolor: "rgb(0, 0, 0)", // Fondo negro
        paper_bgcolor: "rgb(0, 0, 0)", // Fondo negro
      }}
      config={{
        displayModeBar: false,
      }}
    />
  );
};

export default HeatmapChart;
