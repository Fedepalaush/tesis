import React from "react";
import ReactTooltip from "react-tooltip";

const BacktestResults = ({ total }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md w-full max-w-2xl mx-auto mt-6">
      <h1 className="text-xl text-white font-bold mb-4">Resultados del Backtest</h1>

      <div className="space-y-4">
        {[
          { label: "Duración", value: total.Duration },
          { label: "Equity Final", value: total["Equity Final [$]"] },
          { label: "Equity Peak", value: total["Equity Peak [$]"] },
          { label: "Rendimiento Total", value: `${total["Return [%]"].toFixed(2)}%` },
          { label: "Rendimiento Anual", value: `${total["Return (Ann.) [%]"].toFixed(2)}%` },
          {
            label: "Ratio de Sharpe",
            value: total["Sharpe Ratio"].toFixed(2),
            info: "El Sharpe ratio mide la rentabilidad ajustada al riesgo, mostrando la rentabilidad que se obtiene por cada unidad de riesgo asumido. Un ratio más alto indica una mejor relación riesgo-retorno.",
          },
          {
            label: "Ratio de Sortino",
            value: total["Sortino Ratio"].toFixed(2),
            info: "El Sortino ratio es similar al Sharpe ratio, pero solo considera la volatilidad negativa, lo que lo hace más útil para evaluar los riesgos a la baja.",
          },
          { label: "Máximo Drawdown", value: `${total["Max. Drawdown [%]"].toFixed(2)}%` },
          { label: "Duración del Máximo Drawdown", value: total["Max. Drawdown Duration"] },
          { label: "Exposure Time", value: `${total["Exposure Time [%]"].toFixed(2)}%` },
          {
            label: "Volatilidad Anual",
            value: `${total["Volatility (Ann.) [%]"].toFixed(2)}%`,
            info: "La volatilidad anual muestra cuánto fluctúa el valor de la inversión durante el año, indicando el nivel de riesgo de la estrategia.",
          },
          { label: "Duración Promedio del Drawdown", value: total["Avg. Drawdown Duration"] },
          { label: "Drawdown Promedio", value: `${total["Avg. Drawdown [%]"].toFixed(2)}%` },
          {
            label: "Calmar Ratio",
            value: total["Calmar Ratio"].toFixed(2),
            info: "El Calmar ratio mide la rentabilidad ajustada al riesgo, comparando la rentabilidad anual con el drawdown máximo. Cuanto mayor sea este ratio, mejor será la estrategia.",
          },
          {
            label: "Buy & Hold Return",
            value: `${total["Buy & Hold Return [%]"].toFixed(2)}%`,
            info: "El rendimiento Buy & Hold es el rendimiento obtenido al mantener la inversión sin realizar compras ni ventas durante el periodo de tiempo total.",
          },
        ].map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-white">{item.label}:</span>
              {item.info && (
                <>
                  <span data-tip={item.info} className="cursor-pointer text-blue-400">
                    ℹ️
                  </span>
                  <ReactTooltip effect="solid" place="right" />
                </>
              )}
            </div>
            <span className="text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BacktestResults;
