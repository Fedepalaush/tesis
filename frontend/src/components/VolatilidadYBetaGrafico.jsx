import React, { useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const VolatilidadYBetaGrafico = ({ title, data, strokeColor = "#8884d8", height = 250 }) => {
  const explicaciones = {
    Volatilidad: "Indica cuánto cambia el valor de tu inversión. Si la volatilidad es alta, hay más riesgo, pero también más posibilidad de ganar más si acertás.",
    Beta: "Muestra cómo se mueve tu inversión comparada con el mercado (como el S&P 500). Si la beta es 1, se mueve igual que el mercado. Si es mayor a 1, sube y baja más que el mercado: más riesgo y también más oportunidad.",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow w-full">
      <div className="flex items-center justify-center mb-2 gap-2 relative group">
        <h3 className="text-xl font-semibold text-center dark:text-white">{title}</h3>
        <div className="relative flex items-center">
          <span className="text-white text-xs bg-blue-500 rounded-full px-2 py-0.5 cursor-pointer">i</span>
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-700 text-white text-sm px-3 py-1 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10 w-64">
            {explicaciones[title]}
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis dataKey="date" tick={{ fill: "#6B7280" }} />
          <YAxis tick={{ fill: "#6B7280" }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VolatilidadYBetaGrafico;
