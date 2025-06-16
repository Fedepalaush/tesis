# 🔧 GUÍA DE PATRONES DE DESARROLLO - SERVICIOS BACKEND

**Documento**: Estándares y buenas prácticas para servicios  
**Fecha**: 16 de junio de 2025  
**Estado**: Proyecto en etapa final - Solo para referencia futura  

---

## 📋 PATRONES RECOMENDADOS PARA FUTURO

### 🏗️ **Patrón Service Layer (Recomendado para Nuevos Servicios)**

```python
# Ejemplo de implementación futura siguiendo BaseService
from .base import BaseService
from typing import Dict, Any, Optional, List
import logging

class ExampleFinancialService(BaseService):
    """
    Ejemplo de servicio siguiendo patrones OOP establecidos.
    NOTA: Solo para referencia futura, NO implementar en etapa actual.
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
    def execute(self, ticker: str, **kwargs) -> Dict[str, Any]:
        """Implementación requerida del método abstracto."""
        try:
            # 1. Validar inputs
            self._validate_inputs(ticker, **kwargs)
            
            # 2. Verificar cache
            cache_key = f"service_{ticker}_{hash(str(kwargs))}"
            cached_result = self.get_cached_data(cache_key)
            if cached_result:
                return cached_result
            
            # 3. Ejecutar lógica de negocio
            result = self._execute_business_logic(ticker, **kwargs)
            
            # 4. Guardar en cache
            self.set_cached_data(cache_key, result, timeout=3600)
            
            return result
            
        except Exception as e:
            self.handle_exception(e, f"ExampleFinancialService.execute(ticker={ticker})")
            raise
    
    def _validate_inputs(self, ticker: str, **kwargs) -> None:
        """Validación privada de inputs."""
        if not ticker or not isinstance(ticker, str):
            raise ValueError("Ticker debe ser un string válido")
    
    def _execute_business_logic(self, ticker: str, **kwargs) -> Dict[str, Any]:
        """Lógica de negocio privada."""
        # Implementación específica del servicio
        return {"ticker": ticker, "result": "processed"}
```

---

## 🔄 PATRONES DE MIGRACIÓN SEGURA

### **Patrón Wrapper (Para Migración Futura)**

```python
# Ejemplo de cómo migrar función procedural a clase sin romper APIs
from .legacy_functions import calculate_indicators as legacy_calculate_indicators

class IndicatorsService(BaseService):
    """
    Wrapper service para migrar gradualmente funciones procedurales.
    MANTIENE COMPATIBILIDAD con código existente.
    """
    
    def execute(self, data, **kwargs):
        """Nuevo método OOP."""
        return self.calculate_indicators(data)
    
    def calculate_indicators(self, data):
        """Método que wrappea función legacy."""
        try:
            # Usa función existente internamente
            result = legacy_calculate_indicators(data)
            return result
        except Exception as e:
            self.handle_exception(e, "IndicatorsService.calculate_indicators")
            raise
    
    @staticmethod
    def calculate_indicators_legacy(data):
        """Método estático para mantener compatibilidad."""
        return legacy_calculate_indicators(data)

# El código existente sigue funcionando:
# from .indicators import calculate_indicators  # Sigue funcionando
# 
# El nuevo código puede usar:
# service = IndicatorsService()
# result = service.execute(data)
```

---

## 📊 ANÁLISIS DE ANTIPATRONES ACTUALES

### ❌ **Antipatrones Identificados (NO Corregir Ahora)**

#### 1. **Duplicación de Cache**
```python
# Patrón actual en múltiples archivos:
cache_key = f'some_key_{ticker}'
cached_data = cache.get(cache_key)
if cached_data:
    return cached_data
# ... lógica ...
cache.set(cache_key, data, timeout=3600)
```

#### 2. **Error Handling Inconsistente**
```python
# Diferentes enfoques en diferentes archivos:
# Archivo A: print(f"Error: {e}")
# Archivo B: return None
# Archivo C: raise exception
```

#### 3. **Mixing Concerns**
```python
# Lógica de negocio mezclada con acceso a datos
def some_function(ticker):
    # Database access
    data = StockData.objects.filter(ticker=ticker)
    # Business logic
    calculated = data.mean() * 252
    # Caching
    cache.set(f'key_{ticker}', calculated)
    return calculated
```

---

## ✅ PATRONES CORRECTOS PARA FUTURO

### **Separación de Responsabilidades**

