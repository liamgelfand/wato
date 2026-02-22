# PowerShell Deployment Script for DareScore
# Windows version of deployment script

param(
    [switch]$Production,
    [switch]$SkipTests,
    [switch]$Force
)

Write-Host "🚀 DareScore Deployment Script" -ForegroundColor Blue
Write-Host "================================`n" -ForegroundColor Blue

# Check if Vercel CLI is installed
if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Vercel CLI is not installed" -ForegroundColor Red
    Write-Host "Install it with: npm install -g vercel" -ForegroundColor Yellow
    exit 1
}

# Check if we're in a git repository
if (!(Test-Path .git)) {
    Write-Host "❌ Not a git repository" -ForegroundColor Red
    exit 1
}

# Check for uncommitted changes
$gitStatus = git status --porcelain
if ($gitStatus -and !$Force) {
    Write-Host "⚠️  Warning: You have uncommitted changes" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne "y") {
        exit 1
    }
}

# Get current branch
$currentBranch = git branch --show-current
Write-Host "📍 Current branch: $currentBranch`n" -ForegroundColor Blue

# Determine environment
if ($Production -or $currentBranch -eq "main") {
    $environment = "production"
    Write-Host "🚨 You are deploying to PRODUCTION" -ForegroundColor Red
} elseif ($currentBranch -eq "dev") {
    $environment = "preview"
    Write-Host "🔧 You are deploying to STAGING/PREVIEW" -ForegroundColor Yellow
} else {
    $environment = "preview"
    Write-Host "🔧 You are deploying to PREVIEW (feature branch)" -ForegroundColor Yellow
}

# Confirm deployment
if (!$Force) {
    Write-Host ""
    $confirm = Read-Host "Are you sure you want to deploy to $environment? (y/N)"
    if ($confirm -ne "y") {
        Write-Host "Deployment cancelled." -ForegroundColor Yellow
        exit 0
    }
}

# Run pre-deployment checks
Write-Host "`n🔍 Running pre-deployment checks..." -ForegroundColor Blue

# 1. Type check
Write-Host "📝 Type checking..." -ForegroundColor Yellow
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Type check failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Type check passed" -ForegroundColor Green

# 2. Linting
Write-Host "🔍 Linting..." -ForegroundColor Yellow
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Lint check failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Lint check passed" -ForegroundColor Green

# 3. Tests (unless skipped)
if (!$SkipTests) {
    Write-Host "🧪 Running tests..." -ForegroundColor Yellow
    npm run test:ci
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Tests failed" -ForegroundColor Red
        if (!$Force) {
            $deployAnyway = Read-Host "Deploy anyway? (y/N)"
            if ($deployAnyway -ne "y") {
                exit 1
            }
        }
    } else {
        Write-Host "✅ Tests passed" -ForegroundColor Green
    }
}

# 4. Build check
Write-Host "🏗️  Building application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build successful" -ForegroundColor Green

# Deploy to Vercel
Write-Host "`n🚀 Deploying to Vercel..." -ForegroundColor Blue

if ($environment -eq "production") {
    vercel --prod
} else {
    vercel
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✨ Deployment successful!" -ForegroundColor Green
    
    # Post-deployment message
    Write-Host "`n🎉 Deployment complete!" -ForegroundColor Green
    Write-Host "Check the Vercel dashboard for deployment URL and logs." -ForegroundColor Cyan
    
} else {
    Write-Host "`n❌ Deployment failed" -ForegroundColor Red
    exit 1
}
