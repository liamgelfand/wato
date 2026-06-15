# Setup

## Prerequisites

- Node.js 20+
- Docker Desktop (for Postgres)

## Steps

```bash
git clone <repo-url> wato && cd wato
cp .env.example .env
npm install
npm run docker:db
npm run db:migrate
npm run db:seed
npm run dev
```

Open http://localhost:3000

## Environment

Edit `.env` — at minimum set `NEXTAUTH_SECRET` to a random 32+ character string:

```bash
openssl rand -base64 32
```

The default `DATABASE_URL` matches the Docker Postgres service started by `npm run docker:db`.

## Demo accounts

| Email | Password | Role |
|-------|----------|------|
| demo1@test.com | password123 | Admin |
| demo2@test.com | password123 | User |

## Full Docker stack

To run the app inside a container (no hot reload):

```bash
npm run docker:up
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
