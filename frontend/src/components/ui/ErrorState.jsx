import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const ErrorState = ({ 
  error,
  message, // Accept both error and message for backward compatibility
  title = "Error", 
  onRetry,
  showRetry = true // Default to true if onRetry is provided
}) => {
  // Use message prop first, then error prop for backward compatibility
  const errorMessage = message || error;
  
  return (
    <div 
      className="p-6 bg-red-900/20 border border-red-500/30 text-white rounded-lg w-full md:w-3/4 lg:w-2/4 mx-auto my-4"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center space-x-3 mb-3">
        <AlertTriangle className="h-6 w-6 text-red-400" />
        <h2 className="text-lg font-bold text-red-400">{title}</h2>
      </div>
      
      <p className="text-red-200 mb-4">{errorMessage}</p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
          aria-label="Intentar nuevamente"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Intentar nuevamente</span>
        </button>
      )}
    </div>
  );
};

export default ErrorState;
