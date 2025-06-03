/**
 * Accessibility Demonstration Component
 * 
 * This component demonstrates the accessibility improvements made to the application
 * and provides tools for testing color contrast and accessibility features.
 */

import React, { useState, useEffect } from 'react';
import { checkAppColorCompliance, getContrastRatio, checkColorCompliance } from '../utils/colorContrast';
import { announceToScreenReader } from '../utils/focusManagement';

const AccessibilityDemo = () => {
  const [colorResults, setColorResults] = useState({});
  const [customForeground, setCustomForeground] = useState('#000000');
  const [customBackground, setCustomBackground] = useState('#FFFFFF');
  const [customResult, setCustomResult] = useState(null);

  useEffect(() => {
    // Check all app color combinations on component mount
    const results = checkAppColorCompliance();
    setColorResults(results);
  }, []);

  const handleCustomColorCheck = () => {
    const result = checkColorCompliance(customForeground, customBackground);
    setCustomResult(result);
    
    const message = `Contraste verificado: ${result.ratio}:1, ${result.passAA ? 'Cumple' : 'No cumple'} estándares AA`;
    announceToScreenReader(message, 'polite');
  };

  const ComplianceIndicator = ({ level, ratio }) => {
    const getStatusColor = () => {
      if (level === 'AAA') return 'text-green-600 bg-green-50';
      if (level === 'AA') return 'text-blue-600 bg-blue-50';
      return 'text-red-600 bg-red-50';
    };

    return (
      <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor()}`}>
        {level} ({ratio}:1)
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Demostración de Accesibilidad
        </h1>
        <p className="text-gray-600">
          Herramientas para verificar y demostrar las mejoras de accesibilidad implementadas.
        </p>
      </header>

      {/* Color Contrast Testing */}
      <section className="mb-8" aria-labelledby="color-section">
        <h2 id="color-section" className="text-2xl font-semibold text-gray-800 mb-4">
          Análisis de Contraste de Colores
        </h2>
        
        {/* Custom Color Tester */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium mb-3">Probador de Colores Personalizado</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label htmlFor="foreground-color" className="block text-sm font-medium text-gray-700 mb-1">
                Color de Texto
              </label>
              <input
                id="foreground-color"
                type="color"
                value={customForeground}
                onChange={(e) => setCustomForeground(e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md"
                aria-describedby="foreground-help"
              />
              <p id="foreground-help" className="text-xs text-gray-500 mt-1">
                Color del texto o elemento frontal
              </p>
            </div>
            
            <div>
              <label htmlFor="background-color" className="block text-sm font-medium text-gray-700 mb-1">
                Color de Fondo
              </label>
              <input
                id="background-color"
                type="color"
                value={customBackground}
                onChange={(e) => setCustomBackground(e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md"
                aria-describedby="background-help"
              />
              <p id="background-help" className="text-xs text-gray-500 mt-1">
                Color del fondo o elemento trasero
              </p>
            </div>
            
            <button
              onClick={handleCustomColorCheck}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-describedby="check-help"
            >
              Verificar Contraste
            </button>
            <p id="check-help" className="sr-only">
              Analiza el contraste entre los colores seleccionados según estándares WCAG
            </p>
          </div>
          
          {/* Custom Result Display */}
          {customResult && (
            <div 
              className="mt-4 p-3 border rounded-md"
              style={{ 
                backgroundColor: customBackground, 
                color: customForeground,
                borderColor: customResult.passAA ? '#10B981' : '#EF4444'
              }}
              role="region"
              aria-label="Resultado del análisis de contraste"
            >
              <div className="flex justify-between items-center">
                <span>Texto de ejemplo con estos colores</span>
                <ComplianceIndicator level={customResult.level} ratio={customResult.ratio} />
              </div>
            </div>
          )}
        </div>

        {/* App Color Combinations */}
        <div>
          <h3 className="text-lg font-medium mb-3">Combinaciones de Colores de la Aplicación</h3>
          <div className="space-y-3">
            {Object.entries(colorResults).map(([key, result]) => (
              <div key={key} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <p className="text-sm text-gray-600">{result.usage}</p>
                  </div>
                  <div className="flex gap-2">
                    <ComplianceIndicator 
                      level={result.compliance.level} 
                      ratio={result.compliance.ratio} 
                    />
                    <span className="text-xs text-gray-500">
                      (Texto grande: {result.largeTextCompliance.level})
                    </span>
                  </div>
                </div>
                
                <div 
                  className="p-3 rounded"
                  style={{ 
                    backgroundColor: result.background, 
                    color: result.foreground 
                  }}
                >
                  <span>Ejemplo: {result.usage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accessibility Features Summary */}
      <section aria-labelledby="features-section">
        <h2 id="features-section" className="text-2xl font-semibold text-gray-800 mb-4">
          Características de Accesibilidad Implementadas
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Navegación por Teclado</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Navegación con Tab/Shift+Tab</li>
              <li>• Navegación con flechas en menús</li>
              <li>• Focus trapping en modales</li>
              <li>• Skip links para navegación rápida</li>
            </ul>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Screen Readers</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Etiquetas ARIA descriptivas</li>
              <li>• Regiones live para notificaciones</li>
              <li>• Estructura semántica (headings, landmarks)</li>
              <li>• Texto alternativo para imágenes</li>
            </ul>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">Formularios</h3>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Labels asociados correctamente</li>
              <li>• Mensajes de error accesibles</li>
              <li>• Fieldsets para agrupación</li>
              <li>• Autocompletado mejorado</li>
            </ul>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-900 mb-2">Diseño Visual</h3>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• Contraste de colores verificado</li>
              <li>• Focus visible mejorado</li>
              <li>• Indicadores de estado claros</li>
              <li>• Responsivo y escalable</li>
            </ul>
          </div>
        </div>
      </section>

      <footer className="mt-8 p-4 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Nota:</strong> Estas mejoras siguen las pautas WCAG 2.1 niveles AA y AAA para garantizar 
          que la aplicación sea accesible para usuarios con diversas necesidades y tecnologías asistivas.
        </p>
      </footer>
    </div>
  );
};

export default AccessibilityDemo;
