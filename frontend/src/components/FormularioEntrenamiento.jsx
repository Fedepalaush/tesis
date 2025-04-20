import React, { useState, useEffect } from 'react';

const modelos = [
  'XGBoost',
  'SVM',
  'RandomForest',
  'LogisticRegression',
  'KNN',
  'NaiveBayes'
];

const indicadoresDisponibles = [
  { nombre: 'SMA', parametros: ['periodo'] },
  { nombre: 'EMA', parametros: ['periodo'] },
  { nombre: 'RSI', parametros: ['periodo'] },
  { nombre: 'BollingerBands', parametros: ['periodo', 'stddev'] },
  { nombre: 'MACD', parametros: ['rapida', 'lenta', 'signal'] }
];

export default function FormularioEntrenamiento({ onSubmit, loading }) {
  const [ticker, setTicker] = useState('AAPL');
  const [modelo, setModelo] = useState('XGBoost');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [indicadores, setIndicadores] = useState([]);
  const [diasPrediccion, setDiasPrediccion] = useState(1);

  useEffect(() => {
    const today = new Date();
    const lastYear = new Date(today);
    lastYear.setFullYear(today.getFullYear() - 1);
    const oneDayAgo = new Date(today);
    oneDayAgo.setDate(today.getDate() - 1);

    setFechaInicio(lastYear.toISOString().split('T')[0]);
    setFechaFin(oneDayAgo.toISOString().split('T')[0]);
  }, []);

  const agregarIndicador = (nombre) => {
    const yaExiste = indicadores.some((i) => i.nombre === nombre);
    if (yaExiste) return;

    const def = indicadoresDisponibles.find((i) => i.nombre === nombre);
    const parametrosIniciales = def.parametros.reduce((acc, param) => {
      acc[param] = '';
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
      alert('Agrega al menos un indicador.');
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
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Entrenamiento de Modelo</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">Ticker</label>
        <input
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          className="mt-1 block w-full border rounded-md p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Modelo</label>
        <select
          value={modelo}
          onChange={(e) => setModelo(e.target.value)}
          className="mt-1 block w-full border rounded-md p-2"
        >
          {modelos.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha Inicio</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha Fin</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Indicadores Técnicos</label>
        <div className="flex flex-wrap gap-2 mb-4">
          {indicadoresDisponibles.map((i) => (
            <button
              type="button"
              key={i.nombre}
              onClick={() => agregarIndicador(i.nombre)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
            >
              + {i.nombre}
            </button>
          ))}
        </div>

        {indicadores.map((i, index) => (
          <div key={index} className="bg-gray-50 border rounded p-3 mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-800">{i.nombre}</span>
              <button
                type="button"
                onClick={() => eliminarIndicador(index)}
                className="text-red-500 hover:underline text-sm"
              >
                Eliminar
              </button>
            </div>
            {Object.entries(i.parametros).map(([param, valor]) => (
              <div key={param} className="mb-2">
                <label className="block text-sm text-gray-600">{param}</label>
                <input
                  type="text"
                  value={valor}
                  onChange={(e) => actualizarParametro(index, param, e.target.value)}
                  className="mt-1 block w-full border rounded-md p-2"
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Días a predecir</label>
        <input
          type="range"
          min="1"
          max="10"
          value={diasPrediccion}
          onChange={(e) => setDiasPrediccion(e.target.value)}
          className="mt-1 w-full"
        />
        <div className="flex justify-between text-sm text-gray-600">
          <span>1 día</span>
          <span>10 días</span>
        </div>
        <div className="text-center text-sm text-gray-600 mt-2">
          <strong>{diasPrediccion} días</strong>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 px-4 rounded bg-green-600 text-white hover:bg-green-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Entrenando...' : 'Entrenar Modelo'}
      </button>
    </form>
  );
}
