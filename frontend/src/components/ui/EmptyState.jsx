import React from 'react';
import { Search, TrendingUp } from 'lucide-react';

const EmptyState = ({ 
  title = "No hay datos disponibles", 
  description = "No se encontraron elementos para mostrar.",
  icon: Icon = Search,
  actionText,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-white text-center">
      <div className="p-4 bg-gray-700/30 rounded-full mb-4">
        <Icon className="h-12 w-12 text-gray-400" />
      </div>
      
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 max-w-md">{description}</p>
      
      {onAction && actionText && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          {actionText}
        </button>
      )}
      
      <div className="mt-6 text-sm text-gray-500">
        <p>Sugerencias:</p>
        <ul className="mt-2 space-y-1">
          <li>• Verifica que el ticker sea válido</li>
          <li>• Asegúrate de que el rango de fechas sea suficiente</li>
          <li>• Intenta con un período más amplio</li>
        </ul>
      </div>
    </div>
  );
};

export default EmptyState;
