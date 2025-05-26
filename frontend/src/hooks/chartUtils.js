// utils/chartUtils.js
export const coloresClusters = [
  "rgba(255, 99, 132, 0.5)",
  "rgba(54, 162, 235, 0.5)",
  "rgba(75, 192, 192, 0.5)",
  "rgba(153, 102, 255, 0.5)",
  "rgba(255, 159, 64, 0.5)",
];

export function formatParamLabel(param) {
  return param
    .replace("_", " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}
