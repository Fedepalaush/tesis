// src/components/StockChartDisplay.jsx
import React from 'react';
import Plot from 'react-plotly.js';

const StockChartDisplay = ({ dates, open, high, low, close, ticker }) => {
  if (!dates || dates.length === 0) {
    return null;
  }

  return (
    <div className="w-full mx-auto flex justify-center items-center my-4">
      <Plot
        data={[
          {
            x: dates,
            close: close,
            decreasing: { line: { color: 'red' } },
            high: high,
            increasing: { line: { color: 'green' } },
            line: { color: 'rgba(31,119,180,1)' },
            low: low,
            open: open,
            type: 'candlestick',
            xaxis: 'x',
            yaxis: 'y',
          },
        ]}
        layout={{
          width: Math.min(800, typeof window !== 'undefined' ? window.innerWidth - 40 : 800),
          height: 600,
          title: `GRÁFICO ${ticker.toUpperCase()}`,
          xaxis: { title: 'Fecha', automargin: true, rangeslider: { visible: false } },
          yaxis: { title: 'Precio', automargin: true },
          plot_bgcolor: 'rgba(17,24,39,0.8)',
          paper_bgcolor: 'rgba(31,41,55,0.8)',
          font: { color: 'white' },
          legend: {
            orientation: 'h',
            yanchor: 'bottom',
            y: 1.02,
            xanchor: 'right',
            x: 1,
          },
        }}
        config={{ responsive: true }}
      />
    </div>
  );
};

export default StockChartDisplay;