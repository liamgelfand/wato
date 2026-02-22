#!/bin/bash
# Database Backup Script
# Backs up PostgreSQL database and uploads to S3 (or local storage)

set -e # Exit on error

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Configuration
BACKUP_DIR="backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="darescore_backup_${DATE}.sql.gz"
RETENTION_DAYS=30

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔄 Starting database backup...${NC}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Perform backup
echo -e "${YELLOW}📦 Creating backup: $BACKUP_FILE${NC}"
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_DIR/$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Backup created successfully${NC}"
  
  # Get file size
  SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
  echo -e "${GREEN}📊 Backup size: $SIZE${NC}"
else
  echo -e "${RED}❌ Backup failed${NC}"
  exit 1
fi

# Upload to S3 if configured
if [ "$STORAGE_PROVIDER" = "s3" ] && [ -n "$AWS_S3_BUCKET" ]; then
  echo -e "${YELLOW}☁️  Uploading to S3...${NC}"
  
  aws s3 cp "$BACKUP_DIR/$BACKUP_FILE" \
    "s3://$AWS_S3_BUCKET/backups/database/$BACKUP_FILE" \
    --region "$AWS_S3_REGION"
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Uploaded to S3${NC}"
  else
    echo -e "${RED}❌ S3 upload failed${NC}"
  fi
fi

# Clean up old backups (local)
echo -e "${YELLOW}🧹 Cleaning up old backups (older than $RETENTION_DAYS days)...${NC}"
find "$BACKUP_DIR" -name "darescore_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Count remaining backups
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/darescore_backup_*.sql.gz 2>/dev/null | wc -l)
echo -e "${GREEN}📁 Total local backups: $BACKUP_COUNT${NC}"

echo -e "${GREEN}✨ Backup complete!${NC}"
