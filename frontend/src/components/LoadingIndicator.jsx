import React from "react";
import LoadingSpinner from "./LoadingSpinner";

/**
 * Simple Loading Indicator with text and spinner
 * Used for inline loading states within components
 */
const LoadingIndicator = ({ 
  message = "Cargando...", 
  size = "sm",
  color = "white",
  className = ""
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <LoadingSpinner size={size} color={color} />
      <p className={`${color === 'white' ? 'text-white' : 'text-gray-600'}`}>
        {message}
      </p>
    </div>
  );
};

export default LoadingIndicator;
