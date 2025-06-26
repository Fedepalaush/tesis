# 🐳 TESIS - DOCKER + CONTAINERIZATION PATTERNS

## 📋 **PATRONES OBLIGATORIOS - DOCKER SETUP**

### ✅ **DOCKERFILE MULTI-STAGE PATTERNS**

```dockerfile
# ✅ CORRECTO: Dockerfile multi-stage para React
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files primero para mejor cache
COPY package*.json ./
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Build de producción
RUN npm run build

# Stage de producción con nginx
FROM nginx:alpine AS production

# Copiar build files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración nginx personalizada
COPY nginx.conf /etc/nginx/nginx.conf

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

```dockerfile
# ✅ CORRECTO: Dockerfile para Django con dependencies caching
# backend/Dockerfile
FROM python:3.11-slim AS base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Development stage
FROM base AS development

# Install dev dependencies
COPY requirements/dev.txt requirements/dev.txt
RUN pip install -r requirements/dev.txt

# Copy source code
COPY . .

# Run migrations and collect static files
RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# Production stage
FROM base AS production

# Install production dependencies only
COPY requirements/prod.txt requirements/prod.txt
RUN pip install -r requirements/prod.txt

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser

# Copy source code
COPY --chown=appuser:appuser . .

# Switch to non-root user
USER appuser

# Collect static files
RUN python manage.py collectstatic --noinput

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health/ || exit 1

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "backend.wsgi:application"]
```

### ✅ **DOCKER-COMPOSE PATTERNS**

```yaml
# ✅ CORRECTO: docker-compose.yml con servicios completos
version: '3.8'

services:
  # Base de datos TimescaleDB
  timescaledb:
    image: timescale/timescaledb:latest-pg14
    container_name: tesis_timescaledb
    environment:
      POSTGRES_DB: tesis_db
      POSTGRES_USER: tesis_user
      POSTGRES_PASSWORD: ${DB_PASSWORD:-secure_password}
      POSTGRES_INITDB_ARGS: "--auth-host=scram-sha-256"
    ports:
      - "5432:5432"
    volumes:
      - timescale_data:/var/lib/postgresql/data
      - ./backend/scripts/init_timescale.sql:/docker-entrypoint-initdb.d/01_init_timescale.sql
    networks:
      - tesis_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U tesis_user -d tesis_db"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  # Redis para cache y sessions
  redis:
    image: redis:7-alpine
    container_name: tesis_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - tesis_network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3
    restart: unless-stopped

  # Backend Django
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: ${BUILD_TARGET:-development}
    container_name: tesis_backend
    environment:
      - DEBUG=${DEBUG:-True}
      - DATABASE_URL=postgresql://tesis_user:${DB_PASSWORD:-secure_password}@timescaledb:5432/tesis_db
      - REDIS_URL=redis://redis:6379/0
      - SECRET_KEY=${SECRET_KEY:-dev-secret-key}
      - ALLOWED_HOSTS=localhost,127.0.0.1,backend
      - CORS_ALLOWED_ORIGINS=http://localhost:3000,http://frontend:3000
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    depends_on:
      timescaledb:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - tesis_network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health/"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  # Frontend React
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: ${BUILD_TARGET:-development}
    container_name: tesis_frontend
    environment:
      - VITE_API_URL=http://localhost:8000
      - VITE_GRAPHQL_URL=http://localhost:8000/graphql
      - NODE_ENV=${NODE_ENV:-development}
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend
    networks:
      - tesis_network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  # Nginx reverse proxy (solo en producción)
  nginx:
    image: nginx:alpine
    container_name: tesis_nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/sites-available:/etc/nginx/sites-available
      - static_volume:/var/www/static
      - media_volume:/var/www/media
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    networks:
      - tesis_network
    profiles:
      - production
    restart: unless-stopped

  # Celery worker para tareas asíncronas
  celery:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: ${BUILD_TARGET:-development}
    container_name: tesis_celery
    command: celery -A backend worker -l info
    environment:
      - DATABASE_URL=postgresql://tesis_user:${DB_PASSWORD:-secure_password}@timescaledb:5432/tesis_db
      - REDIS_URL=redis://redis:6379/0
      - SECRET_KEY=${SECRET_KEY:-dev-secret-key}
    volumes:
      - ./backend:/app
    depends_on:
      timescaledb:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - tesis_network
    restart: unless-stopped

  # Celery Beat para tareas programadas
  celery-beat:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: ${BUILD_TARGET:-development}
    container_name: tesis_celery_beat
    command: celery -A backend beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
    environment:
      - DATABASE_URL=postgresql://tesis_user:${DB_PASSWORD:-secure_password}@timescaledb:5432/tesis_db
      - REDIS_URL=redis://redis:6379/0
      - SECRET_KEY=${SECRET_KEY:-dev-secret-key}
    volumes:
      - ./backend:/app
    depends_on:
      timescaledb:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - tesis_network
    restart: unless-stopped

  # Monitoring con Prometheus (opcional)
  prometheus:
    image: prom/prometheus:latest
    container_name: tesis_prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    networks:
      - tesis_network
    profiles:
      - monitoring
    restart: unless-stopped

  # Grafana para dashboards (opcional)
  grafana:
    image: grafana/grafana:latest
    container_name: tesis_grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD:-admin}
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources
    networks:
      - tesis_network
    profiles:
      - monitoring
    restart: unless-stopped

