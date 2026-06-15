# Deployment (Docker)

Wato runs as a containerized Next.js app with PostgreSQL. No cloud platform config required.

## Local development

Database in Docker, app on your machine (hot reload):

```bash
npm run docker:db
npm run dev
```

## Production (Docker Compose)

```bash
cp .env.example .env
```

Set at minimum:

```env
NEXTAUTH_SECRET=<random-32-char-string>
NEXTAUTH_URL=http://localhost:3000
```

Build and start:

```bash
npm run docker:up
```

Verify:

```bash
curl http://localhost:3000/api/health
```

## What runs

| Container | Role |
|-----------|------|
| `wato-db` | PostgreSQL 16 |
| `wato-app` | Next.js (standalone build, runs migrations on start) |

Uploads are stored in a Docker volume (`app_uploads`). For multi-server deployments, set `STORAGE_PROVIDER=s3` in `.env`.

## Stop

```bash
npm run docker:down
npm run docker:db:down    # if only running the database
```

## Environment variables

See `.env.example` for the full list.

## Database backups

```bash
./scripts/db/backup.sh
./scripts/db/restore.sh backups/wato_backup_*.sql.gz
```
