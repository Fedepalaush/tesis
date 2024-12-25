import React from "react";

const TableActivo = ({ data, openCompraSetter, deleteActivo }) => {
  return (
    <table className="table-auto w-full">
      <thead>
        <tr>
          <th>Ticker</th>
          <th>Precio</th>
          <th>Cantidad</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            <td>{item.ticker}</td>
            <td>${item.precioCompra.toFixed(2)}</td>
            <td>{item.cantidad}</td>
            <td>
              <button
                className="text-blue-500 hover:underline mr-2"
                onClick={() => openCompraSetter(true, item.ticker)}
              >
                Editar
              </button>
              <button
                className="text-red-500 hover:underline"
                onClick={() => deleteActivo(item.id)}
              >
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TableActivo;
