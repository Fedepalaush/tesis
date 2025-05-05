import React, { useState, useEffect } from "react";
import { fetchFundamentalData } from "../api";
import BaseLayout from "../components/BaseLayout";
import Barchart from "../components/Barchart";
import PieChartComponent from "../components/PieChartComponent";
import TickerSelector from "../components/TickerSelector";

const Fundamental = () => {
  const [freeCashFlowData, setFreeCashFlowData] = useState([]);
  const [debtData, setDebtData] = useState([]);
  const [ebitdaData, setEbitdaData] = useState([]);
  const [totalAssets, setTotalAssets] = useState([]);
  const [cashAndCashEquivalents, setCashAndCashEquivalents] = useState([]);
  const [longTermDebt, setLongTermDebt] = useState(0);
  const [currentDebt, setCurrentDebt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [ticker, setTicker] = useState("MSFT");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchFundamentalData(ticker);

        const cashFlow = JSON.parse(data.data.cash_flow);
        const balance = JSON.parse(data.data.balance);
        const income = JSON.parse(data.data.income);

        const formatData = (data, key) =>
          Object.entries(data).map(([date, properties]) => ({
            name: date.substring(0, 10),
            [key]: parseInt(properties[key], 10),
          }));

        setFreeCashFlowData(formatData(cashFlow, "FreeCashFlow"));
        setDebtData(formatData(balance, "NetDebt"));
        setTotalAssets(formatData(balance, "TotalAssets"));
        setEbitdaData(formatData(income, "EBITDA"));
        setLongTermDebt(formatData(balance, "LongTermDebt"));
        setCurrentDebt(formatData(balance, "CurrentDebt"));

        const currentAssetsData = formatData(balance, "CashAndCashEquivalents").map((item, index) => ({
          name: item.name,
          cash_equivalents: item.CashAndCashEquivalents || 0,
          receivables: formatData(balance, "Receivables")[index]?.Receivables || 0,
          inventory: formatData(balance, "Inventory")[index]?.Inventory || 0,
          other_current_assets: formatData(balance, "OtherCurrentAssets")[index]?.OtherCurrentAssets || 0,
        }));

        setCashAndCashEquivalents(currentAssetsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [ticker]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <BaseLayout>
      <div className="dark:bg-black flex w-full">
        <div className="pl-10 w-full">
          <div className="mb-4">
            <TickerSelector selectedTicker={ticker} setSelectedTicker={setTicker} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Barchart data={freeCashFlowData} type="FreeCashFlow" />
            <Barchart data={debtData} type="NetDebt" />
            <div className="flex align-middle justify-center items-center">
              <PieChartComponent
                data={[
                  { label: "Deuda a Largo Plazo", value: longTermDebt[0] },
                  { label: "Deuda a Corto Plazo", value: currentDebt[0] },
                ]}
                title="Distribución de Deuda"
              />
            </div>
            <Barchart data={cashAndCashEquivalents} type="Activos Corrientes" stacked={true} />
            <Barchart data={totalAssets} type="TotalAssets" />
            <Barchart data={ebitdaData} type="EBITDA" />
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default Fundamental;
