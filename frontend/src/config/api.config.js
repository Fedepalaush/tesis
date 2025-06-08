// API Configuration
// Centralized configuration for API endpoints and settings

/**
 * Environment-based API configuration
 */
export const API_CONFIG = {
  // Base URL from environment variable with fallback
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  
  // Timeout settings
  TIMEOUT: 30000, // 30 seconds
  
  // Retry configuration
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Environment detection
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  
  // API Endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/token/',
      REGISTER: 'user/register/',
      REFRESH: '/token/refresh/',
      USER_EXISTS: '/user/exists',
    },
    
    // Stock data
    STOCKS: {
      DATA: '/stock-data/',
      PIVOT_POINTS: '/pivot-points/',
      FINANCIAL_INDICATORS: '/financial-indicators/',
      CORRELACION: '/correlacion/',
      FUNDAMENTAL: '/fundamental/',
      SHARPE_RATIO: '/sharpe-ratio/',
      RETORNOS_MENSUALES: '/retornos-mensuales/',
      MEDIAS_MOVILES: '/medias-moviles/',
      BACKTESTING: '/backtesting/',
      CLUSTERING: '/agrupamiento/',
      ENTRENAMIENTO: '/entrenamiento/',
      DIVIDENDOS: '/dividendos/',
    },
    
    // Analysis
    ANALYSIS: {
      TECHNICAL: '/technical-analysis/',
      FUNDAMENTAL: '/fundamental-analysis/',
    }
  }
};

/**
 * Get full API URL for an endpoint
 * @param {string} endpoint - The endpoint path
 * @returns {string} Full URL
 */
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

/**
 * Get endpoint URL by category and name
 * @param {string} category - Category name (e.g., 'STOCKS', 'AUTH')
 * @param {string} name - Endpoint name (e.g., 'DATA', 'LOGIN')
 * @returns {string} Full URL
 */
export const getEndpointUrl = (category, name) => {
  const endpoint = API_CONFIG.ENDPOINTS[category]?.[name];
  if (!endpoint) {
    throw new Error(`Endpoint ${category}.${name} not found`);
  }
  return getApiUrl(endpoint);
};

/**
 * Environment-specific configurations
 */
export const ENV_CONFIG = {
  development: {
    enableLogging: true,
    enableMocks: false,
    enableDebugTools: true,
  },
  production: {
    enableLogging: false,
    enableMocks: false,
    enableDebugTools: false,
  }
};

/**
 * Get current environment configuration
 */
export const getCurrentEnvConfig = () => {
  return API_CONFIG.IS_PRODUCTION 
    ? ENV_CONFIG.production 
    : ENV_CONFIG.development;
};

export default API_CONFIG;
