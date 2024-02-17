import { useState, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import axios from "axios";
import "./App.css";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import NavbarComp from "../components/NavbarComp";
import SidebarComp from "../components/SidebarComp";

function App() {
  const [activosData, setActivosData] = useState([]);

  const endpoint = `${import.meta.env.VITE_API_URL}/activos/`;

  const fetchData = async () => {
    console.log("fetching...");
    const response = await axios.get(endpoint);
    console.log(response);
    const { data } = response;
    setActivosData(data);
    console.log(data);
    return data;
  };

  const postData = async () => {
    const ticker = "MSFT";
    const precio = 320.45;
    const body = { ticker, precio };

    const response = await axios.post(endpoint, body);
    console.log(response);
    return response.data;
  };

  const handleSendData = async () => {
    const newData = await postData();
    if (newData) {
      setActivosData((prevState) => [...prevState, newData]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [stockPrices, setStockPrices] = useState({});
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const fetchStockPrices = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/activos2/");
        console.log(response.data);
        setStockPrices(response.data);

        setDataLoaded(true); // Marcamos los datos como cargados
      } catch (error) {
        console.error("Error fetching stock prices:", error);
      }
    };

    fetchStockPrices();
  }, []);

  return (
    <Router>
      <>
        <div className="navbar">
          <NavbarComp />
        </div>

        <div className="content">
          <div className="sidebar">
            <SidebarComp />
          </div>
          <div className="main-content">
            <ul>
              {activosData.map((el) => (
                <li key={el.id}>{el.ticker}</li>
              ))}
            </ul>
            <button onClick={handleSendData}>Crear Data</button>
            <Button variant="outline-dark">Presionamee</Button>
            {dataLoaded && (
              <>
              {stockPrices.map((stock, index) => (
                <div key={index}>
                  <p>Ticker: {stock.ticker}</p>
                  <p>
                    Precios:
                    {stock.prices.map((price, idx) => (
                      <span key={idx}>{price}{idx !== stock.prices.length - 1 ? ', ' : ''}</span>
                    ))}
                  </p>
                </div>
              ))}
            </>
            
            )}
          </div>
        </div>
      </>
    </Router>
  );
}

export default App;
