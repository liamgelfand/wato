import { prisma } from '@/lib/db'
import { getFriendIds } from '@/lib/friends'

export interface FriendSuggestion {
  id: string
  username: string
  name: string | null
  avatarUrl: string | null
  totalPoints: number
  mutualCount: number
}

export async function getFriendSuggestions(userId: string, limit = 10): Promise<FriendSuggestion[]> {
  const [friendIds, following] = await Promise.all([
    getFriendIds(userId),
    prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    }),
  ])

  const exclude = new Set([userId, ...friendIds, ...following.map((f) => f.followingId)])

  if (friendIds.length === 0) {
    const popular = await prisma.user.findMany({
      where: {
        id: { notIn: Array.from(exclude) },
        isPrivate: false,
      },
      select: {
        id: true,
        username: true,
        name: true,
        avatarUrl: true,
        totalPoints: true,
      },
      orderBy: { totalPoints: 'desc' },
      take: limit,
    })
    return popular.map((u) => ({ ...u, mutualCount: 0 }))
  }

  const friendsOfFriends = await prisma.friendship.findMany({
    where: {
      status: 'ACCEPTED',
      OR: [{ requesterId: { in: friendIds } }, { addresseeId: { in: friendIds } }],
    },
    select: { requesterId: true, addresseeId: true },
  })

  const mutualMap = new Map<string, number>()
  for (const f of friendsOfFriends) {
    const candidate =
      friendIds.includes(f.requesterId) ? f.addresseeId : f.requesterId
    if (exclude.has(candidate)) continue
    mutualMap.set(candidate, (mutualMap.get(candidate) ?? 0) + 1)
  }

  const sortedIds = [...mutualMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id)

  if (sortedIds.length === 0) return []

  const users = await prisma.user.findMany({
    where: { id: { in: sortedIds }, isPrivate: false },
    select: {
      id: true,
      username: true,
      name: true,
      avatarUrl: true,
      totalPoints: true,
    },
  })

  return sortedIds
    .map((id) => {
      const user = users.find((u) => u.id === id)
      if (!user) return null
      return { ...user, mutualCount: mutualMap.get(id) ?? 0 }
    })
    .filter((u): u is FriendSuggestion => u !== null)
}
