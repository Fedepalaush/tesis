import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Visualizacion from "./pages/Visualizacion";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import axios from "axios";

import "./App.css";
import NavbarComp from "./components/NavbarComp";
import Sidebar from "./components/SidebarComp";
import { SidebarItem } from "./components/SidebarComp";
import { LayoutDashboard, BarChart3, UserCircle, Boxes, Package, Receipt, Settings, LifeBuoy } from "lucide-react";
import { CardUsageExample } from "./components/Card";
import { TableUsageExample } from "./components/Table";
import { SparkAreaUsageExample } from "./components/SparkChart";
import { DonutChartUsageExampleWithCustomColors } from "./components/DonutChart";

import { ApolloClient, InMemoryCache, ApolloProvider, gql, useQuery } from "@apollo/client";
import AnalisisActivo from "./pages/AnalisisActivo";
import Fundamental from "./pages/Fundamental";
import SharpeRatioChart from "./pages/SharpeRatio";

function Logout() {
  localStorage.clear();
  return <Navigate to="/login/" />;
}

function RegisterAndLogout() {
  localStorage.clear();
  return <Register />;
}

function App() {
  const endpoint = `${import.meta.env.VITE_API_URL}/activos/`;

  const [stockPrices, setStockPrices] = useState({});
  const [dataLoaded, setDataLoaded] = useState(false);
  const [selectedParametro, setSelectedParametro] = useState("BA"); // Default value
  const [selectedTimeframe, setSelectedTimeframe] = useState("1d"); // Default value

  /*   useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:8000/my_custom_view/", {
          params: {
            ticker: selectedParametro,
            timeframe: selectedTimeframe // Include selected timeframe in the request
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
  /*   const handleParametroChange = (event) => {
    setSelectedParametro(event.target.value);
  };

  // Handler function for timeframe dropdown change
  const handleTimeframeChange = (event) => {
    setSelectedTimeframe(event.target.value);
  }; */

  return (
    <div className="">

    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login/>} />
        <Route path="/logout" element={<Logout/>} />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="/visualizacion" element={<Visualizacion />} />
        <Route path="/sharpeRatio" element={<SharpeRatioChart />} />
        <Route path="/fundamental" element={<Fundamental />} />
        <Route path="/analisisActivo" element={<AnalisisActivo />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {/*       <div>
        <div className="w-full">
          <NavbarComp />
        </div>
        <body className="dark:bg-black">
          <div className="flex w-full">
            <aside class="h-screen sticky top-0">
              <Sidebar className="sticky left-0 top-0">
                <SidebarItem icon={<LayoutDashboard size={20} />} text="Dashboard" alert />
                <SidebarItem icon={<BarChart3 size={20} />} text="Estadisticas" active />
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
                <CardUsageExample text="Inversion Inicial" number="$34,743" />
                <CardUsageExample text="Inversion Actual" number="$38,264" />
                <CardUsageExample text="Diferencia" number="1,74 %" />
              </div>
              <div className="w-full mt-6 mx-auto px-14">
                <TableUsageExample />
              </div>
              <div className="mt-4">
                <DonutChartUsageExampleWithCustomColors/>
              </div>
            </div>
          </div>
        </body>
      </div> */}
    </BrowserRouter>
    </div>
  );
}

export default App;
