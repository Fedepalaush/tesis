import { useState, useEffect } from "react";
import { getPortfolioMetrics } from "../api";

export const usePortfolioMetrics = (activos, indice = "^GSPC") => {
  const [metrics, setMetrics] = useState({
    volatilidadData: null,
    betaData: null,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        if (Array.isArray(activos) && activos.length > 0) {
          console.log("🔄 Ejecutando fetchMetrics...");
          const response = await getPortfolioMetrics(activos, indice);
          // response tiene la estructura completa: {status, message, data}
          
          const { data } = response; // extraes el objeto con fechas, volatilidades, betas
          
          const volatilidadData = data.fechas.map((fecha, index) => ({
            date: fecha,
            value: data.volatilidades[index],
          }));
          
          const betaData = data.fechas.map((fecha, index) => ({
            date: fecha,
            value: data.betas[index],
          }));
          
          setMetrics({ volatilidadData, betaData });
        } else {
          console.log("⚠️ No se ejecuta fetchMetrics: activos está vacío");
        }
      } catch (error) {
        console.error("❌ Error al obtener métricas:", error);
      }
    };

    fetchMetrics();
  }, [activos, indice]);

  return metrics;
};
