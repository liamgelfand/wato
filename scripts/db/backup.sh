#!/bin/bash
# Backup the Wato PostgreSQL database to ./backups/
set -e

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

BACKUP_DIR="backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="wato_backup_${DATE}.sql.gz"

mkdir -p "$BACKUP_DIR"
echo "Creating backup: $BACKUP_DIR/$BACKUP_FILE"
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_DIR/$BACKUP_FILE"
echo "Done. Size: $(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)"
