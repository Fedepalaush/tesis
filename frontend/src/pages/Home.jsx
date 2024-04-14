import React from "react";
import { useState, useEffect } from "react";
import api from "../api";
import Modal from "../components/Modal";
import "../App.css";
import NavbarComp from "../components/NavbarComp";
import Sidebar from "../components/SidebarComp";
import { SidebarItem } from "../components/SidebarComp";
import { LayoutDashboard, BarChart3, UserCircle, Boxes, Package, Receipt, Settings, LifeBuoy } from "lucide-react";
import { TableUsageExample } from "../components/Table";
import { CardUsageExample } from "../components/Card";
import { SparkAreaUsageExample } from "../components/SparkChart";
import { DonutChartUsageExampleWithCustomColors } from "../components/DonutChart";
import { Button } from "@tremor/react";

function Home() {
  const endpoint = `${import.meta.env.VITE_API_URL}/activos/`;

  const [stockPrices, setStockPrices] = useState({});
  const [dataLoaded, setDataLoaded] = useState(false);
  const [selectedParametro, setSelectedParametro] = useState("BA"); // Default value
  const [selectedTimeframe, setSelectedTimeframe] = useState("1d"); // Default value
  const [openCompra, setOpenCompra] = useState(false);
  const [openVenta, setOpenVenta] = useState(false);

  const abrirModalCompra = () => {
    setOpenCompra(true);
  };

  const [tickers, setTickers] = useState([]);
  const [ticker, setTicker] = useState("");
  const [precioCompra, setPrecioCompra] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [total, setTotal] = useState("");

  // Calcula el total acumulado
  const totalSum = tickers.reduce((acc, item) => acc + item.precioCompra * item.cantidad, 0).toFixed(2);
  const invActual = tickers.reduce((acc, item) => acc + item.precioActual * item.cantidad, 0).toFixed(2);
  const diferencia = ((invActual / totalSum - 1) * 100).toFixed(2);

  // Actualiza el estado local cuando el total cambia
  useEffect(() => {
    setTotal(totalSum);
  }, [totalSum]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:8000/my_custom_view/", {
          params: {
            ticker: selectedParametro,
            timeframe: selectedTimeframe, // Include selected timeframe in the request
          },
        });
        setStockPrices(response.data);
        setDataLoaded(true);
      } catch (error) {
        // Handle error
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    // Cleanup function not needed in this case because there are no subscriptions or timers
  }, [selectedParametro, selectedTimeframe]); // Fetch data when selectedParametro or selectedTimeframe changes */

  // Handler function for dropdown change
  const handleParametroChange = (event) => {
    setSelectedParametro(event.target.value);
  };

  // Handler function for timeframe dropdown change
  const handleTimeframeChange = (event) => {
    setSelectedTimeframe(event.target.value);
  };

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
      .post("/api/activos/", { ticker, precioCompra, cantidad })
      .then((res) => {
        if (res.status === 201) alert("Activo Creado");
        else alert("Fallo la creacion");
        setTicker("");
        setPrecioCompra(0);
        setCantidad(1);
        getActivos();
        setOpenCompra(false )
      })
      .catch((err) => alert(err));
  };
  return (
    <div>
      <div>
        <div className="w-full">
          <NavbarComp />
        </div>

        <body className="dark:bg-black">
          <div className="flex w-full">
            <aside class="h-screen sticky top-0">
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
            <div className="w-screen pl-10">
              <div className=" grid grid-col-1 mt-4 lg:grid-cols-3 md:grid-cols-2 gap-3  h-max-full">
                <CardUsageExample text="Inversion Inicial" number={`$${total}`} />
                <CardUsageExample text="Inversion Actual" number={`$${invActual}`} />
                <CardUsageExample text="Diferencia" number={`${diferencia}%`} />
              </div>
              <div className="w-full mt-6 mx-auto px-14">
                <TableUsageExample data={tickers} openCompraSetter={setOpenCompra} deleteActivo={deleteActivo} />
                {openCompra && <Modal open={openCompra} onClose={() => setOpenCompra(false)} />}
              </div>
              <div className="mt-4">
                <DonutChartUsageExampleWithCustomColors />
              </div>
            </div>
          </div>
        </body>

        <ul>
          {tickers.map((item, index) => {
            const total = item.precioCompra * item.cantidad;
            return (
              <li key={index}>
                <span>{item.ticker}</span> - <span>{item.precioCompra}</span> - <span>Cantidad: {item.cantidad}</span> -{" "}
                <span>Total: {total}</span>
                <button onClick={() => deleteActivo(item.id)}>Eliminar</button>
              </li>
            );
          })}
        </ul>
      </div>

      <Modal open={openCompra} onClose={() => setOpenCompra(false)}>
        <div className="text-center w-56">
          <h1 className="mx-auto">Compra</h1>
          <div className="mx-auto my-4 w-48">
            <h3 className="text-lg font-black text-gray-800">Comprar</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Ticker" value={ticker} onChange={(e) => setTicker(e.target.value)} />
              <input
                type="number"
                placeholder="Precio"
                value={precioCompra}
                onChange={(e) => setPrecioCompra(parseFloat(e.target.value))}
              />
              <input type="number" placeholder="Cantidad" value={cantidad} onChange={(e) => setCantidad(parseInt(e.target.value))} />
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

      {/* Modal Venta */}
      {/*       <Modal open={open} onClose={() => setOpen(false)}>
        <div className="text-center w-56">
          <h1 className="mx-auto">Fede</h1>
          <div className="mx-auto my-4 w-48">
            <h3 className="text-lg font-black text-gray-800">Vender</h3>
            <p className="text-sm text-gray-500">Estas seguro que queres cerrar esta posicion?</p>
          </div>
          <div className="flex gap-4">
            <button className="btn btn-danger-w-full">Delete</button>
            <button className="btn btn-light-w-full" onClick={() => setOpen(false)}>
              Cancelar
            </button>
          </div>
        </div>
      </Modal> */}
    </div>
  );
}

export default Home;
