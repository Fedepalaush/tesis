#!/bin/bash
# Script para ejecutar tests y verificar la calidad del código

echo "=== Ejecutando tests ==="
python manage.py test

echo -e "\n=== Ejecutando formateo con Black ==="
black --check .

echo -e "\n=== Ejecutando ordenamiento de imports con isort ==="
isort --check-only --profile black .

echo -e "\n=== Ejecutando análisis estático con flake8 ==="
flake8 .

echo -e "\n=== Verificando cobertura de tests ==="
coverage run --source='.' manage.py test
coverage report
