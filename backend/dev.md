# Bitácora de Desarrollo

## Fecha: 27 de Mayo de 2025

### Buenas Prácticas para una Aplicación Django REST Moderna

#### 1. Arquitectura y Patrones de Diseño

- **Patrón de Repositorio**: Separar la lógica de acceso a datos de la lógica de negocio.
  - Implementar clases de repositorio para encapsular las consultas a la base de datos.
  - Facilita pruebas unitarias y cambia el ORM si es necesario.

- **Patrón de Servicio**: Encapsular la lógica de negocio en clases de servicio.
  - Reducir la responsabilidad de las vistas.
  - Mejorar la reutilización del código y facilitar pruebas.

- **Domain-Driven Design (DDD)**: Organizar el código según el dominio de negocio.
  - Definir entidades, agregados, servicios de dominio y objetos de valor.
  - Establecer límites de contexto claros.

- **Clean Architecture**: Separar las capas de aplicación.
  - Capa de presentación (APIs, vistas)
  - Capa de aplicación (casos de uso, coordinación)
  - Capa de dominio (entidades, reglas de negocio)
  - Capa de infraestructura (bases de datos, servicios externos)

#### 2. Estructura del Proyecto

- **Aplicaciones basadas en funcionalidad**: Dividir el proyecto en aplicaciones según funcionalidades del negocio.
- **Módulos por dominio**: Organizar código dentro de las aplicaciones por dominio.
- **Separación de responsabilidades**: Cada módulo/archivo debe tener una única responsabilidad.

```
project/
  ├── apps/
  │   ├── core/  # Funcionalidad común
  │   ├── users/  # Gestión de usuarios
  │   ├── assets/  # Gestión de activos financieros
  │   └── analysis/  # Análisis y modelos ML
  ├── config/  # Configuraciones de Django
  └── utils/  # Utilidades comunes
```

#### 3. APIs REST

- **Versionamiento de API**: Implementar versionamiento (v1, v2) en URLs o headers.
- **Documentación automática**: Usar drf-spectacular o drf-yasg para OpenAPI/Swagger.
- **Paginación consistente**: Aplicar paginación a todas las listas de recursos.
- **Filtrado y ordenamiento**: Implementar django-filter para endpoints que lo requieran.
- **HATEOAS**: Incluir hypermedia links en respuestas API cuando sea apropiado.

#### 4. Serialización y Validación

- **Serializers anidados**: Para representar relaciones complejas.
- **Validación personalizada**: Implementar validadores a nivel de campo y serializer.
- **DTOs (Data Transfer Objects)**: Separar los modelos de la base de datos de la representación API.

#### 5. Autenticación y Seguridad

- **JWT o OAuth2**: Usar tokens para autenticación.
- **Permisos granulares**: Definir permisos a nivel de vista y objeto.
- **Rate limiting**: Implementar limitación de peticiones para prevenir abusos.
- **CORS configurado correctamente**: Restringir a orígenes permitidos.
- **Datos sensibles**: No exponer datos sensibles en logs o respuestas API.

#### 6. Desempeño y Optimización

- **Select_related y Prefetch_related**: Optimizar consultas con relaciones.
- **Consultas eficientes**: Usar anotaciones y agregaciones para operaciones en la BD.
- **Caché**: Implementar caché para respuestas frecuentes y costosas.
- **Optimización de consultas N+1**: Evitar múltiples consultas al cargar objetos relacionados.
- **Task queues**: Usar Celery para tareas asíncronas y procesamiento en segundo plano.

#### 7. Python Eficiente

- **Type hints**: Usar anotaciones de tipo para mejorar la calidad del código.
- **Dataclasses o Pydantic**: Para estructuras de datos inmutables y validación.
- **f-strings**: Usar f-strings para formateo de cadenas.
- **List/Dict comprehensions**: Preferir sobre loops tradicionales cuando sea apropiado.
- **Context managers**: Usar `with` para recursos que necesitan liberación.
- **Funciones puras**: Evitar efectos secundarios en funciones cuando sea posible.
- **Linters y formatters**: Usar black, isort, flake8 para mantener código consistente.

#### 8. Testing

- **Pruebas unitarias**: Para funciones y métodos aislados.
- **Pruebas de integración**: Para verificar interacciones entre componentes.
- **Pruebas de API**: Para validar endpoints REST.
- **Fixtures y factories**: Usar para generar datos de prueba consistentes.
- **Mocking**: Para simular servicios externos y reducir dependencias.
- **Coverage**: Mantener cobertura de pruebas alta, especialmente en lógica crítica.

#### 9. Gestión de Dependencias

