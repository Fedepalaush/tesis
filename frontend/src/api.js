import axios from "axios"
import { ACCESS_TOKEN } from "./constants"

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