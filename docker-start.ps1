# Start PostgreSQL with Docker for DareScore

Write-Host "🐳 Starting PostgreSQL with Docker..." -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
docker ps > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Docker is running" -ForegroundColor Green

# Check if container already exists
$existing = docker ps -a --filter "name=darescore-db" --format "{{.Names}}"
if ($existing -eq "darescore-db") {
    Write-Host "Container 'darescore-db' already exists" -ForegroundColor Yellow
    
    # Check if it's running
    $running = docker ps --filter "name=darescore-db" --format "{{.Names}}"
    if ($running -eq "darescore-db") {
        Write-Host "✓ PostgreSQL is already running" -ForegroundColor Green
    } else {
        Write-Host "Starting existing container..." -ForegroundColor Yellow
        docker start darescore-db
        Start-Sleep -Seconds 3
        Write-Host "✓ PostgreSQL started" -ForegroundColor Green
    }
} else {
    Write-Host "Creating new PostgreSQL container..." -ForegroundColor Yellow
    docker run --name darescore-db `
        -e POSTGRES_PASSWORD=password `
        -e POSTGRES_DB=darescore `
        -p 5432:5432 `
        -d postgres:14
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to create container" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "⏳ Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    Write-Host "✓ PostgreSQL container created and started" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ PostgreSQL is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Database connection details:" -ForegroundColor Cyan
Write-Host "   Host: localhost" -ForegroundColor White
Write-Host "   Port: 5432" -ForegroundColor White
Write-Host "   Database: darescore" -ForegroundColor White
Write-Host "   Username: postgres" -ForegroundColor White
Write-Host "   Password: password" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Use this DATABASE_URL in your .env:" -ForegroundColor Cyan
Write-Host '   DATABASE_URL="postgresql://postgres:password@localhost:5432/darescore"' -ForegroundColor White
Write-Host ""
Write-Host "🚀 Now run: .\start-dev.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "To stop PostgreSQL: docker stop darescore-db" -ForegroundColor Gray
Write-Host "To remove container: docker rm darescore-db" -ForegroundColor Gray
