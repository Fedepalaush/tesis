// Configuración central de endpoints de API
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/token/",
    REFRESH: "/token/refresh/",
    REGISTER: "/user/register/",
    VERIFY: "/token/verify/",
  },
  
  // Activos
  ACTIVOS: {
    BASE: "/activos/",
    LIST: "/activos/",
    DETAIL: (id) => `/activos/${id}/`,
    PRICES: (ticker) => `/activos/${ticker}/prices/`,
    ANALYSIS: (ticker) => `/activos/${ticker}/analysis/`,
  },

  // Tickers
  TICKERS: {
    LIST: "/tickers/",
  },

  // Analytics
  ANALYTICS: {
    SHARPE_RATIO: "/analytics/sharpe-ratio/",
    CORRELATION: "/analytics/correlation/",
    FUNDAMENTAL: "/analytics/fundamental/",
    BACKTESTING: "/analytics/backtesting/",
    MONTHLY_RETURNS: "/analytics/monthly-returns/",
    SUPPORT_RESISTANCE: "/analytics/support-resistance/",
    KMEANS: "/analytics/kmeans/",
    MOVING_AVERAGES: "/analytics/moving-averages/",
    DIVIDEND_CALENDAR: "/analytics/dividend-calendar/",
  },

  // Machine Learning
  ML: {
    TRAIN: "/ml/train/",
    PREDICT: "/ml/predict/",
    MODELS: "/ml/models/",
  },

  // GraphQL
  GRAPHQL: "/graphql/",
};

// Utility functions for building API URLs
export const buildApiUrl = (endpoint, params = {}) => {
  let url = endpoint;
  
  // Replace path parameters
  Object.keys(params).forEach(key => {
    url = url.replace(`:${key}`, params[key]);
  });
  
  return url;
};

// Common API request configurations
export const API_CONFIG = {
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

export default API_ENDPOINTS;
