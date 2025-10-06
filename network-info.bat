@echo off
echo ============================================
echo    SERVIDOR BACKEND - ACCESO EN RED
echo ============================================
echo.
echo El servidor backend ya está configurado para
echo aceptar conexiones desde la red local.
echo.

REM Obtener la IP local
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /R /C:"IPv4 Address"') do (
    for /f "tokens=*" %%a in ("%%i") do set IP=%%a
)
set IP=%IP:~1%

if "%IP%"=="" (
    echo ❌ No se pudo detectar la IP local
    echo Verifica tu conexión de red
    pause
    exit /b 1
)

echo ✅ Tu IP local es: %IP%
echo.
echo ============================================
echo    URLs DE ACCESO
echo ============================================
echo.
echo Backend API:
echo http://%IP%:5000
echo.
echo Documentación Swagger:
echo http://%IP%:5000/api-docs
echo.
echo Health Check:
echo http://%IP%:5000/health
echo.
echo ============================================
echo.
echo IMPORTANTE:
echo - Asegúrate de que el firewall permita
echo   conexiones entrantes al puerto 5000
echo - Otros equipos en la red pueden acceder
echo   usando la IP mostrada arriba
echo.
echo Presiona cualquier tecla para continuar...
pause >nul