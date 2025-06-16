# 🚀 FINANCIAL ASSET ANALYSIS SYSTEM - GITHUB COPILOT AGENTS

**Sistema de Análisis de Activos Financieros con Machine Learning**
> Main development guide for GitHub Copilot agents working on the financial asset analysis and prediction system

---

## 📖 PROJECT OVERVIEW

### 📈 Financial Asset Analysis System
This is a comprehensive financial analysis platform that combines traditional technical analysis with machine learning models for asset prediction and portfolio management. The system provides real-time analysis, backtesting capabilities, and advanced ML-based recommendations for financial assets.

### 🎯 PROJECT VISION
- **Advanced Financial Analysis**: Integrate technical indicators (RSI, EMA, MACD) with machine learning models
- **Portfolio Management**: Complete portfolio tracking with metrics like Sharpe ratio, volatility, and beta
- **ML-Powered Predictions**: Multiple machine learning models (LSTM, XGBoost, Random Forest, SVM) for price prediction/home/matiasgel/desarrollo/ultimo/store54-rg/.github/copilot-instructions1.md
- **Real-Time Data Processing**: Live market data integration with caching and performance optimization
- **Interactive Visualizations**: Advanced charting and correlation analysis tools

---

## 🔄 MANUAL PROJECT INITIALIZATION

> **COMMAND-BASED**: Generate project implementation plans from README.md using manual commands

### Manual Generation Command
Use `${GENERATE}` command to create implementation plans from README.md requirements:

```markdown
${GENERATE} - Generate Financial System implementation plan from README.md

EXECUTION LOGIC:
1. Parse README.md content for financial system requirements
2. Extract key features, technologies, and ML model specifications
3. Generate comprehensive PLAN_IMPLEMENTACION_INICIAL.md
4. Include task breakdown, milestones, and dependencies
5. Follow financial analysis patterns and architectural guidelines

USAGE:
- User: "${GENERATE}"
- Agent: Reads README.md → Generates PLAN_IMPLEMENTACION_INICIAL.md → Documents creation

CONDITIONS:
- Only executes when explicitly requested via ${GENERATE} command
- Overwrites existing PLAN_IMPLEMENTACION_INICIAL.md if present
- Maintains financial system-specific formatting and structure
- Includes all project phases and implementation details
```

---

## 🏗️ FINANCIAL SYSTEM ARCHITECTURE OVERVIEW

### 📐 Patterns & Technologies
- **Backend**: Django REST Framework with PostgreSQL + TimescaleDB
- **Frontend**: React 18 + Vite + TailwindCSS
- **Machine Learning**: TensorFlow 2.12, Scikit-learn, XGBoost, Pandas
- **Financial Data**: yfinance integration with caching layer
- **Database**: PostgreSQL with TimescaleDB for time-series data
- **Authentication**: JWT-based authentication system
- **Deployment**: Docker Compose with multi-container setup

### � Core Features
- **Technical Analysis**: RSI, EMA, MACD, Bollinger Bands indicators
- **Machine Learning Models**: LSTM, XGBoost, Random Forest, SVM, KNN, Logistic Regression
- **Portfolio Management**: Asset tracking, performance metrics, correlation analysis
- **Backtesting System**: Strategy testing with historical data
- **Real-Time Analytics**: Live data processing with caching
- **Advanced Visualizations**: Interactive charts, heatmaps, pivot points

---

## 📚 SPECIALIZED PATTERN REFERENCES

### 🤖 Machine Learning & AI Integration

- TensorFlow and Scikit-learn integration patterns
- LSTM for time-series prediction
- Feature engineering for financial indicators
- Model evaluation and validation strategies

### � Financial Data & Analysis

- Technical indicator calculations (RSI, EMA, MACD)
- yfinance data integration and caching
- Time-series data processing with TimescaleDB
- Real-time market data handling

### 🐘 Backend Architecture & Services

- Django REST Framework best practices
- Repository pattern implementation
- Service layer architecture
- Database optimization for financial data

### ⚛️ Frontend & Visualization

- React 18 with hooks and context patterns
- Interactive financial charts with Chart.js/Plotly
- TailwindCSS component design system
- Real-time data visualization patterns

