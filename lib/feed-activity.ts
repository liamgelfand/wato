import { prisma } from '@/lib/db'
import { getFriendIds } from '@/lib/friends'
import { excludeTestChallengesWhere } from '@/lib/public-challenges'

export type FeedActivityItem = {
  id: string
  proofUrl: string | null
  proofType: string | null
  updatedAt: Date
  source: 'friend' | 'public'
  user: {
    id: string
    username: string
    name: string | null
    avatarUrl: string | null
  }
  challenge: {
    id: string
    title: string
    points: number
  }
}

const attemptInclude = {
  user: { select: { id: true, username: true, name: true, avatarUrl: true } },
  challenge: {
    select: { id: true, title: true, points: true, status: true },
  },
} as const

function toActivityItem(attempt: {
  id: string
  proofUrl: string | null
  proofType: string | null
  updatedAt: Date
  user: { id: string; username: string; name: string | null; avatarUrl: string | null }
  challenge: { id: string; title: string; points: number }
}): FeedActivityItem {
  return {
    id: attempt.id,
    proofUrl: attempt.proofUrl,
    proofType: attempt.proofType,
    updatedAt: attempt.updatedAt,
    source: 'friend',
    user: {
      id: attempt.user.id,
      username: attempt.user.username,
      name: attempt.user.name,
      avatarUrl: attempt.user.avatarUrl,
    },
    challenge: attempt.challenge,
  }
}

function dedupeByUserAndChallenge(items: FeedActivityItem[], limit: number): FeedActivityItem[] {
  const seen = new Set<string>()
  const deduped: FeedActivityItem[] = []
  for (const item of items) {
    const key = `${item.user.id}::${item.challenge.id}`
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(item)
    if (deduped.length >= limit) break
  }
  return deduped
}

export async function markFeedSeen(userId: string, attemptIds: string[]): Promise<void> {
  const unique = [...new Set(attemptIds.filter(Boolean))]
  if (unique.length === 0) return

  await prisma.feedImpression.createMany({
    data: unique.map((attemptId) => ({ userId, attemptId })),
    skipDuplicates: true,
  })
}

/** Friends-only feed. Unseen items are listed first; seen items still appear when caught up. */
export async function getFeedActivity(userId: string, limit = 30): Promise<FeedActivityItem[]> {
  const friendIds = await getFriendIds(userId)
  if (friendIds.length === 0) return []

  const [seenRows, friendAttempts] = await Promise.all([
    prisma.feedImpression.findMany({
      where: { userId },
      select: { attemptId: true },
      take: 500,
      orderBy: { seenAt: 'desc' },
    }),
    prisma.attempt.findMany({
      where: {
        userId: { in: friendIds },
        status: 'APPROVED',
        challenge: { ...excludeTestChallengesWhere },
      },
      include: attemptInclude,
      orderBy: { updatedAt: 'desc' },
      take: limit + 20,
    }),
  ])

  const seenSet = new Set(seenRows.map((r) => r.attemptId))
  const items = dedupeByUserAndChallenge(friendAttempts.map((a) => toActivityItem(a)), limit + 20)

  items.sort((a, b) => {
    const aSeen = seenSet.has(a.id) ? 1 : 0
    const bSeen = seenSet.has(b.id) ? 1 : 0
    if (aSeen !== bSeen) return aSeen - bSeen
    return b.updatedAt.getTime() - a.updatedAt.getTime()
  })

  return items.slice(0, limit)
}
