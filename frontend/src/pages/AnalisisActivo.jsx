import React from "react";
import BaseLayout from "../components/BaseLayout";
import TickerFormControls from "../components/TickerFormControls";
import SummaryCardsDisplay from "../components/SummaryCardsDisplay";
import StockChartDisplay from "../components/StockChartDisplay";
import IndicatorGaugesDisplay from "../components/IndicatorGaugesDisplay";
import RecommendationsBox from "../components/RecommendationsBox";
import SemaforoSignalsDisplay from "../components/SemaforoSignalsDisplay";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";

// Hooks
import useTickerForm from '../hooks/useTickerForm';
import useStockData from '../hooks/useStockData';
import useFinancialIndicators from '../hooks/useFinancialIndicators';
import useRecommendations from '../hooks/useRecommendations';
import { useAsyncOperation } from '../hooks/useAsyncOperation';
import { useTickers } from '../TickersContext';
import { useNotification } from '../contexts/NotificationContext';

const AnalisisActivo = () => {
  const activeItem = "AnalisisActivo";
  const { tickers } = useTickers();
  const { showError } = useNotification();

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
      showError(`Error al cargar datos: ${fetchError}`);
      setFetchError(null);
    }
  }, [fetchError, showError, setFetchError]);

  const handleRetry = () => {
    window.location.reload();
  };

  const showDataSections = !loading && !fetchError && stockData && stockData.length > 0;
  const showEmptyState = !loading && !fetchError && (!stockData || stockData.length === 0);

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
          <ErrorState 
            error={fetchError}
            title="Error al cargar datos"
            onRetry={handleRetry}
            showRetry={true}
          />
        )}

        {loading && <LoadingState message="Cargando análisis del activo..." />}

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
        
        {showEmptyState && (
          <EmptyState 
            title="No hay datos de análisis disponibles"
            description="No se encontraron datos para el ticker y rango de fechas seleccionados."
          />
        )}
      </div>
    </BaseLayout>
  );
};

export default AnalisisActivo;