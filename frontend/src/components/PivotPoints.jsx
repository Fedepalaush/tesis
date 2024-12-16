// components/PivotPoints.js
const PivotPoints = ({ data, historical, limites }) => {
    const LIMIT_DISTANCE = limites;
    const startDate = new Date(historical[0].date);
    const endDate = new Date(historical[historical.length - 1].date);
  
    const filteredPivotLines = data.filter((entry) => {
      const pivotDate = new Date(entry.time);
      return pivotDate >= startDate && pivotDate <= endDate;
    });
  
    const drawnLevels = [];
    const pivotLines = filteredPivotLines.reduce((acc, entry) => {
      const isFarEnough = drawnLevels.every(level => Math.abs(entry.pointpos - level) > LIMIT_DISTANCE);
  
      if (isFarEnough) {
        drawnLevels.push(entry.pointpos);
        acc.push({
          x: [historical[0].date, historical[historical.length - 1].date],
          y: [entry.pointpos, entry.pointpos],
          mode: "lines",
          line: { color: "MediumPurple", width: 2, dash: "dash" },
          name: `Pivot Point: ${entry.type}`,
        });
      }
  
      return acc;
    }, []);
  
    return pivotLines;
  };
  
  export default PivotPoints;
  