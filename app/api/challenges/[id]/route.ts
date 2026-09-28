import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: {
      creator: { select: { username: true, name: true, avatarUrl: true } },
      prerequisiteChallenge: { select: { id: true, title: true } },
    },
  })

  if (!challenge || challenge.status === 'HIDDEN') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const isCreator = challenge.creatorId === user.id

  const userAttempt = await prisma.attempt.findFirst({
    where: { userId: user.id, challengeId: id },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, status: true, updatedAt: true },
  })

  const hasHistory =
    userAttempt &&
    (userAttempt.status === 'APPROVED' ||
      userAttempt.status === 'PENDING' ||
      userAttempt.status === 'REJECTED')

  if (challenge.status === 'ARCHIVED') {
    if (!isCreator && !hasHistory) {
      return NextResponse.json({ error: 'Challenge is no longer available' }, { status: 404 })
    }
  } else if (challenge.status !== 'ACTIVE' && !isCreator) {
    return NextResponse.json({ error: 'Challenge is not available' }, { status: 404 })
  }

  let prerequisiteMet = true
  if (challenge.prerequisiteChallengeId) {
    const done = await prisma.attempt.findFirst({
      where: {
        userId: user.id,
        challengeId: challenge.prerequisiteChallengeId,
        status: 'APPROVED',
      },
    })
    prerequisiteMet = Boolean(done)
  }

  const existingDraft = await prisma.attempt.findFirst({
    where: { userId: user.id, challengeId: id, status: 'DRAFT' },
    select: { id: true },
  })

  return NextResponse.json({
    ...challenge,
    prerequisiteMet,
    draftAttemptId: existingDraft?.id ?? null,
    myAttempt: userAttempt
      ? {
          id: userAttempt.id,
          status: userAttempt.status,
          updatedAt: userAttempt.updatedAt,
        }
      : null,
    isCreator,
  })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const challenge = await prisma.challenge.findUnique({
    where: { id },
    select: { creatorId: true, status: true },
  })

  if (!challenge || challenge.creatorId !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (challenge.status === 'ARCHIVED') {
    return NextResponse.json({ success: true })
  }

  await prisma.challenge.update({
    where: { id },
    data: { status: 'ARCHIVED' },
  })

  return NextResponse.json({ success: true })
}
