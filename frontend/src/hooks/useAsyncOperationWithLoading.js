import { useState } from 'react';
import { useLoading } from '../contexts/LoadingContext';
import { getUserErrorMessage, logError } from '../utils/errorHandler';
import { useNotification } from '../contexts/NotificationContext';

/**
 * Enhanced useAsyncOperation hook with global loading integration
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.useGlobalLoading - Whether to show global loading overlay
 * @param {boolean} options.showNotifications - Whether to show success/error notifications
 * @param {string} options.defaultLoadingMessage - Default loading message
 */
export function useAsyncOperationWithLoading({
  useGlobalLoading = false,
  showNotifications = true,
  defaultLoadingMessage = 'Procesando...'
} = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showLoading, hideLoading } = useLoading();
  const { showNotification } = useNotification();

  const execute = async (asyncFunction, loadingMessage = defaultLoadingMessage) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Show global loading if requested
      if (useGlobalLoading) {
        showLoading(loadingMessage);
      }

      const result = await asyncFunction();
      
      return result;
    } catch (err) {
      const errorMessage = getUserErrorMessage(err);
      const errorInfo = { 
        message: errorMessage, 
        userMessage: errorMessage, 
        originalError: err 
      };
      
      setError(errorInfo);
      logError(err, 'useAsyncOperationWithLoading', errorMessage);
      
      // Show error notification if enabled
      if (showNotifications) {
        showNotification(errorMessage, 'error');
      }
      
      throw err;
    } finally {
      setIsLoading(false);
      
      // Hide global loading if it was shown
      if (useGlobalLoading) {
        hideLoading();
      }
    }
  };

  return {
    isLoading,
    error,
    execute
  };
}
