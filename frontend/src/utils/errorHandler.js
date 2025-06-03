/**
 * Centralized error handling utilities
 * 
 * This module provides unified error handling patterns and user-friendly 
 * error messages for the application.
 */

/**
 * Error types for categorization
 */
export const ERROR_TYPES = {
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION',
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  NOT_FOUND: 'NOT_FOUND',
  SERVER: 'SERVER',
  UNKNOWN: 'UNKNOWN'
};

/**
 * User-friendly error messages in Spanish
 */
const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK]: 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.',
  [ERROR_TYPES.VALIDATION]: 'Los datos ingresados no son válidos. Revisa la información e intenta nuevamente.',
  [ERROR_TYPES.AUTHENTICATION]: 'Credenciales incorrectas. Verifica tu usuario y contraseña.',
  [ERROR_TYPES.AUTHORIZATION]: 'No tienes permisos para realizar esta acción.',
  [ERROR_TYPES.NOT_FOUND]: 'El recurso solicitado no fue encontrado.',
  [ERROR_TYPES.SERVER]: 'Error interno del servidor. Intenta nuevamente en unos momentos.',
  [ERROR_TYPES.UNKNOWN]: 'Ocurrió un error inesperado. Intenta nuevamente.'
};

/**
 * Categorizes an error based on status code and error details
 * @param {Error} error - The error object
 * @returns {string} Error type
 */
export function categorizeError(error) {
  if (!error) return ERROR_TYPES.UNKNOWN;

  // Network errors
  if (!error.response) {
    return ERROR_TYPES.NETWORK;
  }

  const status = error.response?.status;

  // HTTP status code categorization
  if (status === 401) return ERROR_TYPES.AUTHENTICATION;
  if (status === 403) return ERROR_TYPES.AUTHORIZATION;
  if (status === 404) return ERROR_TYPES.NOT_FOUND;
  if (status >= 400 && status < 500) return ERROR_TYPES.VALIDATION;
  if (status >= 500) return ERROR_TYPES.SERVER;

  return ERROR_TYPES.UNKNOWN;
}

/**
 * Gets user-friendly error message for display
 * @param {Error} error - The error object
 * @param {string} fallbackMessage - Custom fallback message
 * @returns {string} User-friendly error message
 */
export function getUserErrorMessage(error, fallbackMessage = null) {
  const errorType = categorizeError(error);
  
  // Try to extract backend error message if available
  const backendMessage = error.response?.data?.message || 
                        error.response?.data?.detail ||
                        error.response?.data?.error;
  
  // If we have a specific backend message, use it
  if (backendMessage && typeof backendMessage === 'string') {
    return backendMessage;
  }

  // Use fallback if provided
  if (fallbackMessage) {
    return fallbackMessage;
  }

  // Use default message for error type
  return ERROR_MESSAGES[errorType];
}

/**
 * Logs error details for debugging while showing user-friendly message
 * @param {Error} error - The error object
 * @param {string} context - Context where error occurred
 * @param {string} userMessage - Message to show to user
 */
export function logError(error, context, userMessage = null) {
  const errorType = categorizeError(error);
  const displayMessage = userMessage || getUserErrorMessage(error);
  
  console.group(`🚨 Error in ${context}`);
  console.error('Error Type:', errorType);
  console.error('User Message:', displayMessage);
  console.error('Original Error:', error);
  if (error.response) {
    console.error('Response Status:', error.response.status);
    console.error('Response Data:', error.response.data);
  }
  console.groupEnd();
  
  return displayMessage;
}

/**
 * Higher-order function to wrap async operations with error handling
 * @param {Function} asyncFn - Async function to wrap
 * @param {Object} options - Error handling options
 * @returns {Function} Wrapped function
 */
export function withErrorHandling(asyncFn, options = {}) {
  const {
    context = 'Unknown operation',
    showNotification = true,
    fallbackMessage = null,
    onError = null
  } = options;

  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      const userMessage = logError(error, context, fallbackMessage);
      
      if (onError) {
        onError(error, userMessage);
      }
      
      throw error; // Re-throw to allow component-level handling
    }
  };
}

/**
 * Utility to extract validation errors from response
 * @param {Error} error - Error object from API
 * @returns {Object} Validation errors by field
 */
export function extractValidationErrors(error) {
  const data = error.response?.data;
  
  if (!data || typeof data !== 'object') {
    return {};
  }

  // Handle Django REST Framework validation errors
  const validationErrors = {};
  
  Object.keys(data).forEach(key => {
    if (Array.isArray(data[key])) {
      validationErrors[key] = data[key].join(' ');
    } else if (typeof data[key] === 'string') {
      validationErrors[key] = data[key];
    }
  });

  return validationErrors;
}

/**
 * Creates an error object with additional context
 * @param {string} message - Error message
 * @param {string} type - Error type
 * @param {any} context - Additional context
 * @returns {Error} Enhanced error object
 */
export function createAppError(message, type = ERROR_TYPES.UNKNOWN, context = null) {
  const error = new Error(message);
  error.type = type;
  error.context = context;
  return error;
}
