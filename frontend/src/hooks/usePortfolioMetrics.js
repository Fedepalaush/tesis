import { useState, useEffect } from "react";
import { getPortfolioMetrics } from "../api";

export const usePortfolioMetrics = (activos) => {
  const [metrics, setMetrics] = useState({ volatilidadData: null, betaData: null });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        if (activos.length > 0) {
          const data = await getPortfolioMetrics(activos);
          const volatilidadData = data.fechas.map((fecha, index) => ({
            date: fecha,
            value: data.volatilidades[index],
          }));
          const betaData = data.fechas.map((fecha, index) => ({
            date: fecha,
            value: data.betas[index],
          }));
          setMetrics({ volatilidadData, betaData });
        }
      } catch (error) {
        console.error("Error al obtener métricas:", error);
      }
    };

    fetchMetrics();
  }, [activos]);

  return metrics;
};
