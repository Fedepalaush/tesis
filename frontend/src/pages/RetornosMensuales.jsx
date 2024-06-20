import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import BaseLayout from '../components/BaseLayout';

const MonthlyReturnsChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicker, setSelectedTicker] = useState('AAPL');
  const activos = ['AAPL', 'MSFT', 'KO'];

  useEffect(() => {
    fetch(`http://localhost:8000/get_retornos_mensuales?ticker=${selectedTicker}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
      })
      .then(data => {
        setData(data.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        setLoading(false);
      });
  }, [selectedTicker]);

  const handleTickerChange = (event) => {
    setSelectedTicker(event.target.value);
    setLoading(true);  // Set loading to true when changing ticker
  };

  // Crear la estructura de los datos para Plotly
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const years = [...new Set(data.map(d => d.year))];
  const returns = data.map(d => d.return * 100); // Convertir a porcentaje
  const minReturn = Math.floor(Math.min(...returns) / 10) * 10; // Redondear hacia abajo al múltiplo de 10 más cercano
  const maxReturn = Math.ceil(Math.max(...returns) / 10) * 10; // Redondear hacia arriba al múltiplo de 10 más cercano
  const z = years.map(year => {
    return months.map((month, idx) => {
      const entry = data.find(d => d.year === year && d.month === idx + 1);
      return entry ? entry.return * 100 : null;  // Convertir a porcentaje
    });
  });

  const text = z.map(row => row.map(value => value !== null ? `${value.toFixed(2)}%` : 'N/A'));

  return (
    <BaseLayout>
      <div className="dark:bg-black text-white min-h-screen flex flex-col items-center justify-center">
        <div className="mb-4">
          <select
            value={selectedTicker}
            onChange={handleTickerChange}
            className="bg-gray-800 text-white p-2 rounded-md border border-gray-700 focus:outline-none focus:border-blue-500"
          >
            {activos.map(activo => (
              <option key={activo} value={activo}>{activo}</option>
            ))}
          </select>
        </div>
        {loading ? (
          <div className="text-lg">Loading data...</div>
        ) : (
          <Plot
            data={[
              {
                z,
                x: months,
                y: years,
                type: 'heatmap',
                hoverongaps: false,
                colorscale: [
                  [0, 'rgb(0,128,0)'],     // Verde más fuerte
                  [0.5, 'rgb(255,255,150)'], // Amarillo
                  [1, 'rgb(255,0,0)']       // Rojo más fuerte
                ],
                zmin: minReturn,
                zmax: maxReturn,
                colorbar: {
                  title: 'Retorno Mensual (%)'
                },
                text,
                hoverinfo: 'text',
                showscale: true
              }
            ]}
            layout={{
              title: `Retorno Mensual de ${selectedTicker} Durante 10 Años`,
              xaxis: {
                title: 'Mes'
              },
              yaxis: {
                title: 'Año'
              },
              height: 800, // Aumentar el tamaño del gráfico
              width: 1000, // Aumentar el tamaño del gráfico
              margin: {
                l: 50,
                r: 50,
                b: 50,
                t: 50,
                pad: 4
              },
              annotations: text.flatMap((row, i) =>
                row.map((value, j) => ({
                  x: months[j],
                  y: years[i],
                  text: value,
                  xref: 'x',
                  yref: 'y',
                  showarrow: false,
                  font: {
                    color: 'black'
                  }
                }))
              ),
              plot_bgcolor: 'rgb(0, 0, 0)', // Fondo negro
              paper_bgcolor: 'rgb(0, 0, 0)' // Fondo negro
            }}
            config={{
              displayModeBar: false
            }}
          />
        )}
      </div>
    </BaseLayout>
  );
};

export default MonthlyReturnsChart;
