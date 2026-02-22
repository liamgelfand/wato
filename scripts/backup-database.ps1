# PowerShell Database Backup Script
# Windows version of backup script

param(
    [string]$BackupDir = "backups",
    [int]$RetentionDays = 30
)

# Load environment variables
if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2])
        }
    }
}

$DATABASE_URL = $env:DATABASE_URL
$DATE = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_FILE = "darescore_backup_$DATE.sql.gz"

Write-Host "🔄 Starting database backup..." -ForegroundColor Green

# Create backup directory
if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

# Perform backup
Write-Host "📦 Creating backup: $BACKUP_FILE" -ForegroundColor Yellow

# Extract connection details from DATABASE_URL
if ($DATABASE_URL -match "postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)") {
    $USER = $matches[1]
    $PASSWORD = $matches[2]
    $HOST = $matches[3]
    $PORT = $matches[4]
    $DATABASE = $matches[5]
    
    # Set PGPASSWORD environment variable
    $env:PGPASSWORD = $PASSWORD
    
    # Run pg_dump
    & pg_dump -h $HOST -p $PORT -U $USER -d $DATABASE | & gzip > "$BackupDir\$BACKUP_FILE"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backup created successfully" -ForegroundColor Green
        
        $Size = (Get-Item "$BackupDir\$BACKUP_FILE").Length / 1MB
        Write-Host "📊 Backup size: $($Size.ToString('0.00')) MB" -ForegroundColor Green
    } else {
        Write-Host "❌ Backup failed" -ForegroundColor Red
        exit 1
    }
    
    # Upload to S3 if configured
    if ($env:STORAGE_PROVIDER -eq "s3" -and $env:AWS_S3_BUCKET) {
        Write-Host "☁️  Uploading to S3..." -ForegroundColor Yellow
        
        aws s3 cp "$BackupDir\$BACKUP_FILE" `
            "s3://$($env:AWS_S3_BUCKET)/backups/database/$BACKUP_FILE" `
            --region $env:AWS_S3_REGION
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Uploaded to S3" -ForegroundColor Green
        } else {
            Write-Host "❌ S3 upload failed" -ForegroundColor Red
        }
    }
    
    # Clean up old backups
    Write-Host "🧹 Cleaning up old backups (older than $RetentionDays days)..." -ForegroundColor Yellow
    $CutoffDate = (Get-Date).AddDays(-$RetentionDays)
    Get-ChildItem $BackupDir -Filter "darescore_backup_*.sql.gz" |
        Where-Object { $_.LastWriteTime -lt $CutoffDate } |
        Remove-Item
    
    $BackupCount = (Get-ChildItem $BackupDir -Filter "darescore_backup_*.sql.gz").Count
    Write-Host "📁 Total local backups: $BackupCount" -ForegroundColor Green
    
    Write-Host "✨ Backup complete!" -ForegroundColor Green
} else {
    Write-Host "❌ Invalid DATABASE_URL format" -ForegroundColor Red
    exit 1
}
