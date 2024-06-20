import React from 'react';
import { Card } from '@tremor/react';
import ReactTooltip from 'react-tooltip';

export function CardUsageExample({ text, number, arrow, showTooltip, tooltipText }) {
  const numberColorClass = arrow === '↑' ? 'text-green-600' : arrow === '↓' ? 'text-red-600' : '';
  const arrowColorClass = arrow === '↑' ? 'text-green-600' : arrow === '↓' ? 'text-red-600' : '';

  const tooltipId = `tooltip-${text.replace(/\s+/g, '-')}`; // Generar un id único para el tooltip basado en el texto

  return (
    <Card className="mx-auto max-w-xs h-max" decoration="top" decorationColor="indigo">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">{text}</p>
          <p className={`text-3xl text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold ${numberColorClass}`}>{number}</p>
        </div>
        {arrow && <span className={`text-xl ${arrowColorClass}`}>{arrow}</span>}
        {showTooltip && (
          <span data-tip data-for={tooltipId} className="ml-2">
            ℹ️
          </span>
        )}
      </div>
      <ReactTooltip id={tooltipId} place="top" effect="solid">
        {tooltipText}
      </ReactTooltip>
    </Card>
  );
}
