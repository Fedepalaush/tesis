import React from "react";
import { Info } from "lucide-react";

const IndicadoresModelo = ({ resultados }) => {
  const metricas = [
    {
      nombre: "Accuracy",
      valor: resultados?.accuracy,
      descripcion:
        "Porcentaje de predicciones correctas del total. Ideal para clases balanceadas.",
    },
    {
      nombre: "Precision",
      valor: resultados?.precision,
      descripcion:
        "Proporción de verdaderos positivos sobre el total de positivos predichos. Mide qué tan confiable es una predicción positiva.",
    },
    {
      nombre: "Recall",
      valor: resultados?.recall,
      descripcion:
        "Proporción de verdaderos positivos sobre el total de positivos reales. Mide qué tan bien se detectan los positivos.",
    },
    {
      nombre: "F1 Score",
      valor: resultados?.f1_score,
      descripcion:
        "Media armónica entre precision y recall. Útil cuando hay clases desbalanceadas.",
    },

  ];

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Indicadores del Modelo
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {metricas.map((m, i) => (
          <div
            key={i}
            className="bg-white border rounded-2xl shadow p-4 relative group"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-md font-semibold text-gray-800">{m.nombre}</h3>
              <div className="relative group">
                <Info className="w-4 h-4 text-gray-500 cursor-pointer" />
                <div className="absolute hidden group-hover:block bg-gray-700 text-white text-xs p-2 rounded w-64 z-10 top-6 left-1/2 transform -translate-x-1/2 shadow-lg">
                  {m.descripcion}
                </div>
              </div>
            </div>
            <div
              className={`text-xl font-bold ${
                m.valor >= 0.8
                  ? "text-green-600"
                  : m.valor >= 0.6
                  ? "text-yellow-600"
                  : "text-red-600"
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
