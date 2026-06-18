import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'
import { prisma } from '@/lib/db'
import { getFriendIds } from '@/lib/friends'

export async function GET(request: Request) {
  const user = await getApiUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const scope = searchParams.get('scope') === 'public' ? 'public' : 'friends'
  const period = searchParams.get('period') === 'weekly' ? 'weekly' : 'alltime'

  if (scope === 'public') {
    if (period === 'alltime') {
      const users = await prisma.user.findMany({
        select: { id: true, username: true, name: true, avatarUrl: true, totalPoints: true },
        orderBy: { totalPoints: 'desc' },
        take: 50,
      })
      return NextResponse.json({ scope, period, users })
    }
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const weekly = await prisma.pointsLedger.groupBy({
      by: ['userId'],
      where: { createdAt: { gte: oneWeekAgo } },
      _sum: { points: true },
    })
    const sorted = weekly
      .map((w) => ({ userId: w.userId, points: w._sum.points ?? 0 }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 50)
    const users = await prisma.user.findMany({
      where: { id: { in: sorted.map((s) => s.userId) } },
      select: { id: true, username: true, name: true, avatarUrl: true },
    })
    return NextResponse.json({
      scope,
      period,
      users: sorted.map((s) => ({
        ...users.find((u) => u.id === s.userId),
        weeklyPoints: s.points,
      })),
    })
  }

  const friendIds = await getFriendIds(user.id)
  const ids = [user.id, ...friendIds]

  if (period === 'alltime') {
    const users = await prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, username: true, name: true, avatarUrl: true, totalPoints: true },
      orderBy: { totalPoints: 'desc' },
    })
    return NextResponse.json({ scope, period, users })
  }

  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const weekly = await prisma.pointsLedger.groupBy({
    by: ['userId'],
    where: { userId: { in: ids }, createdAt: { gte: oneWeekAgo } },
    _sum: { points: true },
  })
  const users = await prisma.user.findMany({
    where: { id: { in: ids } },
    select: { id: true, username: true, name: true, avatarUrl: true },
  })
  const ranked = weekly
    .map((w) => ({
      ...users.find((u) => u.id === w.userId),
      weeklyPoints: w._sum.points ?? 0,
    }))
    .sort((a, b) => (b.weeklyPoints ?? 0) - (a.weeklyPoints ?? 0))

  return NextResponse.json({ scope, period, users: ranked })
}
