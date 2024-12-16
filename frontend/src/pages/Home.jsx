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


function Home() {
  const [tickers, setTickers] = useState([]);
  const [openCompra, setOpenCompra] = useState(false);
  const [tickerToBuy, setTickerToBuy] = useState("");
  const [precioCompra, setPrecioCompra] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [total, setTotal] = useState("");
  const tickersDrop = tickersBM;

  useEffect(() => {
    getActivos();
  }, []);

  const getActivos = () => {
    api
      .get("/api/activos/")
      .then((res) => res.data)
      .then((data) => {
        setTickers(data);
        console.log(data);
      })
      .catch((err) => alert(err));
  };

  const deleteActivo = (id) => {
    api
      .delete(`/api/activos/delete/${id}/`)
      .then((res) => {
        if (res.status == 204) alert("Activo eliminado");
        else alert("Fallo la eliminacion del activo");
        getActivos();
      })
      .catch((error) => alert(error));
  };

  const createActivo = (e) => {
    e.preventDefault();
    api
      .post("/api/activos/", { ticker: tickerToBuy, precioCompra, cantidad })
      .then((res) => {
        if (res.status === 201) alert("Activo Creado");
        else alert("Fallo la creacion");
        setTickerToBuy("");
        setPrecioCompra("");
        setCantidad("");
        getActivos();
        setOpenCompra(false);
      })
      .catch((err) => alert(err));
  };

  const openCompraSetter = (isOpen, ticker) => {
    setTickerToBuy(ticker);
    setOpenCompra(isOpen);
  };

  // Calcula el total acumulado
  const totalSum = tickers.reduce((acc, item) => acc + item.precioCompra * item.cantidad, 0).toFixed(2);
  const invActual = tickers.reduce((acc, item) => acc + item.precioActual * item.cantidad, 0).toFixed(2);
  const diferencia = ((invActual / totalSum - 1) * 100).toFixed(2);

  useEffect(() => {
    setTotal(totalSum);
  }, [totalSum]);

  return (
    <div>
      <body className="dark:bg-black">
        <div className="flex w-full">
          {/* Sidebar */}
          <aside className="h-screen sticky top-0">
            <Sidebar>
              <SidebarItem icon={<LayoutDashboard size={20} />} text="Dashboard" alert active />
              <SidebarItem icon={<BarChart3 size={20} />} text="Análisis" href="/analisisActivo" />
            </Sidebar>
          </aside>
          {/* Contenido principal */}
          <div className="w-screen pl-10">
            <div className="grid grid-cols-1 mt-4 lg:grid-cols-3 md:grid-cols-2 gap-3 h-max-full">
              <CardUsageExample text="Inversión Inicial" number={`$${total}`} />
              <CardUsageExample text="Inversión Actual" number={`$${invActual}`} />
              <CardUsageExample text="Diferencia" number={`${diferencia}%`} />
            </div>
            <div className="w-full mt-6 mx-auto px-14">
              <TableUsageExample data={tickers} openCompraSetter={openCompraSetter} deleteActivo={deleteActivo} />
              {openCompra && (
                <Modal open={openCompra} onClose={() => setOpenCompra(false)}>
                  <div className="text-center w-56">
                    <h1 className="mx-auto">Compra</h1>
                    <div className="mx-auto my-4 w-48">
                      <h3 className="text-lg font-black text-gray-800">Comprar</h3>
                      <div className="space-y-3">
                        <select value={tickerToBuy} onChange={(e) => setTickerToBuy(e.target.value)}>
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
                          onChange={(e) => setPrecioCompra(parseFloat(e.target.value))}
                        />
                        <input
                          type="number"
                          placeholder="Cantidad"
                          value={cantidad}
                          onChange={(e) => setCantidad(parseInt(e.target.value))}
                        />
                      </div>
                      <div className="flex gap-3 justify-center mt-3">
                        <Button variant="primary" color="red" size="sm" onClick={() => setOpenCompra(false)}>
                          Cancelar
                        </Button>
                        <Button variant="primary" color="green" size="sm" onClick={createActivo}>
                          Comprar
                        </Button>
                      </div>
                    </div>
                  </div>
                </Modal>
              )}
            </div>
            <div className="mt-4 px-14 w-full md:w-1/2">
            <DonutChart data={tickers} />
            </div>
          </div>
        </div>
      </body>
    </div>
  );
}

export default Home;
