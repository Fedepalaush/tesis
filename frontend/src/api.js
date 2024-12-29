import axios from "axios"
import { ACCESS_TOKEN } from "./constants"

const API_BASE_URL = "http://localhost:8000";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
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


export const fetchPivotPoints = async (ticker) => {
    try {
      const response = await axios.get(`http://localhost:8000/get_pivot_points/`, {
        params: { ticker },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  };

// Función para obtener la matriz de correlación
export const fetchCorrelationMatrix = async (selectedTickers, startDate, endDate) => {
  const tickersQueryString = selectedTickers
    .map((ticker) => `tickers=${ticker}`)
    .join('&');

  try {
    const response = await axios.get(
      `http://localhost:8000/api/get_correlation_matrix?${tickersQueryString}&start_date=${startDate}&end_date=${endDate}`
    );
    return response.data;
  } catch (error) {
    console.error('Error al obtener la matriz de correlación:', error);
    throw error;
  }
};

  // Función para obtener los datos del Sharpe Ratio
  export const fetchSharpeRatioData = async (sector, xYears, yYears) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/sharpe-ratio/?sector=${sector}&x_years=${xYears}&y_years=${yYears}`
      );
      return response.data.sharpe_data; // Retornar solo los datos necesarios
    } catch (error) {
      console.error('Error al obtener los datos del Sharpe Ratio:', error);
      throw error;
    }
  };

  // Función para obtener los retornos mensuales
  export const fetchMonthlyReturns = async (ticker, years) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/get_retornos_mensuales?ticker=${ticker}&years=${years}`
      );
      return response.data; // Retorna los datos directamente
    } catch (error) {
      console.error("Error al obtener los retornos mensuales:", error);
      throw error; // Lanza el error para manejarlo en el componente
    }
  };

// Función para obtener los datos del activo
export const fetchActivoAnalysis = (ticker, startDate, endDate) => {
  return axios.get(`${API_BASE_URL}/get_activo/`, {
    params: {
      ticker,
      start_date: startDate,
      end_date: endDate,
    },
  });
};

  // Función para ejecutar el backtest
export const runBacktest = (formData) => {
  return axios.post(`${API_BASE_URL}/run_backtest/`, formData);
};

  export const fetchEMASignals = async (tickers, ema4, ema9, ema18, useTriple) => {
    try {
      const response = await axios.get("http://localhost:8000/get_ema_signals/", {
        params: {
          tickers,
          ema4,
          ema9,
          ema18: useTriple ? ema18 : undefined, // Solo incluir ema18 si useTriple es verdadero
          useTriple,
        },
      });
  
      // Si los datos están en formato de cadena, convertir a JSON
      const responseData = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
  
      return responseData; // Retornar los datos
    } catch (error) {
      console.error("Error fetching EMA signals:", error);
      throw error; // Propagar el error para manejarlo en el componente
    }
  }; 

// Función para obtener datos de agrupamiento
export const obtenerDatosAgrupamiento = async (tickers, parametros, startDate, endDate) => {
  const response = await axios.get(`${API_BASE_URL}/agrupamiento/`, {
    params: {
      tickers: tickers.join(","), // Enviar tickers seleccionados
      parametros: parametros.join(","), // Enviar parámetros seleccionados
      start_date: startDate,
      end_date: endDate,
    },
  });
  return response.data;
};  

export const fetchFundamentalData = async (ticker) => {
  try {
    const response = await axios.get("http://localhost:8000/get_fundamental/", {
      params: { ticker },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching fundamental data:", error);
    throw error;
  }
};

// Obtener todos los activos
export const getActivos = async () => {
  const response = await api.get("/api/activos/");
  return response.data; // Devuelve los datos
};

// Eliminar un activo
export const deleteActivo = async (id) => {
  const response = await api.delete(`/api/activos/delete/${id}/`);
  return response.status; // Devuelve el estado de la respuesta
};

// Crear un activo
export const createActivo = async (ticker, precioCompra, cantidad) => {
  const response = await api.post("/api/activos/", {
    ticker,
    precioCompra,
    cantidad,
  });
  return response.status; // Devuelve el estado de la respuesta
};