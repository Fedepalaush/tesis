import React, { useState } from "react";
import BaseLayout from "../components/BaseLayout";
import FormBacktesting from "../components/FormBacktesting";
import StrategiesForm from "../components/StrategiesForm";
import TradesTable from "../components/TradesTable";
import { runBacktest } from "../api"; // Importa la función runBacktest

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
  const [isLoading, setIsLoading] = useState(false); // Nuevo estado para controlar el estado de carga

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
    setIsLoading(true); // Activa el estado de carga
    try {
      const response = await runBacktest(formData); // Llama a la función desde api.js
      console.log(response.data); // Ver la respuesta completa
      if (response.data && response.data.Trades) {
        setResult(response.data.Trades); // Guarda los trades recibidos
      } else {
        console.error("La respuesta no contiene datos de trades.");
        setResult([]); // Resultado vacío en caso de error
      }
    } catch (error) {
      console.error("Error running backtest:", error);
      setResult([]); // Maneja errores asegurando un resultado vacío
    } finally {
      setIsLoading(false); // Finaliza el estado de carga
    }
  };

  return (
    <BaseLayout>
      <div className="flex justify-center items-center flex-col">
        <h1 className="text-white text-xl font-semibold mb-4">Backtest Configuración</h1>
        <FormBacktesting formData={formData} handleChange={handleChange} />
        <StrategiesForm formData={formData} handleChange={handleChange} />
        <button onClick={runBacktestHandler} className="bg-blue-600 text-white px-4 py-2 rounded-md mt-4">
          Ejecutar Backtest
        </button>
        <div className="mt-6"> {/* Añadido margen vertical para separar el contenido */}
          {isLoading ? (
            <p className="text-white">Cargando resultados...</p>
          ) : result ? (
            result.length > 0 ? (
              <TradesTable trades={result} />
            ) : (
              <p className="text-white">No se encontraron operaciones.</p>
            )
          ) : null}
        </div>
      </div>
    </BaseLayout>
  );
}

export default Backtest;
