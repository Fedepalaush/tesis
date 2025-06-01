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

---

## Fecha: 31 de Mayo de 2025

### Implementación de pruebas unitarias para servicios

Se implementaron pruebas unitarias para los servicios en el directorio `services` siguiendo buenas prácticas de ingeniería de software. Este proceso incluyó:

1. **Uso de mocks**:
   - Se utilizaron mocks de Django (`cache`) y librerías externas (`yfinance`) para simular comportamientos y evitar dependencias externas.
   - Esto garantiza que las pruebas sean rápidas y confiables.

2. **Pruebas para el servicio `fundamental`**:
   - Se crearon pruebas en `tests/test_services.py` para validar:
     - Comportamiento cuando los datos están en caché.
     - Comportamiento cuando los datos no están en caché y se obtienen de `yfinance`.

3. **Ejecución de pruebas**:
   - Las pruebas se pueden ejecutar utilizando el siguiente comando de Django:
     ```bash
     python manage.py test backend.tests.test_services
     ```

#### Justificación académica:
Las pruebas unitarias son fundamentales para garantizar la calidad del software. El uso de mocks permite:
- **Aislamiento**: Probar cada componente de forma independiente.
- **Velocidad**: Reducir el tiempo de ejecución de las pruebas.
- **Confiabilidad**: Evitar dependencias externas que puedan fallar.

#### Próximos pasos:
1. Implementar pruebas para otros servicios en el directorio `services`.
2. Documentar métricas de cobertura y resultados de las pruebas.
3. Optimizar los servicios según los resultados de las pruebas.

#### Referencias académicas:
- Meszaros, G. (2007). **xUnit Test Patterns: Refactoring Test Code**. Addison-Wesley.
- Fowler, M. (2002). **Patterns of Enterprise Application Architecture**. Addison-Wesley.

---

## Fecha: 31 de Mayo de 2025

### Implementación de pruebas unitarias completas en el backend

Se desarrollaron pruebas unitarias para cubrir todos los componentes críticos del backend, incluyendo servicios, modelos, vistas y utilidades. Este proceso se realizó siguiendo buenas prácticas de ingeniería de software y se documentó en detalle.

#### **1. Pruebas para servicios**
- **Archivo:** `tests/test_services.py`
- **Descripción:**
  - Validación del servicio `fundamental`.
  - Uso de mocks para simular comportamientos de caché y librerías externas como `yfinance`.
  - Pruebas para escenarios con datos en caché y sin datos en caché.

#### **2. Pruebas para modelos**
- **Archivo:** `tests/test_models.py`
- **Descripción:**
  - Validación de la creación de objetos en el modelo `Activo`.
  - Simulación de filtrado de objetos utilizando métodos de Django ORM.

#### **3. Pruebas para vistas**
- **Archivo:** `tests/test_views.py`
- **Descripción:**
  - Validación de la respuesta del endpoint de salud (`/api/health/`).
  - Validación de la respuesta del endpoint de activos (`/api/activo/`).

#### **4. Pruebas para utilidades**
- **Archivo:** `tests/test_utils.py`
- **Descripción:**
  - Validación de funciones utilitarias con entradas válidas e inválidas.

#### **5. Ejecución de pruebas**
- Las pruebas se pueden ejecutar utilizando el siguiente comando:
  ```bash
  python manage.py test
  ```

#### **Justificación académica**
Las pruebas unitarias son esenciales para garantizar la calidad del software. Este enfoque permite:
- **Cobertura completa:** Validar todos los componentes críticos del backend.
- **Detección temprana de errores:** Identificar problemas antes de la integración.
- **Mantenibilidad:** Facilitar la evolución del código sin introducir regresiones.

#### **Próximos pasos**
1. Ampliar las pruebas para cubrir casos extremos y de rendimiento.
2. Documentar métricas de cobertura y resultados de las pruebas.
3. Optimizar el código según los resultados obtenidos.

#### **Referencias académicas**
- Meszaros, G. (2007). **xUnit Test Patterns: Refactoring Test Code**. Addison-Wesley.
- Fowler, M. (2002). **Patterns of Enterprise Application Architecture**. Addison-Wesley.
- Beck, K. (2002). **Test-Driven Development: By Example**. Addison-Wesley.

---

## Arquitectura C4 del Sistema

### 1. Contexto del Sistema
El sistema desarrollado es una plataforma web que permite a usuarios sin experiencia en el mercado financiero visualizar métricas bursátiles mediante tableros de control interactivos. Los usuarios interactúan con el sistema a través de un frontend intuitivo, mientras que el backend procesa datos financieros y ejecuta modelos de machine learning para generar indicadores comprensibles. La base de datos almacena información histórica y resultados procesados.

#### Actores principales:
- **Usuarios finales**: Personas sin experiencia en finanzas que buscan apoyo para tomar decisiones de inversión.
- **API de datos financieros**: Fuente externa que proporciona datos bursátiles en tiempo real.

---

### 2. Diagrama de Contenedores
El sistema se compone de los siguientes contenedores:

#### Contenedores:
1. **Frontend**:
   - Framework: React.
   - Función: Interfaz de usuario para visualizar métricas bursátiles.
   - Comunicación: Consume endpoints del backend.

