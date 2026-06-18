import { prisma } from '@/lib/db'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

export async function createTeam(
  creatorId: string,
  name: string,
  description?: string
) {
  let slug = slugify(name)
  const existing = await prisma.team.findUnique({ where: { slug } })
  if (existing) slug = `${slug}-${Date.now().toString(36).slice(-4)}`

  return prisma.$transaction(async (tx) => {
    const team = await tx.team.create({
      data: { name, slug, description, creatorId },
    })
    await tx.teamMember.create({
      data: { teamId: team.id, userId: creatorId, role: 'OWNER' },
    })
    return team
  })
}

export async function joinTeam(userId: string, slug: string) {
  const team = await prisma.team.findUnique({ where: { slug } })
  if (!team) throw new Error('Team not found')

  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: team.id, userId } },
    create: { teamId: team.id, userId, role: 'MEMBER' },
    update: {},
  })

  return team
}

export async function getTeamLeaderboard(teamId: string, weekly = false) {
  const members = await prisma.teamMember.findMany({
    where: { teamId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          avatarUrl: true,
          totalPoints: true,
        },
      },
    },
  })

  if (!weekly) {
    return members
      .map((m) => ({ ...m.user, points: m.user.totalPoints }))
      .sort((a, b) => b.points - a.points)
  }

  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const userIds = members.map((m) => m.userId)

  const weeklyPoints = await prisma.pointsLedger.groupBy({
    by: ['userId'],
    where: { userId: { in: userIds }, createdAt: { gte: oneWeekAgo } },
    _sum: { points: true },
  })

  return members
    .map((m) => ({
      ...m.user,
      points: weeklyPoints.find((w) => w.userId === m.userId)?._sum.points ?? 0,
    }))
    .sort((a, b) => b.points - a.points)
}

export async function getUserTeams(userId: string) {
  return prisma.teamMember.findMany({
    where: { userId },
    include: { team: true },
    orderBy: { joinedAt: 'desc' },
  })
}
