import React, { createContext, useContext, useState } from 'react';

const LoadingContext = createContext();

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingCount, setLoadingCount] = useState(0);

  const showLoading = (message = 'Cargando...') => {
    setLoadingCount(prev => prev + 1);
    setLoadingMessage(message);
    setIsLoading(true);
  };

  const hideLoading = () => {
    setLoadingCount(prev => {
      const newCount = Math.max(0, prev - 1);
      if (newCount === 0) {
        setIsLoading(false);
        setLoadingMessage('');
      }
      return newCount;
    });
  };

  const value = {
    isLoading,
    loadingMessage,
    showLoading,
    hideLoading
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
}
