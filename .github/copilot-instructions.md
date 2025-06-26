# 🚀 TESIS PROJECT - AGENTE COPILOT INSTRUCTIONS

## 🚨 PRIORIDAD CRÍTICA: DESARROLLO FULL-STACK EFICIENTE

**OBJETIVO PRINCIPAL**: Desarrollo ágil y mantenible de aplicación de tesis full-stack

- ✅ **PRIORIDAD 1** - Mantener arquitectura limpia frontend + backend + ML
- ✅ **PRIORIDAD 2** - Asegurar consistencia en APIs GraphQL/REST
- ✅ **PRIORIDAD 3** - Optimizar performance y experience de usuario
- ✅ **PRIORIDAD 4** - Validar integración de modelos ML en tiempo real

### ✅ PERMITIDO (Desarrollo Ágil)

Nuevas funcionalidades, optimizaciones, corrección de bugs, integración ML, mejoras UI/UX

### 🚫 PROHIBIDO (Hasta versión estable)

Cambios de arquitectura mayores, migración de stack, refactor masivo sin tests

---

## 🎨 REGLA OBLIGATORIA: STACK CONSISTENCY

**TODA modificación debe seguir:**

- ✅ **USAR React + TypeScript** para componentes frontend
- ✅ **USAR TailwindCSS** para estilos consistentes
- ✅ **USAR Django + DRF** para APIs backend
- ✅ **USAR GraphQL** para queries complejas
- ✅ **USAR Docker** para desarrollo y deployment
- ✅ **MANTENER TimescaleDB** para datos temporales

## 🧩 CATÁLOGO DE COMPONENTES OBLIGATORIO

**ANTES de crear/modificar cualquier componente:**

1. **📚 CONSULTAR OBLIGATORIO** → `docs/components-catalog-tesis.md`
2. **🔍 BUSCAR COMPONENTE** → Verificar si existe componente similar
3. **♻️ REUTILIZAR** → Usar componentes existentes cuando sea posible
4. **🆕 SI ES NUEVO** → Crear siguiendo patrones React/TypeScript
5. **📝 ACTUALIZAR CATÁLOGO** → Documentar nuevo componente inmediatamente

**PROTOCOLO DE ACTUALIZACIÓN:**
- ✅ **Crear componente** → Agregar entrada al catálogo
- ✅ **Modificar componente** → Actualizar documentación existente
- ✅ **Eliminar componente** → Remover del catálogo
- ✅ **Cambiar props** → Actualizar ejemplos de uso

## 🚫 PROHIBICIÓN ABSOLUTA: INCONSISTENCIAS DE ARQUITECTURA

**NUNCA hacer sin consultar patrones:**

- ❌ **PROHIBIDO**: Mezclar estilos CSS inline con TailwindCSS
- ❌ **PROHIBIDO**: Crear endpoints REST sin documentación
- ❌ **PROHIBIDO**: Modificar schema GraphQL sin versionado
- ✅ **CORRECTO**: Seguir patrones establecidos en `.github/patterns/`

**PROTOCOLO OBLIGATORIO:**
1. **BUSCAR PRIMERO** en patrones existentes
2. **SI NO EXISTE** → Crear nuevo patrón documentado
3. **EVITAR DUPLICACIÓN** → Reutilizar patrones similares
4. **MANTENER CONSISTENCIA** → Un concepto = un patrón

---

## 📋 COMANDOS PRINCIPALES

### 🎯 CONTROL DE PROYECTO

- `${T:X}` - **PRINCIPAL** - Ejecutar X tareas en lote (obligatorio para iniciar)
- `${STATUS}` - Estado actual del proyecto full-stack
- `${PROJECT_STATUS}` - Porcentaje completado frontend + backend
- `${COMPLETE_FEATURE:nombre}` - Completar feature full-stack (PRIORIDAD MÁXIMA)

### 🔧 CORRECCIONES CRÍTICAS

- `${FIX}` - Corregir archivo activo en Copilot
- `${FIX_PROBLEM:descripción}` - Corregir con contexto completo de aplicación
- `${FIX_FRONTEND}` - Verificar y corregir errores frontend React
- `${FIX_BACKEND}` - Verificar y corregir errores backend Django
- `${FIX_DOCKER}` - Corregir problemas de containerización
- `${FIX_API}` - Corregir problemas GraphQL/REST API

### ⚡ PERFORMANCE & OPTIMIZATION

- `${OPTIMIZE_PERFORMANCE}` - Optimizar frontend + backend
- `${FIX_SLOW_QUERIES}` - Optimizar queries GraphQL/Django ORM
- `${VALIDATE_ML_INTEGRATION}` - Validar modelos ML funcionan correctamente

### 🔧 REFACTORING

- `${REFACTOR}` - Refactorizar archivo activo manteniendo funcionalidad idéntica

### 🆕 FUNCIONALIDADES

- `${NEW:descripción}` - **ÚNICO** comando para nuevas funcionalidades full-stack

### 📚 DOCUMENTACIÓN

- `${EXPLAIN:descripción}` - Explicar flujo de código frontend/backend
- `${EXPLAIN_API:endpoint}` - Explicar endpoint específico GraphQL/REST

