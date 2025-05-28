// src/hooks/useRecommendations/useRecommendations.js
import { useMemo } from 'react';

const useRecommendations = (lastRsi, hasOne, hasTwo) => {
  const getRecommendations = useMemo(() => {
    const recommendations = [];

    if (lastRsi === undefined) {
        return ["Esperando datos para generar recomendaciones..."];
    }

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
    
    if (recommendations.length === 1 && recommendations[0] === "El RSI está en una zona neutral.") {
        recommendations.push("No hay señales claras de cruces de medias en este momento.");
    }


    return recommendations.length > 0 ? recommendations : ["No hay recomendaciones específicas en este momento."];
  }, [lastRsi, hasOne, hasTwo]);

  return getRecommendations;
};

export default useRecommendations;