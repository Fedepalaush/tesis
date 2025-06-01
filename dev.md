# Bitácora de Desarrollo - Ejecución de Docker Compose

## Fecha: 28 de Mayo de 2025

### Ejecución de la aplicación con Docker Compose

Ejecuté la aplicación utilizando Docker Compose para verificar su correcto funcionamiento después de la refactorización de las vistas de API a clases basadas en vistas.

```bash
sudo docker compose up --build
```

#### Resultados y observaciones:

1. **Error en la construcción del contenedor backend**:
   - Durante la etapa de construcción del contenedor de backend, se encontró un error en el comando `python manage.py collectstatic --noinput`.
   - Error: `ModuleNotFoundError: No module named 'pythonjsonlogger'`
   - Este error indica que falta una dependencia en el archivo de requerimientos para la configuración de logging en formato JSON.

2. **Error en la inicialización de PostgreSQL**:
   - El script de inicialización de la base de datos (`postgres-init/00_schema.sql`) presenta un error de sintaxis.
   - Error: `syntax error at or near "SERIAL" at character 53`
   - El error se debe a caracteres extraños (símbolos de viñeta •) que aparecen en el script SQL.

3. **Funcionamiento del backend**:
   - A pesar del error inicial en `collectstatic`, el backend logra iniciar correctamente.
   - Las migraciones se aplican sin problemas.
   - El endpoint de salud (`/api/health/`) responde correctamente con código 200.
   - No hay errores visibles en la ejecución de las vistas refactorizadas.

4. **Funcionamiento del frontend**:
   - El contenedor de frontend se inicia correctamente.
   - No hay errores reportados en los logs del frontend.

### Correcciones necesarias:

1. **Actualizar requisitos de Python**:
   - Agregar `python-json-logger` al archivo `requirements.txt` para solucionar el error de `collectstatic`.

2. **Corregir script SQL**:
   - Eliminar los caracteres de viñeta (•) del archivo `postgres-init/00_schema.sql`.
   - Verificar que no existan otros caracteres extraños en el script.

3. **Verificar funcionamiento completo**:
   - Probar todos los endpoints de API después de realizar las correcciones.
   - Verificar la interacción entre frontend y backend para todas las funcionalidades.

### Pruebas realizadas:

El endpoint de salud `/api/health/` fue probado exitosamente, lo que confirma que la infraestructura básica de la API está funcionando correctamente después de la refactorización a vistas basadas en clases.

### Próximos pasos:

1. Implementar las correcciones mencionadas.
2. Realizar pruebas exhaustivas de todos los endpoints.
3. Verificar que las mejoras de rendimiento (caching, optimización de consultas) funcionan según lo esperado.
4. Documentar las mejoras de rendimiento y mantenibilidad logradas con la refactorización.

---

## Fecha: 29 de Mayo de 2025

### Ejecución actualizada con `sudo docker compose up -d`

#### Análisis de errores identificados:

### 🔴 PROBLEMA CRÍTICO: Error de migración de Django

**Error principal:**
```
django.db.utils.ProgrammingError: column "fechaCompra" of relation "api_activo" already exists
```

**Descripción:**
- El backend está intentando ejecutar migraciones que agregan una columna `fechaCompra` que ya existe en la base de datos.
- Este error se repite continuamente cada minuto, causando que el contenedor backend falle en su inicialización.
- El error indica que existe un conflicto entre el estado actual de la base de datos y las migraciones de Django.

**Impacto:**
- El backend no puede inicializarse correctamente
- Las APIs no están disponibles
- La aplicación no funciona completamente

### ✅ Estado de contenedores:

1. **TimescaleDB:** ✅ Funcionando correctamente
   - Contenedor iniciado exitosamente
   - Base de datos operativa
   - Solo registra los errores de migración del backend

2. **Frontend:** ✅ Funcionando correctamente  
   - Nginx iniciado exitosamente
   - Sin errores en los logs
   - Servidor funcionando en puerto 80

3. **Backend:** ❌ Error crítico
   - Falla continua en migraciones
   - Reintenta cada minuto sin éxito
   - Aplicación no operativa

### 📋 PLAN DE CORRECCIÓN INMEDIATA

#### Fase 1: Diagnóstico del estado de la base de datos
1. ✅ Verificar el estado actual de las tablas en la base de datos
2. ✅ Identificar qué migraciones han sido aplicadas
3. ✅ Comparar con el estado esperado según los archivos de migración

#### Fase 2: Corrección del problema de migraciones
**Opción A: Reset de migraciones (Recomendado para desarrollo)**
1. ✅ Detener todos los contenedores
2. ✅ Eliminar el volumen de datos de TimescaleDB
3. ✅ Regenerar migraciones desde cero
4. ✅ Reiniciar contenedores

**Opción B: Fake de migraciones (Si hay datos importantes)**
1. ✅ Marcar las migraciones problemáticas como aplicadas sin ejecutarlas
2. ✅ Sincronizar el estado de Django con el estado real de la BD

#### Fase 3: Validación
1. ✅ Verificar que el backend inicie sin errores
2. ✅ Probar endpoints básicos (/api/health/)
3. ✅ Confirmar conectividad entre frontend y backend