### 🐳 Infrastructure & DevOps

- Docker Compose multi-container setup
- PostgreSQL + TimescaleDB configuration
- Environment-based configuration
- Performance optimization and caching
### 🧪 Testing & Quality Assurance

- Unit testing for financial calculations
- Integration testing for ML models
- API testing strategies
- Performance testing for time-series data

### 🛠️ Development Workflow

- Git workflow and branching strategies
- Code review and quality assurance
- Documentation standards
- Continuous integration practices

---

## 📋 AUTOMATIC TASK MANAGEMENT SYSTEM

## 🛡️ PROYECTO EN PRODUCCIÓN - ADVERTENCIAS CRÍTICAS

### ⚠️ **RESTRICCIONES ABSOLUTAS**
```markdown
🚫 PROHIBIDO: Modificar funcionalidades core del sistema
🚫 PROHIBIDO: Crear, modificar o ejecutar tests
🚫 PROHIBIDO: Refactorizar código estable
🚫 PROHIBIDO: Cambiar configuraciones de base de datos
🚫 PROHIBIDO: Modificar modelos de ML en funcionamiento
🚫 PROHIBIDO: Actualizar dependencias críticas
🚫 PROHIBIDO: Cambiar APIs que funcionan

✅ PERMITIDO: Documentación y comentarios
✅ PERMITIDO: Corrección de typos evidentes
✅ PERMITIDO: Cambios cosméticos de UI menores
✅ PERMITIDO: Reportes de estado
```

### 🔒 **MODO MANTENIMIENTO CONSERVADOR**
- Antes de cualquier cambio: PREGUNTAR al usuario
- Priorizar estabilidad sobre nuevas funcionalidades
- Documentar problemas encontrados sin corregir automáticamente
- Evitar cambios que puedan requerir testing adicional

---

### 🔄 Automatic Task Selection Logic
```markdown
🚀 AUTOMATIC TASK WORKFLOW:
1. Read PLAN_IMPLEMENTACION_INICIAL.md to identify current project status
2. Automatically select NEXT PENDING TASK (first uncompleted [ ] task in order)
3. Mark selected task as [🔧 In Progress] in PLAN_IMPLEMENTACION_INICIAL.md
4. Initialize documentacion/progreso.md with task details
5. Execute task systematically until completion
6. Mark task as [✅ Complete] and archive progress to documentacion/dev_nombre_tarea_finalizada.md

📊 TASK LIFECYCLE (AUTOMATED):
Scan Plan → Auto-Select Next → [🔧 In Progress] → Execute → [✅ Complete] → Archive Progress → Auto-Select Next
All status updates happen automatically in PLAN_IMPLEMENTACION_INICIAL.md
```

### 🤖 **AUTONOMOUS EXECUTION WORKFLOW**
```markdown
🔴 NEW RULE: Autonomous task progression until all tasks complete
🔴 AUTO-IDENTIFY next pending task from PLAN_IMPLEMENTACION_INICIAL.md
🔴 AUTO-EXECUTE X tasks per iteration based on ${T:X} command
🔴 CONTINUE until all [ ] tasks become [✅] in PLAN_IMPLEMENTACION_INICIAL.md

Autonomous Workflow:
1. User: ANY development request
2. Agent: Read PLAN_IMPLEMENTACION_INICIAL.md → Auto-identify first [ ] task
3. Agent: Mark as [🔧 In Progress] → Initialize progreso.md → Execute complete task → STOP
4. User: "${T:X}" (where X = number of tasks to execute)
5. Agent: Execute X complete tasks → Update progress for each → STOP
6. Agent: Mark completed tasks as [✅] → Archive progress to dev_nombre_tarea_finalizada.md → AUTO-SELECT next [ ] tasks if available
7. REPEAT until ALL tasks in PLAN_IMPLEMENTACION_INICIAL.md are [✅ Complete]
```

