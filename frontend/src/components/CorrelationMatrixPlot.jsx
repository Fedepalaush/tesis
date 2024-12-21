import React from 'react';
import Plot from 'react-plotly.js';

const CorrelationMatrixPlot = ({ correlationMatrix }) => (
  <Plot
    data={[
      {
        z: Object.values(correlationMatrix).map(row => Object.values(row)),
        x: Object.keys(correlationMatrix),
        y: Object.keys(correlationMatrix),
        type: 'heatmap',
        colorscale: [
          [0, 'red'],
          [1, 'green'],
        ],
        showscale: true,
        text: Object.values(correlationMatrix).map(row =>
          Object.values(row).map(value => value.toFixed(2))
        ),
        hoverinfo: 'text',
        zmin: -1,
        zmax: 1,
      },
    ]}
    layout={{
      title: 'Matriz de Correlación',
      xaxis: { title: 'Tickers' },
      yaxis: { title: 'Tickers' },
      width: 800,
      height: 800,
      paper_bgcolor: 'black',
      plot_bgcolor: 'black',
      font: { color: 'white' },
    }}
    config={{ responsive: true }}
  />
);

export default CorrelationMatrixPlot;
