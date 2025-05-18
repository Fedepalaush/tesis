#!/usr/bin/env bash
set -euo pipefail

STATE_DIR="/opt/state"
INIT_FLAG="$STATE_DIR/.initialized"

mkdir -p "$STATE_DIR"

if [ ! -f "$INIT_FLAG" ]; then
  echo "🎬 Ejecutando tareas de inicialización del backend…"

  # 🔸 PON AQUÍ TUS COMANDOS ONE-SHOT 🔸
  # Ejemplos típicos (descomenta/edita a gusto):
  python manage.py makemigrations
  python manage.py migrate --noinput
  python manage.py collectstatic --noinput
  export DJANGO_SUPERUSER_USERNAME=admin
  export DJANGO_SUPERUSER_EMAIL=admin@admin.com
  export DJANGO_SUPERUSER_PASSWORD='TuClaveSegura123'
  python manage.py createsuperuser --noinput


  touch "$INIT_FLAG"
  echo "✅ Inicialización completada"
fi

# Lanza el comando original que recibimos

gunicorn core.wsgi:application --bind 0.0.0.0:8000