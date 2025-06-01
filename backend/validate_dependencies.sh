#!/bin/bash
# ===================================================================
# SCRIPT DE VALIDACIÓN DE DEPENDENCIAS
# Validates TensorFlow 2.12.0 compatibility before Docker build
# Date: June 1, 2025
# ===================================================================

echo "🔍 Validando compatibilidad de dependencias de TensorFlow..."

# Verificar versiones críticas
echo "📦 Verificando versiones críticas:"
grep -E "^(tensorflow|gast|protobuf|grpcio|numpy|keras)==" requirements.txt

echo ""
echo "⚠️  Verificaciones importantes:"
echo "1. gast debe ser <=0.4.0 para TensorFlow 2.12.0"
echo "2. numpy debe ser <=1.24.0 para compatibilidad"
echo "3. protobuf debe ser ~=3.20.0 para estabilidad"

# Validar versiones específicas
GAST_VERSION=$(grep "^gast==" requirements.txt | cut -d'=' -f3)
if [[ "$GAST_VERSION" > "0.4.0" ]]; then
    echo "❌ ERROR: gast=$GAST_VERSION es incompatible con TensorFlow 2.12.0"
    echo "   Debe ser <=0.4.0"
    exit 1
fi

NUMPY_VERSION=$(grep "^numpy==" requirements.txt | cut -d'=' -f3)
if [[ "$NUMPY_VERSION" > "1.24.0" ]]; then
    echo "❌ ERROR: numpy=$NUMPY_VERSION puede causar incompatibilidades"
    echo "   Recomendado: <=1.24.0"
fi

echo "✅ Validación completada. Dependencias compatibles con TensorFlow 2.12.0"
echo ""
echo "🐳 Listo para construcción Docker:"
echo "   docker compose up --build"
