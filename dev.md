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
