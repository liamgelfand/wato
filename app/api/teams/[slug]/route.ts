import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'
import { prisma } from '@/lib/db'
import { getTeamLeaderboard, joinTeam } from '@/lib/teams'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getApiUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  const { searchParams } = new URL(request.url)
  const weekly = searchParams.get('period') === 'weekly'

  const team = await prisma.team.findUnique({
    where: { slug },
    include: {
      members: {
        include: {
          user: { select: { id: true, username: true, name: true, avatarUrl: true } },
        },
      },
    },
  })

  if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 })

  const leaderboard = await getTeamLeaderboard(team.id, weekly)
  return NextResponse.json({ team, leaderboard })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getApiUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  try {
    const team = await joinTeam(user.id, slug)
    return NextResponse.json({ team })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to join' },
      { status: 400 }
    )
  }
}
