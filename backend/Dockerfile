FROM python:3.9-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    STATIC_ROOT=/static 
    
WORKDIR /app

COPY requirements.txt .

# Instalación de dependencias del sistema, incluyendo psql
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y --no-install-recommends curl postgresql-client && \
    pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    apt-get clean && rm -rf /var/lib/apt/lists/*
    
COPY . .


# ¡NO exponemos puertos! El contenedor vive solo en la red interna
# EXPOSE 8000   ← Eliminado

# Recogemos estáticos en la ruta del volumen
RUN python manage.py collectstatic --noinput

# Permisos para el entrypoint
RUN chmod +x entrypoint.sh

HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
  CMD curl -fs http://localhost:8000/api/health/ || exit 1

ENTRYPOINT ["/app/entrypoint.sh"]