import React from 'react';
import Plot from 'react-plotly.js';

function ChartComp({ data }) {
  console.log(data);

  // Extracting dates, open, high, low, and close prices from data
  const dates = data.data.map(item => item.date);
  const openPrices = data.data.map(item => item.open_price);
  const highPrices = data.data.map(item => item.high_price);
  const lowPrices = data.data.map(item => item.low_price);
  const closePrices = data.data.map(item => item.close_price);

  // Define trace for the plot
  const trace = {
    x: dates,
    close: closePrices,
    high: highPrices,
    low: lowPrices,
    open: openPrices,
    decreasing: {line: {color: 'red'}},
    increasing: {line: {color: 'green'}},
    type: 'candlestick',
    xaxis: 'x',
    yaxis: 'y'
  };

  // Define layout for the plot
  const layout = {
    title: 'Stock Data Candlestick Chart',
    xaxis: { title: 'Date' },
    yaxis: { title: 'Price' },
  };

  return (
    <div>
      <h2>Stock Data Candlestick Chart</h2>
      <Plot
        data={[trace]}
        layout={layout}
      />
    </div>
  );
}

export default ChartComp;
