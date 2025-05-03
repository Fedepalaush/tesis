import React, { useEffect, useState } from "react";
import BaseLayout from "../components/BaseLayout";
import HeatmapChart from "../components/HeatmapChart";
import { tickersBM } from "../constants";
import { fetchMonthlyReturns } from "../api";

const MonthlyReturnsChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicker, setSelectedTicker] = useState("AAPL");
  const [selectedYears, setSelectedYears] = useState(10);
  const [tickers, setTickers] = useState(tickersBM);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const responseData = await fetchMonthlyReturns(selectedTicker, selectedYears);
        setData(responseData.data);
      } catch (error) {
        console.error("Error al obtener los retornos mensuales:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedTicker, selectedYears]);

  const handleTickerChange = (event) => {
    setSelectedTicker(event.target.value);
  };

  const handleYearsChange = (event) => {
    setSelectedYears(Number(event.target.value));
  };

  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const years = [...new Set(data.map((d) => d.year))];
  const returns = data.map((d) => d.return * 100);
  const minReturn = Math.floor(Math.min(...returns) / 10) * 10;
  const maxReturn = Math.ceil(Math.max(...returns) / 10) * 10;
  const z = years.map((year) => {
    return months.map((_, idx) => {
      const entry = data.find((d) => d.year === year && d.month === idx + 1);
      return entry ? entry.return * 100 : null;
    });
  });
  const text = z.map((row) => row.map((value) => (value !== null ? `${value.toFixed(2)}%` : "N/A")));

  return (
    <BaseLayout>
      <div className="bg-black text-white min-h-screen px-4 py-10 flex flex-col items-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-10 text-center">
          Retornos Mensuales
        </h1>

        {/* Selectores centrados y con mejor contraste */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-8 mb-12">
          <div className="flex flex-col items-center">
            <label htmlFor="ticker" className="text-lg font-semibold mb-2">
              Selecciona un Ticker
            </label>
            <select
              id="ticker"
              value={selectedTicker}
              onChange={handleTickerChange}
              className="p-2 rounded bg-[#111] border-2 border-white text-white shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 hover:border-green-500 transition"
            >
              {tickers.map((ticker) => (
                <option key={ticker} value={ticker}>
                  {ticker}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col items-center">
            <label htmlFor="years" className="text-lg font-semibold mb-2">
              Años a Evaluar
            </label>
            <select
              id="years"
              value={selectedYears}
              onChange={handleYearsChange}
              className="p-2 rounded bg-[#111] border-2 border-white text-white shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 hover:border-green-500 transition"
            >
              {Array.from({ length: 16 }, (_, i) => i + 5).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-white text-lg animate-pulse">Cargando datos...</div>
        ) : (
          <div className="w-full max-w-6xl p-4">
            <HeatmapChart
              data={data}
              months={months}
              years={years}
              minReturn={minReturn}
              maxReturn={maxReturn}
              text={text}
            />
          </div>
        )}
      </div>
    </BaseLayout>
  );
};

export default MonthlyReturnsChart;
