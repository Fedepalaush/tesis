import { useState, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import axios from "axios";
import "./App.css";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import NavbarComp from "../components/NavbarComp";
import SidebarComp from "../components/SidebarComp";
import Plot from "react-plotly.js";

function App() {
  const [activosData, setActivosData] = useState([]);

  const endpoint = `${import.meta.env.VITE_API_URL}/activos/`;

  const [parametro, setParametro] = useState("AAPL");
  const [responseMessage, setResponseMessage] = useState("");

  const handleClick = () => {
    axios
      .post("http://127.0.0.1:8000/my_custom_view/", { params: { parametro: parametro } })
      .then((response) => {
        // Handle the response if necessary
        console.log("enviando");
        console.log(response);
        setResponseMessage(response.data.close_prices);
      })
      .catch((error) => {
        // Handle the error if it occurs
      });
  };

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

  const [selectedOption, setSelectedOption] = useState("");

  const handleChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedOption(selectedValue);
    // Make a request to the Django backend
    axios
      .get("/update-data/", { params: { ticker: selectedValue } })
      .then((response) => {
        console.log(response.data);
        // Handle success
      })
      .catch((error) => {
        console.error("Error updating data:", error);
        // Handle error
      });
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
      <div>
        <div className="navbar">
          <NavbarComp />
        </div>

        <div className="main-content">
          <div className="sidebar">
            <SidebarComp />
          </div>
          <div>
            <ul></ul>
          </div>
          <button onClick={handleSendData}>Crear Data</button>
          <Button variant="outline-dark">Presionamee</Button>
          <div>
            {dataLoaded && (
              <>
                {stockPrices.map((stock, index) => (
                  <div key={index}>
                    <p>Ticker: {stock.ticker}</p>
                    <p>
                      Precios:
                      {stock.prices.map((price, idx) => (
                        <span key={idx}>
                          {price}
                          {idx !== stock.prices.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </p>
                  </div>
                ))}
              </>
            )}
          </div>
          <div>
            <div>
              <select value={selectedOption} onChange={handleChange}>
                <option value="AAPL">AAPL</option>
                <option value="MSFT">MSFT</option>
                <option value="BA">BA</option>
              </select>
            </div>

            <div>
              <input type="text" value={parametro} onChange={(e) => setParametro(e.target.value)} />
              <button onClick={handleClick}>Enviar a Django</button>
              {responseMessage && (
                <div>
                  {responseMessage && (
                    <div>
                      <p>Graph:</p>
                      <Plot
                        data={[
                          {
                            x: responseMessage.map((_, index) => index), // Assuming the x-axis is just the index of each data point
                            y: responseMessage,
                            type: "scatter",
                            mode: "lines",
                            marker: { color: "red" }, // Customize marker color if needed
                            line: { shape: "spline" }, // Choose line shape
                          },
                        ]}
                        layout={{ width: 800, height: 400, title: "Response Message Graph" }} // Customize layout as needed
                      />
                    </div>
                  )}
                                    
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
