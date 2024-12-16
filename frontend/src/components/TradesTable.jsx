import React from "react";
import { formatDate, formatPrice } from "../utils/utils"

const TradesTable = ({ trades }) => {
  return (
    <table className="border-collapse border border-white text-white w-full">
      <thead>
        <tr>
          <th className="border border-white px-4 py-2">Fecha de Entrada</th>
          <th className="border border-white px-4 py-2">Fecha de Salida</th>
          <th className="border border-white px-4 py-2">Precio de Entrada</th>
          <th className="border border-white px-4 py-2">Precio de Salida</th>
          <th className="border border-white px-4 py-2">Ganancia/Pérdida</th>
          <th className="border border-white px-4 py-2">Retorno (%)</th>
        </tr>
      </thead>
      <tbody>
        {trades.map((trade, index) => (
          <tr key={index} className="border border-white">
            <td className="border border-white px-4 py-2">{formatDate(trade.EntryTime)}</td>
            <td className="border border-white px-4 py-2">{formatDate(trade.ExitTime)}</td>
            <td className="border border-white px-4 py-2">{formatPrice(trade.EntryPrice)}</td>
            <td className="border border-white px-4 py-2">{formatPrice(trade.ExitPrice)}</td>
            <td className="border border-white px-4 py-2">{formatPrice(trade.PnL)}</td>
            <td className="border border-white px-4 py-2">{(trade.ReturnPct * 100).toFixed(2)}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TradesTable;