volumes:
  timescale_data:
  redis_data:
  static_volume:
  media_volume:
  prometheus_data:
  grafana_data:

networks:
  tesis_network:
    driver: bridge
```

### ✅ **DOCKER-COMPOSE OVERRIDE PATTERNS**

```yaml
# ✅ CORRECTO: docker-compose.override.yml para desarrollo
# docker-compose.override.yml
version: '3.8'

services:
  backend:
    build:
      target: development
    environment:
      - DEBUG=True
      - LOG_LEVEL=DEBUG
    volumes:
      - ./backend:/app
    command: python manage.py runserver 0.0.0.0:8000

  frontend:
    build:
      target: development
    environment:
      - NODE_ENV=development
      - VITE_API_URL=http://localhost:8000
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev -- --host 0.0.0.0
```

```yaml
# ✅ CORRECTO: docker-compose.prod.yml para producción
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    build:
      target: production
    environment:
      - DEBUG=False
      - LOG_LEVEL=INFO
    command: gunicorn --bind 0.0.0.0:8000 --workers 4 backend.wsgi:application

  frontend:
    build:
      target: production
    environment:
      - NODE_ENV=production

  nginx:
    profiles: []  # Activar nginx en producción

  timescaledb:
    environment:
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - ./backups:/backups
```

---

## 🔧 **DEVELOPMENT WORKFLOW PATTERNS**

### ✅ **MAKEFILE PARA COMANDOS DOCKER**

```makefile
# ✅ CORRECTO: Makefile con comandos Docker
.PHONY: help build up down logs shell test clean

# Variables
COMPOSE_FILE=docker-compose.yml
COMPOSE_OVERRIDE=docker-compose.override.yml
COMPOSE_PROD=docker-compose.prod.yml

help: ## Mostrar ayuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

build: ## Construir todas las imágenes
	docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_OVERRIDE) build

up: ## Levantar servicios en desarrollo
	docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_OVERRIDE) up -d

up-build: ## Construir y levantar servicios
	docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_OVERRIDE) up -d --build

down: ## Bajar todos los servicios
	docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_OVERRIDE) down

down-volumes: ## Bajar servicios y eliminar volúmenes
	docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_OVERRIDE) down -v

logs: ## Ver logs de todos los servicios
	docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_OVERRIDE) logs -f

logs-backend: ## Ver logs del backend
	docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_OVERRIDE) logs -f backend

logs-frontend: ## Ver logs del frontend
	docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_OVERRIDE) logs -f frontend

shell-backend: ## Acceder a shell del backend
	docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_OVERRIDE) exec backend bash

shell-frontend: ## Acceder a shell del frontend
	docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_OVERRIDE) exec frontend sh

shell-db: ## Acceder a shell de la base de datos
	docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_OVERRIDE) exec timescaledb psql -U tesis_user -d tesis_db

migrate: ## Ejecutar migraciones Django
	docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_OVERRIDE) exec backend python manage.py migrate

makemigrations: ## Crear migraciones Django
	docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_OVERRIDE) exec backend python manage.py makemigrations

