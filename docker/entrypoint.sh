#!/bin/sh
set -e

echo "Starting Wato..."

echo "Running database migrations..."
./node_modules/.bin/prisma migrate deploy

echo "Starting server..."
exec "$@"
