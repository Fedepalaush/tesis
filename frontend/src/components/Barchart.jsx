import React from "react";
import { BarChart } from "@tremor/react";

const SCALE_FACTOR = 1_000_000; // Escalamos valores para que Tremor los maneje mejor

const dataFormatter = (number) => {
  if (typeof number !== "number" || isNaN(number)) return "0";
  // Multiplicamos para mostrar valor real y formateamos con separadores
  return Intl.NumberFormat("eS-AR", { notation: "compact", compactDisplay: "short" }).format(number * SCALE_FACTOR);
};

const Barchart = ({ data, type, stacked = false }) => {
  // Categorías según si es stacked o no
  const categories = stacked ? ["cash_equivalents", "receivables", "inventory", "other_current_assets"] : [type];

  const colors = stacked ? ["green", "blue", "orange", "red"] : ["blue"];

  // Escalamos los datos para que tremor no reciba números muy grandes
  const scaledData = data.map((item) => {
    const newItem = { name: item.name };
    categories.forEach((key) => {
      newItem[key] = item[key] ? item[key] / SCALE_FACTOR : 0;
    });
    return newItem;
  });

  // Debug rango datos
  const allValues = scaledData.flatMap((item) => categories.map((key) => item[key] || 0));
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  console.log("Barchart rango valores escalados:", { minValue, maxValue });

  return (
    <div style={{ width: "100%", maxWidth: "700px", padding: "20px", margin: "auto" }}>
      <BarChart
        data={scaledData}
        index="name"
        categories={categories}
        colors={colors}
        valueFormatter={dataFormatter}
        yAxisWidth={60} // un poco más ancho para el eje Y
        stack={stacked}
        height="350px" // aumentamos la altura
      />
    </div>
  );
};

export default Barchart;
