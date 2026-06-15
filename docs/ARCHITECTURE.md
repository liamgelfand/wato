# Wato Architecture

## Overview

Wato is a full-stack Next.js application. The frontend (React Server/Client Components) and backend (API routes + server actions) share a single TypeScript codebase deployed as one unit.

## Key Patterns

### Hybrid mutations
- **Server Actions** for simple form flows (friend accept/decline, attempt creation, admin actions)
- **API routes** for client `fetch` (challenge create, proof upload, messaging, reports)

### Auth
NextAuth v5 with JWT sessions. Extended session includes `id`, `username`, `role`, `avatarUrl`. Types in `types/next-auth.d.ts`.

### Storage
Pluggable via `lib/storage.ts`: local filesystem for dev, S3 for production.

### Rate limiting
`lib/rate-limit.ts` — in-memory by default; optional Upstash Redis REST for multi-instance deployments.

### Design system
Tailwind CSS v4 with shadcn/ui. Brand palette: warm coral primary, deep pine secondary, parchment backgrounds. Tokens in `app/globals.css`.

## Data model

Core entities: User, Challenge, Attempt, VerificationVote, Friendship, MessageThread, Message, Notification, Report, PointsLedger.

See `prisma/schema.prisma` for the full schema.
