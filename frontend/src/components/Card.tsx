import React from 'react';
import { Card, Metric, Text } from '@tremor/react';

export function CardUsageExample({ text, number, arrow }) {
  // Determinar la clase de color del número según la dirección de la flecha
  const numberColorClass = arrow === '↑' ? 'text-green-600' : arrow === '↓' ? 'text-red-600' : '';

  // Determinar la clase de color de la flecha según la dirección
  const arrowColorClass = arrow === '↑' ? 'text-green-600' : arrow === '↓' ? 'text-red-600' : '';

  return (
    <Card
      className="mx-auto max-w-xs h-max"
      decoration="top"
      decorationColor="indigo"
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">{text}</p>
          {/* Aplicar la clase de color condicional al número */}
          <p className={`text-3xl text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold ${numberColorClass}`}>{number}</p>
        </div>
        {/* Renderizar la flecha con la clase de color condicional */}
        {arrow && <span className={`text-xl ${arrowColorClass}`}>{arrow}</span>}
      </div>
    </Card>
  );
}