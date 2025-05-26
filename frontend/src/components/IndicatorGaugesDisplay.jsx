// src/components/IndicatorGaugesDisplay.jsx
import React from 'react';
import GaugeChart from './GaugeChart'; // Asegúrate que la ruta y exportación sean correctas

const IndicatorGaugesDisplay = ({ lastRsi, estadoEma }) => {
  if (lastRsi === undefined && estadoEma === undefined) {
    return null;
  }
  return (
    <div className="w-full mx-auto flex flex-col sm:flex-row justify-center items-center mt-4 gap-4">
      {lastRsi !== undefined && (
        <GaugeChart title={"RSI"} currentValue={lastRsi} minValue={0} maxValue={100} orden={"normal"} />
      )}
      {estadoEma !== undefined && (
        <GaugeChart title={"Puntuación EMA"} currentValue={estadoEma} minValue={0} maxValue={100} orden={"inverso"} />
      )}
    </div>
  );
};

export default IndicatorGaugesDisplay;