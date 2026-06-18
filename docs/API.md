# Wato Mobile API

Base URL: `NEXTAUTH_URL` (e.g. `https://your-domain.com`)

Auth: session cookie (web) or `Authorization: Bearer <accessToken>` (mobile).

## Auth (mobile)

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/api/auth/mobile/login` | `{ email, password }` | `{ accessToken, refreshToken, user }` |
| POST | `/api/auth/mobile/refresh` | `{ refreshToken }` | `{ accessToken, refreshToken, user }` |
| POST | `/api/auth/register` | register fields | user |

## Feed & challenges

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/feed?tab=challenges\|friends&category=ALL` | Home feed data |
| GET | `/api/challenges/trending?limit=20` | Explore / trending |
| POST | `/api/challenges/create` | Create challenge (may need mod approval) |

## Attempts

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/attempts/:id` | Attempt detail |
| POST | `/api/attempts/upload-proof` | `multipart`: file, attemptId, taggedUsernames |
| POST | `/api/attempts/:id/comments` | `{ body }` |
| POST | `/api/attempts/:id/reaction` | `{ type: FIRE\|CLAP\|... }` |
| POST | `/api/attempts/:id/upvote` | Toggle upvote |

## Social

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/friends/suggestions` | Friend discovery |
| POST | `/api/friends/send-request` | `{ username }` |
| POST | `/api/follow` | `{ userId, action?: 'unfollow' }` |
| GET | `/api/users/:username` | Public profile |

## Leaderboard & teams

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/leaderboard?scope=friends\|public&period=alltime\|weekly` | Rankings |
| GET | `/api/teams` | User's teams |
| POST | `/api/teams` | `{ name, description? }` |
| GET | `/api/teams/:slug?period=weekly` | Team + leaderboard |
| POST | `/api/teams/:slug` | Join team |

## Push & account

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/devices` | `{ token, platform: ios\|android\|web }` — Expo push token |
| DELETE | `/api/devices` | `{ token }` |
| DELETE | `/api/account` | `{ confirm: username }` |

## Badges

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/badges` | Current user's earned badges |

## Deep links

- Web: `/challenge/:id`, `/attempt/:id`, `/users/:username`, `/teams/:slug`
- iOS: `/.well-known/apple-app-site-association`
- Android: `/.well-known/assetlinks.json`

## Optional env (AI review)

- `OLLAMA_URL` — e.g. `http://localhost:11434`
- `OLLAMA_MODEL` — default `llama3.2`
- `OLLAMA_AUTO_APPROVE=true` — auto-approve AI-safe challenges

## Push

- `EXPO_PUSH_URL` — default Expo push endpoint
- Register device tokens from Expo: `Notifications.getExpoPushTokenAsync()`
