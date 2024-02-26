import React from 'react';
import Plot from 'react-plotly.js';

function ChartComp({ data }) {
  console.log(data);

  // Extracting dates and close prices from data
  const dates = data.data.map(item => item.date);
  const closePrices = data.data.map(item => item.close_price);

  // Define trace for the plot
  const trace = {
    x: dates,
    y: closePrices,
    type: 'scatter',
    mode: 'lines',
    marker: { color: 'red' },
    name: 'Stock Data',
  };

  // Define layout for the plot
  const layout = {
    title: 'Stock Data Chart',
    xaxis: { title: 'Date' },
    yaxis: { title: 'Close Price' },
  };

  return (
    <div>
      <h2>Stock Data Chart</h2>
      <Plot
        data={[trace]}
        layout={layout}
      />
    </div>
  );
}

export default ChartComp;