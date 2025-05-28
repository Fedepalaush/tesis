// src/components/SemaforoSignalsDisplay.jsx
import React from 'react';
import Semaforo from './Semaforo'; // Asegúrate que la ruta y exportación sean correctas

const SemaforoSignalsDisplay = ({
  emaRapidaSemaforo,
  emaMediaSemaforo,
  emaLentaSemaforo,
}) => {
  if (emaRapidaSemaforo === undefined && emaMediaSemaforo === undefined && emaLentaSemaforo === undefined) {
    return null;
  }
  return (
    <div className="flex flex-col sm:flex-row justify-around items-stretch mt-4 mb-8 gap-4">
      {emaRapidaSemaforo !== undefined && (
        <div className="text-white text-center p-3 bg-gray-700 rounded basis-1/3">
          <h3 className="font-semibold mb-2 text-sm md:text-base">Cruce Media Móvil Corto Plazo</h3>
          <Semaforo value={emaRapidaSemaforo} label="" />
        </div>
      )}
      {emaMediaSemaforo !== undefined && (
        <div className="text-white text-center p-3 bg-gray-700 rounded basis-1/3">
          <h3 className="font-semibold mb-2 text-sm md:text-base">Cruce Media Móvil Mediano Plazo</h3>
          <Semaforo value={emaMediaSemaforo} label="" />
        </div>
      )}
      {emaLentaSemaforo !== undefined && (
        <div className="text-white text-center p-3 bg-gray-700 rounded basis-1/3">
          <h3 className="font-semibold mb-2 text-sm md:text-base">Cruce Media Móvil Largo Plazo</h3>
          <Semaforo value={emaLentaSemaforo} label="" />
        </div>
      )}
    </div>
  );
};

export default SemaforoSignalsDisplay;