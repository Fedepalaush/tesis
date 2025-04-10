// pages/SoportesResistencias.js
import React, { useEffect, useState } from "react";
import { fetchPivotPoints } from "../api";
import TickerSelector from "../components/TickerSelector";
import CandlestickChart from "../components/CandlestickChart";
import PivotPoints from "../components/PivotPoints";
import BaseLayout from "../components/BaseLayout";

const SoportesResistencias = () => {
  const [data, setData] = useState([]);
  const [historical, setHistorical] = useState([]);
  const [limites, setLimites] = useState();
  const [selectedTicker, setSelectedTicker] = useState("AAPL");
  const [lastExecution, setLastExecution] = useState(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchPivotPoints(selectedTicker);
        setData(response.data);
        setHistorical(response.historical);
        setLimites(response.limites);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedTicker]);

  useEffect(() => {
    const fetchExecution = async () => {
      try {
        const execResponse = await fetch("http://localhost:8000/last-execution/");
        const execData = await execResponse.json();
        setLastExecution(execData.last_execution);
        setShowToast(true);

        // Ocultar el toast después de 5 segundos
        setTimeout(() => setShowToast(false), 10000);
      } catch (error) {
        console.error("Error al obtener la última ejecución:", error);
      }
    };

    fetchExecution();
  }, []);

  if (data.length === 0 || historical.length === 0) {
    return <div>Loading...</div>;
  }

  const pivotLines = PivotPoints({ data, historical, limites });

  return (
    <BaseLayout>
      <div className="flex flex-col justify-center items-center h-full">
        <TickerSelector selectedTicker={selectedTicker} setSelectedTicker={setSelectedTicker} />

        <CandlestickChart historical={historical} data={data} pivotLines={pivotLines} />
      </div>

      {/* Toast flotante */}
      {showToast && lastExecution && (
        <div className="fixed bottom-6 right-6 bg-white border border-gray-300 shadow-lg rounded-lg px-4 py-3 z-50">
          <p className="text-sm text-gray-800">
            📅 Última actualización de datos: <strong>{lastExecution}</strong>
          </p>
        </div>
      )}
    </BaseLayout>
  );
};

export default SoportesResistencias;
