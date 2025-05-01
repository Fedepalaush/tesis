import React from "react";

const MatrizConfusion = ({ matriz }) => {
  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-white mb-2">
        Matriz de Confusión
      </h2>
      <table className="min-w-full border text-center text-white">
        <thead className="bg-gray-100 dark:bg-gray-800 text-white">
          <tr>
            <th className="border p-2"> </th>
            <th className="border p-2">Predicho: Bajará (0)</th>
            <th className="border p-2">Predicho: Subirá (1)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-2 font-medium text-white">
              Real: Bajó (0)
            </td>
            <td className="border p-2">{matriz[0][0]}</td>
            <td className="border p-2">{matriz[0][1]}</td>
          </tr>
          <tr>
            <td className="border p-2 font-medium text-white">
              Real: Subió (1)
            </td>
            <td className="border p-2">{matriz[1][0]}</td>
            <td className="border p-2">{matriz[1][1]}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default MatrizConfusion;
