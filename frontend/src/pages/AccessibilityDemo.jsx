import React, { useState, useRef, useEffect } from 'react';
import { 
  EyeIcon, 
  SpeakerWaveIcon, 
  KeyIcon,
  AdjustmentsHorizontalIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

// Import our accessible components
import FormLogin from '../components/FormLogin';
import FormRegister from '../components/FormRegister';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import Semaforo from '../components/Semaforo';
import { TableUsageExample } from '../components/Table';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import LoadingState from '../components/ui/LoadingState';

// Import utilities
import { checkColorCompliance, getContrastRatio } from '../utils/colorContrast';
import { focusFirstElement, trapFocus, createSkipLinks } from '../utils/focusManagement';

const AccessibilityDemo = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [semaforoValue, setSemaforoValue] = useState(1);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState('base');
  const [reduceMotion, setReduceMotion] = useState(false);
  
  const mainContentRef = useRef(null);
  const skipLinkRef = useRef(null);

  // Sample table data
  const tableData = [
    { id: 1, nombre: 'AAPL', precio: '$150.00', cambio: '+2.5%', accesible: 'Sí' },
    { id: 2, nombre: 'GOOGL', precio: '$2,800.00', cambio: '-1.2%', accesible: 'Sí' },
    { id: 3, nombre: 'MSFT', precio: '$380.00', cambio: '+0.8%', accesible: 'Sí' },
  ];

  const tableColumns = [
    { key: 'nombre', label: 'Símbolo', sortable: true },
    { key: 'precio', label: 'Precio', sortable: true },
    { key: 'cambio', label: 'Cambio', sortable: true },
    { key: 'accesible', label: 'Accesible', sortable: false },
  ];

  useEffect(() => {
    // Create skip links on component mount
    const skipLinksContainer = createSkipLinks([
      { target: 'main-content', text: 'Ir al contenido principal' },
      { target: 'navigation', text: 'Ir a la navegación' }
    ]);
    skipLinkRef.current = skipLinksContainer;

    return () => {
      // Cleanup skip link on unmount
      if (skipLinkRef.current && skipLinkRef.current.parentNode) {
        skipLinkRef.current.parentNode.removeChild(skipLinkRef.current);
      }
    };
  }, []);

  // Apply user preferences
  useEffect(() => {
    const root = document.documentElement;
    
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    root.classList.remove('text-sm', 'text-base', 'text-lg', 'text-xl');
    root.classList.add(`text-${fontSize}`);

    if (reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }, [highContrast, fontSize, reduceMotion]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const accessibilityFeatures = [
    {
      title: 'Navegación por Teclado',
      icon: KeyIcon,
      description: 'Todos los elementos interactivos son accesibles usando solo el teclado (Tab, Enter, Espacio, flechas).',
      features: [
        'Orden lógico de tabulación',
        'Indicadores de foco visibles',
        'Atajos de teclado estándar',
        'Navegación con teclas de flecha en componentes complejos'
      ]
    },
    {
      title: 'Tecnologías Asistivas',
      icon: SpeakerWaveIcon,
      description: 'Compatibilidad completa con lectores de pantalla y otras tecnologías asistivas.',
      features: [
        'Etiquetas ARIA descriptivas',
        'Regiones vivas para contenido dinámico',
        'Roles semánticos apropiados',
        'Descripciones contextuales'
      ]
    },
    {
      title: 'Contraste Visual',
      icon: EyeIcon,
      description: 'Cumplimiento con las pautas WCAG 2.1 AA para contraste de color.',
      features: [
        'Contraste mínimo 4.5:1 para texto normal',
        'Contraste mínimo 3:1 para texto grande',
        'Modo de alto contraste disponible',
        'Indicadores no dependientes solo del color'
      ]
    },
    {
      title: 'Personalización',
      icon: AdjustmentsHorizontalIcon,
      description: 'Opciones de personalización para diferentes necesidades de accesibilidad.',
      features: [
        'Ajuste de tamaño de fuente',
        'Modo de alto contraste',
        'Reducción de animaciones',
        'Configuración persistente'
      ]
    }
  ];

  const demoSections = [
    { id: 'overview', title: 'Visión General', icon: InformationCircleIcon },
    { id: 'forms', title: 'Formularios', icon: CheckCircleIcon },
    { id: 'navigation', title: 'Navegación', icon: KeyIcon },
    { id: 'feedback', title: 'Retroalimentación', icon: SpeakerWaveIcon },
    { id: 'data', title: 'Visualización de Datos', icon: EyeIcon },
    { id: 'settings', title: 'Configuración', icon: AdjustmentsHorizontalIcon }
  ];

  return (
    <div className={`min-h-screen bg-gray-900 text-white ${reduceMotion ? 'reduce-motion' : ''}`}>
      {/* Skip to main content link */}
      <a 
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50"
        onFocus={() => focusFirstElement(mainContentRef.current)}
      >
        Saltar al contenido principal
      </a>

      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold">
              Demo de Accesibilidad - Aplicación Financiera
            </h1>
            <nav role="navigation" aria-label="Navegación de demostración">
              <ul className="flex space-x-4" role="menubar">
                {demoSections.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <li key={section.id} role="none">
                      <button
                        role="menuitem"
                        onClick={() => setActiveSection(section.id)}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeSection === section.id
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                        }`}
                        aria-current={activeSection === section.id ? 'page' : undefined}
                      >
                        <IconComponent className="h-4 w-4 mr-2" aria-hidden="true" />
                        {section.title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <main 
        id="main-content" 
        ref={mainContentRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        role="main"
        aria-label="Contenido principal de la demostración"
      >
        {/* Overview Section */}
        {activeSection === 'overview' && (
          <section aria-labelledby="overview-title">
            <h2 id="overview-title" className="text-3xl font-bold mb-8">
              Características de Accesibilidad Implementadas
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {accessibilityFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <article 
                    key={index}
                    className="bg-gray-800 rounded-lg p-6 border border-gray-700"
                    role="article"
                  >
                    <div className="flex items-center mb-4">
                      <IconComponent className="h-8 w-8 text-blue-400 mr-3" aria-hidden="true" />
                      <h3 className="text-xl font-semibold">{feature.title}</h3>
                    </div>
                    <p className="text-gray-300 mb-4">{feature.description}</p>
                    <ul className="space-y-2" role="list">
                      {feature.features.map((item, i) => (
                        <li key={i} className="flex items-center text-sm text-gray-400">
                          <CheckCircleIcon className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>

            <div className="bg-blue-900 rounded-lg p-6 border border-blue-700">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <InformationCircleIcon className="h-6 w-6 mr-2" aria-hidden="true" />
                Cómo Probar la Accesibilidad
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Navegación por Teclado</h4>
                  <p className="text-blue-200">
                    Use Tab para navegar, Enter/Espacio para activar, y las teclas de flecha en menús.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Lector de Pantalla</h4>
                  <p className="text-blue-200">
                    Active NVDA, JAWS, o VoiceOver para escuchar las descripciones de contenido.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Zoom y Contraste</h4>
                  <p className="text-blue-200">
                    Pruebe con zoom hasta 200% y active el modo de alto contraste.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Forms Section */}
        {activeSection === 'forms' && (
          <section aria-labelledby="forms-title">
            <h2 id="forms-title" className="text-3xl font-bold mb-8">
              Formularios Accesibles
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Formulario de Inicio de Sesión</h3>
                <FormLogin />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4">Formulario de Registro</h3>
                <FormRegister />
              </div>
            </div>

            <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4">Características de Accesibilidad en Formularios</h3>
              <ul className="space-y-2 text-gray-300" role="list">
                <li className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" aria-hidden="true" />
                  Etiquetas descriptivas asociadas con cada campo
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" aria-hidden="true" />
                  Mensajes de error claros y específicos
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" aria-hidden="true" />
                  Grupos de campos relacionados con fieldset/legend
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" aria-hidden="true" />
                  Instrucciones y ayuda contextual
                </li>
              </ul>
            </div>
          </section>
        )}

        {/* Navigation Section */}
        {activeSection === 'navigation' && (
          <section aria-labelledby="navigation-title">
            <h2 id="navigation-title" className="text-3xl font-bold mb-8">
              Navegación y Interacción
            </h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Modal Accesible</h3>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  Abrir Modal de Demostración
                </button>
                
                {showModal && (
                  <Modal 
                    isOpen={showModal} 
                    onClose={() => setShowModal(false)}
                    title="Modal Accesible"
                  >
                    <div>
                      <p className="mb-4">
                        Este modal implementa todas las mejores prácticas de accesibilidad:
                      </p>
                      <ul className="space-y-2 text-sm" role="list">
                        <li>• Trampas de foco (focus trapping)</li>
                        <li>• Escape con tecla ESC</li>
                        <li>• Etiquetas ARIA apropiadas</li>
                        <li>• Fondo modal descriptivo</li>
                      </ul>
                    </div>
                  </Modal>
                )}
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Indicadores de Estado (Semáforo)</h3>
                <div className="flex items-center gap-8">
                  <Semaforo 
                    value={semaforoValue} 
                    label="Indicador de Tendencia" 
                  />
                  <div>
                    <p className="mb-4">Cambie el estado del indicador:</p>
                    <div className="space-x-2">
                      <button
                        onClick={() => setSemaforoValue(-1)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm focus:ring-2 focus:ring-red-300"
                        aria-pressed={semaforoValue === -1}
                      >
                        Bajista
                      </button>
                      <button
                        onClick={() => setSemaforoValue(0)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm focus:ring-2 focus:ring-yellow-300"
                        aria-pressed={semaforoValue === 0}
                      >
                        Neutral
                      </button>
                      <button
                        onClick={() => setSemaforoValue(1)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm focus:ring-2 focus:ring-green-300"
                        aria-pressed={semaforoValue === 1}
                      >
                        Alcista
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Feedback Section */}
        {activeSection === 'feedback' && (
          <section aria-labelledby="feedback-title">
            <h2 id="feedback-title" className="text-3xl font-bold mb-8">
              Retroalimentación y Notificaciones
            </h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Notificaciones Toast</h3>
                <div className="space-x-2 mb-4">
                  <button
                    onClick={() => showToast('Operación completada exitosamente')}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded focus:ring-2 focus:ring-green-300"
                  >
                    Mostrar Éxito
                  </button>
                  <button
                    onClick={() => showToast('Advertencia: Verifique los datos ingresados')}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded focus:ring-2 focus:ring-yellow-300"
                  >
                    Mostrar Advertencia
                  </button>
                  <button
                    onClick={() => showToast('Error: No se pudo completar la operación')}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded focus:ring-2 focus:ring-red-300"
                  >
                    Mostrar Error
                  </button>
                </div>
                
                {toastMessage && (
                  <Toast 
                    message={toastMessage} 
                    onClose={() => setToastMessage('')} 
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Estado de Carga</h3>
                  <LoadingState message="Cargando datos financieros..." />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Estado Vacío</h3>
                  <EmptyState 
                    title="Sin datos disponibles"
                    description="No hay información financiera para mostrar en este momento."
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Estado de Error</h3>
                  <ErrorState 
                    title="Error de conexión"
                    description="No se pudo cargar la información. Intente nuevamente."
                    onRetry={() => showToast('Reintentando conexión...')}
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Data Visualization Section */}
        {activeSection === 'data' && (
          <section aria-labelledby="data-title">
            <h2 id="data-title" className="text-3xl font-bold mb-8">
              Visualización de Datos Accesible
            </h2>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Tabla de Datos Financieros</h3>
              <TableUsageExample 
                data={tableData}
              />
            </div>

            <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4">Características de las Tablas Accesibles</h3>
              <ul className="space-y-2 text-gray-300" role="list">
                <li className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" aria-hidden="true" />
                  Encabezados de tabla apropiados con scope
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" aria-hidden="true" />
                  Caption descriptivo del contenido
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" aria-hidden="true" />
                  Navegación por teclado entre celdas
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" aria-hidden="true" />
                  Ordenamiento accesible por columnas
                </li>
              </ul>
            </div>
          </section>
        )}

        {/* Settings Section */}
        {activeSection === 'settings' && (
          <section aria-labelledby="settings-title">
            <h2 id="settings-title" className="text-3xl font-bold mb-8">
              Configuración de Accesibilidad
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-semibold mb-4">Ajustes Visuales</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tamaño de Fuente
                    </label>
                    <select
                      value={fontSize}
                      onChange={(e) => setFontSize(e.target.value)}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-blue-300"
                    >
                      <option value="sm">Pequeño</option>
                      <option value="base">Normal</option>
                      <option value="lg">Grande</option>
                      <option value="xl">Extra Grande</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={highContrast}
                        onChange={(e) => setHighContrast(e.target.checked)}
                        className="mr-2 focus:ring-2 focus:ring-blue-300"
                      />
                      <span>Modo de Alto Contraste</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={reduceMotion}
                        onChange={(e) => setReduceMotion(e.target.checked)}
                        className="mr-2 focus:ring-2 focus:ring-blue-300"
                      />
                      <span>Reducir Animaciones</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-semibold mb-4">Verificación de Contraste</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-600 text-white rounded">
                    <p>Texto en fondo azul</p>
                    <p className="text-sm">
                      Contraste: {getContrastRatio('#3B82F6', '#FFFFFF').toFixed(2)}:1
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gray-600 text-white rounded">
                    <p>Texto en fondo gris</p>
                    <p className="text-sm">
                      Contraste: {getContrastRatio('#4B5563', '#FFFFFF').toFixed(2)}:1
                    </p>
                  </div>
                  
                  <div className="p-4 bg-red-600 text-white rounded">
                    <p>Texto en fondo rojo</p>
                    <p className="text-sm">
                      Contraste: {getContrastRatio('#DC2626', '#FFFFFF').toFixed(2)}:1
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-gray-400">
                  <p>WCAG 2.1 AA requiere un contraste mínimo de 4.5:1 para texto normal.</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400">
            <p>Demo de Accesibilidad - Aplicación Financiera</p>
            <p className="mt-2">
              Implementada siguiendo las pautas WCAG 2.1 AA y mejores prácticas de accesibilidad web.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AccessibilityDemo;
