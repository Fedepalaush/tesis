import React, { useState, useEffect } from "react";

const modelos = ["XGBoost", "SVM", "RandomForest", "KNN", "LSTM"];

const indicadoresDisponibles = [
  { nombre: "SMA", parametros: ["periodo"] },
  { nombre: "EMA", parametros: ["periodo"] },
  { nombre: "RSI", parametros: ["periodo"] },
  { nombre: "BollingerBands", parametros: ["periodo", "stddev"] },
  { nombre: "MACD", parametros: ["rapida", "lenta", "signal"] },
];

export default function FormularioEntrenamiento({ onSubmit, loading }) {
  const [ticker, setTicker] = useState("AAPL");
  const [modelo, setModelo] = useState("XGBoost");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [indicadores, setIndicadores] = useState([]);
  const [diasPrediccion, setDiasPrediccion] = useState(1);

  useEffect(() => {
    const today = new Date();
    const lastYear = new Date(today);
    lastYear.setFullYear(today.getFullYear() - 1);
    const oneDayAgo = new Date(today);
    oneDayAgo.setDate(today.getDate() - 1);

    setFechaInicio(lastYear.toISOString().split("T")[0]);
    setFechaFin(oneDayAgo.toISOString().split("T")[0]);
  }, []);

  const agregarIndicador = (nombre) => {
    const permiteMultiples = ["SMA", "EMA"].includes(nombre);
    const yaExiste = indicadores.some((i) => i.nombre === nombre);
    if (!permiteMultiples && yaExiste) return;

    const def = indicadoresDisponibles.find((i) => i.nombre === nombre);
    if (!def) return;

    const parametrosIniciales = def.parametros.reduce((acc, param) => {
      acc[param] = "";
      return acc;
    }, {});

    setIndicadores([...indicadores, { nombre, parametros: parametrosIniciales }]);
  };

  const actualizarParametro = (index, param, value) => {
    const copia = [...indicadores];
    copia[index].parametros[param] = value;
    setIndicadores(copia);
  };

  const eliminarIndicador = (index) => {
    const copia = [...indicadores];
    copia.splice(index, 1);
    setIndicadores(copia);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (indicadores.length === 0) {
      alert("Agrega al menos un indicador.");
      return;
    }

    const indicadoresFormateados = indicadores.map((i) => {
      const parametrosNumericos = {};
      for (const [clave, valor] of Object.entries(i.parametros)) {
        const num = parseFloat(valor);
        parametrosNumericos[clave] = isNaN(num) ? valor : num;
      }
      return { nombre: i.nombre, parametros: parametrosNumericos };
    });

    onSubmit({
      ticker,
      modelo,
      start_date: fechaInicio,
      end_date: fechaFin,
      indicadores: indicadoresFormateados,
      dias_prediccion: diasPrediccion,
    });
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="max-w-2xl mx-auto bg-gray-900 shadow-lg rounded-lg p-6 space-y-6 text-white"
      aria-labelledby="training-form-title"
    >
      <h2 id="training-form-title" className="sr-only">
        Formulario de entrenamiento de modelo
      </h2>
      
      <div>
        <label htmlFor="ticker-input" className="block text-sm font-medium text-gray-300">
          Ticker
        </label>
        <input
          id="ticker-input"
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          className="mt-1 block w-full border border-gray-700 rounded-md p-2 bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
          aria-describedby="ticker-help"
        />
        <div id="ticker-help" className="mt-1 text-xs text-gray-400">
          Símbolo de la acción (ej: AAPL, MSFT)
        </div>
      </div>

      <div>
        <label htmlFor="modelo-select" className="block text-sm font-medium text-gray-300">
          Modelo
        </label>
        <select
          id="modelo-select"
          value={modelo}
          onChange={(e) => setModelo(e.target.value)}
          className="mt-1 block w-full border border-gray-700 rounded-md p-2 bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          aria-describedby="modelo-help"
        >
          {modelos.sort().map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <div id="modelo-help" className="mt-1 text-xs text-gray-400">
          Selecciona el algoritmo de machine learning a utilizar
        </div>
      </div>

      <fieldset className="grid grid-cols-2 gap-4">
        <legend className="block text-sm font-medium text-gray-300 mb-2">
          Rango de fechas para entrenamiento
        </legend>
        <div>
          <label htmlFor="fecha-inicio" className="block text-sm font-medium text-gray-300">
            Fecha Inicio
          </label>
          <input
            id="fecha-inicio"
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="mt-1 block w-full border border-gray-700 rounded-md p-2 bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="fecha-fin" className="block text-sm font-medium text-gray-300">
            Fecha Fin
          </label>
          <input
            id="fecha-fin"
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="mt-1 block w-full border border-gray-700 rounded-md p-2 bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="block text-sm font-medium text-gray-300 mb-2">
          Indicadores Técnicos
        </legend>
        <div className="flex flex-wrap gap-2 mb-4" role="group" aria-labelledby="indicadores-title">
          <div id="indicadores-title" className="sr-only">
            Botones para agregar indicadores técnicos
          </div>
          {indicadoresDisponibles.map((i) => (
            <button
              type="button"
              key={i.nombre}
              onClick={() => agregarIndicador(i.nombre)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label={`Agregar indicador ${i.nombre}`}
            >
              + {i.nombre}
            </button>
          ))}
        </div>

        {indicadores.map((i, index) => (
          <div key={index} className="bg-gray-800 border border-gray-700 rounded p-3 mb-3">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-white">{i.nombre}</h4>
              <button 
                type="button" 
                onClick={() => eliminarIndicador(index)} 
                className="text-red-400 hover:underline text-sm focus:ring-2 focus:ring-red-300 focus:ring-offset-2 focus:ring-offset-gray-800 rounded px-1"
                aria-label={`Eliminar indicador ${i.nombre}`}
              >
                Eliminar
              </button>
            </div>
            {Object.entries(i.parametros).map(([param, valor]) => (
              <div key={param} className="mb-2">
                <label 
                  htmlFor={`param-${index}-${param}`}
                  className="block text-sm text-gray-400"
                >
                  {param}
                </label>
                <input
                  id={`param-${index}-${param}`}
                  type="text"
                  value={valor}
                  onChange={(e) => actualizarParametro(index, param, e.target.value)}
                  className="mt-1 block w-full border border-gray-700 rounded-md p-2 bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-describedby={`param-${index}-${param}-help`}
                />
                <div id={`param-${index}-${param}-help`} className="sr-only">
                  Parámetro {param} para el indicador {i.nombre}
                </div>
              </div>
            ))}
          </div>
        ))}
      </fieldset>

      <div>
        <label htmlFor="dias-prediccion" className="block text-sm font-medium text-gray-300">
          Días a predecir
        </label>
        <input
          id="dias-prediccion"
          type="range"
          min="1"
          max="10"
          value={diasPrediccion}
          onChange={(e) => setDiasPrediccion(e.target.value)}
          className="mt-1 w-full focus:ring-2 focus:ring-blue-500"
          aria-describedby="dias-help"
        />
        <div className="flex justify-between text-sm text-gray-400" aria-hidden="true">
          <span>1 día</span>
          <span>10 días</span>
        </div>
        <div id="dias-help" className="text-center text-sm text-gray-300 mt-2">
          <strong>{diasPrediccion} días seleccionados</strong>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 px-4 rounded bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-300 focus:ring-offset-2 focus:ring-offset-gray-900 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        aria-describedby="submit-help"
      >
        {loading ? "Entrenando..." : "Entrenar Modelo"}
      </button>
      <div id="submit-help" className="sr-only">
        {loading ? "El modelo se está entrenando, por favor espera" : "Hacer clic para iniciar el entrenamiento del modelo"}
      </div>
    </form>
  );
}
