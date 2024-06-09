import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';

const SharpeRatioChart = () => {
  const [sharpeData, setSharpeData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/sharpe-ratio/');
        setSharpeData(response.data.sharpe_data);
      } catch (error) {
        console.error('Error fetching Sharpe ratio data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Sharpe Ratio</h1>
      {sharpeData ? (
        <Plot
          data={[
            {
              x: sharpeData.map(entry => entry.ticker),
              y: sharpeData.map(entry => entry.sharpe_2Y),
              type: 'bar',
              name: 'Sharpe Ratio (2 Years)',
              marker: { color: 'blue' },
            },
            {
              x: sharpeData.map(entry => entry.ticker),
              y: sharpeData.map(entry => entry.sharpe_5Y),
              type: 'bar',
              name: 'Sharpe Ratio (5 Years)',
              marker: { color: 'green' },
            },
          ]}
          layout={{
            title: 'Sharpe Ratio',
            barmode: 'group',
            xaxis: { title: 'Ticker' },
            yaxis: { title: 'Sharpe Ratio' },
            width: 800,
            height: 600,
          }}
          config={{ responsive: true }}
        />
      ) : (
        <p>Loading Sharpe ratio data...</p>
      )}
    </div>
  );
};

export default SharpeRatioChart;