// components/CandlestickChart.js
import React from "react";
import Plot from "react-plotly.js";

const CandlestickChart = ({ historical, data, pivotLines }) => {
  const candlestickData = {
    x: historical.map((entry) => entry.date),
    open: historical.map((entry) => entry.open_price),
    high: historical.map((entry) => entry.high_price),
    low: historical.map((entry) => entry.low_price),
    close: historical.map((entry) => entry.close_price),
    type: "candlestick",
    increasing: { line: { color: "green" } },
    decreasing: { line: { color: "red" } },
  };

  const pivotScatter = {
    x: data.map((entry) => entry.time),
    y: data.map((entry) => entry.pointpos),
    mode: "markers",
    marker: { size: 10, color: "MediumPurple" },
    name: "Pivot Points",
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-3/4">
        <Plot
          data={[candlestickData, pivotScatter, ...pivotLines]}
          layout={{
            xaxis: { rangeslider: { visible: false }, type: "date" },
            yaxis: { title: "Price" },
            paper_bgcolor: "black",
            plot_bgcolor: "black",
            showlegend: false,
          }}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default CandlestickChart;
