// components/TickerSelector.js
import React from "react";
import { tickersBM } from "../constants";

const TickerSelector = ({ selectedTicker, setSelectedTicker }) => {
  return (
    <div className="w-full max-w-sm mb-4">
      <select
        value={selectedTicker}
        onChange={(e) => setSelectedTicker(e.target.value)}
        className="p-2 border rounded w-full"
      >
        {tickersBM.map((ticker) => (
          <option key={ticker} value={ticker}>
            {ticker}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TickerSelector;
