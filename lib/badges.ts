import { prisma } from './db'
import { createNotification } from './notifications'

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
}

export const BADGE_DEFINITIONS: Badge[] = [
  { id: 'first_completion', name: 'First Win', description: 'Complete your first challenge', icon: '🏁' },
  { id: 'ten_completions', name: 'Challenge Crusher', description: 'Complete 10 challenges', icon: '💪' },
  { id: 'hundred_points', name: 'Century Club', description: 'Earn 100 total points', icon: '💯' },
  { id: 'thousand_points', name: 'Point Master', description: 'Earn 1,000 total points', icon: '👑' },
  { id: 'first_created', name: 'Creator', description: 'Create your first challenge', icon: '✨' },
  { id: 'ten_friends', name: 'Social Butterfly', description: 'Have 10 friends', icon: '🦋' },
  { id: 'ten_verifications', name: 'Trusted Judge', description: 'Review 10 challenge submissions', icon: '⚖️' },
  { id: 'streak_7', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥' },
  { id: 'streak_30', name: 'Monthly Machine', description: 'Maintain a 30-day streak', icon: '⚡' },
]

export async function getUserBadges(userId: string): Promise<Badge[]> {
  const [completedCount, createdCount, friendCount, verificationCount, user, streak] = await Promise.all([
    prisma.attempt.count({ where: { userId, status: 'APPROVED' } }),
    prisma.challenge.count({ where: { creatorId: userId } }),
    prisma.friendship.count({
      where: {
        OR: [
          { requesterId: userId, status: 'ACCEPTED' },
          { addresseeId: userId, status: 'ACCEPTED' },
        ],
      },
    }),
    prisma.verificationVote.count({ where: { voterId: userId } }),
    prisma.user.findUnique({ where: { id: userId }, select: { totalPoints: true } }),
    prisma.userStreak.findUnique({ where: { userId } }),
  ])

  const totalPoints = user?.totalPoints ?? 0
  const earned: Badge[] = []

  if (completedCount >= 1) earned.push(BADGE_DEFINITIONS[0])
  if (completedCount >= 10) earned.push(BADGE_DEFINITIONS[1])
  if (totalPoints >= 100) earned.push(BADGE_DEFINITIONS[2])
  if (totalPoints >= 1000) earned.push(BADGE_DEFINITIONS[3])
  if (createdCount >= 1) earned.push(BADGE_DEFINITIONS[4])
  if (friendCount >= 10) earned.push(BADGE_DEFINITIONS[5])
  if (verificationCount >= 10) earned.push(BADGE_DEFINITIONS[6])
  if ((streak?.currentStreak ?? 0) >= 7) earned.push(BADGE_DEFINITIONS[7])
  if ((streak?.longestStreak ?? 0) >= 30) earned.push(BADGE_DEFINITIONS[8])

  return earned
}

export async function checkAndAwardBadges(userId: string): Promise<Badge[]> {
  const badges = await getUserBadges(userId)

  const recentAchievement = await prisma.notification.findFirst({
    where: {
      userId,
      type: 'ACHIEVEMENT',
      createdAt: { gte: new Date(Date.now() - 60_000) },
    },
  })

  if (!recentAchievement && badges.length > 0) {
    const latest = badges[badges.length - 1]
    await createNotification({
      userId,
      type: 'ACHIEVEMENT',
      referenceType: 'BADGE',
      referenceId: latest.id,
      title: 'New Badge Earned!',
      body: `${latest.icon} ${latest.name}: ${latest.description}`,
    })
  }

  return badges
}