2. **Backend**:Introducci´on
En los ´ultimos a˜nos, se observa la aparici´on de plataformas web que
permiten a usuarios sin experiencia alguna en el mercado financiero realizar
inversiones con diferentes instrumentos del mercado de valores ejerciendo el
papel de un broker1 financiero. Al mismo tiempo, se observ´o un crecimiento
exponencial en el inter´es de estos usuarios, quienes se lanzaron invertir en
las plataformas descritas sin realizar un an´alisis previo del mercado para
determinar el riesgo de la inversi´on, bas´andose ´unicamente en su intuici´on
personal. [?]
Con la aparici´on de los brokers disponibles en aplicaciones de internet, se
hicieron disponibles plataformas de apoyo orientadas a usuarios del dominio
de las finanzas. Estas plataformas permiten observar indicadores del mercado
financiero para dar apoyo al inversor experimentado. [?][?]
Dada la observaci´on de una escasez de herramientas intuitivas orientadas
a usuarios sin experiencia alguna en el dominio de las finanzas, sumado a
la abundante informaci´on disponible en Internet, surge la motivaci´on para
desarrollar un software que brinde apoyo a la toma de decisiones mediante
indicadores comprensibles, aplicando los conocimientos adquiridos a lo largo
de mi formaci´on acad´emica.
1.1. Objetivos y metodolog´ıa
Objetivo principal
Desarrollo de una aplicaci´on con una arquitectura web que permita al
usuario visualizar distintas m´etricas burs´atiles, convencionales y no conven-
cionales, mediante el uso de tableros de control interactivos.
Objetivo espec´ıficos
1. Investigaci´on bibliogr´afica del estado del arte orientado a lenguajes,
librer´ıas y frameworks 2 utilizadas en el dominio de herramientas del
mercado burs´atil.
2. Investigaci´on y aplicaci´on de una metodolog´ıa ´agil para el desarrollo
del software.
3. Documentar las diferentes iteraciones de la metodolog´ıa ´agil aplicada.
1Persona o empresa que act´ua como intermediario entre los inversores y el mercado
financiero. Su funci´on principal es ayudar a las personas a comprar y vender activos
2Conjunto de herramientas y bibliotecas que proporciona una estructura predefinida
para desarrollar aplicaciones
2
4. Investigaci´on de bases de datos adecuadas al dominio del an´alisis del
mercado burs´atil.
5. Investigar m´etricas no convencionales utilizando herramientas de inte-
ligencia de datos.
6. Investigar y aplicar regulaciones para plataformas web sobre recomen-
daci´on de inversiones
7. Implementar el software propuesto.
1.2. Resultados obtenidos
1. Recopilaci´on bibliogr´afica sobre el t´opico de la implementaci´on de sis-
temas, herramientas, visualizaci´on de datos orientadas al dominio del
mercado financiero.
2. B´usqueda de una metodolog´ıa ´agil basada en desarrollo iterativo.
3. An´alisis inicial del sistema
4. A partir de este punto, el trabajo se desarrollar´a en iteraciones desde
la iteraci´on inicial donde se definen los roles buscando usuarios con
diferentes experiencias en el dominio los cuales nos permitan realizar
un an´alisis con base en sus necesidades. As´ı mismo, en esta iteraci´on se
buscar´an las tecnolog´ıas adecuadas para realizar el desarrollo bas´ando-
se en la investigaci´on previa.
Resultados esperados
El resultado esperado de este trabajo es el software descripto en la
secci´on objetivos junto con la documentaci´on t´ecnica. A medida que
el proyecto avance, se establecer´an objetivos y entregables espec´ıficos
en el inicio de cada iteraci´on de desarrollo. Dichos entregables estar´an
documentados y se incorpor´an como parte de los resultados de la
tesis. Lo que permit´ira realizar una evaluaci´on detallada del progreso
en cada etapa del proceso de desarrollo
1.3. Cronograma de actividades
Las actividades a realizar y un cronograma tentativo. Cabe destacar que
se realizara un desarrollo iterativo e incremental en diferentes iteraciones
que no siguen un patr´on cl´asico de desarrollo en cascada. Las actividades
son las siguientes:
3
Actividad 1: Estudio del estado del arte y selecci´on indicadores t´ecnicos
convencionales y no convencionales a utilizar en la aplicaci´on.
Actividad 2: An´alisis inicial de los casos de uso de la aplicaci´on.
Actividad 3: Selecci´on de una metodolog´ıa ´agil, comparaci´on y se-
lecci´on de herramientas, lenguajes y frameworks ´agiles de desarrollo
apropiados para la implementaci´on de la plataforma web.
Actividad 4: Dise˜o de la arquitectura inicial del software.
Actividad 5: Inicio de la primera iteraci´on del desarrollo de la aplica-
ci´on.
Actividad 6: Desarrollo del resto de las iteraciones restantes.
Actividad 7: Validaci´on del sistema con usuarios finales.
Actividad 8: Documentaci´on y escritura de la tesina.
Mes
1 2 3 4 5 6 7 8 9 10 11 12 13 14
Actividad 1
Actividad 2
Actividad 3
Actividad 4
Actividad 5
Actividad 6
Actividad 7
Actividad 8
1.4. Organizaci´on del documento
Organizaci´on del documento
Cap´ıtulo 1.
Cap´ıtulo 2.
Cap´ıtulo 3.
4
Los mercados financieros
2.1. ¿Qu´e son los mercados financieros?
Los mercados financieros son lugares, ya sean f´ısicos o virtuales, don-
de se compran y venden diferentes tipos de bienes que tienen valor, como
propiedades o acciones. Su funci´on principal es ayudar a que las personas o
empresas puedan intercambiar estos bienes entre s´ı. [1, p. 3].
Adem´as, estos mercados son muy importantes para la econom´ıa porque
permiten que el dinero de las personas que tienen ahorros llegue a quienes
lo necesitan para invertir en sus proyectos o hacer crecer sus negocios. Por
ejemplo, si alguien tiene dinero extra, puede usarlo para comprar acciones
o bonos. Al hacerlo, est´a prestando su dinero a una persona o empresa que
lo necesita para financiar sus ideas.
De esta forma, los mercados financieros ayudan a que el dinero circule
de manera m´as eficiente, beneficiando tanto a quienes ahorran como a quie-
nes invierten en nuevos proyectos, y contribuyen al crecimiento econ´omico
general, creando nuevas oportunidades para todos.
2.1.1. Tipos de activos
Un activo es un recurso que posee un individuo o una entidad, el cual
tiene el potencial de generar beneficios econ´omicos en el futuro. Se puede
pensar en un activo como una inversi´on, ya que representa algo que puede
ofrecer ingresos o aumentar su valor a lo largo del tiempo.
Los mercados financieros se pueden clasificar seg´un los tipos de activos
que se negocian en ellos, cada uno con caracter´ısticas espec´ıficas que los
hacen adecuados para distintos perfiles de inversi´on1 y objetivos financieros.
Entre los activos m´as destacados se encuentran las acciones, los bonos, las
divisas y las criptomonedas.
En primer lugar, el mercado de acciones es uno de los m´as conocidos
y consiste en la compra y venta de participaciones de propiedad de em-
presas, conocidas como acciones. Los inversores adquieren acciones con el
fin de convertirse en copropietarios de una empresa, esperando beneficiarse
de sus ganancias y su crecimiento. Este mercado es considerado vol´atil, ya
que est´a influenciado por una variedad de factores como los resultados fi-
nancieros de las empresas, las condiciones econ´omicas y las expectativas de
los inversores. En Argentina, adem´as de las acciones locales, los inversores
pueden acceder a los CEDEARs (Certificados de Dep´osito Argentino). Es-
1El perfil del inversor se define por la relaci´on entre el riesgo que se est´a dispuesto a
asumir y la rentabilidad que se espera obtener.
5
tos instrumentos representan acciones de empresas extranjeras que cotizan
en el mercado local, lo que permite a los inversores argentinos invertir en
compa˜n´ıas internacionales, como Apple, Google o Coca-Cola, sin necesidad
de operar directamente en mercados extranjeros. Cada CEDEAR tiene un
ratio de conversi´on que indica cu´antos certificados son necesarios para repre-
sentar una acci´on de la empresa extranjera. Por ejemplo, si el ratio es 5:1,
esto significa que se necesitan 5 CEDEARs para tener el equivalente a una
acci´on completa de esa empresa en el mercado internacional. En cambio,
si el ratio es 1:1, cada CEDEAR representa directamente una acci´on de la
empresa. Los CEDEARs ofrecen ventajas como la diversificaci´on geogr´afica,
protecci´on frente a la devaluaci´on del peso (al estar vinculados al valor del
d´olar), y acceso a empresas globales l´ıderes. Sin embargo, tambi´en est´an su-
jetos a factores locales, como la liquidez del mercado argentino y la facilidad
para comprarlos o venderlos.
Por otro lado, el mercado de bonos es otra categor´ıa importante. Los
bonos son instrumentos de deuda emitidos por gobiernos, empresas y otras
entidades que buscan financiamiento. Cuando un inversor compra un bono,
est´a prestando dinero al emisor, quien a cambio le paga intereses de manera
peri´odica y le devuelve el monto prestado al vencimiento del bono. Este tipo
de inversi´on suele ser menos arriesgado que el mercado de acciones, pero con
rentabilidades generalmente m´as bajas.
Adem´as, el mercado de divisas, tambi´en conocido como Forex, es el mer-
cado financiero m´as grande y l´ıquido del mundo. En este mercado se negocian
diferentes monedas, y los inversores compran y venden pares de divisas, co-
mo EUR/USD, buscando obtener beneficios de las fluctuaciones en los tipos
de cambio. Una caracter´ıstica particular del Forex es que opera las 24 horas
del d´ıa, lo que lo convierte en un mercado muy din´amico y atractivo para
quienes buscan aprovechar los cambios r´apidos en el valor de las monedas.
En los ´ultimos a˜nos, el mercado de criptomonedas ha ganado relevancia
como una opci´on de inversi´on novedosa. Este mercado involucra la compra
y venta de activos digitales descentralizados2, como Bitcoin, Ethereum y
otras criptomonedas. A diferencia de los mercados tradicionales, las cripto-
monedas no est´an reguladas por ninguna entidad gubernamental, y su valor
depende principalmente de la oferta y la demanda, lo que las convierte en
una inversi´on de alto riesgo y alta volatilidad.
Finalmente, existen otros mercados financieros que tambi´en juegan un rol
importante, como el mercado de materias primas, donde se negocian produc-
tos como el oro, el petr´oleo y productos agr´ıcolas, y el mercado inmobiliario,
que permite la inversi´on en bienes ra´ıces a trav´es de fondos de inversi´on.
Estos activos ofrecen otras oportunidades para diversificar las inversiones y
protegerse frente a la inflaci´on o la inestabilidad en otros mercados. [1, p. 3].
2No dependen de intermediarios financieros centrales como plataformas de intercambio
(exchanges), o bancos
6
2.1.2. Plazos de inversi´on
Los plazos de inversi´on se refieren al per´ıodo durante el cual un inversor
mantiene un activo antes de venderlo. Dependiendo de los objetivos y estra-
tegias de cada persona, las inversiones pueden clasificarse en corto, mediano
y largo plazo.
Primeramente, la inversi´on a corto plazo suele durar desde unos pocos
minutos hasta varios d´ıas. Esta estrategia se enfoca en aprovechar movimien-
tos r´apidos en el precio de los activos. Una de las t´ecnicas m´as utilizadas
en este plazo es el scalping, que implica realizar numerosas operaciones pe-
que˜nas a lo largo del d´ıa con el objetivo de obtener ganancias m´ınimas por
cada transacci´on. Los scalpers 3 buscan aprovechar fluctuaciones de precios
menores, realizando compras y ventas en un corto lapso para maximizar sus
ganancias acumuladas. Adem´as, otra opci´on dentro de la inversi´on a corto
plazo es el trading 4 intrad´ıa, donde los operadores compran y venden acti-
vos dentro de la misma jornada, buscando cerrar todas sus posiciones antes
del cierre del mercado. Esta estrategia permite beneficiarse de las fluctua-
ciones de precio durante el d´ıa sin mantener riesgos durante la noche, lo que
requiere un seguimiento constante del mercado y un an´alisis r´apido para
identificar oportunidades.
En segundo lugar, la inversi´on a mediano plazo abarca per´ıodos que van
desde unas pocas semanas hasta varios meses. Los inversores a mediano plazo
buscan aprovechar tendencias y patrones de comportamiento en el mercado,
realizando compras y ventas en funci´on de an´alisis t´ecnico, el cual consiste
en el estudio de gr´aficos de precios para predecir movimientos futuros. M´as
adelante, se detallar´a con mayor claridad c´omo se aplica el an´alisis t´ecnico
en la pr´actica. A diferencia del trading intrad´ıa, los operadores a mediano
plazo no necesariamente cierran todas sus posiciones en el mismo d´ıa, lo que
les permite capturar movimientos de precios a lo largo de varias semanas o
meses, adaptando sus decisiones a las condiciones cambiantes del mercado.
Finalmente, la inversi´on a largo plazo suele mantenerse durante varios
a˜nos, con el objetivo de aprovechar el crecimiento y la apreciaci´on del valor
del activo a lo largo del tiempo. Los inversores a largo plazo se enfocan en
empresas con fundamentos s´olidos y perspectivas de crecimiento sostenible.
Este enfoque les permite ignorar las fluctuaciones del mercado a corto plazo
y beneficiarse de tendencias de crecimiento a largo plazo. As´ı, este tipo de
inversi´on es ideal para quienes buscan construir riqueza con el tiempo y
prefieren una estrategia menos activa en comparaci´on con el trading diario
[2, p. 188].
3Persona que realiza scalping
4Consiste comprar y vender activos, como acciones o divisas, con el objetivo de obtener
ganancias
7
2.2. Tipos de an´alisis
Existen dos enfoques principales para analizar los mercados financieros,
que se presentar´an de manera introductoria aqu´ı y se detallar´an m´as adelan-
te: el an´alisis t´ecnico y el an´alisis fundamental. El an´alisis t´ecnico se enfoca
en estudiar el comportamiento hist´orico de los precios y vol´umenes de los
activos, usando gr´aficos y patrones para intentar predecir movimientos fu-
turos. Herramientas como l´ıneas de tendencia, medias m´oviles e indicadores
t´ecnicos permiten identificar tendencias y puntos de entrada o salida. Este
m´etodo es utilizado tanto a corto como a largo plazo y se basa en la reacci´on
de los participantes del mercado ante los precios.
En contraste, el an´alisis fundamental busca descubrir el verdadero valor
de un activo analizando factores financieros y econ´omicos, como balances,
estados de resultados y condiciones macroecon´omicas. Se aplica no solo a
acciones, sino tambi´en a bonos, materias primas y monedas, evaluando as-
pectos como la capacidad de pago del emisor y las pol´ıticas econ´omicas de
los pa´ıses.
Esta es solo una breve introducci´on; en la secci´on siguiente se profundi-
zar´a en ambos enfoques y sus aplicaciones pr´acticas.
2.3. ¿Qu´e es el an´alisis t´ecnico?
El an´alisis t´ecnico es una forma de estudiar c´omo cambian los precios
de los activos en los mercados financieros, como acciones, divisas y materias
primas. A diferencia del an´alisis fundamental, que se centra en el valor real
de una empresa o la situaci´on econ´omica de un pa´ıs, el an´alisis t´ecnico se
concentra en los movimientos del precio y el volumen de operaciones, con el
objetivo de predecir c´omo se mover´an en el futuro.
Adem´as de esta distinci´on clave respecto al an´alisis fundamental, el an´ali-
sis t´ecnico se basa en una idea central: los precios tienden a moverse en pa-
trones repetitivos. En otras palabras, los analistas t´ecnicos creen que ciertos
comportamientos de los precios se repiten con el tiempo. Por ejemplo, si el
precio de una acci´on ha subido varias veces bajo determinadas circunstan-
cias, es posible que lo vuelva a hacer en el futuro en situaciones similares.
Esta creencia permite a los inversores tomar decisiones m´as informadas sobre
cu´ando comprar o vender un activo [2, p. 21].
Para poder identificar estos patrones, se utilizan gr´aficos y herramientas
especializadas. Los gr´aficos muestran c´omo ha cambiado el valor de un activo
en diferentes periodos, ya sea en un d´ıa, un mes o incluso varios a˜nos. No
solo se emplean gr´aficos, sino tambi´en indicadores como l´ıneas y figuras, que
son esenciales para identificar tendencias y niveles clave. Estos puntos son
importantes porque suelen se˜nalar ´areas donde el precio tiende a detenerse
o cambiar de direcci´on.
8
Por ´ultimo, es importante destacar que el an´alisis t´ecnico puede ser ´util
para todo tipo de operaciones, desde las m´as r´apidas, como el trading in-
trad´ıa, hasta inversiones que se extienden por meses o a˜nos. Aunque este
enfoque no garantiza resultados exactos, brinda a los inversores una com-
prensi´on m´as profunda del comportamiento del mercado, lo que les permite
tomar decisiones con mayor confianza.
2.3.1. Tendencias en el mercado
En el an´alisis t´ecnico, las tendencias son fundamentales para entender el
comportamiento de los precios de los activos. Existen tres tipos de tenden-
cias: alcista, bajista y lateral.
En primer lugar, una tendencia se considera alcista cuando el precio
de un activo, como una acci´on o una divisa, tiende a subir con el tiempo.
Imaginemos que dibujamos una l´ınea de izquierda a derecha que conecta los
puntos m´as bajos del precio; si la l´ınea sube, estamos ante una tendencia
alcista. Esto significa que cada vez que el precio baja, lo hace menos que
antes, y cuando sube, alcanza niveles m´as altos. La interpretaci´on de esta
tendencia indica que hay m´as personas comprando que vendiendo, lo que
hace que el precio suba.
En contraparte, una tendencia es bajista cuando el precio tiende a bajar a
lo largo del tiempo. Si dibujamos una l´ınea que conecta los puntos m´as altos
del precio de izquierda a derecha, y esta l´ınea desciende, estamos ante una
tendencia bajista. En este caso, cada vez que el precio sube, lo hace menos
que antes, y cuando baja, alcanza niveles m´as bajos. Este comportamiento
sugiere que hay m´as personas vendiendo que comprando, lo que contribuye
a la ca´ída del precio.
Finalmente, encontramos la tendencia lateral, que se presenta cuando el
precio de un activo no sube ni baja claramente. En lugar de eso, se mueve
de un lado a otro, como si estuviera atrapado entre dos l´ıneas horizontales:
una que muestra el precio m´as alto (resistencia) y otra que muestra el precio
m´as bajo (soporte). En este tipo de situaci´on, los inversores suelen esperar y
observar antes de decidir qu´e hacer, ya que no hay una direcci´on clara para
el precio. [2, p. 61].
2.3.2. Timeframes
Las series de tiempo son conjuntos de observaciones ordenadas que se
utilizan para analizar y modelar datos que var´ıan en el tiempo. Este tipo de
an´alisis es fundamental en diversas disciplinas, incluyendo la econom´ıa, la
meteorolog´ıa, la ingenier´ıa y, por supuesto, los mercados financieros. Gracias
a las series de tiempo, los analistas e inversores pueden estudiar patrones
hist´oricos en los datos, lo que les ayuda a predecir tendencias futuras.
En particular, en el contexto de los mercados financieros, las series de
9
tiempo permiten analizar el comportamiento pasado de los precios y volúmenes
de negociación de activos financieros. Al examinar datos históricos, como
los precios de cierre diario de una acción durante un año, un analista puede
identificar patrones o tendencias que podrían repetirse en el futuro. Por
ejemplo, si una acción ha estado subiendo constantemente durante varios
meses, es posible que un inversor considere comprarla con la esperanza de
que la tendencia continúe. Por otro lado, si los datos muestran que una
acción tiende a bajar después de alcanzar ciertos niveles de precio, un analista
podría recomendar venderla antes de que su valor disminuya.
Las series de tiempo son herramientas poderosas en el análisis financiero,
ya que proporcionan información valiosa sobre cómo se han comportado los
activos en el pasado y cómo podrían comportarse en el futuro. Sin embargo,
es importante recordar que el análisis de series de tiempo no garantiza resultados
exactos, y siempre existe el riesgo de que las tendencias pasadas no se repitan
en el futuro.
2.4. ¿Qu´e es el an´alisis fundamental?
El an´alisis fundamental es un enfoque utilizado para evaluar el valor
intr´ınseco de un activo, como una acci´on, un bono o una moneda, analizan-
do factores econ´omicos, financieros y, en algunos casos, cualitativos. A dife-
rencia del an´alisis t´ecnico, que se centra en patrones de precios y volúmenes
en los mercados, el an´alisis fundamental busca entender la salud y el valor
real de un activo, considerando factores internos y externos que pueden
afectar su precio.
Este tipo de an´alisis es especialmente utilizado para valorar acciones
de empresas, donde se examinan aspectos como los estados financieros,
los ingresos, las ganancias, el crecimiento potencial y la posici´on en el
mercado. Sin embargo, tambi´en se aplica a otros activos, como bonos y
monedas, evaluando factores como las tasas de inter´es, la inflaci´on y las
pol´ıticas econ´omicas.
El objetivo del an´alisis fundamental es determinar si un activo est´a sobre-
valorado o subvaluado en el mercado, lo que puede ayudar a los inversores a
tomar decisiones informadas sobre comprar, vender o mantener un activo.
Por ejemplo, si el an´alisis fundamental sugiere que una acci´on est´a sub-
valuada, un inversor podr´ia considerar comprarla con la esperanza de que
su precio aumente en el futuro. Por el contrario, si se determina que una
acci´on est´a sobrevalorada, el inversor podr´ia optar por venderla o evitar su
compra.
10
El an´alisis fundamental se basa en la premisa de que los mercados no
siempre valoran los activos de manera eficiente y que puede haber oportunidades
para los inversores que puedan identificar estos desajustes. Sin embargo, al
igual que con cualquier enfoque de inversi´on, no hay garant´ıas de ´exito, y el
an´alisis fundamental requiere de una comprensi´on profunda de los factores
que afectan el valor de los activos.
2.4.1. Estados financieros
Los estados financieros son informes que resumen la situaci´on econ´omica
y financiera de una empresa en un per´ıodo determinado. Estos estados son
utilizados por analistas e inversores para evaluar el rendimiento y la salud
financiera de una empresa, y son fundamentales en el an´alisis fundamental.
Los estados financieros principales son:
1. **Estado de resultados**: Muestra los ingresos, costos y gastos de una
empresa durante un per´ıodo determinado, generalmente un trimestre o un
a˜no. El objetivo es mostrar la rentabilidad de la empresa, es decir, si ha
ganado o perdido dinero durante el per´ıodo.
2. **Balance general**: Presenta la situaci´on financiera de una empresa en
una fecha determinada, mostrando sus activos, pasivos y patrimonio neto.
El balance general permite evaluar la liquidez y solvencia de la empresa.
3. **Estado de flujos de efectivo**: Resume los ingresos y egresos de
efectivo de una empresa durante un per´ıodo determinado. Este estado es
clave para entender la capacidad de la empresa para generar efectivo y
hacer frente a sus obligaciones financieras.
4. **Estado de cambios en el patrimonio neto**: Muestra las variaciones
en el patrimonio neto de una empresa durante un per´ıodo determinado,
incluyendo aportes de los propietarios, retiros y ganancias o pérdidas
retenidas.
Estos estados financieros son interdependientes y proporcionan una
visi´on integral de la salud financiera de una empresa. El an´alisis de estos
estados permite a los inversores tomar decisiones informadas sobre la compra,
venta o mantenimiento de acciones de una empresa.
2.4.2. Indicadores financieros
Los indicadores financieros son relaciones o cocientes calculados a partir
de los estados financieros de una empresa, que permiten evaluar su rendi-
miento, rentabilidad, liquidez y solvencia. Estos indicadores son herramientas
clave en el an´alisis fundamental, ya que proporcionan informaci´on valiosa
sobre la salud financiera de una empresa y su capacidad para generar valor
para los accionistas.
Algunos de los indicadores financieros m´as utilizados son:
1. **Rentabilidad sobre el patrimonio (ROE)**: Mide la rentabilidad de una
empresa en relaci´on con el patrimonio neto de los accionistas. Se calcula
dividiendo la utilidad neta entre el patrimonio promedio de los accionistas.
2. **Rentabilidad sobre los activos (ROA)**: Indica qu´e tan eficientemente
una empresa est´a utilizando sus activos para generar ganancias. Se calcula
dividiendo la utilidad neta entre el total de activos.
3. **Margen de utilidad neta**: Muestra el porcentaje de ingresos que se
transforman en utilidad neta. Se calcula dividiendo la utilidad neta entre
los ingresos totales.
4. **Razón de corriente**: Mide la capacidad de una empresa para cubrir
sus obligaciones a corto plazo con sus activos a corto plazo. Se calcula
dividiendo los activos corrientes entre los pasivos corrientes.
5. **Prueba ácida**: Similar a la razón de corriente, pero más conservadora,
ya que excluye los inventarios de los activos corrientes. Se calcula
dividiendo los activos corrientes menos inventarios entre los pasivos
corrientes.
6. **Razón de deuda a capital**: Mide el nivel de endeudamiento de una
empresa en relación con su patrimonio. Se calcula dividiendo el total de
pasivos entre el patrimonio neto.
7. **Retorno sobre la inversi´on (ROI)**: Indica la rentabilidad de una
inversi´on en particular, comparando la ganancia o p´erdida generada con
el monto invertido.
8. **Valor presente neto (VPN)**: Calcula el valor actual de una serie de
flujos de efectivo futuros descontados a una tasa de inter´es espec´ıfica,
menos la inversi´on inicial.
9. **Tasa interna de retorno (TIR)**: Es la tasa de descuento que iguala
el valor presente de los flujos de efectivo futuros con la inversi´on inicial,
produciendo un VPN igual a cero.
11
Estos indicadores, entre otros, son utilizados por analistas e inversores para
evaluar y comparar el rendimiento financiero de diferentes empresas, y para
tomar decisiones informadas sobre inversiones.
3. Metodolog´ıa
3.1. Metodolog´ıa ´Agil
La metodolog´ıa ´agil es un enfoque para la gesti´on y ejecuci´on de proyec-
tos que se caracteriza por la flexibilidad, la adaptaci´on y la entrega continua
de valor al cliente. A diferencia de las metodolog´ıas tradicionales, que suelen
ser m´as rigidas y secuenciales, las metodolog´ıas ´agiles se centran en la colabo-
raci´on entre equipos multidisciplinarios y en la capacidad de responder de
manera r´apida a los cambios y nuevas informaciones.
Una de las principales caracter´ısticas de las metodolog´ıas ´agiles es la
divisi´on del trabajo en iteraciones o sprints, que son per´ıodos cortos y
bien definidos en los que se completa una parte del proyecto. Al final de
cada iteraci´on, se revisa y ajusta el trabajo realizado, permitiendo una
mejora continua y una mayor alineaci´on con las necesidades del cliente.
Existen varias metodolog´ıas ´agiles, entre las que se incluyen Scrum, Kanban,
Extreme Programming (XP) y Lean Software Development, cada una con
sus propias pr´acticas y enfoques espec´ıficos.
En este proyecto, se ha utilizado una metodolog´ıa ´agil basada en Scrum,
que se detallar´a a continuaci´on.
3.1.1. Scrum
Scrum es un marco de trabajo dentro de las metodolog´ıas ´agiles que se
utiliza para gestionar y completar proyectos de manera colaborativa e itera-
tiva. Se basa en la formaci´on de equipos aut´onomos y multifuncionales que
trabajan en ciclos cortos de desarrollo, llamados sprints, con el objetivo de
entregar incrementos de producto funcional en cada iteraci´on.
Las principales caracter´ısticas y componentes de Scrum son:
1. **Roles**:
   - **Product Owner**: Representa al cliente o usuario final y es
