import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client"
import axios from 'axios'
import { setTickersBM } from './constants.js'

const client = new ApolloClient({
  uri: "api/graphql",
  cache: new InMemoryCache()
});

// Primero pedimos los tickers al backend
axios.get('http://localhost:8000/api/tickers/')
  .then(res => {
    setTickersBM(res.data.tickers);
    console.log(res.data.tickers)

    // Luego montamos la app
    ReactDOM.createRoot(document.getElementById('root')).render(
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    );
  })
  .catch(error => {
    console.error('Error al cargar los tickers:', error);

    // Igual montamos la app por si no son imprescindibles
    ReactDOM.createRoot(document.getElementById('root')).render(
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    );
  });
