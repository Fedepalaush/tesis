import React from "react";

const FormBacktesting = ({ formData, handleChange }) => {
  const currentYear = new Date().getFullYear();
  const minDate = `${currentYear - 10}-01-01`;
  const maxDate = new Date().toISOString().split('T')[0];

  return (
    <form 
      className="mb-4"
      role="form"
      aria-label="Configuración de parámetros de backtesting"
      noValidate
    >
      <fieldset aria-describedby="backtesting-instructions">
        <legend className="sr-only">
          Parámetros de configuración para backtesting
        </legend>
        
        <p id="backtesting-instructions" className="sr-only">
          Configura los parámetros necesarios para ejecutar el backtesting: ticker, fechas, porcentajes de take profit y stop loss, y monto inicial.
        </p>

        <div className="mb-4">
          <label htmlFor="ticker" className="block text-white mb-1 font-medium">
            Ticker del Activo
          </label>
          <input
            type="text"
            id="ticker"
            name="ticker"
            value={formData.ticker}
            onChange={handleChange}
            className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ej: AAPL, MSFT"
            aria-describedby="ticker-help"
            required
            autoComplete="off"
          />
          <p id="ticker-help" className="text-gray-400 text-sm mt-1">
            Ingresa el símbolo del activo financiero (ej: AAPL para Apple)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="inicio" className="block text-white mb-1 font-medium">
              Fecha de Inicio
            </label>
            <input
              type="date"
              id="inicio"
              name="inicio"
              value={formData.inicio}
              onChange={handleChange}
              className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min={minDate}
              max={formData.fin || maxDate}
              aria-describedby="inicio-help"
              required
            />
            <p id="inicio-help" className="text-gray-400 text-sm mt-1">
              Fecha desde la cual comenzar el análisis
            </p>
          </div>

          <div>
            <label htmlFor="fin" className="block text-white mb-1 font-medium">
              Fecha de Fin
            </label>
            <input
              type="date"
              id="fin"
              name="fin"
              value={formData.fin}
              onChange={handleChange}
              className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min={formData.inicio || minDate}
              max={maxDate}
              aria-describedby="fin-help"
              required
            />
            <p id="fin-help" className="text-gray-400 text-sm mt-1">
              Fecha hasta la cual realizar el análisis
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="tp_percentage" className="block text-white mb-1 font-medium">
              Take Profit (%)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max="100"
              id="tp_percentage"
              name="tp_percentage"
              value={formData.tp_percentage}
              onChange={handleChange}
              className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="5.00"
              aria-describedby="tp-help"
              required
            />
            <p id="tp-help" className="text-gray-400 text-sm mt-1">
              Porcentaje de ganancia para cerrar posición (ej: 5 = 5%)
            </p>
          </div>

          <div>
            <label htmlFor="sl_percentage" className="block text-white mb-1 font-medium">
              Stop Loss (%)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max="100"
              id="sl_percentage"
              name="sl_percentage"
              value={formData.sl_percentage}
              onChange={handleChange}
              className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="3.00"
              aria-describedby="sl-help"
              required
            />
            <p id="sl-help" className="text-gray-400 text-sm mt-1">
              Porcentaje de pérdida para cerrar posición (ej: 3 = 3%)
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="initial_cash" className="block text-white mb-1 font-medium">
            Monto Inicial
          </label>
          <input
            type="number"
            step="0.01"
            min="1"
            id="initial_cash"
            name="initial_cash"
            value={formData.initial_cash}
            onChange={handleChange}
            className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="10000.00"
            aria-describedby="initial-cash-help"
            required
          />
          <p id="initial-cash-help" className="text-gray-400 text-sm mt-1">
            Capital inicial para la estrategia en USD (ej: 10000 para $10,000)
          </p>
        </div>
      </fieldset>
    </form>
  );
};

export default FormBacktesting;
