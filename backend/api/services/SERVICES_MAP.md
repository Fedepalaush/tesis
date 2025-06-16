# 🔍 MAPA DE SERVICIOS - REFERENCIA RÁPIDA

**Última actualización**: 16 de junio de 2025  
**Propósito**: Guía rápida para desarrolladores  
**Estado**: Documentación del sistema actual (NO modificar código)  

---

## 🗺️ NAVEGACIÓN DE SERVICIOS

### 📊 **Servicios Financieros Core**

| Servicio | Tipo | Propósito | API Principal |
|----------|------|-----------|---------------|
| `activo_service.py` | 🏗️ OOP | Gestión de activos | `ActivoService.process_activo()` |
| `indicators.py` | 📝 Funcional | Indicadores técnicos | `calculate_analytics()` |
| `trends.py` | 📝 Funcional | Análisis de tendencias | `check_ema_trend()` |
| `fundamental.py` | 📝 Funcional | Datos fundamentales | `get_fundamental_data()` |

### 🤖 **Servicios de Machine Learning**

| Servicio | Tipo | Propósito | API Principal |
|----------|------|-----------|---------------|
| `entrenamiento.py` | 📝 Funcional | Entrenamiento ML | `entrenar_modelo_service()` |
| `agrupacion.py` | 📝 Funcional | Clustering K-Means | `agrupar_acciones()` |
| `backtesting.py` | 📝 Funcional | Testing estrategias | `run_backtest()` |

### 📈 **Servicios de Análisis**

| Servicio | Tipo | Propósito | API Principal |
|----------|------|-----------|---------------|
| `ema_logic.py` | 📝 Funcional | Señales EMA | `obtener_ema_signals()` |
| `pivot.py` | 📝 Funcional | Puntos pivote | `calculate_pivots()` |
| `retornos_mensuales.py` | 📝 Funcional | Heatmaps retornos | `calcular_retornos_mensuales()` |
| `signals.py` | 📝 Funcional | Señales trading | `calculate_signal()` |

---

## 🔧 GUÍAS DE USO RÁPIDO

### **Para Nuevas Funcionalidades**

#### ✅ **Si necesitas crear un servicio simple:**
```python
# Usar patrón funcional existente (como indicators.py)
def nueva_funcion_analisis(data, parametros):
    """
    Nueva función siguiendo patrón establecido.
    """
    try:
        # Validaciones
        if not data:
            raise ValueError("Data is required")
        
        # Lógica de negocio
        resultado = calcular_algo(data, parametros)
        
        return resultado
        
    except Exception as e:
        print(f"Error en nueva_funcion_analisis: {e}")
        return None
```

#### ✅ **Si necesitas un servicio complejo:**
```python
# Seguir patrón OOP como activo_service.py
from .base import BaseService

class NuevoService(BaseService):
    def execute(self, *args, **kwargs):
        # Implementar lógica aquí
        pass
```

### **Para Usar Servicios Existentes**

#### 📊 **Análisis Técnico**
```python
# Obtener indicadores
from .services.indicators import calculate_analytics
result = calculate_analytics(dataframe)

# Obtener señales EMA  
from .services.ema_logic import obtener_ema_signals
signals = obtener_ema_signals(tickers, periods, use_triple=True)
```

#### 💰 **Gestión de Activos**
```python
# Usar servicio principal
from .services.activo_service import ActivoService
service = ActivoService()
processed_data = service.process_activo(activo_instance)
```

#### 🤖 **Machine Learning**
```python
# Entrenar modelo
from .services.entrenamiento import entrenar_modelo_service
result = entrenar_modelo_service(training_data)

# Clustering
from .services.agrupacion import agrupar_acciones  
clusters = agrupar_acciones(tickers, params, start_date, end_date)
```

---

## 🔍 TROUBLESHOOTING COMÚN

### **Problemas Frecuentes y Soluciones**

#### ❌ **Error: "Module not found"**
```python
# ✅ Correcto
from .services.indicators import calculate_analytics

# ❌ Incorrecto  
from services.indicators import calculate_analytics
```

#### ❌ **Error: "No cached data"**
```python
# Servicios que usan cache interno:
# - fundamental.py
# - activo_service.py
# 
# Servicios sin cache:
# - indicators.py
# - trends.py
# - agrupacion.py
```

#### ❌ **Error: "Invalid date format"**
```python
# Diferentes servicios esperan diferentes formatos:
# - StockData queries: datetime objects
# - yfinance calls: string dates 'YYYY-MM-DD'
# - pandas operations: pd.Timestamp
```

---

## 📋 CHECKLIST DE DEVELOPMENT

### **Antes de Usar un Servicio**
- [ ] ✅ Verificar tipo de input esperado (DataFrame, dict, string)
- [ ] ✅ Confirmar formato de fecha requerido
- [ ] ✅ Revisar si el servicio maneja cache internamente
- [ ] ✅ Validar que los datos de entrada no estén vacíos

### **Al Agregar Nueva Funcionalidad**
- [ ] ✅ Seguir patrón existente del archivo más similar
- [ ] ✅ Agregar validación básica de inputs
- [ ] ✅ Implementar manejo de errores consistente
- [ ] ✅ Documentar la función con docstring
- [ ] ✅ **NO** modificar servicios existentes que funcionan

### **Testing Manual Rápido**
```python
# Test básico de servicio
try:
    result = tu_servicio(test_data)
    print(f"✅ Servicio funcionando: {type(result)}")
    return True
except Exception as e:
    print(f"❌ Error: {e}")
    return False
```

---

## 🚨 REGLAS CRÍTICAS

### **❌ PROHIBIDO EN ETAPA ACTUAL**
- Modificar servicios existentes y funcionando
- Cambiar interfaces públicas de funciones
- Refactorizar código estable
- Agregar nuevas dependencias
- Modificar patrones de cache existentes

### **✅ PERMITIDO**
- Consultar servicios existentes
- Crear nuevos archivos de servicio si es absolutamente necesario
- Agregar documentación
- Reportar bugs encontrados (sin corregir)

---

## 📞 CONTACTOS DE REFERENCIA

### **Servicios por Especialidad**

| Necesidad | Archivo Referencia | Función Clave |
|-----------|-------------------|---------------|
| **Indicadores RSI, EMA** | `indicators.py` | `calculate_analytics()` |
| **Datos fundamentales** | `fundamental.py` | `get_fundamental_data()` |
| **Clustering acciones** | `agrupacion.py` | `agrupar_acciones()` |
| **Señales trading** | `ema_logic.py` | `obtener_ema_signals()` |
| **Retornos históricos** | `retornos_mensuales.py` | `calcular_retornos_mensuales()` |
| **Puntos soporte/resistencia** | `pivot.py` | `calculate_pivots()` |
| **Machine Learning** | `entrenamiento.py` | `entrenar_modelo_service()` |
| **Gestión activos** | `activo_service.py` | `ActivoService.process_activo()` |

---

## 📚 DOCUMENTACIÓN RELACIONADA

- [`SERVICES_DOCUMENTATION.md`](./SERVICES_DOCUMENTATION.md) - Análisis completo del estado actual
- [`DEVELOPMENT_PATTERNS_GUIDE.md`](./DEVELOPMENT_PATTERNS_GUIDE.md) - Patrones para futuras versiones  
- `../models.py` - Modelos de datos utilizados
- `../repositories/` - Capa de acceso a datos
- `../../dev.md` - Historial de desarrollo del proyecto

---

**⚠️ Recuerda**: Este sistema está en **producción**. Prioriza la estabilidad sobre la perfección arquitectural.
