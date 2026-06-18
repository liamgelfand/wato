import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'
import { getUserBadges } from '@/lib/badges'
import { getUserStreak } from '@/lib/streaks'
import { isFollowing } from '@/lib/follows'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const viewer = await getApiUser(request)
  if (!viewer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { username } = await params
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      avatarUrl: true,
      isPrivate: true,
      totalPoints: true,
      createdAt: true,
    },
  })

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (user.isPrivate && user.id !== viewer.id) {
    return NextResponse.json({ error: 'Profile is private' }, { status: 403 })
  }

  const [badges, streak, following] = await Promise.all([
    getUserBadges(user.id),
    getUserStreak(user.id),
    isFollowing(viewer.id, user.id),
  ])

  return NextResponse.json({ user, badges, streak, following, isSelf: user.id === viewer.id })
}
