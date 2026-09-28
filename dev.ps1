#!/usr/bin/env pwsh
# dev.ps1 — Start the full Wato dev environment in one shot
# Usage: .\dev.ps1
# Stops everything: .\dev.ps1 -Stop

param([switch]$Stop)

Set-Location $PSScriptRoot

if ($Stop) {
    Write-Host "Stopping Wato dev environment..." -ForegroundColor Yellow
    docker compose --profile prod down
    docker compose down
    Write-Host "Stopped." -ForegroundColor Green
    exit 0
}

# 1. Make sure Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# 2. Start the database (skip if already healthy)
Write-Host "Starting database..." -ForegroundColor Cyan
docker compose up db -d --wait

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to start database." -ForegroundColor Red
    exit 1
}

Write-Host "Database ready." -ForegroundColor Green

# 3. Start Next.js API + Expo together via concurrently
Write-Host ""
Write-Host "Starting API + Mobile (Ctrl+C to stop both)..." -ForegroundColor Cyan
Write-Host ""

npx concurrently `
    --names "api,mobile" `
    --prefix-colors "cyan,magenta" `
    --kill-others-on-fail `
    "npm run dev" `
    "npm run dev:mobile"
