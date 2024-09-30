import React from 'react';
import '../assets/styles.css';

const Semaforo = ({ value, label }) => {
  const getColorClass = (expectedValue) => {
    return value === expectedValue ? 'active' : 'inactive';
  };

  return (
    <div className="semaforo">
      <div className="label">{label}</div>
      <div className={`light red ${getColorClass(-1)}`}></div>
      <div className={`light yellow ${getColorClass(0)}`}></div>
      <div className={`light green ${getColorClass(1)}`}></div>
    </div>
  );
};

export default Semaforo;