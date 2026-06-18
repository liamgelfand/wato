import { prisma } from '@/lib/db'
import { createNotification } from '@/lib/notifications'

export async function followUser(followerId: string, followingId: string): Promise<void> {
  if (followerId === followingId) {
    throw new Error('Cannot follow yourself')
  }

  const [follower, target] = await Promise.all([
    prisma.user.findUnique({
      where: { id: followerId },
      select: { username: true, name: true },
    }),
    prisma.user.findUnique({
      where: { id: followingId },
      select: { id: true, isPrivate: true },
    }),
  ])

  if (!target) throw new Error('User not found')
  if (target.isPrivate) {
    throw new Error('This account is private. Send a friend request instead.')
  }

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  })
  if (existing) return

  await prisma.follow.create({ data: { followerId, followingId } })

  await createNotification({
    userId: followingId,
    type: 'FOLLOW',
    referenceType: 'USER',
    referenceId: followerId,
    title: 'New follower',
    body: `${follower?.name || follower?.username} started following you`,
  })
}

export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
  await prisma.follow.deleteMany({ where: { followerId, followingId } })
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const row = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  })
  return Boolean(row)
}

export async function getFollowerIds(userId: string): Promise<string[]> {
  const rows = await prisma.follow.findMany({
    where: { followingId: userId },
    select: { followerId: true },
  })
  return rows.map((r) => r.followerId)
}

export async function getFollowingIds(userId: string): Promise<string[]> {
  const rows = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  })
  return rows.map((r) => r.followingId)
}