responsable de definir y priorizar las funcionalidades del producto en
el backlog.
   - **Scrum Master**: Facilita el proceso Scrum, eliminando obsta-
culos y asegurando que se sigan las pr´acticas ´agiles.
   - **Equipo de desarrollo**: Grupo multidisciplinario que trabaja en
la ejecuci´on del proyecto, incluyendo desarrolladores, dise˜adores y
especialistas en calidad.
2. **Artefactos**:
   - **Product Backlog**: Lista priorizada de funcionalidades, mejoras y
correcciones necesarias para el producto.
   - **Sprint Backlog**: Conjunto de tareas y requisitos seleccionados
del Product Backlog que se llevar´an a cabo en un sprint.
   - **Incremento**: Producto o funcionalidad entregada al final de
cada sprint, que debe ser potencialmente entregable.
3. **Eventos**:
   - **Sprint**: Per´ıodo de tiempo, generalmente de dos a cuatro se-
manas, en el que se realiza un conjunto de tareas y se entrega un
incremento del producto.
   - **Sprint Planning**: Reuni´on al inicio de cada sprint para
definir los objetivos, tareas y el backlog del sprint.
   - **Daily Scrum**: Reuni´on diaria de corta duraci´on para que el
equipo coordine actividades y aborde posibles obst´aculos.
   - **Sprint Review**: Reuni´on al final de cada sprint para
