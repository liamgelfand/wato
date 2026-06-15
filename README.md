# Wato

Social challenge app — create dares, submit proof, earn points with friends.

## Development

```bash
cp .env.example .env
npm install
npm run docker:db          # start Postgres only
npm run db:migrate
npm run db:seed
npm run dev                # app on host with hot reload → http://localhost:3000
```

Demo login: `demo1@test.com` / `password123`

## Run everything in Docker

```bash
cp .env.example .env       # set NEXTAUTH_SECRET
npm run docker:up          # builds app image + starts db + app
```

## Project structure

```
wato/
├── app/              # Next.js pages & API routes
├── components/       # React UI
├── lib/              # business logic
├── prisma/           # database schema & migrations
├── config/           # jest, eslint
├── tests/            # unit, integration, e2e
├── docker/           # container entrypoint
├── docs/             # documentation
├── Dockerfile        # production image
└── docker-compose.yml
```

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server (use with `docker:db`) |
| `npm run docker:db` | Postgres for local dev |
| `npm run docker:up` | Full app stack in containers |
| `npm run test:unit` | Unit tests |
| `npm run build` | Production build |

## Docs

- [Config files explained](docs/CONFIG.md)
- [Setup](docs/SETUP.md)
- [Testing](docs/TESTING.md)
- [Docker deployment](docs/DEPLOYMENT.md)
- [API](docs/API.md)
- [Architecture](docs/ARCHITECTURE.md)

## License

MIT
