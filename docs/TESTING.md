# Testing

## Commands

| Suite | Command |
|-------|---------|
| Unit | `npm run test:unit` |
| Integration | `npm run test:integration` |
| E2E | `npm run test:e2e` |
| CI suite | `npm run test:all` |

## Prerequisites

Integration and E2E tests need Postgres:

```bash
npm run docker:db
npm run db:migrate
npm run db:seed
```

## E2E interactive mode

```bash
npm run test:e2e:ui
```

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs lint, typecheck, tests, build, and Docker image build on every PR.
