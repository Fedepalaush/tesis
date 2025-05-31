# Plan de mejoras para el frontend

## 1. Estado global y reactividad
- [x] Migrar el manejo de tickers a React Context para asegurar reactividad en toda la app.
- [x] Eliminar el uso de variables globales no reactivas como `tickersBM` en todos los componentes.
- [ ] Revisar otros datos globales (por ejemplo, usuario, configuración) y considerar su migración a Context o a una librería de estado.

## 2. Organización y modularidad
- [ ] Revisar y modularizar componentes grandes (como `AnalisisActivo.jsx`) en subcomponentes más pequeños y reutilizables.
- [ ] Documentar la estructura de carpetas y convenciones de nombres en el README del frontend.

## 3. Manejo de errores y UX
- [ ] Unificar el manejo de errores en la UI para mostrar mensajes claros y consistentes.
- [ ] Agregar loaders/spinners globales para mejorar la experiencia de usuario durante cargas de datos.
- [ ] Mejorar los mensajes de error para el usuario final (no solo logs en consola).

## 4. Acceso a la API y configuración
- [ ] Centralizar la configuración de endpoints (por ejemplo, baseURL de axios) en un solo archivo.
- [ ] Permitir cambiar la URL del backend fácilmente según entorno (dev, prod, etc).

## 5. Accesibilidad y diseño
- [ ] Revisar el uso de colores y contraste para accesibilidad.
- [ ] Agregar atributos ARIA y roles donde sea necesario.
- [ ] Mejorar la navegación con teclado.

## 6. Pruebas y calidad
- [ ] Agregar tests unitarios para componentes clave.
- [ ] Agregar tests de integración para flujos principales.
- [ ] Configurar herramientas de linting y formateo automático (ESLint, Prettier).

## 7. Documentación
- [ ] Documentar el uso de Context y patrones de estado global en `front.md`.
- [ ] Agregar ejemplos de uso de hooks y componentes personalizados.

---

**Prioridad recomendada:**
1. Estado global y reactividad
2. Manejo de errores y UX
3. Organización y modularidad
4. Acceso a la API/configuración
5. Accesibilidad/diseño
6. Pruebas
7. Documentación
