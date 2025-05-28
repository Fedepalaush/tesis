// src/components/SummaryCardsDisplay.jsx
import React from 'react';
import  CardUsageExample from '../components/Card'; // Asegúrate que la ruta y exportación sean correctas

const SummaryCardsDisplay = ({
  diferenciaEma,
  tendencia219,
  diferenciaHoy,
  diferenciaSemana,
}) => {
  if (diferenciaEma === undefined && diferenciaHoy === undefined && diferenciaSemana === undefined) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 mt-4 lg:grid-cols-3 md:grid-cols-2 gap-3 h-max-full mb-8">
      {diferenciaEma !== undefined && (
        <CardUsageExample
          text={"Diferencia EMA 21-9"}
          number={diferenciaEma.toFixed(2) + "%"}
          arrow={tendencia219 === 1 ? "↑" : tendencia219 === 2 ? "↓" : "-"}
          showTooltip={true}
          tooltipText="Una diferencia apenas positiva con una flecha verde indica posible movimiento al alza. Mientras que una diferencia apenas negativa con una flecha roja indica posible movimiento a la baja."
        />
      )}
      {diferenciaHoy !== undefined && (
        <CardUsageExample text={"Última Vela"} number={diferenciaHoy.toFixed(2) + "%"} />
      )}
      {diferenciaSemana !== undefined && (
        <CardUsageExample
          text={"Ultimas 5 Velas"}
          number={diferenciaSemana.toFixed(2) + "%"}
        />
      )}
    </div>
  );
};

export default SummaryCardsDisplay;