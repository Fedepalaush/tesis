# 🎨 CATÁLOGO COMPLETO DE COMPONENTES TESIS - ACCESO RÁPIDO AGENTE

## 📋 **COMPONENTES PRINCIPALES DOCUMENTADOS**

### 🎨 **REACT FRONTEND COMPONENTS**

#### 1. **App**
- **Archivo**: `frontend/src/App.jsx`
- **Función**: Componente raíz con routing y providers
- **Responsabilidades**: Router setup, context providers, layout principal

#### 2. **AuthContext**
- **Archivo**: `frontend/src/contexts/AuthContext.jsx`
- **Función**: Context para autenticación JWT
- **Responsabilidades**: Login, logout, token management, user state

#### 3. **ConfigContext**
- **Archivo**: `frontend/src/contexts/ConfigContext.jsx`
- **Función**: Context para configuración global de la app
- **Responsabilidades**: Settings, environment variables, feature flags

#### 4. **NotificationContext**
- **Archivo**: `frontend/src/contexts/NotificationContext.jsx`
- **Función**: Context para sistema de notificaciones
- **Responsabilidades**: Toast notifications, alerts, error handling

#### 5. **LoadingContext**
- **Archivo**: `frontend/src/contexts/LoadingContext.jsx`
- **Función**: Context para estados de carga globales
- **Responsabilidades**: Loading spinners, overlay states, async operations

#### 6. **TickersContext**
- **Archivo**: `frontend/src/TickersContext.jsx`
- **Función**: Context para datos de tickers/símbolos financieros
- **Responsabilidades**: Ticker data, real-time updates, symbol management

#### 7. **ExecutionContext**
- **Archivo**: `frontend/src/ExecutionContext.jsx`
- **Función**: Context para ejecución de operaciones/algoritmos
- **Responsabilidades**: Algorithm execution, results, ML model inference

---

### 📊 **CHART & VISUALIZATION COMPONENTS**

#### 8. **ChartComponents** (Estimados)
- **Ubicación**: `frontend/src/components/charts/`
- **Tecnologías**: Chart.js, Recharts, Plotly.js
- **Función**: Componentes de visualización de datos
- **Responsabilidades**: Gráficos financieros, métricas, dashboards

#### 9. **TremorCharts** (Estimados)
- **Tecnología**: @tremor/react
- **Función**: Componentes de dashboard empresarial
- **Responsabilidades**: KPIs, métricas, visualizaciones avanzadas

---

### 🔧 **UTILITY & SHARED COMPONENTS**

#### 10. **API Client**
- **Archivo**: `frontend/src/api.js`
- **Función**: Cliente HTTP para comunicación con backend
- **Responsabilidades**: Axios setup, interceptors, error handling

#### 11. **Constants**
- **Archivo**: `frontend/src/constants.js`
- **Función**: Constantes globales de la aplicación
- **Responsabilidades**: URLs, configuración, enums

#### 12. **Utils**
- **Ubicación**: `frontend/src/utils/`
- **Función**: Funciones utilitarias reutilizables
- **Responsabilidades**: Formateo, validaciones, helpers

#### 13. **Hooks**
- **Ubicación**: `frontend/src/hooks/`
- **Función**: Custom hooks React
- **Responsabilidades**: Lógica reutilizable, estado compartido

---

### 📱 **PAGE COMPONENTS**

#### 14. **Pages** (Estimados)
- **Ubicación**: `frontend/src/pages/`
- **Función**: Componentes de página/vista principal
- **Responsabilidades**: Layout de páginas, routing, composición de componentes

---

### ⚙️ **BACKEND DJANGO COMPONENTS**

#### 15. **Core Settings**
- **Archivo**: `backend/core/settings.py`
- **Función**: Configuración principal Django
- **Responsabilidades**: Database, middleware, apps, security

#### 16. **API Models** (Estimados)
- **Ubicación**: `backend/api/models.py`
- **Función**: Modelos de datos Django ORM
- **Responsabilidades**: Schema de base de datos, relaciones, validaciones

#### 17. **API Serializers** (Estimados)
- **Ubicación**: `backend/api/serializers.py`
- **Función**: Serializers DRF para APIs
- **Responsabilidades**: Conversión JSON, validación, transformación datos

#### 18. **API Views** (Estimados)
- **Ubicación**: `backend/api/views.py`
- **Función**: ViewSets y vistas DRF
- **Responsabilidades**: Endpoints REST, lógica de negocio, autenticación

#### 19. **GraphQL Schema** (Estimados)
- **Ubicación**: `backend/api/schema.py`
- **Función**: Schema GraphQL con Graphene
- **Responsabilidades**: Queries, mutations, types, resolvers

---

### 🤖 **MACHINE LEARNING COMPONENTS**

#### 20. **ML Models** (Estimados)
- **Ubicación**: `backend/ml/models/`
- **Función**: Modelos TensorFlow/Scikit-learn
- **Responsabilidades**: Training, inference, model serving

#### 21. **ML Services** (Estimados)
- **Ubicación**: `backend/ml/services/`
- **Función**: Servicios de ML para integración
- **Responsabilidades**: Preprocessing, prediction, model management

#### 22. **ML Pipelines** (Estimados)
- **Ubicación**: `backend/ml/pipelines/`
- **Función**: Pipelines de datos y entrenamiento
- **Responsabilidades**: ETL, feature engineering, model training

---

### 🐳 **INFRASTRUCTURE COMPONENTS**

#### 23. **Docker Frontend**
- **Archivo**: `frontend/Dockerfile`
- **Función**: Container para aplicación React
- **Responsabilidades**: Build optimizado, Nginx serving

