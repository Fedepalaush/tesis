import React from 'react';

const LoadingState = ({ message = "Cargando datos..." }) => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="text-xl text-white animate-pulse">{message}</p>
      </div>
    </div>
  );
};

export default LoadingState;
