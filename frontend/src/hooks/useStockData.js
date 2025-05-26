// src/hooks/useStockData/useStockData.js
import { useState, useEffect } from 'react';
import { fetchActivoAnalysis } from '../api'; // Ajusta la ruta si es necesario

const useStockData = (ticker, startDate, endDate) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ticker || !startDate || !endDate) {
      setData([]); // Limpia los datos si falta algún parámetro
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setData([]); // Limpia datos previos antes de una nueva carga
      try {
        const result = await fetchActivoAnalysis(ticker, startDate, endDate);
        setData(result.data.data);
      } catch (err) {
        if (err.response && err.response.status === 400) {
          setError("Se necesitan al menos 365 días para mostrar los datos.");
        } else {
          setError("Error fetching data: " + (err.message || "Ocurrió un error desconocido"));
        }
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticker, startDate, endDate]);

  return { data, loading, error, setError }; // Exponemos setError para poder limpiarlo externamente si es necesario
};

export default useStockData;