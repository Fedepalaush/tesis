import React, { useState, useEffect } from "react";
import BaseLayout from "../components/BaseLayout";
import axios from "axios";
import Plot from "react-plotly.js";
import { CardUsageExample } from "../components/Card";
import ReactTooltip from "react-tooltip";
import {tickersBM} from '../ticker'

const AnalisisActivo = () => {
  const activeItem = "AnalisisActivo";

  const [tickers, setTickers] = useState(tickersBM);

  const [data, setData] = useState([]);
  const [ticker, setTicker] = useState("AAPL");
  const [timeframe, setTimeframe] = useState("1d");

  const [dates, setDates] = useState([]);
  const [open, setOpen] = useState([]);
  const [high, setHigh] = useState([]);
  const [low, setLow] = useState([]);
  const [close, setClose] = useState([]);
  const [rsi, setRsi] = useState([]);
  const [ema200, setEma200] = useState([]);
  const [ema9, setEma9] = useState([]);
  const [ema21, setEma21] = useState([]);
  const [tendencia219, settendencia219] = useState(undefined);

  const [lastRsi, setLastRsi] = useState(undefined);
  const [lastEma, setLastEma] = useState(undefined);
  const [lastClose, setLastClose] = useState(undefined);
  const [lastEma9, setLastEma9] = useState(undefined);
  const [lastEma21, setLastEma21] = useState(undefined);
  const [diferenciaHoy, setDiferenciaHoy] = useState(undefined);
  const [diferenciaSemana, setDiferenciaSemana] = useState(undefined);
  const [diferenciaEma, setDiferenciaEma] = useState(undefined);

  useEffect(() => {
    if (data.length > 0) {
      const dates = data.map((item) => item.date);
      const open = data.map((item) => item.open_price);
      const high = data.map((item) => item.high_price);
      const low = data.map((item) => item.low_price);
      const close = data.map((item) => item.close_price);
      const rsi = data.map((item) => item.rsi);
      const ema200 = data.map((item) => item.ema_200);
      const ema9 = data.map((item) => item.ema_9);
      const ema21 = data.map((item) => item.ema_21);
      const tendencia219 = data.map((item) => item.tendencia219);

      setDates(dates);
      setOpen(open);
      setHigh(high);
      setLow(low);
      setClose(close);
      setRsi(rsi);
      setEma200(ema200);
      setEma9(ema9);
      setEma21(ema21);
      settendencia219(tendencia219);

      const lastRsi = rsi.slice(-1)[0];
      const lastEma = ema200.slice(-1)[0];
      const lastClose = close.slice(-1)[0];
      const lastEma9 = parseFloat(ema9.slice(-1)[0]);
      const lastEma21 = parseFloat(ema21.slice(-1)[0]);
      const lastTendencia219 = parseFloat(tendencia219.slice(-1)[0]);
      const closeYesterday = close.slice(-2)[0]; // Precio de cierre del día anterior
      const diferenciaHoy = ((lastClose - closeYesterday) / closeYesterday) * 100;
      const closeLastWeek = close.length >= 5 ? close.slice(-5)[0] : undefined; // Precio de cierre hace una semana
      const diferenciaSemana = closeLastWeek !== undefined ? ((lastClose - closeLastWeek) / closeLastWeek) * 100 : undefined;

      const diferenciaEma = ((lastEma21 - lastEma9) / lastEma9) * 100 * -1;

      setLastRsi(lastRsi);
      setLastEma(lastEma);
      setLastClose(lastClose);
      setLastEma9(lastEma9);
      setLastEma21(lastEma21);
      setDiferenciaHoy(diferenciaHoy);
      setDiferenciaSemana(diferenciaSemana);
      setDiferenciaEma(diferenciaEma);
      settendencia219(lastTendencia219);
    }
  }, [data]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:8000/get_activo/", {
          params: {
            ticker: ticker,
            timeframe: timeframe,
          },
        });
        setData(response.data.data);
        console.log(response.data.data[0]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [ticker, timeframe]);

  const handleTickerChange = (e) => {
    setTicker(e.target.value);
  };

  const handleTimeframeChange = (e) => {
    setTimeframe(e.target.value);
  };

  const getRecommendations = () => {
    if (lastRsi > 70) {
      return "El activo está sobrecomprado. Podría ser un buen momento para vender.";
    } else if (lastRsi < 30) {
      return "El activo está sobrevendido. Podría ser un buen momento para comprar.";
    } else {
      return "El RSI está en una zona neutral.";
    }
  };

  return (
    <BaseLayout>
      <div className="flex flex-col">
        <div className="mb-4 flex items-center">
          <label className="mr-2 font-semibold">Ticker:</label>
          <select
                id="ticker"
                value={ticker}
                onChange={handleTickerChange}
                className="bg-gray-800 text-white p-2 rounded-md border border-gray-700 focus:outline-none focus:border-blue-500"
              >
                {tickers.map((ticker) => (
                  <option key={ticker} value={ticker}>{ticker}</option>
                ))}
              </select>
          <label className="mr-2 font-semibold">Timeframe:</label>
          <select
            value={timeframe}
            onChange={handleTimeframeChange}
            className="bg-gray-800 text-white p-2 rounded-md border border-gray-700 focus:outline-none focus:border-blue-500"
          >
            <option value="1d">1 Día</option>
            <option value="1h">1 Hora</option>
            <option value="1wk">1 Semana</option>
          </select>
        </div>
        <div className="grid grid-cols-1 mt-4 lg:grid-cols-3 md:grid-cols-2 gap-3 h-max-full mb-8">
          {lastClose !== undefined && <CardUsageExample text={"Valor Actual"} number={lastClose.toFixed(2)} />}
          {lastEma !== undefined && (
            <CardUsageExample
              text={"EMA200"}
              number={lastEma.toFixed(2)}
              arrow={lastEma < lastClose ? "↑" : "↓"}
              showTooltip={true} // Aquí determinas si quieres mostrar el tooltip
              tooltipText="Un valor superior a la EMA200 indica que el activo está en una tendencia alcista de largo plazo"
            />
          )}
          {lastRsi !== undefined && (
            <div>
              <CardUsageExample
                text={"RSI"}
                number={lastRsi.toFixed(2)}
                showTooltip={true} // Aquí determinas si quieres mostrar el tooltip
                tooltipText="El RSI mide la fuerza relativa de las ganancias y pérdidas recientes para determinar si un activo está sobrecomprado o sobrevendido."
              />
            </div>
          )}
          {diferenciaEma !== undefined && (
            <CardUsageExample
              text={"Diferencia EMA 21-9"}
              number={diferenciaEma.toFixed(2) + "%"}
              arrow={tendencia219 === 1 ? "↑" : tendencia219 === 2 ? "↓" : "-"}
              showTooltip={true}
              tooltipText="Una diferencia apenas positiva con una flecha verde indica posible movimiento al alza. Mientras que una diferencia apenas negativa con una flecha roja indica posible movimiento a la baja "
            />
          )}
          {diferenciaHoy !== undefined && <CardUsageExample text={"Última Vela"} number={diferenciaHoy.toFixed(2) + "%"} />}
          {diferenciaSemana !== undefined && <CardUsageExample text={"Ultimas 5 Velas"} number={diferenciaSemana.toFixed(2) + "%"} />}
        </div>
        <div className="w-full mx-auto flex justify-center items-center">
          {data.length > 0 ? (
            <div>
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
                  title: `GRAFICO ${ticker.toUpperCase()}`,
                  xaxis: {
                    title: "Fecha",
                  },
                  yaxis: {
                    title: "Precio",
                  },
                  plot_bgcolor: "rgba(0,0,0,0.8)",
                  paper_bgcolor: "rgba(0,0,0,0.8)",
                  font: {
                    color: "white",
                  },
                }}
              />
              <div className="mt-4 p-4 bg-gray-800 text-white rounded">
                <h2 className="text-lg font-bold">Recomendaciones</h2>
                <p>{getRecommendations()}</p>
              </div>
            </div>
          ) : (
            <p>No hay datos disponibles</p>
          )}
        </div>
      </div>
    </BaseLayout>
  );
};

export default AnalisisActivo;
