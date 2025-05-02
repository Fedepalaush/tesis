// EntrenamientoPage.jsx
import React, { useState } from "react";
import axios from "axios";
import FormularioEntrenamiento from "../components/FormularioEntrenamiento";
import IndicadoresModelo from "../components/IndicadoresModelo";
import BaseLayout from "../components/BaseLayout";
import MatrizConfusion from "../components/MatrizConfusion";

export default function EntrenamientoPage() {
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  const manejarEnvio = async (formData) => {
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
      setResultado({ error: "Hubo un problema al entrenar el modelo." });
    } finally {
      setLoading(false);
    }
  };

  const getColorClasses = (prediccion) => {
    if (prediccion === "Subirá") {
      return "bg-green-100 border-green-300 text-green-800";
    } else if (prediccion === "Bajará") {
      return "bg-red-100 border-red-300 text-red-800";
    } else {
      return "bg-gray-100 border-gray-300 text-gray-800";
    }
  };

  return (
    <BaseLayout>
      <div className="max-w-3xl mx-auto mt-8 px-4">
        <h1 className="text-2xl font-bold mb-4 text-slate-50">Entrenamiento de Modelos</h1>
        <FormularioEntrenamiento onSubmit={manejarEnvio} loading={loading} />

        {resultado?.error && <div className="mt-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded">{resultado.error}</div>}

        {resultado && !resultado.error && (
          <div className="mt-6">
            {resultado.prediccion && (
              <div className={`mb-6 p-4 border rounded ${getColorClasses(resultado.prediccion)}`}>
                <p className="font-medium">
                  Tendencia esperada en el{" "}
                  {resultado.dias_prediccion === 1 ? "próximo 1 día" : `próximos ${resultado.dias_prediccion} días`}:{" "}
                  <strong>{resultado.prediccion}</strong>
                </p>
              </div>
            )}
            <IndicadoresModelo resultados={resultado} />
          </div>
        )}
        {resultado && !resultado.error && resultado.confusion_matrix && (
          <div className="mt-6">
            <MatrizConfusion matriz={resultado.confusion_matrix} />
          </div>
        )}
      </div>
    </BaseLayout>
  );
}
