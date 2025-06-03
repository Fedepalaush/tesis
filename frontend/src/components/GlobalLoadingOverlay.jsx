import React from 'react';
import { useLoading } from '../contexts/LoadingContext';

const GlobalLoadingOverlay = () => {
  const { isLoading, loadingMessage } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 shadow-xl">
        <div className="flex flex-col items-center space-y-4">
          {/* Improved spinner with better animation */}
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent absolute top-0"></div>
          </div>
          <p className="text-xl text-gray-700 font-medium text-center">
            {loadingMessage}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GlobalLoadingOverlay;
