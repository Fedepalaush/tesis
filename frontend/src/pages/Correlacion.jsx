import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import BaseLayout from '../components/BaseLayout';
import NavbarComp from '../components/NavbarComp';
import Sidebar from '../components/SidebarComp';
import { SidebarItem } from '../components/SidebarComp';
import { LayoutDashboard, BarChart3, UserCircle, Boxes, Package, Receipt, Settings, LifeBuoy } from 'lucide-react';
import {tickersBM} from '../ticker'


const Correlacion = () => {
  const [correlationMatrix, setCorrelationMatrix] = useState(null);
  const [selectedTickers, setSelectedTickers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tickers, setTickers] = useState(tickersBM);
  
  const handleTickerChange = (event) => {
    const value = event.target.value;
    if (!selectedTickers.includes(value) && value) {
      setSelectedTickers((prevSelectedTickers) => [...prevSelectedTickers, value]);
    }
  };

  const handleRemoveTicker = (ticker) => {
    setSelectedTickers((prevSelectedTickers) => prevSelectedTickers.filter(t => t !== ticker));
  };

  const handleSubmit = () => {
    if (selectedTickers.length === 0) {
      alert("Please select at least one ticker.");
      return;
    }

    setIsLoading(true);

    const tickersQueryString = selectedTickers.map(ticker => `tickers=${ticker}`).join('&');
    fetch(`http://localhost:8000/api/get_correlation_matrix?${tickersQueryString}&timeframe=1d`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.correlation_matrix) {
          setCorrelationMatrix(data.correlation_matrix);
        } else {
          console.error('Error fetching correlation matrix:', data.error);
        }
      })
      .catch(error => {
        console.error('Error fetching correlation matrix:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div>
      <BaseLayout>
        <div className="dark:bg-black text-white min-h-screen flex">
          <div className="flex-grow flex justify-center">
            <div className="pl-10">
              <h2 className="text-2xl mb-4">Selecciona Tickers</h2>
              <div className="mb-4">
                <select onChange={handleTickerChange} className="p-2 bg-gray-800 text-white rounded">
                  <option value="">Selecciona un ticker</option>
                  {tickers.filter(ticker => !selectedTickers.includes(ticker)).map(ticker => (
                    <option key={ticker} value={ticker}>{ticker}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                {selectedTickers.length > 0 && selectedTickers.map(ticker => (
                  <div key={ticker} className="flex items-center space-x-2 bg-gray-700 p-2 rounded">
                    <span>{ticker}</span>
                    <button
                      onClick={() => handleRemoveTicker(ticker)}
                      className="text-red-600 hover:text-red-800"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={handleSubmit} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded">Ejecutar</button>
              {isLoading ? (
                <p>Cargando Matriz de Correlación...</p>
              ) : (
                correlationMatrix && (
                  <div>
                    <Plot
                      data={[
                        {
                          z: Object.values(correlationMatrix).map(row => Object.values(row)),
                          x: Object.keys(correlationMatrix),
                          y: Object.keys(correlationMatrix),
                          type: 'heatmap',
                          colorscale: [
                            [0, 'red'], // Lowest correlation
                            [1, 'green'], // Highest correlation
                          ],
                          showscale: true,
                          text: Object.values(correlationMatrix).map(row => Object.values(row).map(value => value.toFixed(2))),
                          hoverinfo: 'text',
                          zmin: -1,
                          zmax: 1,
                        },
                      ]}
                      layout={{
                        title: 'Matriz de Correlación',
                        xaxis: { title: 'Tickers' },
                        yaxis: { title: 'Tickers' },
                        width: 800, // Width of the plot
                        height: 800, // Height of the plot
                        paper_bgcolor: 'black',
                        plot_bgcolor: 'black',
                        font: {
                          color: 'white',
                        },
                      }}
                      config={{ responsive: true }}
                    />
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </BaseLayout>
    </div>
  );
};

export default Correlacion;
