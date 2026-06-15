# Wato API Reference

Base URL: `/api`

## Authentication

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| * | `/api/auth/[...nextauth]` | — | NextAuth session handlers |

## Challenges

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/challenges/create` | Yes | Create a challenge |

**Body:** `{ title, description, category, difficulty }`  
**Points:** `10 × difficulty`

## Attempts

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/attempts/[id]` | Yes | Fetch attempt |
| POST | `/api/attempts/upload-proof` | Yes | Upload proof (multipart) |
| POST | `/api/attempts/[id]/verify` | Yes | Submit verification vote |

**Verification rules:** ≥2 VERIFY votes and 0 REJECT = approved; ≥1 REJECT = rejected.

## Friends

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/friends/send-request` | Yes | Send friend request by username |

## Messages

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/messages/create-thread` | Yes | Create or get thread with a friend |
| GET | `/api/messages/[threadId]` | Yes | Fetch thread messages |
| POST | `/api/messages/[threadId]/send` | Yes | Send a message |

## Notifications

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/notifications/unread-count` | Optional | Unread notification count |

## Reports

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/reports/submit` | Yes | Report challenge or attempt |

## Health

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/health` | No | Database and app health check |

## Rate Limits

- Challenge creation: 10/day
- Friend requests: 5/hour
- Messages: 20/minute
- General API: 100/minute

Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for distributed rate limiting in production.
