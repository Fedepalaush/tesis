import React from "react";
import BaseLayout from "../components/BaseLayout";
import { useState, useEffect } from "react";
import api from "../api";
import axios from "axios";
import Plot from "react-plotly.js";
import { CardUsageExample } from "../components/Card";

const AnalisisActivo = () => {
  const activeItem = "AnalisisActivo";

  const [data, setData] = useState([]);

  // Extraer los datos de apertura, alto, bajo y cierre
  const dates = data.map((item) => item.date);
  const open = data.map((item) => item.open_price);
  const high = data.map((item) => item.high_price);
  const low = data.map((item) => item.low_price);
  const close = data.map((item) => item.close_price);
  const rsi = data.map((item) => item.rsi);
  const ema200 = data.map((item) => item.ema_200);

  const lastRsi = rsi.slice(-1)[0];
  const lastEma = ema200.slice(-1)[0];
  const lastClose = close.slice(-1)[0];

  // Obtener el valor de cierre de hace 7 días
  const close7DaysAgo = close.slice(-7)[0]; // Último valor hace 7 días

  // Obtener el valor de cierre actual
  const closeCurrent = close[close.length - 1]; // Último valor actual

  // Calcular la diferencia en porcentaje
  const percentageDifference = ((closeCurrent - close7DaysAgo) / close7DaysAgo) * 100;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:8000/get_activo/", {
          params: {
            ticker: "AAPL",
            timeframe: "1d", // Include selected timeframe in the request
          },
        });
        setData(response.data.data);
        console.log(response.data.data[0]);
      } catch (error) {
        // Handle error
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    // Cleanup function not needed in this case because there are no subscriptions or timers
  }, []); // Fetch data when selectedParametro or selectedTimeframe changes */

  return (
    <BaseLayout>
      <div className="flex flex-col">
        <div className="grid grid-col-1 mt-4 lg:grid-cols-3 md:grid-cols-2 gap-3 h-max-full mb-8">
          {lastClose && <CardUsageExample text={"Valor Actual"} number={lastClose.toFixed(2)} />}
          {lastEma && <CardUsageExample text={"EMA200"} number={lastEma.toFixed(2)} arrow={lastEma < lastClose ? "↑" : "↓"} />}
          {lastRsi && <CardUsageExample text={"RSI"} number={lastRsi.toFixed(2)} />}
          <CardUsageExample text={"Ultima Semana"} number={percentageDifference.toFixed(2) + "%"} />
        </div>
        <div className="w-full mx-auto flex justify-center items-center">
          {data.length > 0 ? (
            // Render the tickers if the array is not empty
            <Plot
              className=""
              data={[
                {
                  x: dates,
                  close: close,
                  decreasing: { line: { color: "red" } },
                  high: high,
                  increasing: { line: { color: "green" } },
                  line: { color: "rgba(31,119,180,1)" },
                  low: low,
                  open: open,
                  type: "candlestick",
                  xaxis: "x",
                  yaxis: "y",
                },
              ]}
              layout={{
                width: 800,
                height: 600,
                title: "GRAFICO AAPL",
                xaxis: {
                  title: "Fecha",
                },
                yaxis: {
                  title: "Precio",
                },
                plot_bgcolor: "rgba(0,0,0,0.8)", // Dark background color
                paper_bgcolor: "rgba(0,0,0,0.8)", // Dark background color
                font: {
                  color: "white", // Text color
                },
              }}
            />
          ) : (
            // Render a message if the array is empty
            <p>No hay tickers</p>
          )}
        </div>
      </div>
    </BaseLayout>
  );
};

export default AnalisisActivo;
