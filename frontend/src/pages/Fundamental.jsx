import React, { useState, useEffect } from "react";
import axios from "axios";
import BaseLayout from "../components/BaseLayout";
import {Barchart} from "../components/Barchart"; // Importa Barchart según sea necesario

const Fundamental = () => {
  const [freeCashFlowData, setFreeCashFlowData] = useState([]);
  const [debtData, setDebtData] = useState([]);
  const [ebitdaData, setEbitdaData] = useState([]);
  const [totalAssets, setTotalAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticker, setTicker] = useState("MSFT"); // Estado para almacenar el ticker seleccionado

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:8000/get_fundamental/", {
          params: {
            ticker: ticker,
          },
        });
        const cashFlow = JSON.parse(response.data.data.cash_flow);
        const balance = JSON.parse(response.data.data.balance);
        const income = JSON.parse(response.data.data.income);

        // Función para formatear los datos para Barchart
        function formatData(data, key) {
          return Object.entries(data).map(([date, properties]) => ({
            name: date.substring(0, 10),
            [key]: parseInt(properties[key], 10),
          }));
        }

        const formattedFreeCashFlow = formatData(cashFlow, "FreeCashFlow");
        const formattedDebt = formatData(balance, "NetDebt");
        const formattedTotalAssets = formatData(balance, "TotalAssets");
        const formattedEbitda = formatData(income, "EBITDA");

        setFreeCashFlowData(formattedFreeCashFlow);
        setDebtData(formattedDebt);
        setTotalAssets(formattedTotalAssets);
        setEbitdaData(formattedEbitda);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [ticker]);

  // Opciones de tickers disponibles
  const tickerOptions = [
    "AAPL", "MSFT", "TSLA", "AMZN", "GOOGL", "FB", "NFLX", "NVDA", "INTC", "AMD",
    "PYPL", "CRM", "IBM", "CSCO", "QCOM", "GS", "JPM", "V", "DIS", "WMT"
  ];

  // Función para manejar el cambio de ticker seleccionado
  const handleTickerChange = (event) => {
    setTicker(event.target.value);
  };

  return (
    <div>
      <BaseLayout>
        <div className="dark:bg-black flex w-full">
          <div className="pl-10 w-full">
            {/* Dropdown para seleccionar ticker */}
            <div className="mb-4">
              <label htmlFor="ticker" className="mr-2">Ticker:</label>
              <select
                id="ticker"
                value={ticker}
                onChange={handleTickerChange}
                className="border rounded-md p-1"
              >
                {tickerOptions.map((ticker) => (
                  <option key={ticker} value={ticker}>{ticker}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                <Barchart data={freeCashFlowData} type={"FreeCashFlow"} />
                <Barchart data={debtData} type={"NetDebt"} />
                <Barchart data={totalAssets} type={"TotalAssets"} />
                <Barchart data={ebitdaData} type={"EBITDA"} />
              </div>
            )}
          </div>
        </div>
      </BaseLayout>
    </div>
  );
};

export default Fundamental;