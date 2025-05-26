// hooks/useEntrenamiento.js
import { useState } from "react";
import axios from "axios";

export const useEntrenamiento = () => {
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  const entrenarModelo = async (formData) => {
    setLoading(true);
    setResultado(null);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post("http://localhost:8000/entrenar/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setResultado(data);
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
