# Wato Roadmap

Planning notes for features beyond the current MVP. Implementation order: solid core functionality first, then social growth, then mobile.

## Near term (in progress / next)

- [x] Challenge approval workflow (moderator review before going live)
- [x] Friends vs public leaderboards
- [x] Mod-only attempt verification; friends engage via comments/upvotes/reactions
- [x] Friend discovery and suggestions (mutual friends, activity-based)
- [x] Follow model for public accounts
- [x] Push notifications (Expo push + in-app notifications)
- [x] Explore / trending page
- [x] Streaks
- [x] Challenge chains (prerequisite challenges)
- [x] Tag friends in proofs
- [x] Share sheet (Web Share API)
- [x] Team / group leaderboards
- [x] Mobile API + JWT auth
- [x] Account deletion
- [x] Deep links (.well-known)
- [x] Expo mobile scaffold (`mobile/`)
- [x] Optional Ollama AI challenge pre-review
- [x] Offline proof draft (localStorage on web)

## Challenge review automation (Ollama / local LLM)

**Goal:** Pre-screen user-submitted challenges before they hit the human mod queue.

**Feasibility:**

| Approach | Pros | Cons |
|----------|------|------|
| Manual mod approval (current) | Simple, trustworthy, no infra | Does not scale past small communities |
| Ollama on same VPS as app | Free inference, data stays on-server | Needs ~8GB+ RAM for useful models; slower than APIs |
| Managed API (OpenAI, etc.) | Fast, good quality | Cost, privacy, API keys |
| Hybrid | LLM flags obvious violations; humans approve edge cases | Best balance at medium scale |

**Suggested hybrid flow (future):**

1. User submits challenge → `PENDING_REVIEW`
2. Background job runs moderation prompt (title, description, category)
3. Auto-reject if high-confidence policy violation; else queue for human or auto-approve low-risk templates
4. Mods override in admin dashboard

**Deploying Ollama at small scale:** Possible on a single Docker host with 16GB RAM (e.g. `llama3.2:3b` or similar). Not suitable for serverless/edge. For production, run Ollama as a sidecar service and call `http://ollama:11434/api/generate` from a Next.js API route or worker.

## Mobile apps (Android & iOS)

**Recommended path:** React Native (Expo) sharing types and API contracts with the Next.js backend.

| Phase | Work |
|-------|------|
| 1 | Stabilize REST/tRPC API surface; document auth (session/JWT for mobile) |
| 2 | Expo app: auth, feed, challenge detail, proof upload (camera), leaderboard |
| 3 | Native builds (EAS), push notifications, app store listings |
| 4 | Offline drafts, deep links, share sheets |

The current web app remains the source of truth; mobile clients consume the same APIs (`/api/challenges`, `/api/attempts`, etc.).

## Social model (Instagram-like for challenges)

- **Feed:** Challenges to do + friends’ completed proofs (done)
- **Leaderboard:** Friends tab + public community tab (done)
- **Future:** Stories-style streaks, challenge chains, tagged friends in proofs, explore page for trending public challenges

## Infrastructure notes

- Keep uploads on bind-mounted volume or object storage (S3/R2) before mobile scale
- Rate-limit challenge creation and proof uploads
- Consider a job queue (BullMQ, Inngest) for LLM review and notification fan-out
