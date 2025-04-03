# Documentación para Patrones de Diseño, Mónadas y Cambios de Diseño

## Backend (Django)

### Patrones de Diseño

1. **Patrón de Capa de Servicio**
   - **Archivo**: `backend/api/services/activo_service.py`
   - **Descripción**: La clase `ActivoService` procesa datos para un activo específico. Esta lógica está separada de las vistas y modelos, haciendo el código más modular y mantenible.
   - **Ejemplo**:
     ```python
     class ActivoService:
         def __init__(self):
             self.stock_data_repository = StockDataRepository()

         @cache_decorator
         def process_activo(self, activo):
             # Lógica de procesamiento
     ```

2. **Patrón de Repositorio**
   - **Archivo**: `backend/api/repositories/stock_data_repository.py`
   - **Descripción**: La clase `StockDataRepository` abstrae la capa de acceso a datos para el modelo `StockData`. Esto ayuda a mantener las vistas y servicios limpios y enfocados en la lógica de negocio.
   - **Ejemplo**:
     ```python
     class StockDataRepository:
         def get_historical_data(self, ticker, start_date):
             return StockData.objects.filter(ticker=ticker, date__gte=start_date).order_by('date')
     ```

3. **Patrón de Fábrica**
   - **Archivo**: `backend/api/services/estrategias/custom_strategy.py`
   - **Descripción**: La clase `StrategyFactory` crea diferentes tipos de estrategias de trading basadas en la entrada del usuario. Este patrón ayuda a crear objetos sin especificar la clase exacta del objeto que se creará.
   - **Ejemplo**:
     ```python
     class StrategyFactory:
         @staticmethod
         def create_strategy(strategy_type, **kwargs):
             if strategy_type == 'sma_cross':
                 return CustomStrategy.create_sma_cross_strategy(**kwargs)
     ```

4. **Patrón de Estrategia**
   - **Archivo**: `backend/api/services/estrategias/custom_strategy.py`
   - **Descripción**: La clase `CustomStrategy` define diferentes estrategias de trading. La clase `StrategyContext` permite cambiar entre estas estrategias basadas en la entrada del usuario.
   - **Ejemplo**:
     ```python
     class CustomStrategy(Strategy):
         def next(self):
             # Lógica de la estrategia
     ```

5. **Patrón Decorador**
   - **Archivo**: `backend/api/services/activo_service.py`
   - **Descripción**: La función `cache_decorator` añade comportamiento de caché a los métodos del servicio. Este patrón ayuda a añadir comportamiento a los objetos de manera dinámica.
   - **Ejemplo**:
     ```python
     def cache_decorator(func):
         def wrapper(*args, **kwargs):
             cache_key = f"{func.__name__}_{args}_{kwargs}"
             cached_data = cache.get(cache_key)
             if cached_data:
                 return cached_data
             result = func(*args, **kwargs)
             cache.set(cache_key, result, timeout=3600)
             return result
         return wrapper
     ```

6. **Patrón Singleton**
   - **Archivo**: `backend/api/views.py`
   - **Descripción**: La clase `ActivoService` se instancia como un singleton. Este patrón asegura que solo haya una instancia de la clase y proporciona un punto de acceso global a ella.
   - **Ejemplo**:
     ```python
     activo_service = ActivoService()
     ```

## Frontend (React)

### Mónadas

1. **Mónada Maybe**
   - **Archivo**: `frontend/src/utils/monads.js`
   - **Descripción**: Esta mónada ayuda a manejar valores nulos o indefinidos de manera elegante. Proporciona métodos para manejar el valor de manera segura.
   - **Ejemplo**:
     ```javascript
     class Maybe {
         constructor(value) {
             this.value = value;
         }

         static of(value) {
             return new Maybe(value);
         }

         isNothing() {
             return this.value === null || this.value === undefined;
         }

         map(fn) {
             return this.isNothing() ? this : Maybe.of(fn(this.value));
         }

         getOrElse(defaultValue) {
             return this.isNothing() ? defaultValue : this.value;
         }
     }
     ```

2. **Mónada Either**
   - **Archivo**: `frontend/src/utils/monads.js`
   - **Descripción**: Esta mónada ayuda a manejar errores de manera funcional. Proporciona métodos para manejar casos de éxito y error.
   - **Ejemplo**:
     ```javascript
     class Either {
         constructor(left, right) {
             this.left = left;
             this.right = right;
         }

         static left(value) {
             return new Either(value, null);
         }

         static right(value) {
             return new Either(null, value);
         }

         isLeft() {
             return this.left !== null;
         }

         isRight() {
             return this.right !== null;
         }

         map(fn) {
             return this.isRight() ? Either.right(fn(this.right)) : this;
         }

         getOrElse(defaultValue) {
             return this.isRight() ? this.right : defaultValue;
         }
     }
     ```

3. **Mónada Task**
   - **Archivo**: `frontend/src/utils/monads.js`
   - **Descripción**: Esta mónada ayuda a manejar operaciones asíncronas. Proporciona métodos para manejar el resultado de la promesa.
   - **Ejemplo**:
     ```javascript
     class Task {
         constructor(fork) {
             this.fork = fork;
         }

         static of(value) {
             return new Task((reject, resolve) => resolve(value));
         }

         map(fn) {
             return new Task((reject, resolve) => this.fork(reject, x => resolve(fn(x))));
         }

         chain(fn) {
             return new Task((reject, resolve) => this.fork(reject, x => fn(x).fork(reject, resolve)));
         }

         fork(reject, resolve) {
             return this.fork(reject, resolve);
         }
     }
     ```

### Cambios de Diseño

1. **Refactorización para Extensibilidad y Escalabilidad**
   - **Backend**: El código backend en `backend/api/models.py` y `backend/api/serializers.py` ahora usa el Patrón de Repositorio para abstraer la capa de acceso a datos. El archivo `backend/api/views.py` ha sido refactorizado para usar el Patrón de Capa de Servicio, haciéndolo más modular y mantenible.
   - **Frontend**: El código frontend en `frontend/src/App.jsx` y `frontend/src/pages/AnalisisActivo.jsx` ahora usa las mónadas Maybe y Either para un mejor manejo de errores y gestión de valores nulos.

2. **Mejores Prácticas para Escalabilidad y Eficiencia**
   - **Backend**: El código ahora sigue las mejores prácticas para escalabilidad y eficiencia, como el uso de caché y balanceo de carga.
   - **Frontend**: La interfaz de usuario en el frontend ha sido optimizada para ser amigable al usuario e incluye elementos de diseño responsivo.

3. **Implementación de Patrones de Diseño y Mónadas**
   - **Backend**: El código backend ahora implementa patrones de diseño como Capa de Servicio, Repositorio, Fábrica, Estrategia, Decorador y Singleton.
   - **Frontend**: El código frontend ahora implementa mónadas como Maybe, Either y Task.
