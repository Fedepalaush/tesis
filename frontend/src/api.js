import axios from "axios"
import { ACCESS_TOKEN } from "./constants"

// Usa la variable de entorno VITE_API_URL para configurar la baseURL de la API.
// Ejemplo en .env: VITE_API_URL=http://localhost:8000/api
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000"
})

api.interceptors.request.use(
    (config) =>{
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token){
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

export default api

// --- FUNCIONES API ---

export const fetchPivotPoints = async (ticker) => {
    try {
      const response = await api.get("/api/get_pivot_points/", {
        params: { ticker },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
};

export const fetchCorrelationMatrix = async (selectedTickers, startDate, endDate) => {
  const tickersQueryString = selectedTickers.map((ticker) => `tickers=${ticker}`).join('&');
  try {
    const response = await api.get(
      `/api/get_correlation_matrix?${tickersQueryString}&start_date=${startDate}&end_date=${endDate}`
    );
    return response.data;
  } catch (error) {
    console.error('Error al obtener la matriz de correlación:', error);
    throw error;
  }
};

export const fetchSharpeRatioData = async (sector, xYears, yYears) => {
    try {
      const response = await api.get(
        `/api/sharpe-ratio/`,
        { params: { sector, x_years: xYears, y_years: yYears } }
      );
      return response.data.sharpe_data;
    } catch (error) {
      console.error("Error al obtener los datos del Sharpe Ratio:", error);
      throw error;
    }
};

export const fetchMonthlyReturns = async (ticker, years) => {
    try {
      const response = await api.get(
        `/api/get_retornos_mensuales`,
        { params: { ticker, years } }
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener los retornos mensuales:", error);
      throw error;
    }
};

export const fetchActivoAnalysis = (ticker, startDate, endDate) => {
  return api.get("/api/activo/", {
    params: { ticker, start_date: startDate, end_date: endDate },
  });
};

export const runBacktest = (formData) => {
  return api.post("/api/run_backtest/", formData);
};

export const fetchEMASignals = async (tickers, ema4, ema9, ema18, useTriple) => {
    try {
      const response = await api.get("/api/get_ema_signals/", {
        params: {
          tickers,
          ema4,
          ema9,
          ema18: useTriple ? ema18 : undefined,
          useTriple,
        },
      });
      const responseData = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
      return responseData;
    } catch (error) {
      console.error("Error fetching EMA signals:", error);
      throw error;
    }
};

export const obtenerDatosAgrupamiento = async (tickers, parametros, startDate, endDate) => {
  const response = await api.get(`/api/agrupamiento/`, {
    params: {
      tickers: tickers.join(","),
      parametros: parametros.join(","),
      start_date: startDate,
      end_date: endDate,
    },
  });
  return response.data;
};

export const fetchFundamentalData = async (ticker) => {
  try {
    const response = await api.get("/api/fundamental/", {
      params: { ticker },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching fundamental data:", error);
    throw error;
  }
};

export const getActivos = async () => {
  const response = await api.get("/api/activos/");
  return response.data;
};

export const deleteActivo = async (id) => {
  const response = await api.delete(`/api/activos/delete/${id}/`);
  return response.status;
};

export const createActivo = async (ticker, precioCompra, cantidad) => {
  const response = await api.post("/api/activos/", {
    ticker,
    precioCompra,
    cantidad,
  });
  return response.status;
};

export const getPortfolioMetrics = async (activos, indice = "^GSPC") => {
  try {
    const response = await api.post("/api/portfolio-metrics/", {
      activos,
      indice_referencia: indice,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error en getPortfolioMetrics:", error);
    throw error;
  }
};

export const fetchTickers = async () => {
  try {
    const response = await api.get("/api/tickers/");
    return response.data;
  } catch (error) {
    console.error("Error fetching tickers:", error);
    throw error;
  }
};