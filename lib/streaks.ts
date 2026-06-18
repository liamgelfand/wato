import { prisma } from '@/lib/db'
import { createNotification } from '@/lib/notifications'

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function daysBetween(a: Date, b: Date): number {
  const ms = startOfDay(a).getTime() - startOfDay(b).getTime()
  return Math.round(ms / (24 * 60 * 60 * 1000))
}

export async function recordStreakActivity(userId: string): Promise<{
  currentStreak: number
  longestStreak: number
  milestone: number | null
}> {
  const today = startOfDay(new Date())

  const existing = await prisma.userStreak.findUnique({ where: { userId } })

  if (!existing) {
    const created = await prisma.userStreak.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: today,
      },
    })
    return { currentStreak: created.currentStreak, longestStreak: created.longestStreak, milestone: null }
  }

  if (existing.lastActivityDate && daysBetween(today, existing.lastActivityDate) === 0) {
    return {
      currentStreak: existing.currentStreak,
      longestStreak: existing.longestStreak,
      milestone: null,
    }
  }

  const gap = existing.lastActivityDate
    ? daysBetween(today, existing.lastActivityDate)
    : 999

  const currentStreak = gap === 1 ? existing.currentStreak + 1 : 1
  const longestStreak = Math.max(existing.longestStreak, currentStreak)

  await prisma.userStreak.update({
    where: { userId },
    data: { currentStreak, longestStreak, lastActivityDate: today },
  })

  const milestones = [3, 7, 14, 30, 100]
  const milestone = milestones.includes(currentStreak) ? currentStreak : null

  if (milestone) {
    await createNotification({
      userId,
      type: 'STREAK_MILESTONE',
      referenceType: 'STREAK',
      referenceId: String(milestone),
      title: `${milestone}-day streak!`,
      body: `You're on a ${milestone}-day challenge streak. Keep it going!`,
    })
  }

  return { currentStreak, longestStreak, milestone }
}

export async function getUserStreak(userId: string) {
  return prisma.userStreak.findUnique({ where: { userId } })
}
