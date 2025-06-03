import React from "react";

/**
 * Versatile Loading Spinner Component
 * 
 * @param {Object} props
 * @param {string} props.size - Size of spinner ('sm', 'md', 'lg', 'xl')
 * @param {string} props.color - Color theme ('blue', 'white', 'gray')
 * @param {string} props.message - Optional loading message
 * @param {boolean} props.fullScreen - Whether to center in full viewport
 */
const LoadingSpinner = ({ 
  size = 'md', 
  color = 'blue', 
  message = null,
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-2',
    xl: 'h-16 w-16 border-4'
  };

  const colorClasses = {
    blue: 'border-blue-500 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-400 border-t-transparent'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-25 z-40'
    : 'flex items-center justify-center';

  const spinnerClasses = `animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]}`;

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-2">
        <div className={spinnerClasses}></div>
        {message && (
          <p className={`text-sm ${color === 'white' ? 'text-white' : 'text-gray-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;