import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client"
import axios from 'axios'
import { TickersProvider } from './TickersContext.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { ConfigProvider } from './contexts/ConfigContext.jsx'
import { NotificationProvider } from './contexts/NotificationContext.jsx'
import { LoadingProvider } from './contexts/LoadingContext.jsx'

const client = new ApolloClient({
  uri: "api/graphql",
  cache: new InMemoryCache()
});

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Primero pedimos los tickers al backend
axios.get(`${apiBase}/tickers/`)
  .then(res => {
    // Montamos la app pasando los tickers al contexto
    console.log(res.data)
    ReactDOM.createRoot(document.getElementById('root')).render(
      <ConfigProvider>
        <NotificationProvider>
          <LoadingProvider>
            <AuthProvider>
              <ApolloProvider client={client}>        
                <TickersProvider initialTickers={res.data.data.tickers}>
                  <App />
                </TickersProvider>
              </ApolloProvider>
            </AuthProvider>
          </LoadingProvider>
        </NotificationProvider>
      </ConfigProvider>
    );
  })
  .catch(error => {
    console.error('Error al cargar los tickers:', error);
    ReactDOM.createRoot(document.getElementById('root')).render(
      <ConfigProvider>
        <NotificationProvider>
          <LoadingProvider>
            <AuthProvider>
              <ApolloProvider client={client}>
                <TickersProvider initialTickers={[]}> {/* App igual funciona sin tickers */}
                  <App />
                </TickersProvider>
              </ApolloProvider>
            </AuthProvider>
          </LoadingProvider>
        </NotificationProvider>
      </ConfigProvider>
    );
  });
