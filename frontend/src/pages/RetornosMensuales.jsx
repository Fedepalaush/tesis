import React, { useEffect, useState } from "react";
import BaseLayout from "../components/BaseLayout";
import DataSelector from "../components/DataSelector";
import HeatmapChart from "../components/HeatmapChart";
import { tickersBM } from '../constants';

const MonthlyReturnsChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicker, setSelectedTicker] = useState("AAPL");
  const [selectedYears, setSelectedYears] = useState(10); // Añadir estado para los años
  const [tickers, setTickers] = useState(tickersBM);

  useEffect(() => {
    fetch(`http://localhost:8000/get_retornos_mensuales?ticker=${selectedTicker}&years=${selectedYears}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        setData(data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        setLoading(false);
      });
  }, [selectedTicker, selectedYears]);

  const handleTickerChange = (event) => {
    setSelectedTicker(event.target.value);
    setLoading(true); // Set loading to true when changing ticker
  };

  const handleYearsChange = (event) => {
    setSelectedYears(event.target.value);
    setLoading(true); // Set loading to true when changing years
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