### 📋 **PENDING TASK IDENTIFICATION RULES**
```markdown
TASK SELECTION CRITERIA:
1. Scan PLAN_IMPLEMENTACION_INICIAL.md for sections with [ ] checkboxes
2. Identify FIRST uncompleted task ([ ] not [✅])
3. Priority order: FASE 1 tasks before FASE 2 tasks
4. Within phases: Execute in document order (top to bottom)
5. Skip already completed [✅] tasks
6. When all tasks [✅]: Report project completion

TASK STATUS MAPPING:
- [ ] = Pending (auto-select these)
- [🔧] = In Progress (complete first if found)
- [✅] = Complete (skip these)
- [❌] = Error (auto-fix and retry)
```

### Task Status Format
```markdown
## [📝] Task Title - Role: Feature Area
**Status**: [🔧 In Progress] / [✅ Complete] / [🔧 Review] / [❌ Error]
**Started**: YYYY-MM-DD HH:MM
**Completed**: YYYY-MM-DD HH:MM (when applicable)
**Related Patterns**: [pattern-file-1.md, pattern-file-2.md]

### Description
Brief task description with Store54 context

### Implementation Details
- [ ] Subtask 1
- [ ] Subtask 2
- [ ] Subtask 3

### Testing Requirements
- [ ] Unit tests
- [ ] Integration tests
- [ ] Security validation

### Progress Log
- **Step 1**: [✅/🔧/❌] Description - Timestamp
- **Step 2**: [✅/🔧/❌] Description - Timestamp
- **Step 3**: [✅/🔧/❌] Description - Timestamp
```

### 📋 Automatic Task Status Commands
- `${AUTO_NEXT}` - Automatically identify and start next pending task
- `${T:X}` - Execute X tasks in current iteration (REQUIRED to proceed with batch execution)
- `${COMPLETE_AND_NEXT}` - Mark current task complete and auto-start next task
- `${STATUS}` - Check current task status and remaining pending tasks
- `${PROJECT_STATUS}` - Show overall project completion percentage
- `${FIX}` - Fix all errors in active file and continue
- `${NEW:description}` - New Feature Request
  - **Format**: `${NEW:Add dark mode toggle to navbar}`
  - **Action**: Plan and implement new feature/change
  - **Process**:
    1. Analyze description requirements
    2. Check current implementation in `PLAN_IMPLEMENTACION_INICIAL.md`
    3. Create main task and subtasks in `PLAN_IMPLEMENTACION_INICIAL.md` with proper numbering
    4. Stop and wait and wait for new command
    
    

### 🔍 Automatic Task Management Rules
```markdown
STARTING SESSION (AUTONOMOUS):
1. Read PLAN_IMPLEMENTACION_INICIAL.md to understand project state
2. Check for existing [🔧 In Progress] tasks - complete them first
3. AUTO-IDENTIFY first [ ] pending task in priority order
4. Mark as [🔧 In Progress] in PLAN_IMPLEMENTACION_INICIAL.md (set development icon)
5. Initialize documentacion/progreso.md with task context

DURING TASK EXECUTION (AUTONOMOUS):
1. Execute X complete tasks based on ${T:X} command
2. Update progress log after each complete task
3. Maintain [🔧 In Progress] status throughout each task
4. Document blockers/issues encountered for each task
5. Use documentacion/progreso.md for detailed tracking of all tasks in batch

COMPLETING TASK BATCH (AUTONOMOUS):
1. Mark each completed task as [✅ Complete] in PLAN_IMPLEMENTACION_INICIAL.md (change from development to completed icon)
2. Add completion timestamp and summary for each task
3. Archive progreso.md content to documentacion/dev_nombre_tarea_finalizada.md
4. Clear documentacion/progreso.md for reuse after batch completion
5. AUTO-IDENTIFY next [ ] pending tasks for next batch
6. Wait for next ${T:X} command to continue with next batch
7. Report project completion when all tasks [✅]
```

### ⚠️ **AUTONOMOUS TASK CONTROL - PRODUCTION MODE**
```markdown
🔴 CRITICAL RULE: Solo cambios menores y seguros
🔴 ALWAYS ask user before modifying working code
🔴 AUTONOMOUS task selection limited to documentation/cosmetic changes
🔴 Document issues found but don't auto-fix complex problems
🔴 Update documentacion/progreso.md with conservative approach

Conservative Workflow Example:
User: "Start development work"
Agent: [Reads PLAN_IMPLEMENTACION_INICIAL.md] → [Identifies SAFE documentation task] → [Documents current state] → [ASKS permission for any code changes] → STOPS
User: "${T:3}" 
Agent: [Only executes 3 SAFE tasks] → [Documents findings] → [Reports what needs user approval] → STOPS
```

