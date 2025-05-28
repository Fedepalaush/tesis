import React, { useMemo } from "react";
import { Button } from "@tremor/react";
import { Card, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@tremor/react";

export function TableUsageExample({ data, onOpenCompra, handleDeleteActivo }) {
  // Memoizar el cálculo de la suma total
  const totalSum = useMemo(() => {
    return data.reduce((acc, item) => acc + item.precioActual * item.cantidad, 0).toFixed(2);
  }, [data]);

  // Memoizar las recomendaciones
  const recomendaciones = useMemo(() => {
    return data.map(item => {
      if (item.recomendacion) {
        try {
          const { resultadoTriple, rsi } = JSON.parse(item.recomendacion); // Parsear el string JSON a objeto

          let recomendacionText = '';

          // Evaluar resultadoTriple
          if (resultadoTriple === 1) {
            recomendacionText += "El triple cruce de medias dio una señal de compra a corto plazo.";
          } else if (resultadoTriple === 2) {
            recomendacionText += "El triple cruce de medias dio una señal de venta a corto plazo.";
          }

          // Evaluar RSI
          if (rsi <= 30) {
            recomendacionText += " Está en zona de sobreventa, es buen momento para comprar.";
          } else if (rsi >= 70) {
            recomendacionText += " Está en zona de sobrecompra, es buen momento para vender.";
          }

          // Solo incluir el ticker si hay recomendaciones válidas
          if (recomendacionText) {
            return `${item.ticker}: ${recomendacionText.trim()}`;
          }
        } catch (e) {
          console.error('Error al parsear la recomendación:', e);
        }
      }
      return null;
    }).filter(recomendacion => recomendacion !== null); // Filtrar valores null
  }, [data]);

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold">Mis Inversiones</h3>
        <Button variant="secondary" color="green" size="sm" onClick={() => onOpenCompra(true, "")}>
          +
        </Button>
      </div>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Ticker</TableHeaderCell>
            <TableHeaderCell>Cantidad</TableHeaderCell>
            <TableHeaderCell>PPC</TableHeaderCell>
            <TableHeaderCell>Precio Actual</TableHeaderCell>
            <TableHeaderCell>Gan/Per %</TableHeaderCell>
            <TableHeaderCell>Gan/Per</TableHeaderCell>
            <TableHeaderCell>Total</TableHeaderCell>
            <TableHeaderCell>Acciones</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.ticker}>
              <TableCell>{item.ticker}</TableCell>
              <TableCell>{item.cantidad}</TableCell>
              <TableCell>{`$${item.precioCompra.toFixed(2)}`}</TableCell>
              <TableCell>{`$${item.precioActual.toFixed(2)}`}</TableCell>
              <TableCell style={{ color: item.ganancia_porcentaje >= 0 ? "green" : "red" }}>
                {(item.ganancia_porcentaje.toFixed(2))}%
              </TableCell>
              <TableCell style={{ color: item.ganancia.toFixed(2) >= 0 ? "green" : "red" }}>
                {`$${item.ganancia.toFixed(2)}`}
              </TableCell>
              <TableCell>{`$${(item.total_actual).toFixed(2)}`}</TableCell>
              <TableCell>
                <div className="flex gap-3">
                  <Button variant="secondary" color="green" size="sm" onClick={() => onOpenCompra(true, item.ticker)}>
                    +
                  </Button>
                  <Button variant="secondary" color="red" size="sm" onClick={() => handleDeleteActivo(item.id)}>
                    -
                  </Button>
                </div>
              </TableCell>
            </TableRow>

          ))}
          <TableRow>
            <TableCell colSpan={6}></TableCell>
            <TableCell>{`$${totalSum}`}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={8}>
              <div>
                <strong>Recomendaciones:</strong>
                <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
                  {recomendaciones.map((recomendacion, index) => (
                    <li key={index}>{recomendacion}</li>
                  ))}
                </ul>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  );
}