#### 24. **Docker Backend**
- **Archivo**: `backend/Dockerfile`
- **Función**: Container para aplicación Django
- **Responsabilidades**: Python environment, dependencies, entrypoint

#### 25. **Docker Compose**
- **Archivo**: `docker-compose.yml`
- **Función**: Orquestación multi-container
- **Responsabilidades**: Services networking, volumes, environment

#### 26. **Nginx Config**
- **Archivo**: `frontend/nginx.conf`
- **Función**: Configuración web server
- **Responsabilidades**: Routing, static files, proxy configuration

#### 27. **Database Init**
- **Ubicación**: `postgres-init/`
- **Función**: Scripts inicialización TimescaleDB
- **Responsabilidades**: Schema setup, initial data, extensions

---

### 🧪 **TESTING COMPONENTS**

#### 28. **Frontend Tests**
- **Ubicación**: `frontend/src/test/`
- **Función**: Tests Vitest + accessibility
- **Responsabilidades**: Unit tests, integration tests, a11y tests

#### 29. **Backend Tests**
- **Ubicación**: `backend/tests/`
- **Función**: Tests Django
- **Responsabilidades**: Model tests, API tests, ML tests

---

## 🎯 **COMPONENTES POR CATEGORÍA FUNCIONAL**

### 🎨 **UI/UX COMPONENTS**
- **Material-UI**: Componentes base con theme personalizado
- **TailwindCSS**: Utility classes para styling rápido
- **Headless UI**: Componentes accesibles sin styling
- **Hero Icons**: Iconografía consistente

### 📊 **DATA VISUALIZATION**
- **Chart.js**: Gráficos canvas interactivos
- **Recharts**: Componentes React nativos para charts
- **Plotly.js**: Visualizaciones científicas avanzadas
- **Tremor**: Dashboard components empresariales

### 🔗 **API & STATE MANAGEMENT**
- **Apollo Client**: GraphQL client con cache
- **Axios**: HTTP client para REST APIs
- **React Context**: State management global
- **JWT**: Autenticación token-based

### 🤖 **MACHINE LEARNING STACK**
- **TensorFlow 2.12**: Deep learning models
- **Scikit-learn**: Classic ML algorithms
- **NumPy/Pandas**: Data manipulation
- **XGBoost**: Gradient boosting

### 🗃️ **DATABASE & PERSISTENCE**
- **TimescaleDB**: Time-series data optimized
- **PostgreSQL**: Relational database
- **Django ORM**: Database abstraction layer

---

## ⚡ **ACCESO RÁPIDO PARA AGENTE**

### 🔍 **BUSCAR COMPONENTE POR FUNCIÓN**
- **Autenticación**: `AuthContext`, JWT middleware
- **Visualización**: Chart.js, Recharts, Plotly components
- **Estado Global**: Contexts (Auth, Config, Loading, Notification)
- **API Communication**: Apollo Client, Axios setup
- **ML Integration**: TensorFlow models, prediction services
- **Routing**: React Router setup
- **Styling**: TailwindCSS + Material-UI patterns

### 📂 **BUSCAR POR UBICACIÓN**
- **Frontend React**: `frontend/src/components/`, `frontend/src/pages/`
- **Backend Django**: `backend/api/`, `backend/core/`
- **ML Models**: `backend/ml/`
- **Contexts**: `frontend/src/contexts/`
- **Tests**: `frontend/src/test/`, `backend/tests/`
- **Docker**: Root level Dockerfiles, docker-compose.yml

### 🎨 **BUSCAR POR TECNOLOGÍA**
- **React**: JSX components, hooks, contexts
- **Django**: Models, views, serializers, GraphQL
- **TensorFlow**: ML models, training scripts
- **Docker**: Containers, networking, volumes
- **TimescaleDB**: Time-series queries, hypertables

---

## 📝 **NOTAS PARA AGENTE**

1. **SIEMPRE** usar TypeScript en componentes React nuevos
2. **SIEMPRE** seguir patrones TailwindCSS para styling
3. **SIEMPRE** documentar APIs GraphQL y REST
4. **SIEMPRE** validar integración ML funciona end-to-end
5. **REUTILIZAR** componentes existentes antes de crear nuevos
6. **DOCKERIZAR** cambios para consistencia entre entornos
7. **DOCUMENTAR** nuevos componentes siguiendo este catálogo

---

## 🔄 **FLUJO DE DESARROLLO RECOMENDADO**

### **Para nuevos componentes React:**
1. Crear en `frontend/src/components/{categoria}/`
2. Usar TypeScript + TailwindCSS
3. Implementar accessibility (a11y)
4. Crear tests en `frontend/src/test/`
5. Documentar en este catálogo

### **Para nuevos endpoints Django:**
1. Definir modelo en `api/models.py`
2. Crear serializer en `api/serializers.py`
3. Implementar view en `api/views.py`
4. Agregar a GraphQL schema si necesario
5. Crear tests en `backend/tests/`

### **Para integración ML:**
1. Entrenar modelo en `backend/ml/`
2. Crear servicio de inferencia
3. Exponer vía API (REST/GraphQL)
4. Integrar en frontend React
5. Validar performance end-to-end

---

**📅 Última actualización**: 25 de junio de 2025  
**🎯 Estado**: Catálogo adaptado para proyecto tesis full-stack  
**📋 Total componentes documentados**: 29+ componentes principales  
**🔄 Actualización**: Automática con cada nuevo componente creado  
**🚀 Stack**: React + Django + TimescaleDB + TensorFlow + Docker
