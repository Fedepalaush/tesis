// src/components/PieChartComponent.jsx

import React from "react";
import { DonutChart } from "@tremor/react";

const PieChartComponent = ({ data, title }) => {
  // Transformar los datos en el formato requerido por DonutChart
  const formattedData = data.map((entry) => ({
    label: entry.label,
    value: entry.label === "Deuda a Largo Plazo" ? entry.value.LongTermDebt : entry.value.CurrentDebt, // Accede al valor específico dentro del objeto
  }));

  console.log("Formatted Data:", formattedData); // Verifica el formato de los datos

  // Define los colores para las porciones y la leyenda
  const colors = ["purple", "orange"];
  return (
    <div>
      {/* Título con estilos de texto */}
      <h1 className="text-center text-sm text-gray-700 dark:text-gray-300">{title}</h1>

      {/* Gráfico de dona */}
      <DonutChart
        data={formattedData}
        category="value" // Esta es la clave que contiene los valores
        index="label" // Esta es la clave que contiene las etiquetas
        colors={["purple", "orange"]} // Colores para las porciones
        height={300} // Ajusta según sea necesario
        width={500} // Ajusta según sea necesario
        valueFormatter={(number) => `$${Intl.NumberFormat("us").format(number).toString()}`}
      />
      <div className="flex justify-center mt-2">
        {formattedData.map((entry, index) => (
          <div key={entry.label} className="flex items-center mr-4">
            <div className="w-4 h-4" style={{ backgroundColor: colors[index], borderRadius: "50%" }} />
            <span className="ml-1 text-sm text-gray-600 dark:text-gray-300">{entry.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChartComponent;
