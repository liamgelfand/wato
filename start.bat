@echo off
title Wato Dev Environment
cd /d "%~dp0"
echo.
echo  Starting Wato...
echo.
PowerShell -NoProfile -ExecutionPolicy Bypass -Command ^
  "docker info | Out-Null; if ($LASTEXITCODE -ne 0) { Write-Host 'ERROR: Docker Desktop is not running. Please start it first.' -ForegroundColor Red; pause; exit 1 }"
if %errorlevel% neq 0 goto :end

echo  Starting database...
docker compose up db -d --wait
if %errorlevel% neq 0 (
  echo ERROR: Could not start database.
  pause
  goto :end
)
echo  Database ready.
echo.
echo  Starting API + Mobile (close this window to stop both)
echo  API  -> http://localhost:3000
echo  Expo -> scan QR code below
echo.
npx concurrently --names "API,MOBILE" --prefix-colors "cyan,magenta" --kill-others-on-fail "npm run dev" "npm run dev:mobile"

:end
pause
