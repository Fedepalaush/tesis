import React, { useState } from 'react';
import BaseLayout from '../components/BaseLayout';
import MultiTickerSelector from '../components/MultiTickerSelector';
import DateRangePicker from '../components/DateRangePicker';
import CorrelationMatrixPlot from '../components/CorrelationMatrixPlot';
import { tickersBM } from '../constants';
import { fetchCorrelationMatrix } from '../api'; // Importa la función

const Correlacion = () => {
  const [correlationMatrix, setCorrelationMatrix] = useState(null);
  const [selectedTickers, setSelectedTickers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tickers] = useState(tickersBM);

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
      alert('Por favor, selecciona al menos un ticker.');
      return;
    }

    setIsLoading(true);

    try {
      const data = await fetchCorrelationMatrix(selectedTickers, startDate, endDate); // Llamamos a la función aquí
      if (data.correlation_matrix) {
        setCorrelationMatrix(data.correlation_matrix);
      } else {
        console.error('Error al obtener la matriz de correlación:', data.error);
      }
    } catch (error) {
      console.error('Error al obtener la matriz de correlación:', error);
    } finally {
      setIsLoading(false);
    }
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
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Ejecutar
            </button>
          </div>
        </div>
        <div className="w-full max-w-4xl">
          {isLoading ? (
            <p>Cargando Matriz de Correlación...</p>
          ) : (
            correlationMatrix && (
              <CorrelationMatrixPlot correlationMatrix={correlationMatrix} />
            )
          )}
        </div>
      </div>
    </BaseLayout>
  );
};

export default Correlacion;