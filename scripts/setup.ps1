# PowerShell Setup Script for DareScore
# Windows version of setup script

Write-Host "🎯 DareScore Setup Script" -ForegroundColor Blue
Write-Host "=========================`n" -ForegroundColor Blue

# Check Node.js version
Write-Host "🔍 Checking Node.js version..." -ForegroundColor Yellow
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed" -ForegroundColor Red
    Write-Host "Please install Node.js 20+ from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

$nodeVersion = (node -v).TrimStart('v').Split('.')[0]
if ([int]$nodeVersion -lt 20) {
    Write-Host "❌ Node.js version 20+ required (you have $(node -v))" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js $(node -v)" -ForegroundColor Green

# Check npm
Write-Host "🔍 Checking npm..." -ForegroundColor Yellow
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm is not installed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ npm $(npm -v)" -ForegroundColor Green

# Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Setup environment variables
Write-Host "`n⚙️  Setting up environment variables..." -ForegroundColor Yellow
if (!(Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "✅ Created .env file" -ForegroundColor Green
    Write-Host "📝 Please edit .env and add your configuration" -ForegroundColor Yellow
    
    # Generate NEXTAUTH_SECRET
    $bytes = New-Object byte[] 32
    [Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
    $NEXTAUTH_SECRET = [Convert]::ToBase64String($bytes)
    
    # Update .env with generated secret
    (Get-Content .env) -replace 'your-secret-key-here-replace-in-production', $NEXTAUTH_SECRET | Set-Content .env
    
    Write-Host "✅ Generated NEXTAUTH_SECRET" -ForegroundColor Green
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Check if Docker is available
Write-Host "`n🐳 Checking Docker..." -ForegroundColor Yellow
if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host "✅ Docker is installed" -ForegroundColor Green
    
    # Check if database is running
    $dbRunning = docker ps | Select-String "darescore-db"
    if ($dbRunning) {
        Write-Host "✅ Database is already running" -ForegroundColor Green
    } else {
        Write-Host "📊 Starting database..." -ForegroundColor Yellow
        docker-compose -f docker-compose.dev.yml up -d
        Write-Host "✅ Database started" -ForegroundColor Green
        
        # Wait for database
        Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
} else {
    Write-Host "⚠️  Docker not found - you'll need to set up PostgreSQL manually" -ForegroundColor Yellow
}

# Generate Prisma Client
Write-Host "`n🔧 Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate
Write-Host "✅ Prisma Client generated" -ForegroundColor Green

# Run migrations
Write-Host "`n🗄️  Running database migrations..." -ForegroundColor Yellow
npx prisma migrate deploy
Write-Host "✅ Migrations completed" -ForegroundColor Green

# Seed database
Write-Host "`n🌱 Seeding database with demo data..." -ForegroundColor Yellow
npm run db:seed
Write-Host "✅ Database seeded" -ForegroundColor Green

# Install Playwright browsers
Write-Host "`n🎭 Installing Playwright browsers..." -ForegroundColor Yellow
npx playwright install --with-deps chromium
Write-Host "✅ Playwright browsers installed" -ForegroundColor Green

# Create backup directory
Write-Host "`n📁 Creating backup directory..." -ForegroundColor Yellow
if (!(Test-Path backups)) {
    New-Item -ItemType Directory -Path backups | Out-Null
}
Write-Host "✅ Backup directory created" -ForegroundColor Green

# Final summary
Write-Host "`n=====================================" -ForegroundColor Blue
Write-Host "✨ Setup complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Blue

Write-Host "`n📚 Next steps:" -ForegroundColor Blue
Write-Host "  1. Edit .env and configure your environment variables" -ForegroundColor White
Write-Host "  2. Run 'npm run dev' to start the development server" -ForegroundColor White
Write-Host "  3. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "  4. Login with demo account: demo1@test.com / password123`n" -ForegroundColor White

Write-Host "📖 Useful commands:" -ForegroundColor Blue
Write-Host "  npm run dev           - Start development server" -ForegroundColor White
Write-Host "  npm test              - Run tests in watch mode" -ForegroundColor White
Write-Host "  npm run test:e2e      - Run end-to-end tests" -ForegroundColor White
Write-Host "  npm run db:studio     - Open Prisma Studio" -ForegroundColor White
Write-Host "  npm run lint          - Lint code" -ForegroundColor White
Write-Host "  npm run docker:dev    - Start database only`n" -ForegroundColor White

Write-Host "Happy coding! 🎉`n" -ForegroundColor Green
