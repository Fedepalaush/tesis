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
  { nombre: 'BollingerBands', parametros: ['periodo', 'desviacion'] },
  { nombre: 'MACD', parametros: [] },
];

export default function FormularioEntrenamiento({ onSubmit, loading }) {
  const [ticker, setTicker] = useState('AAPL');
  const [modelo, setModelo] = useState('XGBoost');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [indicadores, setIndicadores] = useState([]);

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
    const indicador = indicadoresDisponibles.find(i => i.nombre === nombre);
    if (!indicadores.find(i => i.nombre === nombre)) {
      setIndicadores([...indicadores, {
        nombre,
        parametros: indicador.parametros.reduce((acc, p) => ({ ...acc, [p]: '' }), {})
      }]);
    }
  };

  const actualizarParametro = (index, parametro, valor) => {
    const nuevos = [...indicadores];
    nuevos[index].parametros[parametro] = valor;
    setIndicadores(nuevos);
  };

  const eliminarIndicador = (index) => {
    setIndicadores(indicadores.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (indicadores.length === 0) {
      alert('Agrega al menos un indicador.');
      return;
    }
    onSubmit({
      ticker,
      modelo,
      start_date: fechaInicio,
      end_date: fechaFin,
      indicadores,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Entrenamiento de Modelo</h2>

      {/* Ticker */}
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

      {/* Modelo */}
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

      {/* Fechas */}
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

      {/* Indicadores */}
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
          <div key={index} className="bg-gray-50 border rounded p-3 mb-3 space-y-2">
            <div className="flex justify-between items-center">
              <strong>{i.nombre}</strong>
              <button
                type="button"
                onClick={() => eliminarIndicador(index)}
                className="text-red-600 text-sm"
              >
                Eliminar
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(i.parametros).map(([param, valor]) => (
                <input
                  key={param}
                  type="number"
                  placeholder={param}
                  value={valor}
                  onChange={(e) => actualizarParametro(index, param, e.target.value)}
                  className="border p-2 rounded w-full"
                  required
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Entrenando...' : 'Entrenar Modelo'}
        </button>
      </div>
    </form>
  );
}
