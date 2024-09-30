import React from "react";
import { BarChart } from "@tremor/react";

const dataFormatter = (number) =>
  Intl.NumberFormat('us').format(number).toString();

export const Barchart = ({ data, type, stacked = false }) => {
  // Si stacked es true, configura varias categorías para el gráfico apilado.
  const categories = stacked
    ? ["cash_equivalents", "receivables", "inventory", "other_current_assets"]
    : [type];

  const colors = stacked ? ["green", "blue", "orange", "red"] : ["blue"];

  return (
    <div>
      <BarChart
        data={data}
        index="name" // El campo de tu índice podría variar según tus datos
        categories={categories}
        colors={colors}
        valueFormatter={dataFormatter}
        yAxisWidth={48}
        stack={stacked} // Activar o desactivar apilamiento
        onValueChange={(v) => console.log("Changed value:", v)}
      />
    </div>
  );
};