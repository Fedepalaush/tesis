// EntrenamientoPage.jsx
import React from "react";
import clsx from "clsx";
import { useEntrenamiento } from "../hooks/useEntrenamiento";
import FormularioEntrenamiento from "../components/FormularioEntrenamiento";
import IndicadoresModelo from "../components/IndicadoresModelo";
import BaseLayout from "../components/BaseLayout";
import MatrizConfusion from "../components/MatrizConfusion";
import { useAsyncOperationWithLoading } from '../hooks/useAsyncOperationWithLoading';
import { useNotification } from '../contexts/NotificationContext';

export default function EntrenamientoPage() {
  const { showError, showSuccess } = useNotification();
  
  // Use global loading system
  const { execute, isLoading } = useAsyncOperationWithLoading({
    useGlobalLoading: true,
    showNotifications: false // We'll handle notifications manually for better UX
  });

  const { resultado, entrenarModelo } = useEntrenamiento();

  const datos = resultado?.data;

  const getColorClasses = (prediccion) =>
    clsx("p-4 border rounded", {
      "bg-green-100 border-green-300 text-green-800": prediccion === "Subirá",
      "bg-red-100 border-red-300 text-red-800": prediccion === "Bajará",
      "bg-gray-100 border-gray-300 text-gray-800": !["Subirá", "Bajará"].includes(prediccion),
    });

  // Enhanced form submission handler with global loading
  const handleEntrenarModelo = async (formData) => {
    await execute(
      async () => {
        await entrenarModelo(formData);
        if (resultado?.error) {
          throw new Error(resultado.error);
        }
        showSuccess('Modelo entrenado exitosamente');
      },
      'Entrenando modelo...'
    );
  };

  return (
    <BaseLayout>
      <div className="max-w-3xl mx-auto mt-8 px-4">
        <h1 className="text-2xl font-bold mb-4 text-slate-50">Entrenamiento de Modelos</h1>

        <FormularioEntrenamiento onSubmit={handleEntrenarModelo} loading={isLoading} />

        {resultado?.error && (
          <div
            role="alert"
            className="mt-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded"
          >
            {resultado.error}
          </div>
        )}

        {datos && (
          <div className="mt-6">
            {datos.prediccion && (
              <div className={getColorClasses(datos.prediccion)}>
                <p className="font-medium">
                  Tendencia esperada en el{" "}
                  {datos.dias_prediccion === 1
                    ? "próximo 1 día"
                    : `próximos ${datos.dias_prediccion} días`}
                  : <strong>{datos.prediccion}</strong>
                </p>
              </div>
            )}
            <IndicadoresModelo resultados={datos} />
          </div>
        )}

        {datos?.confusion_matrix && (
          <div className="mt-6">
            <MatrizConfusion matriz={datos.confusion_matrix} />
          </div>
        )}
      </div>
    </BaseLayout>
  );
}

