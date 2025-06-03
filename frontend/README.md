# Frontend - Plataforma de Análisis Financiero

Una aplicación React moderna construida con Vite, enfocada en análisis financiero con características avanzadas de accesibilidad y UX.

## 🏗️ Arquitectura y Tecnologías

- **React 18** - Framework principal
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de estilos
- **Heroicons** - Librería de iconos
- **Vitest** - Framework de testing
- **Context API** - Manejo de estado global
- **Custom Hooks** - Lógica reutilizable

## 📁 Estructura de Carpetas

```
src/
├── components/           # Componentes React reutilizables
│   ├── kmeans/          # Componentes específicos de análisis K-Means
│   ├── ui/              # Componentes base de UI (Button, Input, Select)
│   └── __tests__/       # Tests de componentes
├── contexts/            # React Contexts para estado global
│   ├── AuthContext.jsx      # Autenticación
│   ├── LoadingContext.jsx   # Estado de loading global
│   ├── NotificationContext.jsx # Sistema de notificaciones
│   └── ConfigContext.jsx    # Configuración de la aplicación
├── hooks/               # Custom hooks reutilizables
├── pages/               # Componentes de páginas/rutas
├── services/            # Servicios para comunicación con APIs
├── config/              # Archivos de configuración
│   ├── api.config.js        # Configuración de API
│   ├── apiEndpoints.js      # Endpoints centralizados
│   └── theme.config.js      # Configuración de tema
├── utils/               # Utilidades y helpers
│   ├── colorContrast.js     # Utilidades de accesibilidad (contraste)
│   ├── focusManagement.js   # Utilidades de accesibilidad (foco)
│   ├── errorHandler.js      # Manejo centralizado de errores
│   └── apiInterceptors.js   # Interceptores de API
├── docs/                # Documentación técnica
├── assets/              # Recursos estáticos
├── types/               # Definiciones de tipos (TypeScript)
└── test/                # Configuración y utilidades de testing
```

## 🎯 Convenciones de Nombres

### Archivos y Carpetas
- **Componentes**: `PascalCase.jsx` (ej: `FormLogin.jsx`, `ChartComp.jsx`)
- **Hooks**: `camelCase.js` prefijo `use` (ej: `useAsyncOperation.js`)
- **Contexts**: `PascalCase.jsx` sufijo `Context` (ej: `LoadingContext.jsx`)
- **Servicios**: `camelCase.js` (ej: `apiService.js`)
- **Utilidades**: `camelCase.js` (ej: `colorContrast.js`)
- **Configuración**: `camelCase.config.js` (ej: `api.config.js`)
- **Carpetas**: `kebab-case` para múltiples palabras, `camelCase` para single word

### Variables y Funciones
- **Variables**: `camelCase`
- **Constantes**: `SCREAMING_SNAKE_CASE`
- **Funciones**: `camelCase`
- **Componentes**: `PascalCase`

### Props y Estados
- **Props**: `camelCase` con nombres descriptivos
- **Estados**: `camelCase` con prefijo del tipo de dato cuando es necesario
- **Handlers**: `handle` + `PascalCase` (ej: `handleSubmit`, `handleClick`)

## 🧩 Organización de Componentes

### Componentes Base (`/components/ui/`)
Componentes reutilizables con accesibilidad completa:
- `Button.jsx` - Botón con estados y variantes
- `Input.jsx` - Input con validación y ARIA
- `Select.jsx` - Selector accesible
- `Modal.jsx` - Modal con focus trapping
- `Toast.jsx` - Notificaciones con aria-live

### Componentes de Dominio (`/components/`)
Componentes específicos del negocio:
- Formularios: `FormLogin.jsx`, `FormRegister.jsx`, `FormBacktesting.jsx`
- Gráficos: `ChartComp.jsx`, `CandlestickChart.jsx`, `ScatterPlot.jsx`
- Navegación: `NavbarComp.jsx`, `SidebarComp.jsx`
- Tablas: `Table.jsx`, `StatsTable.jsx`

### Componentes Modulares (`/components/kmeans/`)
Componentes específicos para análisis K-Means:
- `DateRangeSelector.jsx` - Selector de rango de fechas
- `TickerSelector.jsx` - Selector de tickers
- `ParameterSelector.jsx` - Selector de parámetros
- `ExecuteButton.jsx` - Botón de ejecución
- `KMeansScatterPlot.jsx` - Visualización de resultados

## 🔗 Patrones de Estado

### Context API
```javascript
// Estructura estándar de Context
const MyContext = createContext();

export const MyProvider = ({ children }) => {
  const [state, setState] = useState(initialState);
  
  return (
    <MyContext.Provider value={{ state, setState }}>
      {children}
    </MyContext.Provider>
  );
};

export const useMyContext = () => {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error('useMyContext must be used within MyProvider');
  }
  return context;
};
```

### Custom Hooks
```javascript
// Estructura estándar de hook
export const useMyHook = (params) => {
  const [state, setState] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lógica del hook...

  return {
    data: state,
    loading,
    error,
    actions: { /* funciones */ }
  };
};
```

## ♿ Accesibilidad (WCAG 2.1 AA)

### Principios Implementados
- **Navegación por teclado** completa en todos los componentes
- **ARIA attributes** apropiados (roles, labels, descriptions)
- **Focus management** con indicadores visibles
- **Color contrast** verificado automáticamente
- **Screen reader support** con live regions
- **Skip links** para navegación rápida

### Utilidades de Accesibilidad
- `colorContrast.js`: Verificación de contraste WCAG 2.1
- `focusManagement.js`: Manejo de foco y navegación por teclado

## 🧪 Testing

### Configuración
- **Vitest** como test runner
- **@testing-library/react** para testing de componentes
- Tests organizados en carpetas `__tests__/` junto a componentes

### Comandos de Testing
```bash
# Ejecutar todos los tests
npm test

# Tests específicos de un componente
npx vitest run src/components/__tests__/ComponentName.test.jsx

# Tests en modo watch
npm run test:watch
```

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Build
npm run build        # Construye para producción
npm run preview      # Preview del build de producción

# Testing
npm test             # Ejecuta todos los tests
npm run test:watch   # Tests en modo watch

# Linting
npm run lint         # Ejecuta ESLint
```

## 📝 Configuración de Desarrollo

### Variables de Entorno
```env
# .env.local
VITE_API_BASE_URL=http://localhost:8000
VITE_ENV=development
```

### Configuración de API
Toda la configuración de API está centralizada en `/config/api.config.js`:
```javascript
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  // ... más configuraciones
};
```

## 🔄 Flujo de Desarrollo

1. **Crear feature branch** desde main
2. **Desarrollar** siguiendo las convenciones establecidas
3. **Escribir tests** para nuevos componentes
4. **Verificar accesibilidad** usando utilidades incluidas
5. **Ejecutar tests** antes del commit
6. **Documentar** cambios significativos en `mejoras.md`

---

## 📊 Estado del Proyecto

**Características Completadas:**
- ✅ Sistema de estado global reactivo
- ✅ Loading global con UX mejorada  
- ✅ Modularización completa de componentes
- ✅ Configuración centralizada de API
- ✅ Accesibilidad WCAG 2.1 AA completa
- ✅ Infrastructure de testing con Vitest

**Métricas de Calidad:**
- 📊 **Tests**: 53 tests unitarios pasando
- ♿ **Accesibilidad**: WCAG 2.1 AA compliance
- 🏗️ **Arquitectura**: Componentes modulares
- 🔧 **DX**: Configuración optimizada
