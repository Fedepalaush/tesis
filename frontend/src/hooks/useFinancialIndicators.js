// src/hooks/useFinancialIndicators/useFinancialIndicators.js
import { useState, useEffect } from 'react';

const useFinancialIndicators = (data) => {
  const [indicators, setIndicators] = useState({
    dates: [],
    open: [],
    high: [],
    low: [],
    close: [],
    rsi: [],
    ema200: [],
    ema9: [],
    ema21: [],
    tendencia219: undefined,
    estadoEma: undefined,
    emaRapidaSemaforo: undefined,
    emaMediaSemaforo: undefined,
    emaLentaSemaforo: undefined,
    tripleEma: undefined,
    hasOne: undefined,
    hasTwo: undefined,
    lastRsi: undefined,
    lastEma200: undefined, // Renombrado de lastEma para claridad
    lastClose: undefined,
    lastEma9: undefined,
    lastEma21: undefined,
    diferenciaHoy: undefined,
    diferenciaSemana: undefined,
    diferenciaEma: undefined,
  });

  useEffect(() => {
    if (data && data.length > 0) {
      const dates = data.map((item) => item.date);
      const open = data.map((item) => item.open_price);
      const high = data.map((item) => item.high_price);
      const low = data.map((item) => item.low_price);
      const close = data.map((item) => item.close_price);
      const rsi = data.map((item) => item.rsi);
      const ema200 = data.map((item) => item.ema_200);
      const ema9 = data.map((item) => item.ema_9);
      const ema21 = data.map((item) => item.ema_21);
      const rawTendencia219 = data.map((item) => item.tendencia219); // Renombrado para evitar colisión
      const rawEstadoEma = data.map((item) => item.scoreEma);
      const rawEmaRapidaSemaforo = data.map((item) => item.emaRapidaSemaforo);
      const rawEmaMediaSemaforo = data.map((item) => item.emaMediaSemaforo);
      const rawEmaLentaSemaforo = data.map((item) => item.emaLentaSemaforo);
      const rawTripleEma = data.map((item) => item.tripleEma);

      const lastRsi = rsi.slice(-1)[0];
      const lastEma200 = ema200.slice(-1)[0];
      const lastClose = close.slice(-1)[0];
      const lastEma9 = parseFloat(ema9.slice(-1)[0]);
      const lastEma21 = parseFloat(ema21.slice(-1)[0]);
      const lastTendencia219 = parseFloat(rawTendencia219.slice(-1)[0]);
      const lastEstadoEma = parseFloat(rawEstadoEma.slice(-1)[0]);
      const lastEmaRapidaSemaforo = parseFloat(rawEmaRapidaSemaforo.slice(-1)[0]);
      const lastEmaMediaSemaforo = parseFloat(rawEmaMediaSemaforo.slice(-1)[0]);
      const lastEmaLentaSemaforo = parseFloat(rawEmaLentaSemaforo.slice(-1)[0]);
      const lastTripleEmaArray = rawTripleEma.slice(-1)[0]; // Es un array

      const closeYesterday = close.length > 1 ? close.slice(-2)[0] : undefined;
      const diferenciaHoy = closeYesterday !== undefined ? ((lastClose - closeYesterday) / closeYesterday) * 100 : undefined;

      const closeLastWeek = close.length >= 5 ? close.slice(-5)[0] : undefined;
      const diferenciaSemana = closeLastWeek !== undefined ? ((lastClose - closeLastWeek) / closeLastWeek) * 100 : undefined;

      const diferenciaEma = (lastEma9 && lastEma21) ? ((lastEma21 - lastEma9) / lastEma9) * -100 : undefined; // Multiplicado por -100

      const hasOne = Array.isArray(lastTripleEmaArray) ? lastTripleEmaArray.some((item) => item.Cruce === 1) : undefined;
      const hasTwo = Array.isArray(lastTripleEmaArray) ? lastTripleEmaArray.some((item) => item.Cruce === 2) : undefined;

      setIndicators({
        dates, open, high, low, close, rsi, ema200, ema9, ema21,
        tendencia219: lastTendencia219,
        estadoEma: lastEstadoEma,
        emaRapidaSemaforo: lastEmaRapidaSemaforo,
        emaMediaSemaforo: lastEmaMediaSemaforo,
        emaLentaSemaforo: lastEmaLentaSemaforo,
        tripleEma: rawTripleEma, // Guardamos el array completo si es necesario para el plot, o el último si solo se usa para hasOne/hasTwo
        hasOne,
        hasTwo,
        lastRsi,
        lastEma200,
        lastClose,
        lastEma9,
        lastEma21,
        diferenciaHoy,
        diferenciaSemana,
        diferenciaEma,
      });
    } else {
      // Reset indicators if data is empty
      setIndicators({
        dates: [], open: [], high: [], low: [], close: [], rsi: [], ema200: [], ema9: [], ema21: [],
        tendencia219: undefined, estadoEma: undefined, emaRapidaSemaforo: undefined, emaMediaSemaforo: undefined,
        emaLentaSemaforo: undefined, tripleEma: undefined, hasOne: undefined, hasTwo: undefined,
        lastRsi: undefined, lastEma200: undefined, lastClose: undefined, lastEma9: undefined, lastEma21: undefined,
        diferenciaHoy: undefined, diferenciaSemana: undefined, diferenciaEma: undefined,
      });
    }
  }, [data]);

  return indicators;
};

export default useFinancialIndicators;