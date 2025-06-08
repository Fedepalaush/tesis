import React, { createContext, useContext, useState, useEffect } from 'react';

const ConfigContext = createContext();

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState({
    apiUrl: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
    theme: 'dark',
    language: 'es',
    defaultTicker: 'AAPL',
    defaultTimeframe: '1d',
    defaultDateRange: {
      start: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0],
      end: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]
    }
  });

  // Cargar configuración desde localStorage al inicializar
  useEffect(() => {
    const savedConfig = localStorage.getItem('appConfig');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(prev => ({ ...prev, ...parsedConfig }));
      } catch (error) {
        console.error('Error parsing saved config:', error);
      }
    }
  }, []);

  // Guardar configuración en localStorage cuando cambie
  const updateConfig = (newConfig) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    localStorage.setItem('appConfig', JSON.stringify(updatedConfig));
  };

  const resetConfig = () => {
    const defaultConfig = {
      apiUrl: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
      theme: 'dark',
      language: 'es',
      defaultTicker: 'AAPL',
      defaultTimeframe: '1d',
      defaultDateRange: {
        start: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0],
        end: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]
      }
    };
    setConfig(defaultConfig);
    localStorage.setItem('appConfig', JSON.stringify(defaultConfig));
  };

  const value = {
    config,
    updateConfig,
    resetConfig,
    // Helper functions for common config values
    getApiUrl: () => config.apiUrl,
    getTheme: () => config.theme,
    getDefaultTicker: () => config.defaultTicker,
    getDefaultTimeframe: () => config.defaultTimeframe,
    getDefaultDateRange: () => config.defaultDateRange
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}
