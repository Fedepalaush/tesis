// src/hooks/useTickerForm/useTickerForm.js
import { useState } from 'react';
import { tickersBM } from '../constants'; // Asegúrate que la ruta sea correcta

const useTickerForm = () => {
  const today = new Date();
  const defaultEndDate = today.toISOString().split('T')[0];
  // Creamos una nueva instancia de Date para defaultStartDate para no modificar 'today'
  const oneYearAgo = new Date(new Date().setFullYear(today.getFullYear() - 1));
  const defaultStartDate = oneYearAgo.toISOString().split('T')[0];

  const [tickers] = useState(tickersBM);
  const [ticker, setTicker] = useState("AAPL");
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  const handleTickerChange = (e) => {
    setTicker(e.target.value);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  return {
    tickers,
    ticker,
    startDate,
    endDate,
    handleTickerChange,
    handleStartDateChange,
    handleEndDateChange,
  };
};

export default useTickerForm;