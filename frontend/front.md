# Gestión reactiva de tickers en frontend

## Contexto
Antes, los tickers se almacenaban en una variable global mediante `setTickersBM` en `constants.js`, lo que no permitía reactividad en los componentes de React.

## Solución aplicada (30/05/2025)
- Se creó un contexto React (`TickersContext.jsx`) para manejar los tickers de forma global y reactiva.
- En `main.jsx`, la app se monta dentro de `<TickersProvider initialTickers={...}>`, lo que permite que cualquier componente acceda y actualice los tickers usando el hook `useTickers()`.
- Ahora, cualquier cambio en los tickers se refleja automáticamente en los componentes que los usan.

## Ejemplo de uso en un componente
```jsx
import { useTickers } from './TickersContext';

function MiComponente() {
  const { tickers, setTickers } = useTickers();
  // ...
}
```

## Beneficio
- Los datos de tickers son reactivos y compartidos en toda la app.
- Se elimina la dependencia de variables globales no reactivas.

## 30/05/2025 - Uso de tickers reactivos en AnalisisActivo.jsx

Ahora el componente `AnalisisActivo.jsx` obtiene los tickers desde el contexto global (`useTickers`), no desde la constante `tickersBM`.

**Ventajas:**
- Los tickers se actualizan automáticamente en la UI si cambian en el backend o en la app.
- Se elimina la dependencia de variables globales no reactivas.

**Patrón aplicado:**
```jsx
import { useTickers } from '../TickersContext';
// ...
const { tickers } = useTickers();
// ...
<TickerFormControls tickers={tickers} ... />
```

Esto asegura que el selector de tickers siempre muestre la información más actualizada y reactiva.