- **Entornos virtuales**: Usar venv o conda.
- **Requirements organizados**: Separar en base, dev, test, prod.
- **Versiones específicas**: Fijar versiones exactas de dependencias.
- **Actualización regular**: Mantener dependencias actualizadas para seguridad.

#### 10. Calidad de Código y CI/CD

- **Pre-commit hooks**: Verificar calidad de código antes de commits.
- **CI/CD pipeline**: Automatizar tests, linting, y despliegue.
- **Code reviews**: Establecer proceso de revisión de código.
- **Versionamiento semántico**: Para releases del API.

#### 11. Logging y Monitoreo

- **Logging estructurado**: Usar JSON para logs.
- **Niveles de log apropiados**: DEBUG, INFO, WARNING, ERROR, CRITICAL.
- **Contexto en logs**: Incluir información relevante como user_id, request_id.
- **Monitoreo de rendimiento**: Implementar APM (Application Performance Monitoring).

#### 12. Contenedorización y Despliegue

- **Docker**: Usar contenedores para entorno de desarrollo y producción.
- **Configuración basada en entorno**: Usar variables de entorno.
- **Stateless**: Diseñar la aplicación para ser stateless y escalable horizontalmente.
- **Health checks**: Implementar endpoints para verificar estado del servicio.

---

## Registro de Cambios

### Cambio #1: Evaluación de la Estructura Actual del Proyecto - 27/05/2025

**INICIO DE CAMBIO #1**

Después de revisar la estructura actual del proyecto, se puede observar lo siguiente:

- La aplicación tiene una estructura básica de Django con una app principal llamada `api`.
- Dentro de `api` hay varios subdirectorios que separan la lógica:
  - `logica`: Contiene lógica de importación de datos.
  - `management/commands`: Comandos personalizados de Django.
  - `migrations`: Migraciones de la base de datos.
  - `ml_models`: Modelos de machine learning.
  - `services`: Servicios con lógica de negocio.
  - `utils`: Utilidades y herramientas.

Áreas de mejora identificadas:
1. Falta una clara separación entre las capas de aplicación (repositorios, servicios, casos de uso).
2. No hay una separación clara por dominios de negocio.
3. Mezcla de responsabilidades en algunos módulos.
4. Falta documentación en código y docstrings.
5. No se aplican type hints de forma consistente.
6. Posible ausencia de tests unitarios y de integración.
7. No hay una estructura clara para manejo de excepciones.

Próximos cambios a implementar:
1. Reestructurar la organización de código según patrones de diseño recomendados.
2. Implementar type hints y docstrings.
3. Mejorar la separación de responsabilidades.
4. Implementar manejo de excepciones adecuado.
5. Configurar herramientas de calidad de código (black, isort, flake8).

**FIN DE CAMBIO #1**

### Cambio #2: Implementación del Patrón Repositorio - 27/05/2025

**INICIO DE CAMBIO #2**

Se ha implementado el patrón Repositorio para encapsular la lógica de acceso a datos. Este cambio separa claramente la responsabilidad de acceso a datos de la lógica de negocio, facilitando las pruebas unitarias y mejorando la mantenibilidad del código.

Acciones realizadas:
1. Creación del módulo `api/repositories/` para contener todas las clases de repositorio.
2. Implementación de `ActivoRepository` para encapsular operaciones CRUD de activos.
3. Implementación de `StockDataRepository` para encapsular operaciones relacionadas con datos históricos.
4. Adición de type hints y docstrings para mejorar la legibilidad y documentación del código.
5. Implementación de métodos específicos para diferentes consultas a la base de datos.

Beneficios:
- Separación clara de responsabilidades entre acceso a datos y lógica de negocio.
- Mejor organización del código según patrones de diseño establecidos.
- Mayor facilidad para escribir pruebas unitarias al poder simular (mock) los repositorios.
- Documentación en código que facilita el entendimiento y mantenimiento.

**FIN DE CAMBIO #2**

### Cambio #3: Mejora del Patrón Servicio - 27/05/2025

**INICIO DE CAMBIO #3**

Se ha refactorizado y mejorado el patrón Servicio para encapsular la lógica de negocio. Este cambio separa claramente la responsabilidad de la lógica de negocio de las vistas y repositorios, facilitando las pruebas unitarias y mejorando la organización del código.

Acciones realizadas:
1. Refactorización del servicio `ActivoService` para utilizar los repositorios creados.
2. Implementación de métodos CRUD y métodos específicos de negocio.
3. Creación del servicio `StockDataService` para manejar operaciones de datos históricos.
4. Adición de type hints y docstrings completos para mejorar la legibilidad y documentación.
5. Implementación de validaciones y manejo de errores.