---

## 🎯 COPILOT AGENT WORKFLOW - PRODUCTION SAFE MODE

### ⚠️ **CRITICAL EXECUTION RULE: SAFETY FIRST APPROACH**
```markdown
🚫 NEVER modify core financial calculations or ML models
🚫 NEVER create or run new tests
🚫 NEVER refactor working code
✅ ALWAYS ask permission before any functional changes
✅ FOCUS on documentation and safe cosmetic improvements
✅ REPORT issues found without auto-fixing them
```

### 1. **Start with Context Loading (PRODUCTION ASSESSMENT)**
```markdown
When working on Financial System in production:
1. Read this main file for production constraints
2. Assess what's working vs what needs attention
3. Document current state before any changes
4. Get user approval for any modifications

⏹️ STOP HERE - Always ask permission before changes
```

### 2. **Task Execution Priorities (MINIMAL RISK TASKS ONLY)**
1. **Preserve Existing Functionality**: NO cambios a lógica crítica ⏹️ Complete Task 1
2. **Documentation Only**: Solo mejoras de documentación ⏹️ Complete Task 2  
3. **UI Cosmetic**: Cambios menores de interfaz sin impacto ⏹️ Complete Task 3
4. **Bug Fixes**: Solo correcciones evidentes y necesarias ⏹️ Complete Task 4
5. **Status Reports**: Documentar estado actual sin cambios ⏹️ Complete Task 5

### 3. **Task Completion Documentation Requirements (SAFE MODE)**
```markdown
After EACH safe task completion, provide:
📊 **Task Completion Report**
- ✅ What was safely accomplished (documentation/cosmetic only)
- 📄 Files that were viewed/analyzed (not modified)
- 🔍 Issues found that need user attention
- ⚠️ Recommendations for user to consider
- 📋 Next safe task recommendations
- ⏸️ **WAITING FOR USER APPROVAL for any code changes**
```

### 4. **Integration Guidelines (PRODUCTION SAFETY MODE)**
- **Django Integration**: NO tocar servicios que funcionan ⏹️
- **Financial Data**: NO modificar validaciones existentes ⏹️
- **ML Pipeline**: NO cambiar modelos en producción ⏹️
- **Error Handling**: NO modificar manejo de errores funcional ⏹️
- **Data Validation**: NO cambiar validaciones críticas ⏹️

---

## 🚨 CRITICAL DEVELOPMENT RULES - PRODUCTION READY PROJECT

### ⚠️ **PROYECTO EN ETAPA FINAL - MODO CONSERVADOR**
- 🚫 **NO MODIFICAR funcionalidades esenciales ya implementadas**
- 🚫 **NO CREAR nuevos tests ni modificar tests existentes**
- 🚫 **NO REFACTORIZAR código que funciona correctamente**
- 🚫 **NO CAMBIAR arquitectura o patrones establecidos**
- 🚫 **NO ACTUALIZAR dependencias críticas**
- ✅ **SOLO correcciones menores de bugs evidentes**
- ✅ **SOLO mejoras de documentación si es necesario**
- ✅ **SOLO cambios cosméticos en UI sin impacto funcional**

### Security & Data Integrity Requirements (MINIMAL CHANGES)
- ✅ **Validar solo si hay problemas evidentes en cálculos financieros**
- ✅ **NO tocar autenticación existente a menos que esté rota**
- ✅ **NO modificar APIs que funcionan correctamente**
- ✅ **NO cambiar manejo de base de datos funcional**
- ✅ **Reportar problemas antes de hacer cambios**

### Code Quality Standards (MINIMAL IMPACT)
- ✅ **NO cambiar código Python/Django que funciona**
- ✅ **NO modificar componentes React estables**
- ✅ **NO cambiar convenciones de nombres establecidas**
- ✅ **NO agregar logging extensivo innecesario**
- ✅ **NO escribir tests adicionales - usar los existentes**
- ✅ **SOLO corregir typos o errores evidentes**

