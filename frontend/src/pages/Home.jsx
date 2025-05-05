import React, { useState, useEffect } from "react";
import api from "../api";
import Modal from "../components/Modal";
import { CardUsageExample } from "../components/Card";
import { TableUsageExample } from "../components/Table";
import DonutChart from "../components/DonutChart";
import { Button } from "@tremor/react";
import Sidebar, { SidebarItem } from "../components/SidebarComp";
import { LayoutDashboard, BarChart3 } from "lucide-react";
import { tickersBM } from "../constants";
import { getActivos, deleteActivo, createActivo } from "../api";
import { getPortfolioMetrics } from "../api";
import VolatilidadYBetaGrafico from "../components/VolatilidadYBetaGrafico";

function Home() {
  const [tickers, setTickers] = useState([]);
  const [openCompra, setOpenCompra] = useState(false);
  const [tickerToBuy, setTickerToBuy] = useState("");
  const [precioCompra, setPrecioCompra] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [metrics, setMetrics] = useState({ volatilidad: null, beta: null });
  const [isLoading, setIsLoading] = useState(true); // nuevo estado
  const tickersDrop = tickersBM;

  // Fetch initial data
  useEffect(() => {
    fetchActivos();
  }, []);

  const fetchActivos = async () => {
    try {
      setIsLoading(true);
      const data = await getActivos();
      setTickers(data);
    } catch (error) {
      alert("Error al cargar los activos: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        if (tickers.length > 0) {
          const data = await getPortfolioMetrics(tickers);
          console.log("Métricas del portafolio:", data);

          const volatilidadData = data.fechas.map((fecha, index) => ({
            date: fecha,
            value: data.volatilidades[index],
          }));

          const betaData = data.fechas.map((fecha, index) => ({
            date: fecha,
            value: data.betas[index],
          }));

          setMetrics({ volatilidadData, betaData });
        }
      } catch (error) {
        console.error("Error al obtener métricas:", error);
      }
    };

    fetchMetrics();
  }, [tickers]);

  const handleDeleteActivo = async (id) => {
    try {
      const status = await deleteActivo(id);
      if (status === 204) {
        alert("Activo eliminado");
        fetchActivos();
      } else {
        alert("Falló la eliminación del activo");
      }
    } catch (error) {
      alert("Error al eliminar el activo: " + error.message);
    }
  };

  const handleCreateActivo = async (e) => {
    e.preventDefault();
    try {
      const parsedPrecio = parseFloat(precioCompra);
      const parsedCantidad = parseInt(cantidad, 10);

      if (!tickerToBuy || isNaN(parsedPrecio) || isNaN(parsedCantidad) || parsedCantidad <= 0) {
        alert("Todos los campos son obligatorios. La cantidad debe ser positiva y los valores válidos.");
        return;
      }

      const status = await createActivo(tickerToBuy, parsedPrecio, parsedCantidad);

      if (status === 201) {
        alert("Activo creado con éxito");
        fetchActivos();
        setOpenCompra(false);
        resetCompraForm();
      } else {
        alert(`Falló la creación del activo. Código de estado: ${status}`);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        alert("Error del servidor: " + error.response.data.detail);
      } else if (error.message) {
        alert("Error al crear el activo: " + error.message);
      } else {
        alert("Ocurrió un error desconocido al crear el activo.");
      }
    }
  };

  const resetCompraForm = () => {
    setTickerToBuy("");
    setPrecioCompra("");
    setCantidad("");
  };

  const openCompraSetter = (isOpen, ticker = "") => {
    setTickerToBuy(ticker);
    setOpenCompra(isOpen);
  };

  const totalSum = tickers.reduce((acc, item) => acc + item.precioCompra * item.cantidad, 0).toFixed(2);
  const invActual = tickers.reduce((acc, item) => acc + item.precioActual * item.cantidad, 0).toFixed(2);
  const diferencia = ((invActual / totalSum - 1) * 100).toFixed(2);

  // Spinner de carga mientras se cargan los datos
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

        <div className="w-screen pl-10">
          <div className="grid grid-cols-1 mt-4 lg:grid-cols-3 md:grid-cols-2 gap-3 h-max-full">
            <CardUsageExample text="Inversión Inicial" number={`$${totalSum}`} />
            <CardUsageExample text="Inversión Actual" number={`$${invActual}`} />
            <CardUsageExample text="Diferencia" number={`${diferencia}%`} />
          </div>

          <div className="w-full mt-6 mx-auto px-14">
            <TableUsageExample data={tickers} openCompraSetter={openCompraSetter} deleteActivo={handleDeleteActivo} />

            {openCompra && (
              <Modal open={openCompra} onClose={() => setOpenCompra(false)}>
                <form onSubmit={handleCreateActivo} className="text-center w-56">
                  <h1 className="mx-auto">Compra</h1>
                  <div className="mx-auto my-4 w-48">
                    <h3 className="text-lg font-black text-gray-800">Comprar</h3>
                    <div className="space-y-3">
                      <select value={tickerToBuy} onChange={(e) => setTickerToBuy(e.target.value)} required>
                        <option value="" disabled>
                          Selecciona un Ticker
                        </option>
                        {tickersDrop.map((ticker) => (
                          <option key={ticker} value={ticker}>
                            {ticker}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Precio"
                        value={precioCompra}
                        onChange={(e) => setPrecioCompra(e.target.value)}
                        required
                      />
                      <input
                        type="number"
                        placeholder="Cantidad"
                        value={cantidad}
                        onChange={(e) => setCantidad(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex gap-3 justify-center mt-3">
                      <Button variant="primary" color="red" size="sm" onClick={() => setOpenCompra(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" variant="primary" color="green" size="sm">
                        Comprar
                      </Button>
                    </div>
                  </div>
                </form>
              </Modal>
            )}
          </div>

          <div className="mt-4 px-14 w-full md:w-full flex flex-col md:flex-row">
            <div className="md:w-1/2">
              <DonutChart data={tickers} />
            </div>
            <div className="md:w-1/2 flex flex-col gap-4">
              {metrics.volatilidadData && (
                <VolatilidadYBetaGrafico title="Volatilidad" data={metrics.volatilidadData} strokeColor="#8884d8" height={250} />
              )}
              {metrics.betaData && (
                <VolatilidadYBetaGrafico title="Beta" data={metrics.betaData} strokeColor="#82ca9d" height={250} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
