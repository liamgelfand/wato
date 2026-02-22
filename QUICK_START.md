# Quick Start Guide

Get DareScore running in 5 minutes or less.

## Prerequisites

- Node.js 20+
- Docker (recommended) or PostgreSQL 14+
- Git

## Option 1: Docker (Recommended) ⚡

**Fastest way to get started:**

```bash
# 1. Start database
npm run docker:dev

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env and set NEXTAUTH_SECRET:
# Run: openssl rand -base64 32

# 4. Run migrations and seed
npm run db:migrate
npm run db:seed

# 5. Start development server
npm run dev
```

✅ **Done!** Open [http://localhost:3000](http://localhost:3000)

### Login

- Email: `demo1@test.com`
- Password: `password123`

## Option 2: Full Docker Stack

**Run everything in containers:**

```bash
# 1. Setup environment
cp .env.example .env
# Edit .env with your settings

# 2. Start all services
npm run docker:up

# 3. Check status
docker-compose logs -f app
```

✅ **Done!** Open [http://localhost:3000](http://localhost:3000)

## Option 3: Local Development

**If you have PostgreSQL installed locally:**

```bash
# 1. Create database
createdb darescore

# 2. Setup environment
cp .env.example .env
# Update DATABASE_URL to your local PostgreSQL
# DATABASE_URL="postgresql://postgres:password@localhost:5432/darescore"

# 3. Install dependencies
npm install

# 4. Run migrations and seed
npm run db:migrate
npm run db:seed

# 5. Start development server
npm run dev
```

✅ **Done!** Open [http://localhost:3000](http://localhost:3000)

## Essential Commands

### Development

```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run linter
```

### Database

```bash
npm run db:migrate       # Run migrations
npm run db:seed          # Seed demo data
npm run db:studio        # Open Prisma Studio
npm run db:push          # Push schema (no migrations)
```

### Testing

```bash
npm test                 # Unit tests (watch mode)
npm run test:ci          # All tests with coverage
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests
npm run test:e2e         # End-to-end tests
npm run test:bdd         # BDD tests
npm run test:all         # Run everything
```

### Docker

```bash
npm run docker:dev       # Start dev database
npm run docker:dev:down  # Stop dev database
npm run docker:up        # Start full stack
npm run docker:down      # Stop full stack
npm run docker:logs      # View logs
npm run docker:test      # Run tests in Docker
```

## Project Structure

```
├── app/                 # Next.js pages & API routes
├── components/          # React components
├── lib/                 # Core utilities
│   ├── db.ts           # Database client
│   ├── auth.ts         # Authentication
│   ├── env.ts          # Environment validation
│   ├── logger.ts       # Structured logging
│   └── monitoring.ts   # Observability
├── prisma/             # Database schema
├── __tests__/          # Unit & integration tests
├── e2e/                # End-to-end tests
├── features/           # BDD tests
└── deploy/             # Deployment configs
```

## Environment Variables

**Required:**

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/darescore"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
STORAGE_PROVIDER="local"  # or "s3"
```

**Optional:**

```env
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
SENTRY_DSN=""
```

Generate secure secret:

```bash
openssl rand -base64 32
```

## Common Issues

### Port Already in Use

```bash
# Find and kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :3000
kill -9 <PID>
```

### Database Connection Failed

```bash
# Check if database is running
docker ps | grep darescore-db

# Restart database
npm run docker:dev:down
npm run docker:dev
```

### Migrations Failed

```bash
# Reset database (⚠️ destroys data)
npm run db:migrate -- reset

# Or push schema without migrations
npm run db:push
```

## Demo Users

After seeding, you can login with:

| Email | Password | Role |
|-------|----------|------|
| demo1@test.com | password123 | ADMIN |
| demo2@test.com | password123 | USER |
| demo3@test.com | password123 | USER |
| demo4@test.com | password123 | USER |
| demo5@test.com | password123 | USER |

## Next Steps

1. **Explore the app** - Try creating challenges, making attempts
2. **Check health** - Visit [http://localhost:3000/api/health](http://localhost:3000/api/health)
3. **Run tests** - `npm run test:all`
4. **Read docs** - See `README.md` and other `*.md` files
5. **Deploy** - See `deploy/README.md` when ready

## Resources

- 📖 **Full Documentation**: `README.md`
- 🐳 **Docker Guide**: `DOCKER_GUIDE.md`
- 🧪 **Testing Guide**: `TESTING.md`
- 🚀 **Deployment**: `deploy/README.md`
- 🌳 **Git Workflow**: `BRANCHING_STRATEGY.md`
- ✅ **Production Readiness**: `PRODUCTION_READINESS.md`

## Need Help?

1. Check the documentation files
2. Review error logs: `docker-compose logs app`
3. Open an issue on GitHub

---

**Happy coding!** 🎉
