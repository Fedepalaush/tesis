import React, { useState } from "react";
import axios from "axios";
import BaseLayout from "../components/BaseLayout";
import Plot from "react-plotly.js";

function Backtest() {
  const [formData, setFormData] = useState({
    ticker: "AAPL",
    inicio: "2020-01-01",
    fin: "2023-01-01",
    rapida: 9,
    lenta: 21,
    tp_percentage: 0.09,
    sl_percentage: 0.04,
    strategies: {
      smaCross: false,
      rsi: false,
      rsiParams: {
        overboughtLevel: 70,
        oversoldLevel: 30,
      },
    },
  });
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prevData) => ({
        ...prevData,
        strategies: {
          ...prevData.strategies,
          [name]: checked,
        },
      }));
    } else {
      const parsedValue = type === "number" ? Number(value) : value;
      if (
        name === "rapida" ||
        name === "lenta" ||
        name === "tp_percentage" ||
        name === "sl_percentage" ||
        name === "overboughtLevel" ||
        name === "oversoldLevel"
      ) {
        if (name === "overboughtLevel" || name === "oversoldLevel") {
          setFormData((prevData) => ({
            ...prevData,
            strategies: {
              ...prevData.strategies,
              rsiParams: {
                ...prevData.strategies.rsiParams,
                [name]: parsedValue,
              },
            },
          }));
        } else {
          setFormData((prevData) => ({
            ...prevData,
            [name]: parsedValue,
          }));
        }
      } else {
        setFormData((prevData) => ({
          ...prevData,
          [name]: value,
        }));
      }
    }
  };

  const runBacktest = async () => {
    try {
      const response = await axios.post("http://localhost:8000/run_backtest/", formData);
      setResult(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Hubo un error!", error);
    }
  };

  const generateDateRange = (startDate, endDate) => {
    let dates = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatPrice = (price) => {
    return price.toFixed(2);
  };

  return (
    <BaseLayout>
      <div className="pl-8">
        <h1 className="text-white text-4xl mb-4">Resultados del Backtest</h1>

        <form className="mb-4">
          <div className="mb-2">
            <label className="text-white">Ticker:</label>
            <input type="text" name="ticker" value={formData.ticker} onChange={handleChange} className="ml-2 p-1" />
          </div>
          <div className="mb-2">
            <label className="text-white">Inicio:</label>
            <input type="date" name="inicio" value={formData.inicio} onChange={handleChange} className="ml-2 p-1" />
          </div>
          <div className="mb-2">
            <label className="text-white">Fin:</label>
            <input type="date" name="fin" value={formData.fin} onChange={handleChange} className="ml-2 p-1" />
          </div>
          <div className="mb-2">
            <label className="text-white">TP %:</label>
            <input
              type="number"
              step="0.01"
              name="tp_percentage"
              value={formData.tp_percentage}
              onChange={handleChange}
              className="ml-2 p-1"
            />
          </div>
          <div className="mb-2">
            <label className="text-white">SL %:</label>
            <input
              type="number"
              step="0.01"
              name="sl_percentage"
              value={formData.sl_percentage}
              onChange={handleChange}
              className="ml-2 p-1"
            />
          </div>
          <div className="mb-2">
            <label className="text-white">Cruce de Medias:</label>
            <input type="checkbox" name="smaCross" checked={formData.strategies.smaCross} onChange={handleChange} className="ml-2" />
            {formData.strategies.smaCross && (
              <>
                <div className="mb-2">
                  <label className="text-white">Rápida:</label>
                  <input type="number" name="rapida" value={formData.rapida} onChange={handleChange} className="ml-2 p-1" />
                </div>
                <div className="mb-2">
                  <label className="text-white">Lenta:</label>
                  <input type="number" name="lenta" value={formData.lenta} onChange={handleChange} className="ml-2 p-1" />
                </div>
              </>
            )}
          </div>
          <div className="mb-2">
            <label className="text-white">RSI:</label>
            <input type="checkbox" name="rsi" checked={formData.strategies.rsi} onChange={handleChange} className="ml-2" />
            {formData.strategies.rsi && (
              <>
                <div className="mb-2">
                  <label className="text-white">Sobrecompra (%):</label>
                  <input
                    type="number"
                    name="overboughtLevel"
                    value={formData.strategies.rsiParams.overboughtLevel}
                    onChange={handleChange}
                    className="ml-2 p-1"
                  />
                </div>
                <div className="mb-2">
                  <label className="text-white">Sobreventa (%):</label>
                  <input
                    type="number"
                    name="oversoldLevel"
                    value={formData.strategies.rsiParams.oversoldLevel}
                    onChange={handleChange}
                    className="ml-2 p-1"
                  />
                </div>
              </>
            )}
          </div>
        </form>

        <button className="bg-white text-black border border-white px-4 py-2 mb-4 cursor-pointer" onClick={runBacktest}>
          Ejecutar Backtest
        </button>

        {result && (
          <div className="text-white">
            <h2 className="text-2xl mb-2">Resumen</h2>
            <p>
              <strong>Inicio:</strong> {result.Start}
            </p>
            <p>
              <strong>Fin:</strong> {result.End}
            </p>
            <p>
              <strong>Máxima Caída:</strong> {result["Max. Drawdown [%]"]}%
            </p>
            <p>
              <strong>Retorno Total:</strong> {result["Return [%]"]}%
            </p>
            <p>
              <strong>Sharpe Ratio:</strong> {result["Sharpe Ratio"]}
            </p>
            <p>
              <strong>Duración:</strong> {result.Duration}
            </p>
            <p>
              <strong>Buy & Hold Return [%]:</strong> {result["Buy & Hold Return [%]"]}%
            </p>

            {result.Trades && (
              <>
                <h2 className="text-2xl mt-8 mb-2 mx-auto">Curva de Patrimonio</h2>

                <Plot
                  data={[
                    {
                      x: generateDateRange(result.Start, result.End),
                      y: result["Equity Curve"].map((entry) => entry.Equity),
                      type: "scatter",
                      mode: "lines",
                      marker: { color: "blue" },
                    },
                  ]}
                  layout={{ width: 800, height: 400, title: "Curva de Patrimonio" }}
                />
              </>
            )}

            <h2 className="text-2xl mt-8 mb-2">Trades</h2>
            {result.Trades ? (
              <table className="border-collapse border border-white text-white w-full">
                <thead>
                  <tr>
                    <th className="border border-white px-4 py-2">Fecha de Entrada</th>
                    <th className="border border-white px-4 py-2">Fecha de Salida</th>
                    <th className="border border-white px-4 py-2">Precio de Entrada</th>
                    <th className="border border-white px-4 py-2">Precio de Salida</th>
                    <th className="border border-white px-4 py-2">Ganancia/Pérdida</th>
                    <th className="border border-white px-4 py-2">Retorno (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {result.Trades.map((trade, index) => (
                    <tr key={index} className="border border-white">
                      <td className="border border-white px-4 py-2">{formatDate(trade.EntryTime)}</td>
                      <td className="border border-white px-4 py-2">{formatDate(trade.ExitTime)}</td>
                      <td className="border border-white px-4 py-2">{formatPrice(trade.EntryPrice)}</td>
                      <td className="border border-white px-4 py-2">{formatPrice(trade.ExitPrice)}</td>
                      <td className="border border-white px-4 py-2">{formatPrice(trade.PnL)}</td>
                      <td className="border border-white px-4 py-2">{(trade.ReturnPct * 100).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No hay trades para mostrar.</p>
            )}
          </div>
        )}
      </div>
    </BaseLayout>
  );
}

export default Backtest;
