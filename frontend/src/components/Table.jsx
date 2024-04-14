import { RiFlag2Line } from "@remixicon/react";
import { Badge, Card, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Button } from "@tremor/react";


export function TableUsageExample({ data, openCompraSetter, deleteActivo  }) {
  const totalSum = data.reduce((acc, item) => acc + (item.precioCompra * item.cantidad), 0).toFixed(2);

  console.log(data)
  return (
    <Card>
      <div className="flex items-center gap-3">
        <h3 className="text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold">Mis Inversiones</h3>
        <Button variant="secondary" color='green' size='sm' onClick={() => openCompraSetter(true)} >+</Button>
      </div>
      <Table className="mt-5">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Ticker</TableHeaderCell>
            <TableHeaderCell>Cantidad</TableHeaderCell>
            <TableHeaderCell>PPC</TableHeaderCell>
            <TableHeaderCell>Precio Actual</TableHeaderCell>
            <TableHeaderCell>Gan/Per %</TableHeaderCell>
            <TableHeaderCell>Gan/Per</TableHeaderCell>
            <TableHeaderCell>Total</TableHeaderCell>
            <TableHeaderCell >Acciones</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item) => (
            
            <TableRow key={item.ticker}>
              <TableCell>{item.ticker}</TableCell>
              <TableCell>{item.cantidad}</TableCell>
              <TableCell>{`$${item.precioCompra.toFixed(2)}`}</TableCell>
              <TableCell>{item.precioActual}</TableCell>
              <TableCell>{item.ganancia_pct}</TableCell>
              <TableCell>{item.ganancia}</TableCell>
              <TableCell>${(item.precioCompra * item.cantidad).toFixed(2)}</TableCell>
              <TableCell>
                <div className="flex gap-3">
                <Button variant="secondary" color='green' size='sm' onClick={() => openCompraSetter(true)} >+</Button>
                <Button variant="secondary" color='red' size='sm'  onClick={() => deleteActivo(item.id)}>-</Button>
                </div>
             </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={6}></TableCell>
            <TableCell>${totalSum}</TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  );
}
