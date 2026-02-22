#!/bin/bash
# Database Restore Script
# Restores PostgreSQL database from backup

set -e # Exit on error

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if backup file is provided
if [ $# -eq 0 ]; then
  echo -e "${RED}❌ Error: No backup file specified${NC}"
  echo "Usage: ./scripts/restore-database.sh <backup-file>"
  echo ""
  echo "Available backups:"
  ls -lh backups/darescore_backup_*.sql.gz 2>/dev/null || echo "No backups found"
  exit 1
fi

BACKUP_FILE=$1

# Check if file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo -e "${RED}❌ Error: Backup file not found: $BACKUP_FILE${NC}"
  exit 1
fi

# Warning
echo -e "${RED}⚠️  WARNING: This will REPLACE the current database!${NC}"
echo -e "${YELLOW}Database: $DATABASE_URL${NC}"
echo -e "${YELLOW}Backup file: $BACKUP_FILE${NC}"
echo ""
read -p "Are you sure you want to continue? (type 'yes' to confirm): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo -e "${YELLOW}Restore cancelled.${NC}"
  exit 0
fi

echo -e "${GREEN}🔄 Starting database restore...${NC}"

# Drop and recreate database (BE CAREFUL!)
echo -e "${YELLOW}📊 Preparing database...${NC}"

# Restore from backup
echo -e "${YELLOW}📦 Restoring from backup...${NC}"
gunzip -c "$BACKUP_FILE" | psql "$DATABASE_URL"

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Database restored successfully${NC}"
  
  # Run migrations to ensure schema is up to date
  echo -e "${YELLOW}🔄 Running migrations...${NC}"
  npx prisma migrate deploy
  
  echo -e "${GREEN}✨ Restore complete!${NC}"
else
  echo -e "${RED}❌ Restore failed${NC}"
  exit 1
fi
