#!/bin/bash
# Restore Wato database from a backup file
set -e

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

if [ $# -eq 0 ]; then
  echo "Usage: ./scripts/db/restore.sh <backup-file.sql.gz>"
  ls -lh backups/wato_backup_*.sql.gz 2>/dev/null || echo "No backups found in ./backups/"
  exit 1
fi

BACKUP_FILE=$1
if [ ! -f "$BACKUP_FILE" ]; then
  echo "File not found: $BACKUP_FILE"
  exit 1
fi

echo "WARNING: This replaces the current database at $DATABASE_URL"
read -p "Type 'yes' to continue: " CONFIRM
[ "$CONFIRM" = "yes" ] || exit 0

gunzip -c "$BACKUP_FILE" | psql "$DATABASE_URL"
npx prisma migrate deploy
echo "Restore complete."