collectstatic: ## Recopilar archivos estáticos
	docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_OVERRIDE) exec backend python manage.py collectstatic --noinput

test-backend: ## Ejecutar tests del backend
	docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_OVERRIDE) exec backend python manage.py test

test-frontend: ## Ejecutar tests del frontend
	docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_OVERRIDE) exec frontend npm test

install-frontend: ## Instalar dependencias del frontend
	docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_OVERRIDE) exec frontend npm install

install-backend: ## Instalar dependencias del backend
	docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_OVERRIDE) exec backend pip install -r requirements/dev.txt

# Comandos de producción
prod-build: ## Construir para producción
	docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_PROD) build

prod-up: ## Levantar en producción
	docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_PROD) up -d

prod-down: ## Bajar producción
	docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_PROD) down

# Comandos de limpieza
clean: ## Limpiar contenedores y imágenes no utilizadas
	docker system prune -a

clean-volumes: ## Limpiar volúmenes no utilizados
	docker volume prune

# Backup y restore
backup-db: ## Backup de la base de datos
	docker-compose exec timescaledb pg_dump -U tesis_user tesis_db > backup_$(shell date +%Y%m%d_%H%M%S).sql

restore-db: ## Restaurar base de datos (requiere BACKUP_FILE)
	docker-compose exec -T timescaledb psql -U tesis_user -d tesis_db < $(BACKUP_FILE)

# Health checks
health: ## Verificar salud de los servicios
	docker-compose ps
	@echo "\nBackend health:"
	@curl -s http://localhost:8000/health/ || echo "Backend no disponible"
	@echo "\nFrontend health:"
	@curl -s http://localhost:3000 > /dev/null && echo "Frontend OK" || echo "Frontend no disponible"
```

### ✅ **SCRIPTS DE DESARROLLO**

```bash
#!/bin/bash
# ✅ CORRECTO: scripts/dev-setup.sh

set -e

echo "🚀 Configurando entorno de desarrollo..."

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado"
    exit 1
fi

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env..."
    cp .env.example .env
    echo "✅ Archivo .env creado. Edítalo según tus necesidades."
fi

# Construir imágenes
echo "🔨 Construyendo imágenes Docker..."
make build

# Levantar servicios
echo "⬆️ Levantando servicios..."
make up

# Esperar a que la base de datos esté lista
echo "⏳ Esperando base de datos..."
sleep 10

# Ejecutar migraciones
echo "🔄 Ejecutando migraciones..."
make migrate

# Crear superusuario si no existe
echo "👤 Configurando superusuario..."
docker-compose exec backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(email='admin@tesis.com').exists():
    User.objects.create_superuser('admin@tesis.com', 'admin123')
    print('Superusuario creado: admin@tesis.com / admin123')
else:
    print('Superusuario ya existe')
"

# Instalar dependencias frontend
echo "📦 Instalando dependencias frontend..."
make install-frontend

echo "✅ Configuración completada!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📊 Admin Django: http://localhost:8000/admin"
echo "🗄️ Base de datos: localhost:5432"
echo ""
echo "Comandos útiles:"
echo "  make logs          # Ver todos los logs"
echo "  make shell-backend # Acceder al shell del backend"
echo "  make test-backend  # Ejecutar tests"
echo "  make down          # Parar servicios"
```

```bash
#!/bin/bash
# ✅ CORRECTO: scripts/deploy.sh

set -e

ENV=${1:-staging}

echo "🚀 Desplegando en entorno: $ENV"

if [ "$ENV" = "production" ]; then
    echo "⚠️ Desplegando en PRODUCCIÓN. ¿Continuar? (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        echo "❌ Despliegue cancelado"
        exit 1
    fi
fi

# Backup de base de datos en producción
if [ "$ENV" = "production" ]; then
    echo "💾 Creando backup de base de datos..."
    make backup-db
fi

# Bajar servicios actuales
echo "⬇️ Bajando servicios actuales..."
if [ "$ENV" = "production" ]; then
    make prod-down
else
    make down
fi

# Construir nuevas imágenes
echo "🔨 Construyendo nuevas imágenes..."
if [ "$ENV" = "production" ]; then
    make prod-build
else
    make build