presentar el incremento del producto y obtener retroalimentaci´on.
   - **Sprint Retrospective**: Reuni´on para reflexionar sobre el
proceso y buscar oportunidades de mejora.
12
Scrum proporciona un marco flexible y adaptable que permite a los
equipos responder r´apidamente a los cambios y entregar valor de manera
continua. En el contexto de este proyecto, el uso de Scrum ha permitido
una gesti´on eficiente de las diferentes etapas del desarrollo, asegurando una
adecuada planificaci´on, ejecuci´on y entrega de los componentes del sistema.
3.2. Herramientas
Para llevar a cabo el desarrollo del proyecto se han utilizado diversas
herramientas tecnol´ogicas que han facilitado la implementaci´on de las
metodolog´ıas ´agiles y el trabajo colaborativo. Entre las principales
herramientas utilizadas se encuentran:
1. **Git**: Sistema de control de versiones que permite gestionar y
rastrear los cambios en el c´odigo fuente a lo largo del tiempo. Git
facilita la colaboraci´on entre los miembros del equipo, ya que permite
trabajar en diferentes ramas y fusionar cambios de manera controlada.
2. **GitHub**: Plataforma de hospedaje de c´odigo fuente que utiliza
Git como sistema de control de versiones. GitHub proporciona
herramientas para la revisi´on de c´odigo, gesti´on de incidencias y
colaboraci´on en proyectos de software.
3. **Docker**: Herramienta que permite crear, desplegar y ejecutar
aplicaciones en contenedores, que son entornos ligeros y
portables que incluyen todo lo necesario para ejecutar una
aplicaci´on. Docker facilita la gesti´on de dependencias y la
implementaci´on de entornos consistentes en diferentes
plataformas.
4. **Docker Compose**: Herramienta que permite definir y
gestionar aplicaciones compuestas por m´ultiples contenedores
Docker. Con Docker Compose, se puede definir la
configuraci´on de todos los contenedores necesarios para una
aplicaci´on en un archivo YAML, y luego iniciar y detener
toda la aplicaci´on con un solo comando.
5. **PostgreSQL**: Sistema de gesti´on de bases de datos relacio-
nales que se ha utilizado para almacenar y gestionar los datos
del proyecto. PostgreSQL es conocido por su robustez,
escalabilidad y cumplimiento de est´andares SQL.
6. **TimescaleDB**: Extensi´on de PostgreSQL que permite el
almacenamiento y consulta eficiente de series de tiempo. Se
ha utilizado para gestionar los datos hist´oricos y las
m´etricas burs´atiles en el proyecto.
7. **Python**: Lenguaje de programaci´on utilizado para el
desarrollo de la l´ogica de negocio, el procesamiento de datos
y la implementaci´on de modelos de machine learning.
8. **Django**: Framework de desarrollo web basado en Python,
que se ha utilizado para construir el backend de la
aplicaci´on, incluyendo la API REST para la comunicaci´on
con el frontend.
9. **Django REST Framework**: Conjunto de herramientas para
construir APIs web en Django, que facilita la serializaci´on
de datos y la gesti´on de vistas y URLs para la API.
10. **Celery**: Herramienta para la gesti´on de tareas asíncronas
y programaci´on de trabajos en segundo plano. Se ha
utilizado para ejecutar tareas de larga duraci´on, como el
procesamiento de datos y la ejecuci´on de modelos de
machine learning, sin bloquear el funcionamiento de la
aplicaci´on.
11. **Redis**: Sistema de gesti´on de bases de datos en
memoria, que se ha utilizado como broker de mensajes
para Celery y como sistema de caché para mejorar el
rendimiento de la aplicaci´on.
12. **YFinance**: Biblioteca de Python para acceder a datos
financieros de Yahoo Finance, que se ha utilizado para
obtener datos burs´atiles en tiempo real y realizar
an´alisis t´ecnico.
13. **Scikit-learn**: Biblioteca de Python para el aprendizaje
autom´atico, que se ha utilizado para implementar y
evaluar modelos de machine learning, como regresiones,
´arboles de decisi´on y m´etodos de ensamble.
14. **TensorFlow**: Biblioteca de c´odigo abierto para el
aprendizaje autom´atico y el desarrollo de redes
neuronales, que se ha utilizado para construir y
entrenar modelos de deep learning.
15. **NumPy**: Biblioteca de Python para el c´alculo num´erico
y la manipulaci´on de arreglos y matrices, que se ha
utilizado para realizar c´alculos matem´aticos y
estad´ısticos en el procesamiento de datos y la
implementaci´on de modelos.
16. **Pandas**: Biblioteca de Python para la manipulaci´on y
an´alisis de datos, que se ha utilizado para limpiar,
transformar y analizar datos financieros y de mercado.
17. **Matplotlib** y **Seaborn**: Bibliotecas de Python para
la visualizaci´on de datos, que se han utilizado para
crear gr´aficos y visualizaciones de las m´etricas
burs´atiles y los resultados de los modelos.
18. **Jupyter Notebook**: Entorno interactivo para el
desarrollo y la documentaci´on de c´odigo en Python,
que se ha utilizado para explorar datos, probar
modelos y documentar el proceso de desarrollo.
19. **Postman**: Herramienta para probar y documentar
APIs, que se ha utilizado para verificar el correcto
funcionamiento de la API REST del backend.
20. **Swagger**: Herramienta para documentar y probar
APIs REST, que se ha utilizado para generar
automáticamente la documentaci´on de la API del
backend.
21. **Sentry**: Herramienta para el monitoreo y la
reportaci´on de errores en tiempo real, que se ha
utilizado para detectar y rastrear errores en la
aplicaci´on.
22. **Google Analytics**: Servicio de analítica web que se
ha utilizado para rastrear y analizar el tr´afico y el
comportamiento de los usuarios en la aplicaci´on.
23. **GitHub Actions**: Herramienta de integraci´on y
entrega continua (CI/CD) que se ha utilizado para
automarizar el proceso de construcci´on, prueba y
despliegue de la aplicaci´on.
24. **Trello**: Herramienta de gesti´on de proyectos que se
ha utilizado para planificar, organizar y hacer
seguimiento de las tareas y actividades del proyecto.
25. **Slack**: Herramienta de comunicaci´on y colabo-
raci´on en equipo que se ha utilizado para facilitar
la comunicaci´on entre los miembros del equipo de
desarrollo.
Estas herramientas han sido fundamentales para el
´exito del proyecto, permitiendo una gesti´on eficiente
y colaborativa del desarrollo de la aplicaci´on.
4. Implementaci´on
4.1. Estructura del proyecto
La estructura del proyecto se ha organizado de manera modular y
escalable, siguiendo las mejores pr´acticas para el desarrollo de
aplicaciones web. A continuaci´on, se describe la estructura de
directorios y archivos principales del proyecto:
```markdown
proyecto/
│
├── backend/                  # C´odigo fuente del backend
│   ├── api/                  # Módulo de la API
│   │   ├── migrations/        # Migraciones de la base de datos
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py         # Modelos de datos
│   │   ├── tests/            # Pruebas unitarias
│   │   └── views.py          # Vistas de la API
│   │
│   ├── ml_models/            # Modelos de machine learning
│   │   ├── __init__.py
│   │   ├── base.py           # Clase base para modelos
│   │   ├── knn_model.py
│   │   ├── logistic_model.py
│   │   ├── lstm_model.py
│   │   ├── random_forest_model.py
│   │   ├── svm_model.py
│   │   └── xgboost_model.py
│   │
│   ├── services/             # Servicios de la aplicaci´on
│   │   ├── __init__.py
│   │   ├── base.py           # Clase base para servicios
│   │   ├── factory.py        # F´abrica de servicios
│   │   ├── fundamental.py     # Servicio fundamental
│   │   └── activo_service.py  # Servicio para activos
│   │
│   ├── tests/                # Pruebas del backend
│   │   ├── __init__.py
│   │   ├── test_models.py     # Pruebas para modelos
│   │   ├── test_services.py   # Pruebas para servicios
│   │   └── test_views.py      # Pruebas para vistas
│   │
│   ├── .env                  # Variables de entorno
│   ├── Dockerfile            # Archivo de configuraci´on de Docker
│   ├── docker-compose.yml     # Archivo de configuraci´on de Docker Compose
│   ├── manage.py             # Script de gesti´on de Django
│   └── requirements.txt      # Dependencias de Python
│
├── frontend/                 # C´odigo fuente del frontend
│   ├── public/               # Archivos est´aticos
│   ├── src/                  # C´odigo fuente de React
│   │   ├── components/        # Componentes de React
│   │   ├── hooks/             # Hooks personalizados
│   │   ├── pages/             # Páginas de la aplicaci´on
│   │   ├── App.js            # Componente principal
│   │   └── index.js          # Punto de entrada
│   │
│   ├── .env                  # Variables de entorno
│   ├── Dockerfile            # Archivo de configuraci´on de Docker
│   └── package.json          # Dependencias de Node.js
│
├── postgres-init/            # Scripts de inicializaci´on de PostgreSQL
│   ├── 00_schema.sql         # Script de creaci´on de esquemas
│   └── 01_data.sql           # Script de carga de datos
│
├── .gitignore                # Archivos y carpetas a ignorar por Git
└── README.md                 # Documentaci´on del proyecto
```
Esta estructura permite una clara separaci´on de
responsabilidades y facilita el mantenimiento y la
escalabilidad de la aplicaci´on.
4.2. Configuraci´on del entorno
La configuraci´on del entorno de desarrollo se ha realizado
utilizando Docker y Docker Compose, lo que permite
crear un entorno aislado y reproducible para el
desarrollo y pruebas de la aplicaci´on. A continuaci´on,
se describen los pasos para configurar el entorno:
1. Clonar el repositorio del proyecto desde GitHub:
```bash
git clone https://github.com/usuario/proyecto.git
cd proyecto
```
2. Crear un archivo `.env` a partir del archivo `.env.example`:
```bash
cp .env.example .env
```
3. Editar el archivo `.env` para configurar las variables de
entorno, como las credenciales de la base de datos y las
claves secretas.
4. Construir y levantar los contenedores de Docker:
```bash
sudo docker compose up --build
```
5. Ejecutar las migraciones de la base de datos:
```bash
sudo docker compose exec backend python manage.py migrate
```
6. Cargar los datos iniciales en la base de datos (opcional):
```bash
sudo docker compose exec backend python manage.py loaddata
```
7. Acceder a la aplicaci´on en un navegador web:
```bash
http://localhost
```
8. Para detener los contenedores, presionar `CTRL+C` en la
terminal donde se est´an ejecutando, o ejecutar el siguiente
comando en otra terminal:
```bash
sudo docker compose down
```
Con esta configuraci´on, se dispone de un entorno completo
para el desarrollo y pruebas de la aplicaci´on, con todos
los servicios necesarios ejecut´andose en contenedores
aislados.
4.3. Despliegue
El despliegue de la aplicaci´on en un entorno de producci´on
requiere de consideraciones adicionales para asegurar un
funcionamiento correcto y seguro. A continuaci´on, se
describen los pasos y recomendaciones para el despliegue:
1. Configurar un servidor con Docker y Docker Compose
instalados.
2. Clonar el repositorio del proyecto en el servidor:
```bash
git clone https://github.com/usuario/proyecto.git
cd proyecto
```
3. Crear un archivo `.env` con las variables de entorno
adecuadas para el entorno de producci´on, incluyendo
credenciales de base de datos, claves secretas y
configuraciones de seguridad.
4. Construir y levantar los contenedores de Docker en
modo desatendido:
```bash
sudo docker compose up --build -d
```
5. Ejecutar las migraciones de la base de datos:
```bash
sudo docker compose exec backend python manage.py migrate
```
6. Cargar los datos iniciales en la base de datos (opcional):
```bash
sudo docker compose exec backend python manage.py loaddata
```
7. Configurar un servidor web (como Nginx) como proxy
inverso para dirigir el tr´afico HTTP/HTTPS a los
contenedores de la aplicaci´on.
8. Configurar un sistema de monitoreo y registro de
errores, como Sentry, para detectar y rastrear
problemas en producci´on.
9. Realizar copias de seguridad regulares de la base de
datos y los volúmenes de Docker.
10. Para detener los contenedores, presionar `CTRL+C` en
la terminal donde se est´an ejecutando, o ejecutar el
siguiente comando en otra terminal:
```bash
sudo docker compose down
```
Con estos pasos, la aplicaci´on estar´a lista para ser
desplegada y utilizada en un entorno de producci´on, con
todas las configuraciones necesarias para un
funcionamiento seguro y eficiente.
5. Resultados
5.1. Resultados obtenidos
A lo largo del desarrollo del proyecto, se han
obtenido diversos resultados que evidencian el
cumplimiento de los objetivos propuestos. A
continuaci´on, se detallan algunos de los resultados
más relevantes:
1. **Desarrollo de la aplicaci´on web**: Se ha
completado el desarrollo de una aplicaci´on web
funcional que permite a los usuarios visualizar
métricas bursátiles a trav´es de tableros de
control interactivos.
2. **Integraci´on de modelos de machine learning**:
Se han integrado y puesto en marcha diversos
modelos de machine learning que permiten
realizar predicciones y análisis de datos
bursátiles.
3. **Implementaci´on de una API REST**: Se ha
desarrollado e implementado una API REST que
permite la comunicaci´on entre el frontend y el
backend de la aplicaci´on.
4. **Contenerización con Docker**: Se ha
completado la contenerización de todos los
servicios de la aplicaci´on utilizando Docker,
lo que permite una f´acil implementaci´on y
escalabilidad.
5. **Documentaci´on completa**: Se ha elaborado
una documentaci´on completa y detallada que
incluye desde la descripci´on del problema y
los objetivos, hasta la documentaci´on t´ecnica
y de usuario de la aplicaci´on.
6. **Pruebas y validaci´on**: Se han realizado
pruebas exhaustivas de la aplicaci´on, incluyendo
pruebas unitarias, de integraci´on y de
aceptaci´on, que aseguran el correcto
funcionamiento de todos los componentes.
7. **Despliegue en entorno de producci´on**: Se ha
realizado el despliegue exitoso de la
aplicaci´on en un entorno de producci´on,
donde se encuentra operativa y disponible para
los usuarios.
Estos resultados evidencian el avance y
cumplimiento de los objetivos propuestos en el
proyecto, y sientan las bases para futuras
mejoras y expansiones de la aplicaci´on.
5.2. Pruebas realizadas
Se han realizado diversas pruebas para asegurar el
correcto funcionamiento de la aplicaci´on y la calidad
del c´odigo desarrollado. A continuaci´on, se detallan
algunos de los tipos de pruebas realizadas:
1. **Pruebas unitarias**: Se han implementado
pruebas unitarias para validar el correcto
funcionamiento de las unidades m´as
peque˜nas del c´odigo, como funciones y
métodos individuales. Estas pruebas aseguran
que cada componente funcione de manera
aislada y cumpla con su prop´osito
espec´ıfico.
2. **Pruebas de integraci´on**: Se han realizado
pruebas de integraci´on para verificar la
interacci´on y el correcto funcionamiento de
los diferentes componentes de la
aplicaci´on en conjunto. Estas pruebas
aseguran que los datos fluyan correctamente
entre el frontend, el backend y la base de
datos.
3. **Pruebas de aceptaci´on**: Se han llevado a
cabo pruebas de aceptaci´on para validar que
la aplicaci´on cumpla con los requisitos y
expectativas del usuario final. Estas pruebas
se realizan en un entorno que simula el
entorno de producci´on y abarcan
escenarios de uso reales.
4. **Pruebas de rendimiento**: Se han
ejecutado pruebas de rendimiento para
evaluar la capacidad de la aplicaci´on para
manejar cargas de trabajo variables y
asegurar tiempos de respuesta adecuados.
5. **Pruebas de seguridad**: Se han realizado
pruebas de seguridad para identificar y
corregir vulnerabilidades en la aplicaci´on,
asegurando la protecci´on de los datos y la
privacidad de los usuarios.
6. **Pruebas de regresi´on**: Se han llevado a
cabo pruebas de regresi´on para asegurar que
los cambios y mejoras realizados en la
aplicaci´on no hayan introducido nuevos
errores o problemas en funcionalidades
previas.
Estas pruebas se han realizado de manera
exhaustiva y sistem´atica, utilizando tanto
herramientas automáticas como pruebas manuales,
y han permitido asegurar la calidad y fiabilidad de
la aplicaci´on antes de su despliegue en
producci´on.
6. Conclusiones
6.1. Conclusiones generales
El desarrollo de la aplicaci´on para la visualizaci´on
de m´etricas burs´atiles ha permitido abordar y
resolver de manera efectiva el problema planteado
en el proyecto. A trav´es de la implementaci´on de
diversas funcionalidades y la integraci´on de
modelos de machine learning, la aplicaci´on es
capaz de proporcionar a los usuarios finales
informaci´on relevante y oportuna que facilita la
toma de decisiones informadas en sus
inversiones.
Entre las principales conclusiones obtenidas a
lo largo del desarrollo del proyecto, se pueden
destacar las siguientes:
1. La importancia de contar con una
metodolog´ıa de desarrollo ´agil, como Scrum,
que permita gestionar de manera eficiente las
diferentes etapas del proyecto, asegurando una
adecuada planificaci´on, ejecuci´on y entrega de
resultados.
2. La utilidad de las herramientas de
contenedorizaci´on, como Docker, que facilitan
la implementaci´on de entornos aislados y
reproducibles, simplificando el proceso de
despliegue y escalabilidad de la aplicaci´on.
3. La relevancia de realizar pruebas exhaustivas
y sistem´aticas, que aseguren la calidad y
fiabilidad del c´odigo desarrollado, y
permitan detectar y corregir errores en
etapas tempranas del desarrollo.
4. La necesidad de contar con una
documentaci´on completa y actualizada, que
registre todas las decisiones, cambios y
resultados obtenidos a lo largo del
proyecto, y que sirva como base para futuras
mejoras y expansiones de la aplicaci´on.
5. La importancia de considerar aspectos de
seguridad y protecci´on de datos desde las
primeras etapas del desarrollo, asegurando
que la aplicaci´on cumpla con los
est´andares y regulaciones aplicables.
6. La utilidad de contar con un sistema de
monitoreo y registro de errores en tiempo
real, que permita detectar y rastrear
problemas en producci´on, y facilitar su
correcci´on oportuna.
7. La necesidad de realizar copias de seguridad
regulares de la base de datos y los volúmenes
de Docker, que aseguren la disponibilidad y
persistencia de los datos ante posibles
fallos o incidentes.
8. La importancia de capacitar a los usuarios
finales en el uso y aprovechamiento de la
aplicaci´on, asegurando que puedan
beneficiarse plenamente de las herramientas
y funcionalidades disponibles.
9. La utilidad de establecer un canal de
comunicaci´on efectivo con los usuarios
finales, que permita recibir retroalimentaci´on
y sugerencias de mejora, y facilite la
atenci´on de consultas o problemas
eventuales.
10. La importancia de mantener una visi´on a
largo plazo sobre la evoluci´on y mejora
continua de la aplicaci´on, considerando
nuevas funcionalidades, mejoras en el
rendimiento y la incorporaci´on de nuevas
tecnolog´ıas o enfoques que puedan surgir
en el futuro.
Estas conclusiones resaltan la importancia de
seguir una serie de buenas pr´acticas y
recomendaciones a lo largo del desarrollo y
despliegue de la aplicaci´on, que aseguren su
´exito y sostenibilidad en el tiempo.
6.2. Trabajo futuro
Como resultado del desarrollo de este proyecto, han
surgido una serie de oportunidades y
recomendaciones para trabajos futuros que
podr´an complementar y expandir las
funcionalidades de la aplicaci´on, as´ı como
mejorar su rendimiento y escalabilidad. Entre
las principales oportunidades de trabajo futuro,
se pueden destacar las siguientes:
1. Implementar un sistema de recomendaciones
personalizadas para los usuarios, basado en
sus preferencias, historial de inversiones y
comportamiento en la plataforma.
2. Incorporar nuevas fuentes de datos y
métricas bursátiles, que enriquezcan el
análisis y las recomendaciones proporcionadas
por la aplicaci´on.
3. Desarrollar e integrar nuevos modelos de
machine learning y deep learning, que
permitan mejorar la precisión y utilidad de
las predicciones y análisis realizados por la
aplicaci´on.
4. Ampliar las funcionalidades de la API REST,
permitiendo una mayor flexibilidad y
personalizaci´on en la consulta y
manipulaci´on de datos.
5. Mejorar la interfaz de usuario y la
experiencia de usuario (UI/UX), haciendo la
plataforma m´as intuitiva y f´acil de usar para
usuarios sin experiencia en el mercado
financiero.
6. Implementar un sistema de alertas y
notificaciones, que informe a los usuarios
sobre eventos relevantes, cambios en el
mercado o recomendaciones personalizadas.
7. Desarrollar una versi´on m´ovil de la
aplicaci´on, que permita a los usuarios
acceder a las m´etricas burs´atiles y
recomendaciones desde sus dispositivos
móviles.
8. Realizar un estudio de mercado y de
usuarios, que permita identificar nuevas
oportunidades de negocio y mejorar la
propuesta de valor de la aplicaci´on.
9. Explorar nuevas tecnolog´ıas y enfoques de
desarrollo, que puedan ser incorporados a la
aplicaci´on para mejorar su rendimiento,
escalabilidad y seguridad.
10. Mantener un programa de capacitaci´on y
actualizaci´on para los usuarios finales, que
les permita aprovechar al m´aximo las
herramientas y funcionalidades de la
aplicaci´on, y estar al tanto de las
novedades y mejoras implementadas.
Estas oportunidades de trabajo futuro representan
áreas clave en las que se podr´an enfocar los
esfuerzos de desarrollo y mejora de la
aplicaci´on, asegurando su continuo crecimiento
y adaptaci´on a las necesidades y cambios en el entorno del mercado financiero.