---

## 🛠️ COMANDOS ESPECÍFICOS DEL STACK

### 🎨 FRONTEND (React + Vite)

- `${FRONTEND_DEV}` - Iniciar servidor de desarrollo frontend
- `${FRONTEND_BUILD}` - Build de producción frontend
- `${FRONTEND_TEST}` - Ejecutar tests frontend (Vitest)
- `${FRONTEND_LINT}` - Linting y formateo (ESLint + Prettier)

### ⚙️ BACKEND (Django + ML)

- `${BACKEND_DEV}` - Iniciar servidor Django development
- `${BACKEND_MIGRATE}` - Ejecutar migraciones Django
- `${BACKEND_TEST}` - Ejecutar tests backend
- `${ML_TRAIN}` - Ejecutar entrenamiento de modelos ML
- `${ML_VALIDATE}` - Validar modelos ML existentes

### 🐳 DOCKER & INFRASTRUCTURE

- `${DOCKER_UP}` - Levantar todos los servicios (docker-compose up)
- `${DOCKER_DOWN}` - Bajar todos los servicios
- `${DOCKER_REBUILD}` - Reconstruir imágenes Docker
- `${DB_RESET}` - Reset completo TimescaleDB
- `${LOGS}` - Ver logs de todos los servicios

### 🔗 API & INTEGRATION

- `${GRAPHQL_SCHEMA}` - Generar/actualizar schema GraphQL
- `${API_DOCS}` - Generar documentación API (DRF Spectacular)
- `${TEST_INTEGRATION}` - Tests de integración frontend-backend

---

## 🚫 COMANDOS DESHABILITADOS TEMPORALMENTE

**HASTA COMPLETAR FUNCIONALIDADES CORE:**

### 📝 OPTIMIZACIÓN AVANZADA (POSTERIOR)

- ~~`${OPTIMIZE_ML_MODELS}`~~ - POSTERIOR: Optimización avanzada ML
- ~~`${IMPLEMENT_CACHING}`~~ - POSTERIOR: Implementar Redis caching
- ~~`${SETUP_MONITORING}`~~ - POSTERIOR: Monitoring y alertas

### 🚀 DEPLOYMENT AVANZADO (POSTERIOR)

- ~~`${SETUP_CI_CD}`~~ - POSTERIOR: Configurar CI/CD pipeline
- ~~`${SETUP_PRODUCTION}`~~ - POSTERIOR: Configuración producción
- ~~`${PERFORMANCE_AUDIT}`~~ - POSTERIOR: Auditoría de performance completa

**📋 REGLA**: Estos comandos se activan SOLO cuando las funcionalidades core estén completas

### 🛠️ DEVTOOLS

- `${ANALYZE}` - Análisis completo del código
- `${DIAGNOSE}` - Diagnóstico de problemas
- `${INFO}` - Información del proyecto

---

## 🔄 FLUJO OBLIGATORIO

### Para comando `${T:X}`:

1. Leer `dev.md` → identificar X tareas `[ ]`
2. Cambiar a `[🔧]` en plan → documentar progreso
3. Cambiar a `[✅]` → ejecutar commit → archivar progreso

### Para comando `${FIX}`:

1. Consultar patrones del área → documentar cambios
2. Corregir archivo activo → validar → actualizar estados

### Para comando `${NEW:descripción}`:

1. **ANÁLISIS FULL-STACK**: Evaluar impacto frontend + backend
2. **CONSULTAR PATRONES**: Revisar `.github/patterns/` aplicables
3. **PLANIFICAR**: Frontend components + Backend endpoints + DB changes
4. **IMPLEMENTAR**: Crear feature completa end-to-end
5. **VALIDAR**: Tests frontend + backend + integración
6. **DOCUMENTAR**: Actualizar catálogos y patrones

### Para comando `${EXPLAIN:descripción}`:

1. **ANÁLISIS**: Buscar archivos frontend + backend relacionados
2. **MAPEO**: Identificar componentes React, endpoints Django, modelos ML
3. **FLUJO**: Documentar flujo de datos completo frontend → backend → ML
4. **DIAGRAMAS**: Crear representación visual del flujo
5. **PATRONES**: Referenciar patrones aplicados
6. **ARCHIVO**: Crear archivo `docs/{nombre}.md`

---

## 🚫 PROHIBICIONES CRÍTICAS

- ❌ NO trabajar sin comando `${T:X}` en proyectos complejos
- ❌ NO modificar Docker configs sin documentar
- ❌ NO cambiar schema GraphQL sin versionado
- ❌ NO commits manuales (usar sistema documentado)
- ❌ NO nuevas funcionalidades sin `${NEW:descripción}`
- ❌ NO modificar modelos ML sin validación

## ✅ OBLIGACIONES CRÍTICAS

