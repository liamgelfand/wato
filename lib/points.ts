import { prisma } from './db'
import { createNotification } from './notifications'
import { checkAndAwardBadges } from './badges'

export async function awardPoints(
  userId: string,
  attemptId: string,
  points: number
): Promise<void> {
  // Use a transaction to ensure atomicity
  await prisma.$transaction(async (tx) => {
    // Check if points have already been awarded for this attempt
    const existing = await tx.pointsLedger.findUnique({
      where: { attemptId },
    })

    if (existing) {
      throw new Error('Points have already been awarded for this attempt')
    }

    // Create points ledger entry
    await tx.pointsLedger.create({
      data: {
        userId,
        attemptId,
        points,
      },
    })

    // Update user's total points
    await tx.user.update({
      where: { id: userId },
      data: {
        totalPoints: {
          increment: points,
        },
      },
    })

    // Update attempt status to APPROVED
    await tx.attempt.update({
      where: { id: attemptId },
      data: {
        status: 'APPROVED',
      },
    })
  })

  await createNotification({
    userId,
    type: 'ATTEMPT_APPROVED',
    referenceType: 'ATTEMPT',
    referenceId: attemptId,
    title: 'Challenge Completed!',
    body: `Your attempt was approved! You earned ${points} points!`,
  })

  await checkAndAwardBadges(userId)
}

export async function getUserTotalPoints(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalPoints: true },
  })

  return user?.totalPoints || 0
}

export async function getUserWeeklyPoints(userId: string): Promise<number> {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const result = await prisma.pointsLedger.aggregate({
    where: {
      userId,
      createdAt: {
        gte: oneWeekAgo,
      },
    },
    _sum: {
      points: true,
    },
  })

  return result._sum.points || 0
}

export function calculateChallengePoints(basePoints: number, difficulty: string | number): number {
  // Handle both string enum and number difficulty
  let multiplier = 1
  
  if (typeof difficulty === 'string') {
    const multipliers: Record<string, number> = {
      'EASY': 1.0,
      'MEDIUM': 1.5,
      'HARD': 2.0,
      'EXPERT': 3.0,
      'EXTREME': 5.0,
    }
    multiplier = multipliers[difficulty] || 1
  } else {
    // If it's a number (1-5), use it directly as multiplier
    multiplier = difficulty
  }
  
  return Math.round(basePoints * multiplier)
}