```python
# Repository Layer (Acceso a datos)
class StockDataRepository:
    def get_by_ticker(self, ticker: str) -> QuerySet:
        return StockData.objects.filter(ticker=ticker)

# Service Layer (Lógica de negocio)  
class CalculationService(BaseService):
    def __init__(self):
        self.repository = StockDataRepository()
    
    def execute(self, ticker: str) -> float:
        data = self.repository.get_by_ticker(ticker)
        return self._calculate_annual_return(data)
    
    def _calculate_annual_return(self, data) -> float:
        return data.aggregate(avg=Avg('close_price'))['avg'] * 252
```

### **Dependency Injection**

```python
class FinancialAnalysisService(BaseService):
    def __init__(self, data_repository=None, cache_service=None):
        self.data_repository = data_repository or StockDataRepository()
        self.cache_service = cache_service or CacheService()
    
    # Fácil de testear con mocks
```

---

## 🧪 ESTRATEGIA DE TESTING FUTURA

### **Testing de Servicios Procedurales Actuales**
```python
# Para funciones existentes
def test_calculate_indicators():
    # Given
    sample_data = create_test_dataframe()
    
    # When  
    result = calculate_indicators(sample_data)
    
    # Then
    assert 'RSI' in result.columns
    assert 'EMA_200' in result.columns
```

### **Testing de Servicios OOP Futuros**
```python
def test_financial_service():
    # Given
    mock_repository = Mock()
    service = FinancialAnalysisService(data_repository=mock_repository)
    
    # When
    result = service.execute("AAPL")
    
    # Then
    mock_repository.get_by_ticker.assert_called_once_with("AAPL")
```

---

## 📈 MÉTRICAS DE CALIDAD

### **Indicadores de Código Limpio**

| Métrica | Estado Actual | Objetivo Futuro |
|---------|---------------|-----------------|
| **Cyclomatic Complexity** | 5-15 por función | < 10 por método |
| **Function Length** | 20-100 líneas | < 50 líneas |
| **Code Duplication** | ~15% | < 5% |
| **Test Coverage** | Variable | > 80% |
| **Type Hints** | Parcial | 100% |

### **Deuda Técnica Identificada**

1. **Cache Inconsistente**: ~6 implementaciones diferentes
2. **Error Handling**: 4 patrones distintos  
3. **Logging**: Inconsistente entre servicios
4. **Validation**: Lógica duplicada de validación
5. **Type Safety**: Falta type hints en funciones legacy

---

## 🚀 ROADMAP DE MEJORAS (POST-PRODUCCIÓN)

### **Versión 2.0 - Arquitectura Unificada**
- [ ] Migrar todos los servicios a patrón OOP
- [ ] Implementar cache service centralizado
- [ ] Unificar error handling y logging
- [ ] Agregar type hints completos
- [ ] Crear tests unitarios 100%

### **Versión 2.1 - Optimización**
- [ ] Implementar async/await para operaciones I/O
- [ ] Optimizar consultas de base de datos
- [ ] Agregar monitoring y métricas
- [ ] Implementar circuit breakers

### **Versión 2.2 - Escalabilidad**
- [ ] Separar servicios en microservicios
- [ ] Implementar message queues
- [ ] Agregar load balancing
- [ ] Optimizar para concurrencia

---

## 📚 REFERENCIAS Y RECURSOS

### **Documentación Django**
- [Service Layer Pattern](https://docs.djangoproject.com/)
- [Repository Pattern](https://docs.djangoproject.com/)
- [Caching Framework](https://docs.djangoproject.com/en/stable/topics/cache/)

### **Libros Recomendados**
- "Clean Code" by Robert C. Martin
- "Refactoring" by Martin Fowler  
- "Design Patterns" by Gang of Four

### **Herramientas de Análisis**
- `flake8` - Linting
- `black` - Formatting
- `mypy` - Type checking
- `pytest` - Testing
- `coverage.py` - Code coverage

---

## ⚠️ ADVERTENCIA FINAL

**ESTE DOCUMENTO ES SOLO PARA REFERENCIA FUTURA**

- ❌ NO implementar cambios en etapa actual
- ❌ NO refactorizar código existente  
- ❌ NO crear nuevos tests ahora
- ✅ USAR como guía para próximas versiones
- ✅ MANTENER funcionalidad actual intacta
- ✅ DOCUMENTAR nuevos problemas encontrados

El sistema actual **FUNCIONA CORRECTAMENTE** y debe mantenerse estable hasta la finalización del proyecto actual.
