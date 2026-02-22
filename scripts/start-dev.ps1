# DareScore Development Startup Script
# This script will initialize and start your DareScore app

Write-Host "🚀 DareScore - Development Startup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "Please create a .env file with your database configuration." -ForegroundColor Yellow
    Write-Host "See .env.example for reference." -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ .env file found" -ForegroundColor Green

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✓ Dependencies installed" -ForegroundColor Green

# Check database connection
Write-Host "🔍 Checking database connection..." -ForegroundColor Yellow
$env:DATABASE_URL = (Get-Content .env | Where-Object { $_ -match '^DATABASE_URL=' }) -replace 'DATABASE_URL=', '' -replace '"', ''

# Try to push schema
Write-Host "📊 Setting up database schema..." -ForegroundColor Yellow
npx prisma db push --accept-data-loss
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to connect to database" -ForegroundColor Red
    Write-Host "Please ensure:" -ForegroundColor Yellow
    Write-Host "  1. PostgreSQL is running" -ForegroundColor Yellow
    Write-Host "  2. DATABASE_URL in .env is correct" -ForegroundColor Yellow
    Write-Host "  3. Database exists" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Database schema created" -ForegroundColor Green

# Seed database
Write-Host "🌱 Seeding database with demo data..." -ForegroundColor Yellow
npm run db:seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Seeding failed, but you can continue" -ForegroundColor Yellow
} else {
    Write-Host "✓ Database seeded successfully" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Demo Accounts:" -ForegroundColor Cyan
Write-Host "   Email: demo1@test.com (ADMIN)" -ForegroundColor White
Write-Host "   Email: demo2@test.com" -ForegroundColor White
Write-Host "   Password: password123" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Starting development server..." -ForegroundColor Yellow
Write-Host "   URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Start dev server
npm run dev
