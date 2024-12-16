// pages/SoportesResistencias.js
import React, { useEffect, useState } from "react";
import { fetchPivotPoints } from "../api";
import TickerSelector from "../components/TickerSelector";
import CandlestickChart from "../components/CandlestickChart";
import PivotPoints from "../components/PivotPoints";
import BaseLayout from "../components/BaseLayout";

const SoportesResistencias = () => {
  const [data, setData] = useState([]);
  const [historical, setHistorical] = useState([]);
  const [limites, setLimites] = useState();
  const [selectedTicker, setSelectedTicker] = useState("AAPL");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchPivotPoints(selectedTicker);
        setData(response.data);
        setHistorical(response.historical);
        setLimites(response.limites);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedTicker]);

  if (data.length === 0 || historical.length === 0) {
    return <div>Loading...</div>;
  }

  const pivotLines = PivotPoints({ data, historical, limites });

  return (
    <BaseLayout>
      <div className="flex flex-col justify-center items-center h-full">
        <TickerSelector selectedTicker={selectedTicker} setSelectedTicker={setSelectedTicker} />
        <CandlestickChart historical={historical} data={data} pivotLines={pivotLines} />
      </div>
    </BaseLayout>
  );
};

export default SoportesResistencias;
