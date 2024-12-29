import React, { useEffect, useState } from "react";
import BaseLayout from "../components/BaseLayout";
import DataSelector from "../components/DataSelector";
import HeatmapChart from "../components/HeatmapChart";
import { tickersBM } from '../constants';
import { fetchMonthlyReturns } from "../api";

const MonthlyReturnsChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicker, setSelectedTicker] = useState("AAPL");
  const [selectedYears, setSelectedYears] = useState(10); // Añadir estado para los años
  const [tickers, setTickers] = useState(tickersBM);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Mostrar indicador de carga
      try {
        const responseData = await fetchMonthlyReturns(selectedTicker, selectedYears); // Llamar a la función de `api.js`
        setData(responseData.data); // Asignar los datos al estado
      } catch (error) {
        console.error("Error al obtener los retornos mensuales:", error);
      } finally {
        setLoading(false); // Ocultar indicador de carga
      }
    };

    fetchData();
  }, [selectedTicker, selectedYears]); // Ejecutar cada vez que cambian estos valores

  const handleTickerChange = (event) => {
    setSelectedTicker(event.target.value);
    setLoading(true); // Activar carga al cambiar ticker
  };

  const handleYearsChange = (event) => {
    setSelectedYears(event.target.value);
    setLoading(true); // Activar carga al cambiar años
  };

  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const years = [...new Set(data.map((d) => d.year))];
  const returns = data.map((d) => d.return * 100);
  const minReturn = Math.floor(Math.min(...returns) / 10) * 10;
  const maxReturn = Math.ceil(Math.max(...returns) / 10) * 10;
  const z = years.map((year) => {
    return months.map((month, idx) => {
      const entry = data.find((d) => d.year === year && d.month === idx + 1);
      return entry ? entry.return * 100 : null;
    });
  });
  const text = z.map((row) => row.map((value) => (value !== null ? `${value.toFixed(2)}%` : "N/A")));

  return (
    <BaseLayout>
      <div className="dark:bg-black text-white min-h-screen flex flex-col items-center justify-center">
        <DataSelector
          tickers={tickers}
          selectedTicker={selectedTicker}
          handleTickerChange={handleTickerChange}
          selectedYears={selectedYears}
          handleYearsChange={handleYearsChange}
        />

        {loading ? (
          <div className="text-lg">Loading data...</div>
        ) : (
          <HeatmapChart
            data={data}
            months={months}
            years={years}
            minReturn={minReturn}
            maxReturn={maxReturn}
            text={text}
          />
        )}
      </div>
    </BaseLayout>
  );
};

export default MonthlyReturnsChart;
