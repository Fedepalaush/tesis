import React, { useMemo } from "react";
import { Button } from "@tremor/react";
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@tremor/react";

export function TableUsageExample({ data = [], onOpenCompra, handleDeleteActivo }) {
  // Asegurarse que data es un array
  const safeData = Array.isArray(data) ? data : [];

  // Calcular suma total
  const totalSum = useMemo(() => {
    return safeData.reduce((acc, item) => acc + item.precioActual * item.cantidad, 0).toFixed(2);
  }, [safeData]);

  // Generar recomendaciones
  const recomendaciones = useMemo(() => {
    return safeData
      .map(item => {
        if (item.recomendacion) {
          try {
            const { resultadoTriple, rsi } = JSON.parse(item.recomendacion);
            let recomendacionText = "";

            if (resultadoTriple === 1) {
              recomendacionText += "El triple cruce de medias dio una señal de compra a corto plazo.";
            } else if (resultadoTriple === 2) {
              recomendacionText += "El triple cruce de medias dio una señal de venta a corto plazo.";
            }

            if (rsi <= 30) {
              recomendacionText += " Está en zona de sobreventa, es buen momento para comprar.";
            } else if (rsi >= 70) {
              recomendacionText += " Está en zona de sobrecompra, es buen momento para vender.";
            }

            if (recomendacionText) {
              return `${item.ticker}: ${recomendacionText.trim()}`;
            }
          } catch (e) {
            console.error("Error al parsear la recomendación:", e);
          }
        }
        return null;
      })
      .filter(recomendacion => recomendacion !== null);
  }, [safeData]);

return (
  <Card>
    <div className="flex items-center justify-between mb-3">
      <h3 
        id="investments-table-title"
        className="text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold"
      >
        Mis Inversiones
      </h3>
      <Button 
        variant="secondary" 
        color="green" 
        size="sm" 
        onClick={() => onOpenCompra(true, "")}
        aria-label="Agregar nueva inversión"
      >
        +
      </Button>
    </div>
    <Table 
      aria-labelledby="investments-table-title"
      aria-describedby={recomendaciones.length > 0 ? "investments-recommendations" : undefined}
    >
      <TableHead>
        <TableRow>
          <TableHeaderCell scope="col">Ticker</TableHeaderCell>
          <TableHeaderCell scope="col">Cantidad</TableHeaderCell>
          <TableHeaderCell scope="col">PPC</TableHeaderCell>
          <TableHeaderCell scope="col">Precio Actual</TableHeaderCell>
          <TableHeaderCell scope="col">Gan/Per %</TableHeaderCell>
          <TableHeaderCell scope="col">Gan/Per</TableHeaderCell>
          <TableHeaderCell scope="col">Total</TableHeaderCell>
          <TableHeaderCell scope="col">Acciones</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {safeData.map((item) => (
          <TableRow key={item.ticker}>
            <TableCell>
              <span className="font-medium">{item.ticker}</span>
            </TableCell>
            <TableCell>{item.cantidad}</TableCell>
            <TableCell>{`$${item.precioCompra.toFixed(2)}`}</TableCell>
            <TableCell>{`$${item.precioActual.toFixed(2)}`}</TableCell>
            <TableCell style={{ color: item.ganancia_porcentaje >= 0 ? "green" : "red" }}>
              <span 
                aria-label={`${item.ganancia_porcentaje >= 0 ? 'Ganancia' : 'Pérdida'} del ${item.ganancia_porcentaje.toFixed(2)} por ciento`}
              >
                {(item.ganancia_porcentaje.toFixed(2))}%
              </span>
            </TableCell>
            <TableCell style={{ color: item.ganancia.toFixed(2) >= 0 ? "green" : "red" }}>
              <span 
                aria-label={`${item.ganancia.toFixed(2) >= 0 ? 'Ganancia' : 'Pérdida'} de ${item.ganancia.toFixed(2)} dólares`}
              >
                {`$${item.ganancia.toFixed(2)}`}
              </span>
            </TableCell>
            <TableCell>{`$${(item.total_actual).toFixed(2)}`}</TableCell>
            <TableCell>
              <div className="flex gap-3" role="group" aria-label={`Acciones para ${item.ticker}`}>
                <Button 
                  variant="secondary" 
                  color="green" 
                  size="sm" 
                  onClick={() => onOpenCompra(true, item.ticker)}
                  aria-label={`Comprar más acciones de ${item.ticker}`}
                >
                  +
                </Button>
                <Button 
                  variant="secondary" 
                  color="red" 
                  size="sm" 
                  onClick={() => handleDeleteActivo(item.id)}
                  aria-label={`Eliminar inversión en ${item.ticker}`}
                >
                  -
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}

        <TableRow>
          <TableCell colSpan={6} aria-hidden="true"></TableCell>
          <TableCell>
            <strong aria-label={`Total de todas las inversiones: ${totalSum} dólares`}>
              {`$${totalSum}`}
            </strong>
          </TableCell>
          <TableCell aria-hidden="true"></TableCell>
        </TableRow>

        {Array.isArray(recomendaciones) && recomendaciones.length > 0 && (
          <TableRow>
            <TableCell colSpan={8}>
              <div id="investments-recommendations" role="region" aria-labelledby="recommendations-title">
                <strong id="recommendations-title">Recomendaciones:</strong>
                <ul style={{ listStyleType: "disc", paddingLeft: "20px" }} role="list">
                  {recomendaciones.map((recomendacion, index) => (
                    <li key={index} role="listitem">{recomendacion}</li>
                  ))}
                </ul>
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </Card>
);

}