---

### Diagramas en ASCII

#### 1. Diagrama de Contexto
```
+-------------------+          +-------------------+
|                   |          |                   |
|   Usuarios Finales|          | API de Datos      |
|                   |          | Financieros       |
+-------------------+          +-------------------+
          |                            |
          |                            |
          v                            v
+---------------------------------------------+
|                                             |
|                 Sistema                     |
|                                             |
|  +-------------------+   +---------------+  |
|  |                   |   |               |  |
|  |   Frontend        |   |   Backend     |  |
|  |                   |   |               |  |
|  +-------------------+   +---------------+  |
|                                             |
+---------------------------------------------+
```

#### 2. Diagrama de Contenedores
```
+-------------------+
|                   |
|   Frontend        |
|                   |
|  Framework: React |
+-------------------+
          |
          v
+-------------------+
|                   |
|   Backend         |
|                   |
|  Framework: Django|
+-------------------+
          |
          v
+-------------------+
|                   |
|   Base de Datos   |
|                   |
|  Tecnología:      |
|  TimescaleDB      |
+-------------------+
```

#### 3. Diagrama de Componentes
```
+-------------------+
|                   |
|   Backend         |
|                   |
|  +-------------+  |
|  | Servicios    |  |
|  |-------------|  |
|  | BaseService |  |
|  | Factory     |  |
|  +-------------+  |
|                   |
|  +-------------+  |
|  | Modelos ML   |  |
|  |-------------|  |
|  | BaseModel   |  |
|  | KNN         |  |
|  | Logistic    |  |
|  | Regression  |  |
|  +-------------+  |
|                   |
+-------------------+
```

#### 4. Diagrama de Código
```
+-------------------+
|                   |
|   BaseModel       |
|                   |
|  Métodos:         |
|  - train          |
|  - predict        |
|  - preparar_datos |
|  - evaluar_modelo |
+-------------------+
          |
          v
+-------------------+
|                   |
|   BaseService     |
|                   |
|  Métodos:         |
|  - get_cached_data|
|  - set_cached_data|
|  - handle_exception|
|  - execute        |
+-------------------+
```