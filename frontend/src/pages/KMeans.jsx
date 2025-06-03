import React from "react";
import BaseLayout from "../components/BaseLayout";
import { useTickers } from "../TickersContext";

// Modular components
import DateRangeSelector from "../components/kmeans/DateRangeSelector";
import TickerSelector from "../components/kmeans/TickerSelector";
import ParameterSelector from "../components/kmeans/ParameterSelector";
import ExecuteButton from "../components/kmeans/ExecuteButton";
import KMeansScatterPlot from "../components/kmeans/KMeansScatterPlot";

// Custom hook
import { useKMeansAnalysis } from "../hooks/useKMeansAnalysis";

/**
 * KMeans clustering analysis page
 * Modularized into smaller, reusable components
 */
const KMeans = () => {
  const { tickers } = useTickers();
  
  const {
    // State
    selectedTickers,
    selectedParameters,
    startDate,
    endDate,
    clusterData,
    notification,
    isLoading,
    
    // Computed
    isDisabled,
    
    // Actions
    handleTickerChange,
    handleRemoveTicker,
    handleAddAllTickers,
    handleRemoveAllTickers,
    handleParameterChange,
    handleStartDateChange,
    handleEndDateChange,
    executeKMeansAnalysis
  } = useKMeansAnalysis();

  return (
    <BaseLayout>
      <div className="bg-black text-white min-h-screen p-6 space-y-8">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Análisis de Agrupamiento K-Means
          </h1>
          <p className="text-gray-400">
            Agrupa activos financieros basado en características de rendimiento
          </p>
        </div>

        {/* Date Range Selection */}
        <DateRangeSelector
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
        />

        {/* Ticker Selection */}
        <TickerSelector
          tickers={tickers}
          selectedTickers={selectedTickers}
          onTickerChange={handleTickerChange}
          onRemoveTicker={handleRemoveTicker}
          onAddAllTickers={() => handleAddAllTickers(tickers)}
          onRemoveAllTickers={handleRemoveAllTickers}
          notification={notification}
        />

        {/* Parameter Selection */}
        <ParameterSelector
          selectedParameters={selectedParameters}
          onParameterChange={handleParameterChange}
        />

        {/* Execute Button */}
        <ExecuteButton
          onExecute={executeKMeansAnalysis}
          isLoading={isLoading}
          isDisabled={isDisabled}
          selectedTickersCount={selectedTickers.length}
          selectedParametersCount={selectedParameters.length}
        />

        {/* Results Visualization */}
        <KMeansScatterPlot
          clusterData={clusterData}
          selectedParameters={selectedParameters}
        />
      </div>
    </BaseLayout>
  );
};

export default KMeans;