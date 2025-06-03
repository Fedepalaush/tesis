import React, { useState } from 'react';
import BaseLayout from '../components/BaseLayout';
import MultiTickerSelector from '../components/MultiTickerSelector';
import DateRangePicker from '../components/DateRangePicker';
import CorrelationMatrixPlot from '../components/CorrelationMatrixPlot';
import { fetchCorrelationMatrix } from '../api';
import { useTickers } from '../TickersContext';
import { useAsyncOperationWithLoading } from '../hooks/useAsyncOperationWithLoading';
import { useNotification } from '../contexts/NotificationContext';

const Correlacion = () => {
  const { tickers } = useTickers();
  const { showError, showSuccess } = useNotification();
  const [correlationMatrix, setCorrelationMatrix] = useState(null);
  const [selectedTickers, setSelectedTickers] = useState([]);
  
  // Use global loading system
  const { execute, isLoading } = useAsyncOperationWithLoading({
    useGlobalLoading: true,
    showNotifications: true
  });

  const today = new Date();
  const defaultEndDate = today.toISOString().split('T')[0];
  const defaultStartDate = new Date(today.setFullYear(today.getFullYear() - 1)).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  const handleTickerChange = (value) => {
    console.log('Ticker seleccionado:', value); // Debug
    if (value && !selectedTickers.includes(value)) {
      setSelectedTickers((prevSelectedTickers) => [...prevSelectedTickers, value]);
      console.log('Tickers seleccionados:', [...selectedTickers, value]); // Debug
    }
  };

  const handleRemoveTicker = (ticker) => {
    setSelectedTickers((prevSelectedTickers) =>
      prevSelectedTickers.filter((t) => t !== ticker)
    );
    console.log('Ticker eliminado:', ticker); // Debug
  };

  const handleSubmit = async () => {
    if (selectedTickers.length === 0) {
      showError('Por favor, selecciona al menos un ticker.');
      return;
    }

    await execute(
      async () => {
        const data = await fetchCorrelationMatrix(selectedTickers, startDate, endDate);
        if (data.correlation_matrix) {
          setCorrelationMatrix(data.correlation_matrix);
          showSuccess('Matriz de correlación calculada exitosamente');
        } else {
          throw new Error(data.error || 'Error al obtener la matriz de correlación');
        }
      },
      'Calculando matriz de correlación...'
    );
  };

  return (
    <BaseLayout>
      <div className="dark:bg-black text-white min-h-screen flex flex-col items-center">
        <div className="w-full max-w-4xl p-10">
          <h2 className="text-2xl mb-4">Selecciona Tickers</h2>
          <MultiTickerSelector
            tickers={tickers}
            selectedTickers={selectedTickers}
            onTickerChange={handleTickerChange}
            onRemoveTicker={handleRemoveTicker}
          />
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
          <div className="mb-4">
            <button
              onClick={handleSubmit}
              disabled={isLoading || selectedTickers.length === 0}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded transition-colors"
            >
              {isLoading ? 'Calculando...' : 'Ejecutar'}
            </button>
          </div>
        </div>
        <div className="w-full max-w-4xl">
          {correlationMatrix && (
            <CorrelationMatrixPlot correlationMatrix={correlationMatrix} />
          )}
        </div>
      </div>
    </BaseLayout>
  );
};

export default Correlacion;