// EntrenamientoPage.jsx
import React from "react";
import clsx from "clsx";
import { useEntrenamiento } from "../hooks/useEntrenamiento";
import FormularioEntrenamiento from "../components/FormularioEntrenamiento";
import IndicadoresModelo from "../components/IndicadoresModelo";
import BaseLayout from "../components/BaseLayout";
import MatrizConfusion from "../components/MatrizConfusion";

export default function EntrenamientoPage() {
  const { resultado, loading, entrenarModelo } = useEntrenamiento();

  const getColorClasses = (prediccion) =>
    clsx("p-4 border rounded", {
      "bg-green-100 border-green-300 text-green-800": prediccion === "Subirá",
      "bg-red-100 border-red-300 text-red-800": prediccion === "Bajará",
      "bg-gray-100 border-gray-300 text-gray-800": !["Subirá", "Bajará"].includes(prediccion),
    });

  return (
    <BaseLayout>
      <div className="max-w-3xl mx-auto mt-8 px-4">
        <h1 className="text-2xl font-bold mb-4 text-slate-50">Entrenamiento de Modelos</h1>

        <FormularioEntrenamiento onSubmit={entrenarModelo} loading={loading} />

        {loading && (
          <div className="mt-4 text-center text-slate-50 animate-pulse">
            Entrenando modelo...
          </div>
        )}

        {resultado?.error && (
          <div
            role="alert"
            className="mt-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded"
          >
            {resultado.error}
          </div>
        )}

        {resultado && !resultado.error && (
          <div className="mt-6">
            {resultado.prediccion && (
              <div className={getColorClasses(resultado.prediccion)}>
                <p className="font-medium">
                  Tendencia esperada en el{" "}
                  {resultado.dias_prediccion === 1
                    ? "próximo 1 día"
                    : `próximos ${resultado.dias_prediccion} días`}
                  : <strong>{resultado.prediccion}</strong>
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
