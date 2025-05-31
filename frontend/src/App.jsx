import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import api from "./api";

import "./App.css";

import { ApolloClient, InMemoryCache, ApolloProvider, gql, useQuery } from "@apollo/client";
import AnalisisActivo from "./pages/AnalisisActivo";
import Fundamental from "./pages/Fundamental";
import SharpeRatioChart from "./pages/SharpeRatio";
import Correlacion from "./pages/Correlacion";
import RetornosMensuales from "./pages/RetornosMensuales"; 
import Backtesting from "./pages/Backtesting"; 
import SoportesResistencias from "./pages/SoportesResistencias";
import KMeans from "./pages/KMeans";
import MediasMoviles from "./pages/MediasMoviles";
import DividendCalendar from "./pages/CalendarioDividendos";
import EntrenamientoPage from "./pages/EntrenamientoPage";

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
        <Route path="/correlacion" element={<Correlacion />} />
        <Route path="/sharpeRatio" element={<SharpeRatioChart />} />
        <Route path="/fundamental" element={<Fundamental />} />
        <Route path="/agrupamiento" element={<KMeans/>} />
        <Route path="/analisisActivo" element={<AnalisisActivo />} />
        <Route path="/retornosMensuales" element={<RetornosMensuales />} />
        <Route path="/soportesResistencias" element={<SoportesResistencias />} />
        <Route path="/backtesting" element={<Backtesting />} />
        <Route path="/mediasMoviles" element={<MediasMoviles />} />
        <Route path="/calendarioDividendos" element={<DividendCalendar/>} />
        <Route path="/entrenamientoPage" element={<EntrenamientoPage/>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;
