import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import NavbarComp from '../components/NavbarComp';
import Sidebar from '../components/SidebarComp';
import { SidebarItem } from '../components/SidebarComp';
import { LayoutDashboard, BarChart3, UserCircle, Boxes, Package, Receipt, Settings, LifeBuoy } from 'lucide-react';

const Visualizacion = () => {
  const [correlationMatrix, setCorrelationMatrix] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/get_correlation_matrix?timeframe=1d')
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
      });
  }, []);

  return (
    <div>
      <div className="w-full">
        <NavbarComp />
      </div>

      <div className="dark:bg-black text-white min-h-screen flex"> {/* Use flexbox for layout */}
        <aside className="h-screen sticky top-0">
          <Sidebar className="sticky left-0 top-0">
            <SidebarItem icon={<LayoutDashboard size={20} />} text="Dashboard" alert active />
            <SidebarItem icon={<BarChart3 size={20} />} text="Estadisticas" />
            <SidebarItem icon={<UserCircle size={20} />} text="Usuarios" />
            <SidebarItem icon={<Boxes size={20} />} text="Inventario" />
            <SidebarItem icon={<Package size={20} />} text="Ordenes" />
            <SidebarItem icon={<Receipt size={20} />} text="Facturacion" />
            <SidebarItem icon={<Settings size={20} />} text="Ajustes" />
            <SidebarItem icon={<LifeBuoy size={20} />} text="Ayuda" />
          </Sidebar>
        </aside>
        <div className="flex-grow flex justify-center"> {/* Center content horizontally */}
          <div className="pl-10">
            {correlationMatrix ? (
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
            ) : (
              <p>Cargando Matriz de Correlación...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visualizacion;