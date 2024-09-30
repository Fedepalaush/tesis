import React from 'react';
import Plot from 'react-plotly.js';
import { Card, Title } from '@tremor/react';

const DonutChart = ({ data }) => {
  const labels = data.map(item => item.ticker);
  const values = data.map(item => item.porcentaje_cartera);

  return (
    <Card className="w-full max-w-lg mx-auto"> {/* Ajusta el tamaño máximo y centraliza */}
      <Title>Distribución de Activos</Title>
      <Plot
        data={[
          {
            type: 'pie',
            labels: labels,
            values: values,
            hole: 0.4,
            textinfo: 'label+percent',
            insidetextorientation: 'radial',
            marker: {
              colors: ['#ff9999','#66b3ff','#99ff99','#ffcc99','#c2c2f0','#ffb3e6']
            }
          }
        ]}
        layout={{
          autosize: true, // Habilita el ajuste automático del tamaño
          responsive: true, // Responsividad activada
          title: {
            text: 'Distribución de Activos en la Cartera',
            font: {
              color: '#ffffff'
            }
          },
          paper_bgcolor: '#111827', // Fondo del área del gráfico
          plot_bgcolor: '#1e293b',  // Fondo del área del gráfico
          font: {
            color: '#ffffff'
          },
          showlegend: true,
        }}
        useResizeHandler={true} // Permite que Plotly redimensione
        style={{ width: '100%', height: '100%' }} // Ocupa el 100% del espacio disponible
      />
    </Card>
  );
};

export default DonutChart;
