<# 
 .SYNOPSIS
   Borra todos los contenedores e imágenes locales de Docker. 
   Ejecutar en una consola de PowerShell con permisos de administrador.
#>

Write-Host "⏳ Deteniendo y eliminando todos los contenedores..."
docker container ls -aq | ForEach-Object { docker container rm -f $_ }

Write-Host "⏳ Eliminando todas las imágenes..."
docker image ls -aq | ForEach-Object { docker image rm -f $_ }

Write-Host "✅ Docker limpio: sin contenedores ni imágenes locales."
