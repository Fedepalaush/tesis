import React, { useState, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import axios from "axios";
import "./App.css";

import { ApolloClient, InMemoryCache, ApolloProvider, gql, useQuery } from "@apollo/client";

import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import NavbarComp from "../components/NavbarComp";
import SidebarComp from "../components/SidebarComp";
import ChartComp from "../components/ChartComp";

function App() {
  const endpoint = `${import.meta.env.VITE_API_URL}/activos/`;

  const [stockPrices, setStockPrices] = useState({});
  const [dataLoaded, setDataLoaded] = useState(false);
  const [selectedParametro, setSelectedParametro] = useState("BA"); // Default value
  const [selectedTimeframe, setSelectedTimeframe] = useState("1d"); // Default value

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:8000/my_custom_view/", {
          params: {
            parametro: selectedParametro,
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
  }, [selectedParametro, selectedTimeframe]); // Fetch data when selectedParametro or selectedTimeframe changes

  // Handler function for dropdown change
  const handleParametroChange = (event) => {
    setSelectedParametro(event.target.value);
  };

  // Handler function for timeframe dropdown change
  const handleTimeframeChange = (event) => {
    setSelectedTimeframe(event.target.value);
  };

  return (
    <Router>
      <div>
        <div className="navbar">
          <NavbarComp />
        </div>
        <div className="main-content">
          <div className="sidebar">
            <SidebarComp />
          </div>
          <div>
            <select value={selectedParametro} onChange={handleParametroChange}>
              <option value="AAPL">AAPL</option>
              <option value="BA">BA</option>
              <option value="MSFT">MSFT</option>
              <option value="KO">KO</option>
              <option value="NVDA">NVDA</option>
            </select>

            <select value={selectedTimeframe} onChange={handleTimeframeChange}>
              <option value="1d">1 Day</option>
              <option value="4h">4 Hours</option>
              <option value="1s">1 Week</option>
            </select>
            
            {dataLoaded && <ChartComp data={stockPrices} />}
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;