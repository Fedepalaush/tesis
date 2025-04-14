// EntrenamientoPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import FormularioEntrenamiento from '../components/FormularioEntrenamiento';
import IndicadoresModelo from '../components/IndicadoresModelo';

export default function EntrenamientoPage() {
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  const manejarEnvio = async (formData) => {
    setLoading(true);
    setResultado(null);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post('http://localhost:8000/entrenar/', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setResultado(data);
    } catch (error) {
      console.error(error);
      setResultado({ error: 'Hubo un problema al entrenar el modelo.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Entrenamiento de Modelos</h1>
      <FormularioEntrenamiento onSubmit={manejarEnvio} loading={loading} />

      {resultado?.error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded">
          {resultado.error}
        </div>
      )}

      {resultado && !resultado.error && (
        <div className="mt-6">
          <IndicadoresModelo resultados={resultado} />
        </div>
      )}
    </div>
  );
}
