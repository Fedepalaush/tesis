import React, { useState, useEffect } from "react";
import axios from "axios";
import BaseLayout from "../components/BaseLayout";
import { Barchart } from "../components/Barchart"; // Asegúrate de importar correctamente
import PieChartComponent from "../components/PieChartComponent"; // Importa el componente de gráfico de torta
import { tickersBM } from "../ticker";

const Fundamental = () => {
  const [freeCashFlowData, setFreeCashFlowData] = useState([]);
  const [debtData, setDebtData] = useState([]);
  const [ebitdaData, setEbitdaData] = useState([]);
  const [totalAssets, setTotalAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticker, setTicker] = useState("MSFT"); // Estado para almacenar el ticker seleccionado
  const [tickers, setTickers] = useState(tickersBM);
  const [longTermDebt, setLongTermDebt] = useState(0); // Estado para deuda a largo plazo
  const [currentDebt, setCurrentDebt] = useState(0); // Estado para deuda a corto plazo
  const [cashAndCashEquivalents, setCashAndCashEquivalents] = useState(0);
  const [receivables, setReceivables] = useState(0);
  const [inventory, setInventory] = useState(0);
  const [otherCurrentAssets, setOtherCurrentAssets] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:8000/get_fundamental/", {
          params: {
            ticker: ticker,
          },
        });
        const cashFlow = JSON.parse(response.data.data.cash_flow);
        const balance = JSON.parse(response.data.data.balance);
        const income = JSON.parse(response.data.data.income);

        // Función para formatear los datos para Barchart
        function formatData(data, key) {
          return Object.entries(data).map(([date, properties]) => ({
            name: date.substring(0, 10),
            [key]: parseInt(properties[key], 10),
          }));
        }

        const formattedFreeCashFlow = formatData(cashFlow, "FreeCashFlow");
        const formattedDebt = formatData(balance, "NetDebt");
        const formattedTotalAssets = formatData(balance, "TotalAssets");
        const formattedEbitda = formatData(income, "EBITDA");
        const formattedcurrentDebtValue = formatData(balance, "CurrentDebt");
        const formattedlongTermDebtValue = formatData(balance, "LongTermDebt");
        const formattedCashAndCashEquivalents = formatData(balance, "CashAndCashEquivalents");
        const formattedReceivables = formatData(balance, "Receivables");
        const formattedInventory = formatData(balance, "Inventory");
        const formattedOtherCurrentAssets = formatData(balance, "OtherCurrentAssets");

        setFreeCashFlowData(formattedFreeCashFlow);
        setDebtData(formattedDebt);
        setTotalAssets(formattedTotalAssets);
        setEbitdaData(formattedEbitda);
        setLongTermDebt(formattedlongTermDebtValue);
        setCurrentDebt(formattedcurrentDebtValue);

        // Crear datos para el gráfico de activos corrientes
        const currentAssetsData = formattedCashAndCashEquivalents.map((item, index) => ({
          name: item.name,
          cash_equivalents: item.CashAndCashEquivalents || 0,
          receivables: formattedReceivables[index]?.Receivables || 0,
          inventory: formattedInventory[index]?.Inventory || 0,
          other_current_assets: formattedOtherCurrentAssets[index]?.OtherCurrentAssets || 0,
        }));

        // Aquí, guardar los datos de activos corrientes
        setCashAndCashEquivalents(currentAssetsData);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [ticker]);

  // Función para manejar el cambio de ticker seleccionado
  const handleTickerChange = (event) => {
    setTicker(event.target.value);
  };

  return (
    <div>
      <BaseLayout>
        <div className="dark:bg-black flex w-full">
          <div className="pl-10 w-full">
            {/* Dropdown para seleccionar ticker */}
            <div className="mb-4">
              <label htmlFor="ticker" className="mr-2">
                Ticker:
              </label>
              <select id="ticker" value={ticker} onChange={handleTickerChange} className="border rounded-md p-1">
                {tickers.map((ticker) => (
                  <option key={ticker} value={ticker}>
                    {ticker}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                <Barchart data={freeCashFlowData} type={"FreeCashFlow"} />
                <Barchart data={debtData} type={"NetDebt"} />

                {/* Agregar el gráfico de torta aquí */}
                <div className="flex align-middle justify-center items-center">
                  <PieChartComponent
                    data={[
                      { label: "Deuda a Largo Plazo", value: longTermDebt[0] },
                      { label: "Deuda a Corto Plazo", value: currentDebt[0] }, // Usar el primer valor del array
                    ]}
                    title={"Distribución de Deuda"}
                  />
                </div>
                {/* Gráfico apilado de activos corrientes */}
                <div>
                <Barchart data={cashAndCashEquivalents} type={"Activos Corrientes"} stacked={true} />
                </div>
                <Barchart data={totalAssets} type={"TotalAssets"} />
                <Barchart data={ebitdaData} type={"EBITDA"} />
              </div>
            )}
          </div>
        </div>
      </BaseLayout>
    </div>
  );
};

export default Fundamental;
