import React from "react";
import { BarChart } from "@tremor/react";



const dataFormatter = (number) =>
  Intl.NumberFormat('us').format(number).toString();


export const Barchart = ({ data, type }) => (
  <div>
  
    <BarChart
      data={data}
      index="name"
      categories={[type]}
      colors={["blue"]}
      valueFormatter={dataFormatter}
      yAxisWidth={48}
      onValueChange={(v) => console.log("Changed value:", v)}
    />
  </div>
);
