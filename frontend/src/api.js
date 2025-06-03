import axios from "axios"
import { ACCESS_TOKEN } from "./constants"
import { API_CONFIG, getCurrentEnvConfig } from "./config/api.config"

// Get current environment configuration
const envConfig = getCurrentEnvConfig();

// Create axios instance with centralized configuration
const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
})

// Request interceptor for authentication
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        
        // Log requests in development
        if (envConfig.enableLogging) {
            console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`, config);
        }
        
        return config
    },
    (error) => {
        if (envConfig.enableLogging) {
            console.error('❌ API Request Error:', error);
        }
        return Promise.reject(error)
    }
)

// Response interceptor for logging and error handling
api.interceptors.response.use(
    (response) => {
        if (envConfig.enableLogging) {
            console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
        }
        return response;
    },
    (error) => {
        if (envConfig.enableLogging) {
            console.error('❌ API Response Error:', error.response?.data || error.message);
        }
        return Promise.reject(error);
    }
)

export default api

// --- FUNCIONES API ---

export const fetchPivotPoints = async (ticker) => {
    try {
      const response = await api.get("/pivot-points/", {
        params: { ticker },
      });
      console.log(response)
      return response.data.data;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
};

export const fetchCorrelationMatrix = async (selectedTickers, startDate, endDate) => {
  const tickersQueryString = selectedTickers.map((ticker) => `tickers=${ticker}`).join('&');
  try {
    const response = await api.get(
      `/correlation-matrix?${tickersQueryString}&start_date=${startDate}&end_date=${endDate}`
    );
    return response.data;
  } catch (error) {
    console.error('Error al obtener la matriz de correlación:', error);
    throw error;
  }
};

export const fetchSharpeRatioData = async (sector, xYears, yYears) => {
  try {
    const response = await api.get("/sharpe-ratio/", {
      params: { sector, x_years: xYears, y_years: yYears },
    });

    const sharpeData = response?.data?.data?.sharpe_data;

    if (!sharpeData) {
      throw new Error("No se encontró 'sharpe_data' en la respuesta");
    }

    return sharpeData;
  } catch (error) {
    console.error("Error al obtener los datos del Sharpe Ratio:", error);
    throw error;
  }
};


export const fetchMonthlyReturns = async (ticker, years) => {
    try {
      const response = await api.get(
        `/retornos-mensuales`,
        { params: { ticker, years } }
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener los retornos mensuales:", error);
      throw error;
    }
};

export const fetchActivoAnalysis = (ticker, startDate, endDate) => {
  return api.get("/activo/", {
    params: { ticker, start_date: startDate, end_date: endDate },
  });
};

export const runBacktest = (formData) => {
  return api.post("/backtest/", formData);
};

export const fetchEMASignals = async (ema4, ema9, ema18, useTriple) => {
  try {
    const tickers = ["AAPL", "TSLA", "MSFT"];  // solo estos 3
    const response = await api.get("/ema-signals/", {
      params: {
        tickers,
        ema4,
        ema9,
        ema18: useTriple ? ema18 : undefined,
        useTriple,
      },
    });
    const responseData = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
    console.log(responseData);
    return responseData;
  } catch (error) {
    console.error("Error fetching EMA signals:", error);
    throw error;
  }
};

export const obtenerDatosAgrupamiento = async (tickers, parametros, startDate, endDate) => {
  const response = await api.get(`/agrupamiento/`, {
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
    const response = await api.get("/fundamental/", {
      params: { ticker },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching fundamental data:", error);
    throw error;
  }
};

export const getActivos = async () => {
  const response = await api.get("/activos/");
  return response.data;
};

export const deleteActivo = async (id) => {
  const response = await api.delete(`/activos/delete/${id}/`);
  return response.status;
};

export const createActivo = async (ticker, precioCompra, cantidad) => {
  const response = await api.post("/activos/", {
    ticker,
    precioCompra,
    cantidad,
  });
  return response.status;
};

export const getPortfolioMetrics = async (activos, indice = "^GSPC") => {
  try {
    const response = await api.post("/portfolio-metrics/", {
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
    const response = await api.get("/tickers/");
    return response.data;
  } catch (error) {
    console.error("Error fetching tickers:", error);
    throw error;
  }
};