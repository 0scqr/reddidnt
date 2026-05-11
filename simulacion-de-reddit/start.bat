@echo off
title Simulacion de Reddit - Servidor Local (Offline/Portable)
echo =======================================================
echo     Iniciando Simulacion de Reddit (Next.js)
echo     Modo 100%% Portable (Offline)
echo =======================================================
echo.

set NODE_EXE=%~dp0node.exe

:: 1. Verificamos que el ejecutable de Node este en la misma carpeta
if not exist "%NODE_EXE%" (
    echo [!] ERROR: No se encontro node.exe en el directorio actual.
    echo [!] Asegurate de que el archivo node.exe este junto a start.bat.
    pause
    exit /b 1
)

:: 2. Verificamos que las dependencias existan, porque sin internet no hay npm install
if not exist "%~dp0node_modules\" (
    echo [!] ERROR: No se encontro la carpeta node_modules.
    echo [!] Al estar offline, las dependencias ya deben venir copiadas en la carpeta.
    echo [!] Ejecuta 'npm install' en una PC con internet antes de mover la carpeta.
    pause
    exit /b 1
)

echo [i] Levantando el servidor de Next.js usando node.exe portable...
echo [i] Tu navegador se abrira automaticamente en unos segundos...

:: Lanza un comando en segundo plano que espera 5 segundos y luego abre tu navegador
start /b cmd /c "timeout /nobreak /t 5 >nul && start http://localhost:3000"

:: 3. Ejecuta Next.js dev directamente con node.exe (evitando npm)
"%NODE_EXE%" node_modules\next\dist\bin\next dev

echo.
pause
