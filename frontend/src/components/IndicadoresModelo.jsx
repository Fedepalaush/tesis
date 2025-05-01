import React from "react";
import { Info } from "lucide-react";

const IndicadoresModelo = ({ resultados }) => {
  const metricas = [
    {
      nombre: "Exactitud",
      valor: resultados?.accuracy,
      descripcion:
        "Muestra qué tan seguido el modelo acierta. Si acierta 8 de cada 10 veces, la exactitud es 80%.",
    },
    {
      nombre: "Precision",
      valor: resultados?.precision,
      descripcion:
        "De todas las veces que el modelo dijo 'sí', cuántas veces tuvo razón. Útil para no dar falsos avisos.",
    },
    {
      nombre: "Recall",
      valor: resultados?.recall,
      descripcion:
        "De todos los casos reales que eran 'sí', cuántos detectó el modelo. Es decir, cuántos no se le escaparon.",
    },
    {
      nombre: "F1 Score",
      valor: resultados?.f1_score,
      descripcion:
        "Combina precisión y detección en una sola medida. Es útil cuando hay pocos casos positivos.",
    },
  ];

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
        Indicadores del Modelo
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {metricas.map((m, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl shadow p-4 relative group"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100">
                {m.nombre}
              </h3>
              <div className="relative group">
                <Info className="w-4 h-4 text-gray-500 dark:text-gray-300 cursor-pointer" />
                <div className="absolute hidden group-hover:block bg-gray-700 text-white text-xs p-2 rounded w-64 z-10 top-6 left-1/2 transform -translate-x-1/2 shadow-lg">
                  {m.descripcion}
                </div>
              </div>
            </div>
            <div
              className={`text-xl font-bold ${
                m.valor >= 0.8
                  ? "text-green-600 dark:text-green-400"
                  : m.valor >= 0.6
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {m.valor !== undefined ? m.valor.toFixed(2) : "-"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IndicadoresModelo;
