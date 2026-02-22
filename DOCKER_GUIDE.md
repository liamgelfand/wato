# Docker Guide for DareScore

This guide explains how to run DareScore using Docker for development, testing, and production.

## Quick Start

### Development with Docker

The fastest way to get started:

```bash
# 1. Start PostgreSQL database only
npm run docker:dev

# 2. Install dependencies (on your local machine)
npm install

# 3. Setup environment
cp .env.example .env

# 4. Run migrations and seed
npm run db:migrate
npm run db:seed

# 5. Start Next.js dev server (on your local machine)
npm run dev
```

This approach gives you:
- Database in Docker (consistent, isolated)
- Hot reloading for code changes
- Easy debugging
- Fast iteration

### Full Docker Stack (Production-like)

Run everything in containers:

```bash
# 1. Setup environment
cp .env.example .env
# Edit .env and set:
# - DATABASE_URL=postgresql://postgres:password@db:5432/darescore
# - NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>

# 2. Build and start all services
docker-compose up --build -d

# 3. Check status
docker-compose ps

# 4. View logs
docker-compose logs -f app

# 5. Access application
# http://localhost:3000
```

### Testing with Docker

```bash
# Run tests in isolated containers
npm run docker:test

# Or manually
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

## Docker Compose Files

### `docker-compose.dev.yml`
**Purpose**: Development database only

```bash
# Start
docker-compose -f docker-compose.dev.yml up -d

# Stop
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes (⚠️ deletes data)
docker-compose -f docker-compose.dev.yml down -v
```

**Services**:
- PostgreSQL 14 on port 5432
- Persistent data volume

### `docker-compose.yml`
**Purpose**: Full production-like stack

```bash
# Start
docker-compose up -d

# Rebuild and start
docker-compose up --build -d

# Stop
docker-compose down

# View logs
docker-compose logs -f

# Execute commands in app container
docker-compose exec app npm run db:migrate
```

**Services**:
- PostgreSQL database
- Next.js application
- Persistent volumes for database and uploads
- Health checks

### `docker-compose.test.yml`
**Purpose**: Automated testing

```bash
# Run tests
docker-compose -f docker-compose.test.yml up --abort-on-container-exit

# Clean up
docker-compose -f docker-compose.test.yml down -v
```

**Services**:
- Test database (tmpfs for speed)
- Test runner with all dependencies

## Dockerfile Stages

### Production `Dockerfile`

Multi-stage build for optimized images:

1. **deps**: Install production dependencies
2. **builder**: Build Next.js application
3. **runner**: Minimal runtime image

```bash
# Build
docker build -t darescore:latest .

# Run
docker run -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e NEXTAUTH_SECRET="..." \
  -e NEXTAUTH_URL="..." \
  darescore:latest
```

### Test `Dockerfile.test`

Includes dev dependencies for testing:

```bash
# Build test image
docker build -f Dockerfile.test -t darescore:test .

# Run tests
docker run --rm darescore:test npm run test:ci
```

## Common Workflows

### Starting Fresh

```bash
# Remove all containers and volumes
docker-compose down -v

# Rebuild from scratch
docker-compose up --build -d

# Run migrations
docker-compose exec app npm run db:migrate

# Seed data
docker-compose exec app npm run db:seed
```

### Database Migrations

```bash
# Inside app container
docker-compose exec app npm run db:migrate

# Or with docker-compose.dev.yml (database only)
# Run migrations on local machine connecting to Docker DB
npm run db:migrate
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f db

# Last 100 lines
docker-compose logs --tail=100 app
```

### Access Database

```bash
# Using psql inside container
docker-compose exec db psql -U postgres -d darescore

# Or connect from local machine
psql postgresql://postgres:password@localhost:5432/darescore

# Using Prisma Studio (requires local setup)
npm run db:studio
```

### Execute Commands in Containers

```bash
# Shell access
docker-compose exec app sh

# Run npm commands
docker-compose exec app npm run lint
docker-compose exec app npm test

# Prisma commands
docker-compose exec app npx prisma studio
docker-compose exec app npx prisma migrate status
```

## Production Deployment

### Environment Variables

Create `.env` file with production values:

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@db:5432/darescore
NEXTAUTH_SECRET=<strong-secret-key>
NEXTAUTH_URL=https://yourdomain.com
STORAGE_PROVIDER=s3
AWS_S3_BUCKET=your-bucket
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>
```

### Deploy

```bash
# Build production image
docker-compose build

# Start in detached mode
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate deploy

# Check health
curl http://localhost:3000/api/health
```

### Update Deployment

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up --build -d

# Run new migrations
docker-compose exec app npx prisma migrate deploy
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Or use different ports
APP_PORT=3001 DB_PORT=5433 docker-compose up -d
```

### Database Connection Failed

```bash
# Check if database is running
docker-compose ps

# Check database logs
docker-compose logs db

# Verify connection string in .env
DATABASE_URL=postgresql://postgres:password@db:5432/darescore
#                                           ^^^ Use "db" not "localhost" in Docker

# Test connection
docker-compose exec db psql -U postgres -d darescore -c "SELECT 1"
```

### Application Won't Start

```bash
# Check logs
docker-compose logs app

# Common issues:
# 1. Database not ready - wait a few seconds
# 2. Migrations not run - run: docker-compose exec app npm run db:migrate
# 3. Build error - rebuild: docker-compose up --build -d

# Rebuild from scratch
docker-compose down -v
docker-compose up --build -d
```

### Out of Disk Space

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove everything unused
docker system prune -a --volumes
```

### Slow Build Times

```bash
# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker-compose build

# Use build cache
docker-compose build --build-arg BUILDKIT_INLINE_CACHE=1
```

## Health Checks

The application includes health check endpoints:

```bash
# Check application health
curl http://localhost:3000/api/health

# Check from inside Docker network
docker-compose exec app wget -O- http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "database": "connected"
}
```

## Performance Optimization

### Multi-stage Build Benefits

1. **Smaller Images**: Only runtime dependencies in final image
2. **Faster Deploys**: Less data to transfer
3. **Better Security**: Fewer attack surfaces

### Layer Caching

Order matters for efficient caching:

```dockerfile
# ✅ Good - dependencies cached separately
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ❌ Bad - cache invalidated on any file change
COPY . .
RUN npm ci && npm run build
```

### Volume Mounts

For development, mount code as volume:

```yaml
services:
  app:
    volumes:
      - .:/app
      - /app/node_modules  # Don't override node_modules
```

## Best Practices

1. **Use `.dockerignore`**: Exclude unnecessary files from context
2. **Non-root User**: Run containers as non-root for security
3. **Health Checks**: Always include health checks
4. **Resource Limits**: Set CPU and memory limits in production
5. **Logging**: Use structured logging
6. **Secrets**: Use secrets management (not env vars) in production

## Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Example](https://github.com/vercel/next.js/tree/canary/examples/with-docker)
- [Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

**Questions?** Check the main [README.md](./README.md) or open an issue on GitHub.
