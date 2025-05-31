// components/TickerSelector.js
import React from "react";
import { useTickers } from "../TickersContext";

const TickerSelector = ({ selectedTicker, setSelectedTicker, tickers: propTickers }) => {
  const { tickers: contextTickers } = useTickers();
  const tickers = propTickers || contextTickers;
  return (
    <div className="w-full max-w-sm mb-4">
      <select
        value={selectedTicker}
        onChange={(e) => setSelectedTicker(e.target.value)}
        className="p-2 border rounded w-full bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {tickers.map((ticker) => (
          <option key={ticker} value={ticker}>
            {ticker}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TickerSelector;
