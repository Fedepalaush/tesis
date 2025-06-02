import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client"
import axios from 'axios'
import { TickersProvider } from './TickersContext.jsx';

const client = new ApolloClient({
  uri: "api/graphql",
  cache: new InMemoryCache()
});

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000/";

// Primero pedimos los tickers al backend
axios.get(`${apiBase}/tickers/`)
  .then(res => {
    // Montamos la app pasando los tickers al contexto
    console.log(res.data)
    ReactDOM.createRoot(document.getElementById('root')).render(
      <ApolloProvider client={client}>        
        <TickersProvider initialTickers={res.data.data.tickers}>
          <App />
        </TickersProvider>
      </ApolloProvider>
    );
  })
  .catch(error => {
    console.error('Error al cargar los tickers:', error);
    ReactDOM.createRoot(document.getElementById('root')).render(
      <ApolloProvider client={client}>
        <TickersProvider initialTickers={[]}> {/* App igual funciona sin tickers */}
          <App />
        </TickersProvider>
      </ApolloProvider>
    );
  });
