#!/usr/bin/env bash
set -euo pipefail

echo "⏳ Deteniendo y eliminando todos los contenedores..."
docker ps -aq | xargs -r docker rm -f

echo "⏳ Eliminando todas las imágenes..."
docker images -aq | xargs -r docker rmi -f

echo "✅ Docker limpio: sin contenedores ni imágenes locales."
