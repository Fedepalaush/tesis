import React, { useState, useEffect } from "react";
import BaseLayout from "../components/BaseLayout";
import axios from "axios";
import Plot from "react-plotly.js";
import { CardUsageExample } from "../components/Card";
import ReactTooltip from "react-tooltip";
import { tickersBM } from '../constants';
import GaugeChart from "../components/GaugeChart";
import Semaforo from "../components/Semaforo";
import { fetchActivoAnalysis } from '../api'; // Adjust the path if necessary
import { Maybe, Either } from '../utils/monads'; // Importing Maybe and Either monads

const AnalisisActivo = () => {
  const activeItem = "AnalisisActivo";

  const [tickers, setTickers] = useState(tickersBM);

  const [data, setData] = useState([]);
  const [ticker, setTicker] = useState("AAPL");
  const today = new Date();
  const defaultEndDate = today.toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD
  const defaultStartDate = new Date(today.setFullYear(today.getFullYear() - 1)).toISOString().split('T')[0]; // Un año atrás en formato YYYY-MM-DD
  
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [error, setError] = useState(null);
  
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
  const [estadoEma, setEstadoEma] = useState(undefined);
  const [emaRapidaSemaforo, setEmaRapidaSemaforo] = useState(undefined);
  const [emaMediaSemaforo, setEmaMediaSemaforo] = useState(undefined);
  const [emaLentaSemaforo, setEmaLentaSemaforo] = useState(undefined);
  const [tripleEma, setTripleEma] = useState(undefined);
  const [hasOne, setHasOne] = useState(undefined);
  const [hasTwo, setHasTwo] = useState(undefined);
  
  const [lastRsi, setLastRsi] = useState(undefined);
  const [lastEma, setLastEma] = useState(undefined);
  const [lastClose, setLastClose] = useState(undefined);
  const [lastEma9, setLastEma9] = useState(undefined);
  const [lastEma21, setLastEma21] = useState(undefined);
  const [diferenciaHoy, setDiferenciaHoy] = useState(undefined);
  const [diferenciaSemana, setDiferenciaSemana] = useState(undefined);
  const [diferenciaEma, setDiferenciaEma] = useState(undefined);
  
  useEffect(() => {
    console.log('Aca estoyyy')
    console.log(data.data)
    console.log('pase dif')
    if (data.length > 0) {
      console.log(data);
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
      const estadoEma = data.map((item) => item.scoreEma);
      const emaRapidaSemaforo = data.map((item) => item.emaRapidaSemaforo);
      const emaMediaSemaforo = data.map((item) => item.emaMediaSemaforo);
      const emaLentaSemaforo = data.map((item) => item.emaLentaSemaforo);
      const tripleEma = data.map((item) => item.tripleEma);

      setDates(dates);
      console.log(dates)
      setOpen(open);
      setHigh(high);
      setLow(low);
      setClose(close);
      setRsi(rsi);
      setEma200(ema200);
      setEma9(ema9);
      setEma21(ema21);
      settendencia219(tendencia219);
      setEstadoEma(estadoEma);
      setEmaRapidaSemaforo(emaRapidaSemaforo);
      setEmaMediaSemaforo(emaMediaSemaforo);
      setEmaLentaSemaforo(emaLentaSemaforo);
      setTripleEma(tripleEma);
      
      console.log(emaRapidaSemaforo);
      
      const lastRsi = rsi.slice(-1)[0];
      const lastEma = ema200.slice(-1)[0];
      const lastClose = close.slice(-1)[0];
      const lastEma9 = parseFloat(ema9.slice(-1)[0]);
      const lastEma21 = parseFloat(ema21.slice(-1)[0]);
      const lastTendencia219 = parseFloat(tendencia219.slice(-1)[0]);
      const lastEstadoEma = parseFloat(estadoEma.slice(-1)[0]);
      const lastEmaRapidaSemaforo = parseFloat(emaRapidaSemaforo.slice(-1)[0]);
      const lastEmaMediaSemaforo = parseFloat(emaMediaSemaforo.slice(-1)[0]);
      const lastEmaLentaSemaforo = parseFloat(emaLentaSemaforo.slice(-1)[0]);
      const lastTripleEma = tripleEma.slice(-1)[0];
      const closeYesterday = close.slice(-2)[0]; // Precio de cierre del día anterior
      const diferenciaHoy = ((lastClose - closeYesterday) / closeYesterday) * 100;
      const closeLastWeek = close.length >= 5 ? close.slice(-5)[0] : undefined; // Precio de cierre hace una semana
      const diferenciaSemana = closeLastWeek !== undefined ? ((lastClose - closeLastWeek) / closeLastWeek) * 100 : undefined;

      const diferenciaEma = ((lastEma21 - lastEma9) / lastEma9) * 100 * -1;
      // Verifica si existe algún 1
      const hasOne = lastTripleEma.some((item) => item.Cruce === 1);

      // Verifica si existe algún 2
      const hasTwo = lastTripleEma.some((item) => item.Cruce === 2);

      // Verifica si todos son 0
      const allZero = lastTripleEma.every((item) => item.Cruce === 0);

      console.log("¿Existe algún 1?", hasOne); // true o false
      console.log("¿Existe algún 2?", hasTwo); // true o false
      console.log(lastEmaMediaSemaforo); // true o false

      setLastRsi(lastRsi);
      setLastEma(lastEma);
      setLastClose(lastClose);
      setLastEma9(lastEma9);
      setLastEma21(lastEma21);
      setDiferenciaHoy(diferenciaHoy);
      setDiferenciaSemana(diferenciaSemana);
      setDiferenciaEma(diferenciaEma);
      settendencia219(lastTendencia219);
      setEstadoEma(lastEstadoEma);
      setEmaRapidaSemaforo(lastEmaRapidaSemaforo);
      setEmaMediaSemaforo(lastEmaMediaSemaforo);
      setEmaLentaSemaforo(lastEmaLentaSemaforo);
      setHasOne(hasOne);
      setHasTwo(hasTwo);
    }
  }, [data]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchActivoAnalysis(ticker, startDate, endDate);
        setData(result.data.data);
        setError(null); // Clear previous errors if the fetch is successful
      } catch (error) {
        if (error.response && error.response.status === 400) {
          setError("Se necesitan al menos 365 días para mostrar los datos.");
        } else {
          setError("Error fetching data: " + error.message);
        }
        console.error("Error fetching data:", error);
      }
    };

    if (ticker && startDate && endDate) {
      fetchData();
    }
  }, [ticker, startDate, endDate]);

  const handleTickerChange = (e) => {
    setTicker(e.target.value);
  };

  // Handlers for start and end date changes
  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const getRecommendations = () => {
    const recommendations = [];

    if (lastRsi > 70) {
      recommendations.push("El activo está sobrecomprado. Podría ser un buen momento para vender.");
    } else if (lastRsi < 30) {
      recommendations.push("El activo está sobrevendido. Podría ser un buen momento para comprar.");
    } else {
      recommendations.push("El RSI está en una zona neutral.");
    }

    if (hasOne) {
      recommendations.push("Hubo un cruce de medias que indica un posible movimiento al alza a corto plazo.");
    }

    if (hasTwo) {
      recommendations.push("Hubo un cruce de medias que indica un posible movimiento a la baja a corto plazo.");
    }

    return recommendations;
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
              <option key={ticker} value={ticker}>
                {ticker}
              </option>
            ))}
          </select>
          {/* Start Date Input */}
          <label className="ml-4 mr-2 text-white">Fecha de inicio:</label>
          <input type="date" value={startDate} onChange={handleStartDateChange} className="bg-gray-800 text-white p-2 rounded-md border border-gray-700 focus:outline-none focus:border-blue-500 " />

          {/* End Date Input */}
          <label className="ml-4 mr-2 bg text-white">Fecha de fin:</label>
          <input type="date" value={endDate} onChange={handleEndDateChange} className="bg-gray-800 text-white p-2 rounded-md border border-gray-700 focus:outline-none focus:border-blue-500" />

          {error && (
            <div className="p-4 bg-red-500 text-white rounded w-2/4 mx-auto mb-4">
              <h2 className="text-lg font-bold">Error</h2>
              <p>{error}</p>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 mt-4 lg:grid-cols-3 md:grid-cols-2 gap-3 h-max-full mb-8">

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
            </div>
          ) : (
            <p>No hay datos disponibles</p>
          )}
        </div>
        {lastRsi !== undefined && (
          <div className="w-full mx-auto flex justify-center items-center mt-4">
            <GaugeChart title={"RSI"} currentValue={lastRsi} minValue={0} maxValue={100} orden={"normal"} />
            <GaugeChart title={"EMA"} currentValue={estadoEma} minValue={0} maxValue={100} orden={"inverso"} />
          </div>
        )}
        <div className="mt-4 p-4 bg-gray-800 text-white rounded w-3/4 mx-auto mb-4">
          <h2 className="text-lg font-bold">Recomendaciones</h2>
          {getRecommendations().map((recommendation, index) => (
            <p key={index}>{recommendation}</p>
          ))}
        </div>
        <div className="flex flex-row justify-around items-stretch mt-4">
          <div className="text-white justify-center">
            <h3 className="justify-center">Cruce Media Móvil Corto Plazo</h3>
            <Semaforo value={emaRapidaSemaforo} label="" />
          </div>
          <div className="text-white justify-center">
            <h3 className="justify-center">Cruce Media Móvil Mediano Plazo</h3>
            <Semaforo value={emaMediaSemaforo} label="" />
          </div>
          <div className="text-white justify-center">
            <h3 className="justify-center">Cruce Media Móvil Largo Plazo</h3>
            <Semaforo value={emaLentaSemaforo} label="" />
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default AnalisisActivo;
