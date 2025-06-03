import { useState, useCallback } from 'react';
import { useNotification } from '../contexts/NotificationContext';

export const useAsyncOperation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError, showSuccess, showLoading, removeNotification } = useNotification();

  const execute = useCallback(async (
    asyncFunction,
    {
      loadingMessage = 'Cargando...',
      successMessage = null,
      errorMessage = 'Ha ocurrido un error',
      showSuccessNotification = false,
      showErrorNotification = true,
      showLoadingNotification = true
    } = {}
  ) => {
    setIsLoading(true);
    setError(null);
    
    let loadingId = null;
    if (showLoadingNotification) {
      loadingId = showLoading(loadingMessage);
    }

    try {
      const result = await asyncFunction();
      
      if (showSuccessNotification && successMessage) {
        showSuccess(successMessage);
      }
      
      return { success: true, data: result };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 
                      err.response?.data?.message || 
                      err.message || 
                      errorMessage;
      
      setError(errorMsg);
      
      if (showErrorNotification) {
        showError(errorMsg);
      }
      
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
      if (loadingId) {
        removeNotification(loadingId);
      }
    }
  }, [showError, showSuccess, showLoading, removeNotification]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    execute,
    reset
  };
};
