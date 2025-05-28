import React, { useState, useEffect } from "react";
import { fetchFundamentalData } from "../api";
import BaseLayout from "../components/BaseLayout";
import Barchart from "../components/Barchart";
import PieChartComponent from "../components/PieChartComponent";
import TickerSelector from "../components/TickerSelector";
import {
  DollarSign,
  TrendingDown,
  PieChart,
  Layers,
  BarChart2,
  Info,
} from "lucide-react";

const TooltipIcon = ({ text }) => (
  <div className="relative group inline-block ml-1">
    <Info className="w-4 h-4 text-gray-500 dark:text-gray-300 cursor-pointer" />
    <div className="absolute hidden group-hover:block bg-gray-700 text-white text-xs p-2 rounded w-64 z-10 top-6 left-1/2 transform -translate-x-1/2 shadow-lg">
      {text}
    </div>
  </div>
);

const Fundamental = () => {
  const [freeCashFlowData, setFreeCashFlowData] = useState([]);
  const [debtData, setDebtData] = useState([]);
  const [ebitdaData, setEbitdaData] = useState([]);
  const [totalAssets, setTotalAssets] = useState([]);
  const [cashAndCashEquivalents, setCashAndCashEquivalents] = useState([]);
  const [longTermDebt, setLongTermDebt] = useState([]);
  const [currentDebt, setCurrentDebt] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticker, setTicker] = useState("MSFT");

  const hasValidData = (data, key) => {
    if (!data || data.length === 0) return false;
    return data.some((item) => {
      const val = item[key];
      return val !== null && val !== undefined && !isNaN(val);
    });
  };

  const isValidValue = (val) => val !== null && val !== undefined && !isNaN(val);

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
            {hasValidData(freeCashFlowData, "FreeCashFlow") && (
              <div>
                <div className="flex items-center mb-1">
                  <h2 className="text-white text-lg font-semibold">Flujo de Caja Libre</h2>
                  <TooltipIcon text="Muestra cuánto dinero le queda a la empresa después de pagar todos sus gastos. Más alto es mejor." />
                </div>
                <Barchart data={freeCashFlowData} type="FreeCashFlow" />
              </div>
            )}

            {hasValidData(debtData, "NetDebt") && (
              <div>
                <div className="flex items-center mb-1">
                  <h2 className="text-white text-lg font-semibold">Deuda Neta</h2>
                  <TooltipIcon text="Es la deuda total menos el efectivo disponible. Un valor más bajo indica menor endeudamiento neto." />
                </div>
                <Barchart data={debtData} type="NetDebt" />
              </div>
            )}

            {longTermDebt.length > 0 &&
              currentDebt.length > 0 &&
              isValidValue(longTermDebt[0]?.LongTermDebt) &&
              isValidValue(currentDebt[0]?.CurrentDebt) && (
                <div>
                  <div className="flex items-center mb-1">
                    <h2 className="text-white text-lg font-semibold">Distribución de Deuda</h2>
                    <TooltipIcon text="Muestra qué parte de la deuda es a corto y a largo plazo. Idealmente, una empresa saludable tiene una buena proporción entre ambas." />
                  </div>
                  <div className="flex align-middle justify-center items-center">
                    <PieChartComponent
                      data={[
                        { label: "Deuda a Largo Plazo", value: longTermDebt[0] },
                        { label: "Deuda a Corto Plazo", value: currentDebt[0] },
                      ]}
                      title="Distribución de Deuda"
                    />
                  </div>
                </div>
              )}

            {hasValidData(cashAndCashEquivalents, "cash_equivalents") && (
              <div>
                <div className="flex items-center mb-1">
                  <h2 className="text-white text-lg font-semibold">Activos Corrientes</h2>
                  <TooltipIcon text="Incluye efectivo, inventario y cuentas por cobrar. Muestra los recursos que la empresa puede usar pronto." />
                </div>
                <Barchart data={cashAndCashEquivalents} type="Activos Corrientes" stacked={true} />
              </div>
            )}

            {hasValidData(totalAssets, "TotalAssets") && (
              <div>
                <div className="flex items-center mb-1">
                  <h2 className="text-white text-lg font-semibold">Activos Totales</h2>
                  <TooltipIcon text="Refleja el tamaño total de los recursos de la empresa. Incluye todo lo que posee." />
                </div>
                <Barchart data={totalAssets} type="TotalAssets" />
              </div>
            )}

            {hasValidData(ebitdaData, "EBITDA") && (
              <div>
                <div className="flex items-center mb-1">
                  <h2 className="text-white text-lg font-semibold">EBITDA</h2>
                  <TooltipIcon text="Muestra las ganancias antes de intereses, impuestos, depreciación y amortización. Es un indicador de rentabilidad." />
                </div>
                <Barchart data={ebitdaData} type="EBITDA" />
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default Fundamental;
