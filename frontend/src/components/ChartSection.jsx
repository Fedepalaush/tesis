import React from "react";
import { Barchart } from "./Barchart";
import PieChartComponent from "./PieChartComponent";

const ChartSection = ({
  freeCashFlowData,
  debtData,
  longTermDebt,
  currentDebt,
  cashAndCashEquivalents,
  totalAssets,
  ebitdaData,
}) => {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Barchart data={freeCashFlowData} type={"FreeCashFlow"} />
      <Barchart data={debtData} type={"NetDebt"} />

      <div className="flex align-middle justify-center items-center">
        <PieChartComponent
          data={[
            { label: "Deuda a Largo Plazo", value: longTermDebt[0] },
            { label: "Deuda a Corto Plazo", value: currentDebt[0] },
          ]}
          title={"Distribución de Deuda"}
        />
      </div>

      <Barchart data={cashAndCashEquivalents} type={"Activos Corrientes"} stacked={true} />
      <Barchart data={totalAssets} type={"TotalAssets"} />
      <Barchart data={ebitdaData} type={"EBITDA"} />
    </div>
  );
};

export default ChartSection;