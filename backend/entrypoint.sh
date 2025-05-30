#!/usr/bin/env bash
set -euo pipefail
set -x

echo "⏳ Esperando que la base de datos esté lista..."

: "${DB_HOST:?Falta DB_HOST}"
: "${DB_USER:?Falta DB_USER}"
: "${DB_NAME:?Falta DB_NAME}"
: "${DB_PASSWORD:?Falta DB_PASSWORD}"

echo "🔍 Usando DB_HOST=$DB_HOST, DB_USER=$DB_USER, DB_NAME=$DB_NAME"

until PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c '\q'; do
  echo "⏳ Base de datos no disponible todavía. Reintentando en 2 segundos..."
  sleep 2
done

echo "✅ Base de datos lista, aplicando migraciones..."

# Aplicar migraciones normales, sin --fake


echo "🖼 Colectando archivos estáticos..."


echo "👤 Creando superusuario si no existe..."
export DJANGO_SUPERUSER_USERNAME=${DJANGO_SUPERUSER_USERNAME:-admin}
export DJANGO_SUPERUSER_EMAIL=${DJANGO_SUPERUSER_EMAIL:-admin@example.com}
export DJANGO_SUPERUSER_PASSWORD=${DJANGO_SUPERUSER_PASSWORD:-Cambiar123}

if ! python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); print(User.objects.filter(username='$DJANGO_SUPERUSER_USERNAME').exists())" | grep -q True; then
  python manage.py migrate --noinput
  python manage.py createsuperuser --noinput
  python manage.py collectstatic --noinput
  python manage.py import_stock_data
fi

echo "📈 Importando datos de acciones..."


echo "✅ Backend listo, arrancando servidor..."

exec gunicorn core.wsgi:application \
     --workers ${GUNICORN_WORKERS:-4} \
     --bind 0.0.0.0:8000 \
     --keep-alive 60 \
     --access-logfile -