Beneficios:
- Separación clara de responsabilidades entre servicios y repositorios.
- Centralización de la lógica de negocio en los servicios.
- Mejor organización del código según patrones de diseño establecidos.
- Mayor facilidad para escribir pruebas unitarias.
- Documentación en código que facilita el entendimiento y mantenimiento.

**FIN DE CAMBIO #3**

### Cambio #4: Mejora del Módulo de Utilidades - 27/05/2025

**INICIO DE CAMBIO #4**

Se ha refactorizado el módulo de utilidades para mejorar la documentación, tipado y organización del código. Este cambio mejora la calidad y mantenibilidad del código, además de facilitar su comprensión y uso.

Acciones realizadas:
1. Adición de docstrings detallados para todas las funciones.
2. Implementación de type hints para mejorar la verificación de tipos.
3. Adición de la función `calculate_percentage_change` para centralizar el cálculo de cambios porcentuales.
4. Mejora de la documentación de parámetros y valores de retorno.

Beneficios:
- Mejor documentación en código que facilita el entendimiento.
- Verificación de tipos en tiempo de desarrollo con type hints.
- Centralización de funciones de utilidad para evitar duplicación de código.
- Mayor claridad en el propósito y uso de cada función.

**FIN DE CAMBIO #4**

### Cambio #5: Implementación de Sistema de Excepciones Personalizadas - 27/05/2025

**INICIO DE CAMBIO #5**

Se ha implementado un sistema de excepciones personalizadas para mejorar el manejo de errores en la aplicación. Este cambio proporciona una forma consistente y estructurada de manejar y comunicar errores a través de toda la aplicación.

Acciones realizadas:
1. Creación del módulo `api/exceptions.py` con definiciones de excepciones personalizadas.
2. Implementación de una jerarquía de excepciones con `BaseAppException` como clase base.
3. Creación de excepciones específicas para diferentes tipos de errores:
   - `NotFoundException` para recursos no encontrados.
   - `ValidationException` para errores de validación.
   - `BusinessLogicException` para violaciones de reglas de negocio.
   - `ExternalServiceException` para errores en servicios externos.
4. Implementación del middleware `ExceptionMiddleware` para capturar y procesar excepciones.
5. Creación de un manejador personalizado de excepciones para Django REST Framework.

Beneficios:
- Manejo consistente de errores en toda la aplicación.
- Respuestas de error estructuradas y detalladas para la API.
- Mejor experiencia para los consumidores de la API al recibir errores informativos.
- Centralización del código de manejo de errores para facilitar mantenimiento.
- Mejor depuración y diagnóstico de problemas.

**FIN DE CAMBIO #5**

### Cambio #6: Refactorización de Vistas a Clases - 27/05/2025

**INICIO DE CAMBIO #6**

Se ha refactorizado el módulo de vistas para utilizar clases en lugar de funciones, aplicando principios de herencia y reutilización de código. Este cambio mejora la organización, mantenibilidad y legibilidad del código, además de facilitar la extensión futura de la API.

Acciones realizadas:
1. Creación de un módulo de vistas estructurado en carpetas según funcionalidad.
2. Implementación de clases base `BaseAPIView` y `CachedAPIView` para proporcionar funcionalidad común como:
   - Manejo consistente de respuestas de éxito y error
   - Soporte de caché integrado
   - Generación de claves de caché
3. Conversión de vistas basadas en funciones a vistas basadas en clases.
4. Reorganización de las URLs para agruparlas por funcionalidad.
5. Mejora de la documentación en código con docstrings y type hints en español.
6. Movimiento de lógica de negocio a los servicios correspondientes.

Beneficios:
- **Reutilización de código**: Las clases base proporcionan funcionalidad común para todas las vistas.
- **Separación de responsabilidades**: Cada vista tiene una única responsabilidad claramente definida.
- **Mayor consistencia**: Todas las vistas siguen el mismo patrón de manejo de errores y respuestas.
- **Mejor organización**: Las vistas están agrupadas por funcionalidad.
- **Caché integrado**: Implementación consistente de caché en todas las vistas.
- **Mejor documentación**: Docstrings detallados y type hints en español para facilitar el entendimiento.

Nueva estructura de vistas:
```
api/views/
  ├── __init__.py
  ├── base.py              # Clases base para todas las vistas
  ├── activo_views.py      # Vistas relacionadas con activos financieros
  ├── analytics_views.py   # Vistas relacionadas con análisis y métricas
  ├── user_views.py        # Vistas relacionadas con usuarios
  └── utility_views.py     # Vistas de utilidad (salud, fechas, etc.)
```

**FIN DE CAMBIO #6**

## Próximos Pasos

- Implementar pruebas unitarias para repositorios y servicios
- Configurar herramientas de calidad de código (black, isort, flake8)
- Implementar documentación API con drf-spectacular o drf-yasg
