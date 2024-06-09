import React from "react";
import NavbarComp from "../components/NavbarComp";
import Sidebar from "../components/SidebarComp";
import { SidebarItem } from "../components/SidebarComp";
import { Barchart } from "../components/Barchart";
import { LayoutDashboard, BarChart3, UserCircle, Boxes, Package, Receipt, Settings, LifeBuoy } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import BaseLayout from "../components/BaseLayout";

const Fundamental = () => {
  const [freeCashFlowData, setFreeCashFlowData] = useState([]);
  const [debtData, setDebtData] = useState([]);
  const [ebitdaData, setEbitdaData] = useState([]);
  const [totalAssets, setTotalAssets] = useState([]);
  const [loading, setLoading] = useState(true);  // Initial loading state

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);  // Begin loading
        const response = await axios.get("http://localhost:8000/get_fundamental/", {
          params: {
            ticker: "AAPL",
          },
        });
        const cashFlow = JSON.parse(response.data.data.cash_flow); // Suponiendo que esta es la estructura correcta de tus datos
        const balance = JSON.parse(response.data.data.balance); // Suponiendo que esta es la estructura correcta de tus datos
        const income = JSON.parse(response.data.data.income); // Suponiendo que esta es la estructura correcta de tus datos
        // Transforma los datos para compatibilidad con Barchart
        function formatData(data, key) {
          return Object.entries(data).map(([date, properties]) => ({
            name: date.substring(0, 10), // Formatea la fecha a 'YYYY-MM-DD'
            [key]: parseInt(properties[key], 10), // Extrae y convierte a entero la propiedad especificada
          }));
        }

        console.log(income)
        const formattedFreeCashFlow = formatData(cashFlow, "FreeCashFlow",10);
        const formattedDebt = formatData(balance, "NetDebt",10);
        const formattedTotalAssets = formatData(balance, "TotalAssets",10);
        const formattedEbitda = formatData(income, "EBITDA",10);

        setFreeCashFlowData(formattedFreeCashFlow); // Actualiza el estado con los datos formateados
        setDebtData(formattedDebt); // Actualiza el estado con los datos formateados
        setTotalAssets(formattedTotalAssets); // Actualiza el estado con los datos formateados
        setEbitdaData(formattedEbitda); // Actualiza el estado con los datos formateados
        
  
        setLoading(false);  // End loading
      } catch (error) {
        console.error("Error fetching Free Cash Flow data:", error);
        setLoading(false);  // Ensure loading is false upon error
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <BaseLayout>
        <div className="dark:bg-black flex w-full">
          <div className="pl-10 w-full">
            {loading ? (
              <div>Loading...</div>  // Display loading indicator
            ) : (
              <div className="grid md:grid-cols-2">
                <Barchart data={freeCashFlowData} type={"FreeCashFlow"} />
                <Barchart data={debtData} type={"NetDebt"} /> 
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