fi

# Levantar servicios
echo "⬆️ Levantando servicios..."
if [ "$ENV" = "production" ]; then
    make prod-up
else
    make up
fi

# Ejecutar migraciones
echo "🔄 Ejecutando migraciones..."
sleep 10
make migrate

# Recopilar archivos estáticos
if [ "$ENV" = "production" ]; then
    echo "📁 Recopilando archivos estáticos..."
    make collectstatic
fi

# Verificar salud
echo "🏥 Verificando salud de servicios..."
sleep 5
make health

echo "✅ Despliegue completado en $ENV!"
```

---

## 🔐 **SECURITY PATTERNS**

### ✅ **SECRETS MANAGEMENT**

```yaml
# ✅ CORRECTO: Docker secrets para producción
# docker-compose.secrets.yml
version: '3.8'

secrets:
  db_password:
    external: true
  secret_key:
    external: true
  ssl_cert:
    external: true
  ssl_key:
    external: true

services:
  backend:
    secrets:
      - db_password
      - secret_key
    environment:
      - DATABASE_PASSWORD_FILE=/run/secrets/db_password
      - SECRET_KEY_FILE=/run/secrets/secret_key

  nginx:
    secrets:
      - ssl_cert
      - ssl_key
    volumes:
      - /run/secrets/ssl_cert:/etc/nginx/ssl/cert.pem:ro
      - /run/secrets/ssl_key:/etc/nginx/ssl/key.pem:ro
```

```dockerfile
# ✅ CORRECTO: Dockerfile con usuario no-root
FROM python:3.11-slim

# Crear usuario no-root
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Instalar dependencias
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copiar código
COPY --chown=appuser:appuser . /app
WORKDIR /app

# Cambiar a usuario no-root
USER appuser

# No exponer puertos privilegiados
EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app.wsgi"]
```

---

## 📊 **MONITORING Y LOGGING PATTERNS**

### ✅ **LOGGING CENTRALIZADO**

```yaml
# ✅ CORRECTO: Logging con ELK stack
version: '3.8'

services:
  # ... otros servicios ...

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.5.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    networks:
      - tesis_network

  logstash:
    image: docker.elastic.co/logstash/logstash:8.5.0
    volumes:
      - ./monitoring/logstash/pipeline:/usr/share/logstash/pipeline
      - ./monitoring/logstash/config:/usr/share/logstash/config
    depends_on:
      - elasticsearch
    networks:
      - tesis_network

  kibana:
    image: docker.elastic.co/kibana/kibana:8.5.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch
    networks:
      - tesis_network

  # Configurar servicios principales para enviar logs
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        labels: "service=backend"

  frontend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        labels: "service=frontend"
```

---

## 🚫 **ANTI-PATTERNS (EVITAR)**

### ❌ **INCORRECTO: Dockerfile no optimizado**

```dockerfile
# ❌ MAL: Dockerfile ineficiente
FROM python:3.11

WORKDIR /app

# Instalar todo cada vez (sin cache)
COPY . .
RUN pip install -r requirements.txt

# Correr como root (inseguro)
EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```

### ❌ **INCORRECTO: docker-compose sin healthchecks**

```yaml
# ❌ MAL: Sin healthchecks ni dependencias
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "8000:8000"
  
  database:
    image: postgres
    # Sin healthcheck
    # Sin variables de entorno seguras
```

### ❌ **INCORRECTO: Secrets en código**

```yaml
# ❌ MAL: Secrets hardcodeados
services:
  backend:
    environment:
      - DATABASE_PASSWORD=password123  # ¡Nunca!
      - SECRET_KEY=my-secret-key      # ¡Nunca!
```

---

**📋 RESUMEN DE PATRONES OBLIGATORIOS:**

✅ **Multi-stage Dockerfiles** para optimización  
✅ **docker-compose** con healthchecks y dependencias  
✅ **Variables de entorno** para configuración  
✅ **Volúmenes** para persistencia de datos  
✅ **Networks** para aislamiento de servicios  
✅ **Secrets management** para datos sensibles  
✅ **Usuario no-root** en contenedores  
✅ **Logging centralizado** y monitoring  
✅ **Scripts de automatización** (Makefile)  
✅ **Separación dev/prod** con overrides
