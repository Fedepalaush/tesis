import React, { useState, useEffect } from "react";
import api from "../api";
import Modal from "../components/Modal";
import { CardUsageExample } from "../components/Card";
import { TableUsageExample } from "../components/Table";
import DonutChart from "../components/DonutChart";
import { Button } from "@tremor/react";
import Sidebar, { SidebarItem } from "../components/SidebarComp";
import { LayoutDashboard, BarChart3 } from "lucide-react";
import { tickersBM } from '../constants';
import { getActivos, deleteActivo, createActivo } from '../api';

function Home() {
  const [tickers, setTickers] = useState([]);
  const [openCompra, setOpenCompra] = useState(false);
  const [tickerToBuy, setTickerToBuy] = useState("");
  const [precioCompra, setPrecioCompra] = useState("");
  const [cantidad, setCantidad] = useState("");
  const tickersDrop = tickersBM;

  // Fetch initial data
  useEffect(() => {
    fetchActivos();
  }, []);

  const fetchActivos = async () => {
    try {
      const data = await getActivos();
      setTickers(data);
    } catch (error) {
      alert("Error al cargar los activos: " + error.message);
    }
  };

  const handleDeleteActivo = async (id) => {
    try {
      const status = await deleteActivo(id);
      if (status === 204) {
        alert("Activo eliminado");
        fetchActivos();
      } else {
        alert("Fallo la eliminación del activo");
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
  
      // Validación de entrada
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
        alert(`Fallo la creación del activo. Código de estado: ${status}`);
      }
    } catch (error) {
      // Si el error tiene un mensaje definido
      if (error.response && error.response.data && error.response.data.detail) {
        alert("Error del servidor: " + error.response.data.detail);
      } else if (error.message) {
        alert("Error al crear el activo: " + error.message);
      } else {
        alert("Ocurrió un error desconocido al crear el activo.");
      }
    }
  };
  
  // Función auxiliar para reiniciar el formulario
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

  return (
    <div className="dark:bg-black">
      <div className="flex w-full">
        {/* Sidebar */}
        <aside className="h-screen sticky top-0">
          <Sidebar>
            <SidebarItem icon={<LayoutDashboard size={20} />} text="Dashboard" alert active />
            <SidebarItem icon={<BarChart3 size={20} />} text="Análisis" href="/analisisActivo" />
          </Sidebar>
        </aside>

        {/* Main Content */}
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
                      <select
                        value={tickerToBuy}
                        onChange={(e) => setTickerToBuy(e.target.value)}
                        required
                      >
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

          <div className="mt-4 px-14 w-full md:w-1/2">
            <DonutChart data={tickers} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
