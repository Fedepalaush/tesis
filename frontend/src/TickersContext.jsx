import React, { createContext, useContext, useState } from 'react';

const TickersContext = createContext();

export function useTickers() {
  return useContext(TickersContext);
}

export function TickersProvider({ children, initialTickers = [] }) {
  const [tickers, setTickers] = useState(initialTickers);
  return (
    <TickersContext.Provider value={{ tickers, setTickers }}>
      {children}
    </TickersContext.Provider>
  );
}
