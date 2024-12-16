// utils.js

/**
 * Devuelve recomendaciones basadas en RSI y cruces de medias.
 */
export const getRecommendations = (lastRsi, hasOne, hasTwo) => {
    const recommendations = [];
  
    if (lastRsi > 70) {
      recommendations.push("El activo está sobrecomprado. Podría ser un buen momento para vender.");
    } else if (lastRsi < 30) {
      recommendations.push("El activo está sobrevendido. Podría ser un buen momento para comprar.");
    } else {
      recommendations.push("El RSI está en una zona neutral.");
    }
  
    if (hasOne) {
      recommendations.push("Hubo un cruce de medias que indica un posible movimiento al alza a corto plazo.");
    }
  
    if (hasTwo) {
      recommendations.push("Hubo un cruce de medias que indica un posible movimiento a la baja a corto plazo.");
    }
  
    return recommendations;
  };
  
  /**
   * Calcula la diferencia porcentual entre dos valores.
   */
  export const calculatePercentageDifference = (current, previous) => {
    if (!current || !previous) return undefined;
    return ((current - previous) / previous) * 100;
  };
  

  export const generateDateRange = (startDate, endDate) => {
    let dates = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
  
    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
  
    return dates;
  };
  
  export const formatDate = (dateString) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  export const formatPrice = (price) => {
    return price.toFixed(2);
  };