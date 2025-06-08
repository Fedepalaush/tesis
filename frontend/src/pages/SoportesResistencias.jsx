import React, { useEffect, useState } from "react";
import { fetchPivotPoints } from "../api";
import TickerSelector from "../components/TickerSelector";
import CandlestickChart from "../components/CandlestickChart";
import PivotPoints from "../components/PivotPoints";
import BaseLayout from "../components/BaseLayout";
import { useAsyncOperationWithLoading } from '../hooks/useAsyncOperationWithLoading';
import { useNotification } from '../contexts/NotificationContext';

const SoportesResistencias = () => {
  const { showError, showSuccess } = useNotification();
  
  // Use global loading system
  const { execute, isLoading } = useAsyncOperationWithLoading({
    useGlobalLoading: true,
    showNotifications: false // We'll handle notifications manually for better UX
  });

  const [data, setData] = useState([]);
  const [historical, setHistorical] = useState([]);
  const [limites, setLimites] = useState();
  const [selectedTicker, setSelectedTicker] = useState("AAPL");
  const [lastExecution, setLastExecution] = useState(null);
  const [showToast, setShowToast] = useState(false);

  const fetchData = async (ticker) => {
    await execute(
      async () => {
        const response = await fetchPivotPoints(ticker);
        setData(response.data);
        setHistorical(response.historical);
        setLimites(response.limites);
        showSuccess(`Datos de soportes y resistencias actualizados para ${ticker}`);
      },
      `Cargando datos de ${ticker}...`
    );
  };

  useEffect(() => {
    fetchData(selectedTicker);
  }, [selectedTicker]);  useEffect(() => {
    const fetchExecution = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
        const execResponse = await fetch(`${apiBase}/last-execution/`);
        const execData = await execResponse.json();
      console.log("execData:", execData);
      setLastExecution(execData.data.last_execution);
      setShowToast(true);
        setTimeout(() => setShowToast(false), 10000);
      } catch (error) {
        console.error("Error al obtener la última ejecución:", error);
        showError("Error al obtener información de última actualización");
      }
    };

    fetchExecution();
  }, []);

  // Replace local loading with global loading state
  if (isLoading && data.length === 0) {
    return null; // Global loading spinner will be shown
  }

  const pivotLines = data.length > 0 && historical.length > 0
  ? PivotPoints({ data, historical, limites })
  : [];

  return (
    <BaseLayout>
      <div className="flex flex-col justify-start items-center w-full min-h-screen bg-black px-4 py-6 text-white">
        <h1 className="text-3xl font-bold mb-6">Soportes y Resistencias</h1>

        <div className="w-full max-w-6xl">
  <label className="block text-sm text-gray-300 mb-2 ml-1">
    Seleccioná un ticker:
  </label>
  <TickerSelector
    selectedTicker={selectedTicker}
    setSelectedTicker={setSelectedTicker}
  />

  <div className="mt-6 bg-gray-900 rounded-2xl shadow-xl p-4">
    <CandlestickChart
      historical={historical}
      data={data}
      pivotLines={pivotLines}
    />
  </div>
</div>

      </div>

      {showToast && lastExecution && (
        <div className="fixed bottom-6 right-6 bg-white text-black border border-gray-300 shadow-lg rounded-lg px-5 py-4 z-50 transition-opacity duration-500">
          <p className="text-sm">
            📅 Última actualización de datos:{" "}
            <strong className="font-semibold">{lastExecution}</strong>
          </p>
        </div>
      )}
    </BaseLayout>
  );
};

export default SoportesResistencias;
