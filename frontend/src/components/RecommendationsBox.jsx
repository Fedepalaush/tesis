// src/components/RecommendationsBox.jsx
import React from 'react';

const RecommendationsBox = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }
  return (
    <div className="mt-8 p-4 bg-gray-800 text-white rounded w-full md:w-3/4 mx-auto mb-4">
      <h2 className="text-xl font-bold mb-2">Recomendaciones 💡</h2>
      {recommendations.map((recommendation, index) => (
        <p key={index} className="mb-1">
          {recommendation}
        </p>
      ))}
    </div>
  );
};

export default RecommendationsBox;