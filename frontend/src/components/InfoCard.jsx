// components/InfoCard.jsx
import React from "react";

const InfoCard = ({ title, value, icon }) => (
  <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-4 flex items-center space-x-4">
    {icon && <div className="text-blue-500">{icon}</div>}
    <div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
      <div className="text-lg font-semibold text-gray-900 dark:text-white">{value}</div>
    </div>
  </div>
);

export default InfoCard;
