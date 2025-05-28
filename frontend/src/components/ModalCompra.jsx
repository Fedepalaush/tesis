import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { Button, TextField, MenuItem } from "@mui/material";

const tickers = [
  "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA",
  "NVDA", "META", "JPM", "V", "JNJ"
];

function ModalCompra({
  open,
  onClose,
  onSubmit,
  tickerToBuy,
  setTickerToBuy,
  precioCompra,
  setPrecioCompra,
  cantidad,
  setCantidad
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tickerToBuy || !precioCompra || !cantidad) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    onSubmit({ ticker: tickerToBuy, precio_compra: precioCompra, cantidad });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Comprar Activo</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <TextField
            select
            fullWidth
            label="Ticker"
            value={tickerToBuy}
            onChange={(e) => setTickerToBuy(e.target.value)}
            margin="normal"
          >
            {tickers.map((ticker) => (
              <MenuItem key={ticker} value={ticker}>
                {ticker}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Precio de compra"
            type="number"
            inputProps={{ step: "0.01", min: "0" }}
            value={precioCompra}
            onChange={(e) => setPrecioCompra(e.target.value)}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Cantidad"
            type="number"
            inputProps={{ step: "1", min: "1" }}
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            margin="normal"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="secondary">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Comprar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default ModalCompra;
