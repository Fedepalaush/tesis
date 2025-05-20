#!/usr/bin/env bash
set -euo pipefail

STATE_DIR="/opt/state"
INIT_FLAG="$STATE_DIR/.initialized"
mkdir -p "$STATE_DIR"

if [ ! -f "$INIT_FLAG" ]; then
  echo "⏳ Backend se está inicializando…"
  python manage.py makemigrations
  python manage.py migrate --noinput
  python manage.py collectstatic --noinput

  # super-usuario de arranque (solo la 1.ª vez)
  export DJANGO_SUPERUSER_USERNAME=${DJANGO_SUPERUSER_USERNAME:-admin}
  export DJANGO_SUPERUSER_EMAIL=${DJANGO_SUPERUSER_EMAIL:-admin@example.com}
  export DJANGO_SUPERUSER_PASSWORD=${DJANGO_SUPERUSER_PASSWORD:-Cambiar123}
  python manage.py createsuperuser --noinput || true

  touch "$INIT_FLAG"
  echo "✅ Backend listo"
fi

# Lanzamos Gunicorn; 4 workers + keep-alive
exec gunicorn core.wsgi:application \
     --workers ${GUNICORN_WORKERS:-4} \
     --bind 0.0.0.0:8000 \
     --keep-alive 60 \
     --access-logfile -
