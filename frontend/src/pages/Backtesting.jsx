import React, { useState } from "react";
import BaseLayout from "../components/BaseLayout";
import FormBacktesting from "../components/FormBacktesting";
import StrategiesForm from "../components/StrategiesForm";
import TradesTable from "../components/TradesTable";
import { runBacktest } from "../api";

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
  const [isLoading, setIsLoading] = useState(false);

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

  const runBacktestHandler = async () => {
    setIsLoading(true);
    try {
      const response = await runBacktest(formData);
      console.log(response.data);
      if (response.data && response.data.Trades) {
        setResult(response.data.Trades);
      } else {
        console.error("La respuesta no contiene datos de trades.");
        setResult([]);
      }
    } catch (error) {
      console.error("Error running backtest:", error);
      setResult([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseLayout>
      <div className="flex justify-center items-center flex-col px-4 py-6">
        <h1 className="text-gray-200 text-2xl font-bold mb-6">Configuración del Backtest</h1>

        <div className="bg-gray-800 shadow-md rounded-lg p-6 w-full max-w-2xl">
          <FormBacktesting formData={formData} handleChange={handleChange} />
          <StrategiesForm formData={formData} handleChange={handleChange} />

          <div className="flex justify-center">
            <button
              onClick={runBacktestHandler}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-md mt-4 transition duration-300"
            >
              Ejecutar Backtest
            </button>
          </div>
        </div>

        <div className="mt-8 w-full max-w-4xl">
          {isLoading ? (
            <p className="text-gray-300 text-center">Cargando resultados...</p>
          ) : result ? (
            result.length > 0 ? (
              <TradesTable trades={result} />
            ) : (
              <p className="text-gray-400 text-center">No se encontraron operaciones.</p>
            )
          ) : null}
        </div>
      </div>
    </BaseLayout>
  );
}

export default Backtest;
