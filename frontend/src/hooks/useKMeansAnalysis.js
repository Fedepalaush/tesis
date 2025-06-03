import { useState } from 'react';
import { obtenerDatosAgrupamiento } from '../api';
import { useAsyncOperationWithLoading } from './useAsyncOperationWithLoading';
import { useNotification } from '../contexts/NotificationContext';

/**
 * Custom hook for managing KMeans clustering state and operations
 */
export const useKMeansAnalysis = () => {
  const { showError, showSuccess } = useNotification();
  
  // Form state
  const [selectedTickers, setSelectedTickers] = useState([]);
  const [selectedParameters, setSelectedParameters] = useState([]);
  const [startDate, setStartDate] = useState(
    new Date(new Date().setFullYear(new Date().getFullYear() - 1))
      .toISOString()
      .split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  
  // Results state
  const [clusterData, setClusterData] = useState([]);
  const [notification, setNotification] = useState("");
  
  // Loading state with global loading system
  const { execute, isLoading } = useAsyncOperationWithLoading({
    useGlobalLoading: true,
    showNotifications: false // We'll handle notifications manually
  });

  // Ticker management
  const handleTickerChange = (event) => {
    const ticker = event.target.value;
    if (ticker && !selectedTickers.includes(ticker)) {
      setSelectedTickers(prev => [...prev, ticker]);
      setNotification(`${ticker} añadido`);
      setTimeout(() => setNotification(""), 3000);
    }
  };

  const handleRemoveTicker = (ticker) => {
    setSelectedTickers(prev => prev.filter(t => t !== ticker));
    setNotification(`${ticker} eliminado`);
    setTimeout(() => setNotification(""), 3000);
  };

  const handleAddAllTickers = (tickers) => {
    setSelectedTickers(tickers);
    setNotification(`Todos los tickers (${tickers.length}) fueron añadidos.`);
    setTimeout(() => setNotification(""), 5000);
  };

  const handleRemoveAllTickers = () => {
    const count = selectedTickers.length;
    setSelectedTickers([]);
    setNotification(count > 0 ? `${count} tickers eliminados` : "");
    setTimeout(() => setNotification(""), 3000);
  };

  // Parameter management
  const handleParameterChange = (e) => {
    const parameter = e.target.value;
    setSelectedParameters(prev => {
      if (prev.includes(parameter)) {
        return prev.filter(p => p !== parameter);
      } else if (prev.length < 2) {
        return [...prev, parameter];
      } else {
        showError("Máximo 2 parámetros permitidos");
        return prev;
      }
    });
  };

  // Date management
  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  // Execute clustering analysis
  const executeKMeansAnalysis = async () => {
    if (selectedTickers.length < 3) {
      showError("Selecciona al menos 3 tickers");
      return;
    }

    if (selectedParameters.length !== 2) {
      showError("Selecciona exactamente 2 parámetros");
      return;
    }

    await execute(async () => {
      const data = await obtenerDatosAgrupamiento(
        selectedTickers, 
        selectedParameters, 
        startDate, 
        endDate
      );
      
      setClusterData(data);
      
      // Show success notification with results
      const clusterCount = [...new Set(data.map(item => item.Cluster))].length;
      showSuccess(
        `Análisis completado: ${data.length} activos agrupados en ${clusterCount} clusters`
      );
    }, {
      loadingMessage: `Ejecutando agrupamiento K-Means para ${selectedTickers.length} tickers...`,
      onError: (error) => {
        console.error('Error en análisis K-Means:', error);
        setClusterData([]);
        showError(
          error.response?.data?.message || 
          "Error al ejecutar el agrupamiento. Verifica los parámetros e intenta nuevamente."
        );
      }
    });
  };

  // Computed values
  const isReadyToExecute = selectedTickers.length >= 3 && selectedParameters.length === 2;
  const isDisabled = !isReadyToExecute || isLoading;

  return {
    // State
    selectedTickers,
    selectedParameters,
    startDate,
    endDate,
    clusterData,
    notification,
    isLoading,
    
    // Computed
    isReadyToExecute,
    isDisabled,
    
    // Actions
    handleTickerChange,
    handleRemoveTicker,
    handleAddAllTickers,
    handleRemoveAllTickers,
    handleParameterChange,
    handleStartDateChange,
    handleEndDateChange,
    executeKMeansAnalysis,
    
    // Utils
    clearNotification: () => setNotification(""),
    resetAnalysis: () => {
      setClusterData([]);
      setSelectedTickers([]);
      setSelectedParameters([]);
      setNotification("");
    }
  };
};

export default useKMeansAnalysis;
