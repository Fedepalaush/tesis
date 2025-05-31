// src/hooks/useTickerForm/useTickerForm.js
import { useState } from 'react';
import { useTickers } from '../TickersContext';

const useTickerForm = () => {
  const { tickers } = useTickers();
  const today = new Date();
  const defaultEndDate = today.toISOString().split('T')[0];
  const oneYearAgo = new Date(new Date().setFullYear(today.getFullYear() - 1));
  const defaultStartDate = oneYearAgo.toISOString().split('T')[0];

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