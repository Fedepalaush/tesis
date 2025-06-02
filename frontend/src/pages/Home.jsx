import React from "react";
import { LayoutDashboard, BarChart3 } from "lucide-react";

import Sidebar, { SidebarItem } from "../components/SidebarComp";
import CardUsageExample from "../components/Card";
import { TableUsageExample } from "../components/Table";
import ModalCompra from "../components/ModalCompra";
import DonutChart from "../components/DonutChart";
import VolatilidadYBetaGrafico from "../components/VolatilidadYBetaGrafico";

import useActivos from "../hooks/useActivos";
import { usePortfolioMetrics } from "../hooks/usePortfolioMetrics";

import { useTickers } from '../TickersContext';

function Home() {
  const {
    activos,
    isLoading,
    openCompra,
    tickerToBuy,
    precioCompra,
    cantidad,
    handleOpenCompra,
    handleCloseCompra,
    setTickerToBuy,
    setPrecioCompra,
    setCantidad,
    handleCreateActivo,
    handleDeleteActivo,
    total_inv,
    inversion_actual,
    diferencia_total_pct,
  } = useActivos();

  const { tickers } = useTickers();
  const { volatilidadData, betaData } = usePortfolioMetrics(activos);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="dark:bg-black">
      <div className="flex w-full">
        <aside className="h-screen sticky top-0">
          <Sidebar>
            <SidebarItem icon={<LayoutDashboard size={20} />} text="Dashboard" alert active />
            <SidebarItem icon={<BarChart3 size={20} />} text="Análisis" href="/analisisActivo" />
          </Sidebar>
        </aside>

        <main className="w-screen pl-10 pr-8 pt-6">
          {/* Tarjetas de resumen */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CardUsageExample text="Inversión Inicial" number={`$${total_inv.toFixed(2)}`} />
            <CardUsageExample text="Inversión Actual" number={`$${inversion_actual.toFixed(2)}`} />
            <CardUsageExample text="Diferencia" number={`${diferencia_total_pct.toFixed(2)}%`} />
          </div>

          {/* Tabla y Modal */}
          <section className="mt-6 max-w-7xl mx-auto">
            <TableUsageExample
              data={activos || []} // por si acaso
              onOpenCompra={handleOpenCompra}
              handleDeleteActivo={handleDeleteActivo}
            />

            {openCompra && (
              <ModalCompra
              tickers = {tickers}
                open={openCompra}
                onClose={handleCloseCompra}
                onSubmit={handleCreateActivo}
                tickerToBuy={tickerToBuy}
                setTickerToBuy={setTickerToBuy}
                precioCompra={precioCompra}
                setPrecioCompra={setPrecioCompra}
                cantidad={cantidad}
                setCantidad={setCantidad}
              />
            )}
          </section>

          {/* Gráficos */}
          <section className="mt-6 max-w-7xl flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">
              <DonutChart data={activos} />
            </div>
            <div className="md:w-1/2 flex flex-col gap-4">
              <VolatilidadYBetaGrafico title="Volatilidad" data={activos.length > 0 ? volatilidadData : []} strokeColor="#8884d8" />
              <VolatilidadYBetaGrafico title="Beta" data={activos.length > 0 ? betaData : []} strokeColor="#82ca9d" />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Home;
