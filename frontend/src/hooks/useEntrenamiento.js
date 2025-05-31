// hooks/useEntrenamiento.js
import { useState } from "react";
import api from "../api";

export const useEntrenamiento = () => {
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  const entrenarModelo = async (formData) => {
    setLoading(true);
    setResultado(null);
    try {
      const { data } = await api.post("/entrenar-modelo/", formData);
      setResultado(data);
      console.log(data)
    } catch (error) {
      console.error(error);
      const mensaje = error.response?.data?.detail || "Hubo un problema al entrenar el modelo.";
      setResultado({ error: mensaje });
    } finally {
      setLoading(false);
    }
  };

  return { resultado, loading, entrenarModelo };
};