### Pattern Adherence (MAINTENANCE MODE)
- ✅ **NO modificar patrones Repository/Service establecidos**
- ✅ **NO cambiar hooks de React que funcionan**
- ✅ **NO tocar integración ML si funciona correctamente**
- ✅ **NO modificar workflows de datos financieros**
- ✅ **NO cambiar patrones de caching establecidos**
- ✅ **PRESERVAR toda funcionalidad existente**

---

## 🔍 QUICK REFERENCE

### Key Project Files
- `PLAN_IMPLEMENTACION_INICIAL.md` - Main implementation roadmap
- `README.md` - Project requirements and setup
- `DEV.md` - Detailed development documentation
- `backend/core/settings.py` - Django configuration
- `backend/api/` - API endpoints and business logic
- `frontend/src/` - React application components and pages

### Key Backend Structure
```
backend/
├── api/
│   ├── models.py - Database models (Activo, StockData)
│   ├── services/ - Business logic layer
│   ├── repositories/ - Data access layer  
│   ├── ml_models/ - Machine learning models
│   ├── views/ - API endpoints
│   └── utils/ - Utility functions
└── core/
    └── settings.py - Django configuration
```

### Key Frontend Structure
```
frontend/
├── src/
│   ├── components/ - Reusable UI components
│   ├── pages/ - Application pages
│   ├── hooks/ - Custom React hooks
│   ├── contexts/ - React context providers
│   └── api.js - API integration
└── package.json - Dependencies
```


### Emergency Debugging
1. Check `backend/dev.md` for known backend issues
2. Review Django settings in `backend/core/settings.py`
3. Check Docker Compose logs for container issues
4. Review database migrations and TimescaleDB status
5. Validate ML model performance and predictions
6. Check frontend console for React errors

---

**For detailed implementation patterns, always reference the appropriate pattern file before starting development. This modular approach ensures GitHub Copilot only loads necessary context for optimal performance and focused assistance.**

---

### � **PROGRESS TRACKING SYSTEM**
```markdown

CONDITIONAL READING LOGIC:
- ONLY read documentacion/progreso.md when there's an active task execution
- READ when: Starting new task OR continuing in-progress task  
- DO NOT READ when: No active task execution

STARTING NEW TASK:
1. Clear documentacion/progreso.md content completely
2. Initialize with new task context and objectives
3. Record starting timestamp and task ID
4. Document initial state

CONTINUING EXISTING TASK:
1. ALWAYS read documentacion/progreso.md first
2. Understand current progress state
3. Identify last completed step
4. Resume from appropriate point

DURING TASK EXECUTION:
BEFORE MODIFYING ANY FILE:
1. Update documentacion/progreso.md with: "🔄 ACCIÓN PLANIFICADA:"
2. Specify which file will be modified
3. Explain what changes will be made
4. Document the purpose of the modification

AFTER MODIFYING ANY FILE:
1. Update documentacion/progreso.md with: "✅ MODIFICACIÓN REALIZADA:"
2. Specify which file was modified
3. Detail the exact changes made
4. Note any issues encountered

COMPLETING TASK:
1. Document final task completion in progreso.md
2. Mark task as [✅ Complete] in PLAN_IMPLEMENTACION_INICIAL.md
```

### 📋 **PROGRESS FILE FORMAT**
```markdown
# FINANCIAL SYSTEM - PROGRESO DE TAREA ACTUAL

## INFORMACIÓN DE TAREA
**Tarea ID**: [Task identifier]
**Iniciado**: YYYY-MM-DD HH:MM:SS
**Estado**: [🔧 En Progreso] / [✅ Completado]

## OBJETIVO
[Brief description of task goals]

## PROGRESO DETALLADO

### 🔄 ACCIONES PLANIFICADAS
- **Timestamp**: [Action planned description]

### ✅ MODIFICACIONES REALIZADAS  
- **Timestamp**: [Modification completed description]

### ⚠️ PROBLEMAS ENCONTRADOS
- **Timestamp**: [Issues and resolutions]

## ESTADO ACTUAL
[Current progress summary and next steps]
```