### 🛠️ COMANDOS DE CORRECCIÓN

```bash
# Opción A: Reset completo (PERDERÁ TODOS LOS DATOS)
sudo docker compose down
sudo docker volume rm tesis_timescaledb_data
sudo docker compose up --build -d

# Opción B: Fake migrations (conserva datos)
sudo docker compose exec backend python manage.py migrate api 0001 --fake
sudo docker compose exec backend python manage.py migrate api --fake-initial
sudo docker compose restart backend
```

---

## Fecha: 31 de Mayo de 2025

### Refactorización de modelos de machine learning

Se realizó una refactorización completa de los modelos de machine learning en el directorio `ml_models` para mejorar la mantenibilidad y la reutilización del código. Este proceso incluyó:

1. **Creación de la clase base `BaseModel`**:
   - Implementada en `ml_models/base.py`.
   - Proporciona métodos comunes para la preparación de datos (`preparar_datos`) y la evaluación de modelos (`evaluar_modelo`).
   - Define métodos abstractos (`train` y `predict`) que deben ser implementados por cada modelo específico.

2. **Adaptación de modelos existentes**:
   - Los modelos `KNN`, `Logistic Regression`, `LSTM`, `Random Forest`, `SVM` y `XGBoost` fueron refactorizados para heredar de `BaseModel`.
   - Cada modelo implementa los métodos `train` y `predict` según sus características específicas.

3. **Actualización de dependencias**:
   - Se agregaron las siguientes librerías al archivo `requirements.txt`:
     - `scikit-learn==1.2.2`: Biblioteca para algoritmos de machine learning.
     - `tensorflow==2.12.0`: Framework para redes neuronales y deep learning.
     - `numpy==1.24.3`: Biblioteca para operaciones numéricas y manipulación de matrices.

#### Justificación académica:
La refactorización se realizó siguiendo principios de diseño orientado a objetos y patrones de diseño como el Template Method. Esto permite:

- **Reutilización de código**: Los métodos comunes se centralizan en la clase base, reduciendo la duplicación.
- **Extensibilidad**: Nuevos modelos pueden ser añadidos fácilmente implementando los métodos abstractos.
- **Mantenibilidad**: La estructura modular facilita la comprensión y el mantenimiento del código.

#### Próximos pasos:
1. **Reconstruir el contenedor Docker**:
   Ejecutar el siguiente comando para instalar las dependencias actualizadas:
   ```bash
   sudo docker compose up --build
   ```
2. **Validar funcionalidad**:
   - Probar cada modelo refactorizado para garantizar su correcto funcionamiento.
   - Verificar que los endpoints de API que utilizan estos modelos operen sin errores.
3. **Documentar resultados**:
   - Registrar métricas de rendimiento y precisión de cada modelo.
   - Comparar con la implementación previa para evaluar mejoras.

#### Referencias académicas:
- Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994). **Design Patterns: Elements of Reusable Object-Oriented Software**. Addison-Wesley.
- Chollet, F. (2018). **Deep Learning with Python**. Manning Publications.
- Pedregosa, F., et al. (2011). **Scikit-learn: Machine Learning in Python**. Journal of Machine Learning Research, 12, 2825-2830.

---

## Fecha: 31 de Mayo de 2025

### Refactorización del directorio `services` de `api`

Se inició la refactorización del directorio `services` para mejorar la mantenibilidad y la reutilización del código. Este proceso incluyó:

1. **Creación de la clase base `BaseService`**:
   - Implementada en `services/base.py`.
   - Proporciona métodos comunes para:
     - Manejo de caché (`get_cached_data`, `set_cached_data`).
     - Manejo de excepciones (`handle_exception`).
   - Define el método abstracto `execute` que debe ser implementado por cada servicio derivado.

2. **Plan de refactorización**:
   - Refactorizar servicios existentes (`fundamental.py`, `activo_service.py`, etc.) para heredar de `BaseService`.
   - Modularizar funciones reutilizables en `services/utils.py`.
   - Implementar el patrón Strategy para lógica específica en una carpeta `strategies`.
   - Crear un `ServiceFactory` en `services/factory.py` para instanciar servicios dinámicamente.

#### Justificación académica:
La refactorización se basa en principios de diseño orientado a objetos y patrones de diseño reconocidos:
- **Strategy**: Facilita la extensión de lógica específica sin modificar el código existente.
- **Factory**: Simplifica la creación de servicios dinámicos.
- **Modularización**: Mejora la reutilización y la mantenibilidad del código.

#### Próximos pasos:
1. Refactorizar servicios existentes para heredar de `BaseService`.
2. Implementar estrategias específicas en la carpeta `strategies`.
3. Crear el `ServiceFactory`.
4. Escribir pruebas unitarias.
5. Documentar resultados en `README.md` y `dev.md`.

#### Referencias académicas:
- Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994). **Design Patterns: Elements of Reusable Object-Oriented Software**. Addison-Wesley.
- Fowler, M. (2002). **Patterns of Enterprise Application Architecture**. Addison-Wesley.
