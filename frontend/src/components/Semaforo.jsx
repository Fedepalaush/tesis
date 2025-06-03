import React from 'react';
import '../assets/styles.css';

const Semaforo = ({ value, label }) => {
  const getColorClass = (expectedValue) => {
    return value === expectedValue ? 'active' : 'inactive';
  };

  const getSignalText = () => {
    switch (value) {
      case -1:
        return 'Señal Bajista';
      case 0:
        return 'Señal Neutral';
      case 1:
        return 'Señal Alcista';
      default:
        return 'Señal No Disponible';
    }
  };

  const getSignalDescription = () => {
    switch (value) {
      case -1:
        return 'Indicador en rojo: tendencia descendente o señal de venta';
      case 0:
        return 'Indicador en amarillo: tendencia neutral o sin señal clara';
      case 1:
        return 'Indicador en verde: tendencia ascendente o señal de compra';
      default:
        return 'Estado del indicador no determinado';
    }
  };

  return (
    <div 
      className="semaforo" 
      role="img" 
      aria-label={`${label ? `${label}: ` : ''}${getSignalText()}`}
      aria-describedby={`semaforo-desc-${Math.random().toString(36).substr(2, 9)}`}
    >
      {label && (
        <div className="label" aria-hidden="true">
          {label}
        </div>
      )}
      
      <div className="semaforo-lights" role="group" aria-label="Indicadores de señal">
        <div 
          className={`light red ${getColorClass(-1)}`}
          role="img"
          aria-label={`Luz roja${value === -1 ? ' - activa' : ' - inactiva'}`}
        ></div>
        <div 
          className={`light yellow ${getColorClass(0)}`}
          role="img"
          aria-label={`Luz amarilla${value === 0 ? ' - activa' : ' - inactiva'}`}
        ></div>
        <div 
          className={`light green ${getColorClass(1)}`}
          role="img"
          aria-label={`Luz verde${value === 1 ? ' - activa' : ' - inactiva'}`}
        ></div>
      </div>

      <div 
        id={`semaforo-desc-${Math.random().toString(36).substr(2, 9)}`}
        className="sr-only"
      >
        {getSignalDescription()}
      </div>

      {/* Additional live region for dynamic updates */}
      <div 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        Estado actual: {getSignalText()}
      </div>
    </div>
  );
};

export default Semaforo;