- ✅ SIEMPRE `${ANALYZE}` antes de modificar
- ✅ SIEMPRE verificar Docker funciona después de cambios
- ✅ SIEMPRE documentar en **archivo individual** `docs/{feature}.md`
- ✅ SIEMPRE ejecutar tests frontend + backend al completar
- ✅ SIEMPRE **solo estado** en progreso (no detalles)
- ✅ SIEMPRE consultar patrones en `.github/patterns/` según stack
- ✅ SIEMPRE **usar TypeScript** en componentes React nuevos
- ✅ SIEMPRE **consultar `docs/components-catalog-tesis.md`** antes de crear componentes
- ✅ SIEMPRE **actualizar catálogo** cuando se modifique/cree componente

---

## 📁 ARCHIVOS DE REFERENCIA

**Patrones de desarrollo**: Ver archivos `.github/patterns/` para procedimientos por tecnología
**Estados de tareas**: `dev.md` (maestro) + progreso documentado
**Detalles de features**: Archivos individuales en `docs/{feature}.md`
**Componentes**: `docs/components-catalog-tesis.md` (catálogo completo)

## 📋 PROTOCOLO DOCUMENTACIÓN MODULAR

### ✅ **OBLIGATORIO - Documentación por Feature**

1. **📝 Para toda feature**: Crear archivo individual `docs/{nombre-feature}.md`
2. **📋 En dev.md**: SOLO listar features con referencias
3. **🚫 PROHIBIDO**: Escribir detalles directamente en `dev.md`
4. **✅ PERMITIDO**: Cambiar estado de feature: `[ ]` → `[🔧]` → `[✅]`

### 📁 **Estructura de Archivo de Feature**

```markdown
# NOMBRE-FEATURE

## INFORMACIÓN DE LA FEATURE
**Stack**: Frontend/Backend/Full-Stack
**Iniciado**: 2025-06-25
**Estado**: [🔧 En Progreso] | [✅ COMPLETADO]

## OBJETIVO
Descripción clara de la funcionalidad

## COMPONENTES AFECTADOS
### Frontend
- Componentes React
- Páginas
- Contextos

### Backend
- Endpoints Django
- Modelos
- Queries GraphQL

## PROGRESO DETALLADO
- [ ] Backend API
- [🔧] Frontend UI
- [✅] Integración

## TESTS
- [ ] Tests unitarios frontend
- [ ] Tests unitarios backend
- [ ] Tests integración

## ESTADO FINAL
Resultado y próximos pasos
```

---

## 🎨 PATRONES DE CÓDIGO

**OBLIGATORIO**: Consultar patrones específicos en `.github/patterns/`:

- **`tesis-react-patterns.md`** - Componentes React + TypeScript, hooks, contexts
- **`tesis-django-patterns.md`** - Django models, serializers, views, GraphQL
- **`tesis-api-patterns.md`** - GraphQL schemas, REST endpoints, autenticación
- **`tesis-docker-patterns.md`** - Docker, docker-compose, networking, volúmenes
- **`tesis-ml-patterns.md`** - TensorFlow integration, model serving, data pipeline
- **`tesis-testing-patterns.md`** - Tests frontend (Vitest), backend (Django), integración
- **`tesis-styling-patterns.md`** - TailwindCSS, componentes Material-UI, responsive

**📋 CUÁNDO USAR PATRONES:**

- 🎨 Frontend → `tesis-react-patterns.md` + `tesis-styling-patterns.md`
- ⚙️ Backend → `tesis-django-patterns.md` + `tesis-api-patterns.md`
- 🤖 ML → `tesis-ml-patterns.md`
- 🐳 Docker → `tesis-docker-patterns.md`
- 🧪 Testing → `tesis-testing-patterns.md`

---

**Criterio Simple**: ¿Es mejora/nueva feature? → ✅ Permitido | ¿Rompe arquitectura? → 🚫 Requiere `${NEW:descripción}`

## 📚 IMPLEMENTACIÓN DE COMANDOS

### Comando ${FRONTEND_DEV}

**Ejemplo de uso:**
```bash
cd frontend && npm run dev
```

**Resultado esperado:** Servidor Vite corriendo en puerto 5173

### Comando ${DOCKER_UP}

**Ejemplo de uso:**
```bash
docker-compose up -d
```

**Resultado esperado:** 
- Frontend en puerto 80
- Backend en puerto 8000  
- TimescaleDB en puerto 5432

### Comando `${NEW:feature-name}`

**Ejemplo de uso:**
```
${NEW:user-dashboard}           - Crea dashboard completo frontend + backend
${NEW:ml-prediction-api}        - Crea endpoint ML + frontend integration
${NEW:data-visualization}       - Crea componente charts + API data
```

**Respuesta esperada:**
- **🎯 ANÁLISIS FULL-STACK**: Frontend + Backend + ML components
- **📋 PLANIFICACIÓN**: Tasks específicas por stack layer
- **⚙️ IMPLEMENTACIÓN**: Código end-to-end
- **✅ VALIDACIÓN**: Tests completos
- **📖 DOCUMENTACIÓN**: Feature documentada completamente

---

**📅 Última actualización**: 25 de junio de 2025  
**🎯 Estado**: Instrucciones adaptadas para proyecto tesis full-stack  
**📋 Stack**: React + Django + TimescaleDB + TensorFlow + Docker  
**🔄 Patrón**: Store54 adaptado para desarrollo académico/investigación
