// src/AnalisisActivo.jsx
import React from "react";
import BaseLayout from "../components/BaseLayout"; // Asumo que BaseLayout es .js o .jsx, ajusta si es necesario
import TickerFormControls from "../components/TickerFormControls";
import SummaryCardsDisplay from "../components/SummaryCardsDisplay";
import StockChartDisplay from "../components/StockChartDisplay";
import IndicatorGaugesDisplay from "../components/IndicatorGaugesDisplay";
import RecommendationsBox from "../components/RecommendationsBox";
import SemaforoSignalsDisplay from "../components/SemaforoSignalsDisplay";
//impotar todas las constantes
import { tickersBM } from "../constants"; // Asegúrate de que esta ruta sea correcta
// Los hooks usualmente se mantienen como .js, pero ajusta la importación si también los renombraste a .jsx
import useTickerForm from '../hooks/useTickerForm';
import useStockData from '../hooks/useStockData';
import useFinancialIndicators from '../hooks/useFinancialIndicators';
import useRecommendations from '../hooks/useRecommendations';
import { useTickers } from '../TickersContext';

const AnalisisActivo = () => {
  const activeItem = "AnalisisActivo";
  const { tickers } = useTickers();

  const {    
    ticker,
    startDate,
    endDate,
    handleTickerChange,
    handleStartDateChange,
    handleEndDateChange,
  } = useTickerForm();

  const { data: stockData, loading, error: fetchError, setError: setFetchError } = useStockData(ticker, startDate, endDate);

  const {
    dates, open, high, low, close,
    lastRsi, estadoEma,
    diferenciaEma, tendencia219,
    diferenciaHoy, diferenciaSemana,
    emaRapidaSemaforo, emaMediaSemaforo, emaLentaSemaforo,
    hasOne, hasTwo
  } = useFinancialIndicators(stockData);

  const recommendations = useRecommendations(lastRsi, hasOne, hasTwo);
  
  React.useEffect(() => {
    if (fetchError) {
        setFetchError(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker, startDate, endDate]);

  const showDataSections = !loading && !fetchError && stockData && stockData.length > 0;

  return (
    <BaseLayout activeItem={activeItem}>
      <div className="flex flex-col p-4">
        <TickerFormControls
          tickers={tickers}
          ticker={ticker}
          startDate={startDate}
          endDate={endDate}
          handleTickerChange={handleTickerChange}
          handleStartDateChange={handleStartDateChange}
          handleEndDateChange={handleEndDateChange}
        />

        {fetchError && (
          <div className="p-4 bg-red-600 text-white rounded w-full md:w-3/4 lg:w-2/4 mx-auto my-4 text-center">
            <h2 className="text-lg font-bold">Error</h2>
            <p>{fetchError}</p>
          </div>
        )}

        {loading && (
          <div className="p-4 text-white text-center w-full my-4">
            <p className="text-xl">Cargando datos...</p>
          </div>
        )}

        {showDataSections && (
          <>
            <SummaryCardsDisplay
              diferenciaEma={diferenciaEma}
              tendencia219={tendencia219}
              diferenciaHoy={diferenciaHoy}
              diferenciaSemana={diferenciaSemana}
            />
            <StockChartDisplay
              dates={dates}
              open={open}
              high={high}
              low={low}
              close={close}
              ticker={ticker}
            />
            <IndicatorGaugesDisplay lastRsi={lastRsi} estadoEma={estadoEma} />
            <RecommendationsBox recommendations={recommendations} />
            <SemaforoSignalsDisplay
              emaRapidaSemaforo={emaRapidaSemaforo}
              emaMediaSemaforo={emaMediaSemaforo}
              emaLentaSemaforo={emaLentaSemaforo}
            />
          </>
        )}
        
        {!loading && !fetchError && (!stockData || stockData.length === 0) && (
          <div className="p-4 text-white text-center w-full my-8">
            <p className="text-xl">No hay datos disponibles para mostrar. Por favor, ajusta el ticker o el rango de fechas.</p>
          </div>
        )}
      </div>
    </BaseLayout>
  );
};

export default AnalisisActivo;