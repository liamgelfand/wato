import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'
import { prisma } from '@/lib/db'
import { getEngageableAttempt } from '@/lib/attempt-engagement-access'
import { createNotification } from '@/lib/notifications'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: attemptId } = await params
    const user = await getApiUser(_request)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const attempt = await getEngageableAttempt(attemptId, user.id, user.role)
    if (!attempt) {
      return NextResponse.json({ error: 'Cannot upvote this attempt' }, { status: 403 })
    }

    const existing = await prisma.attemptUpvote.findUnique({
      where: { attemptId_userId: { attemptId, userId: user.id } },
    })

    if (existing) {
      await prisma.attemptUpvote.delete({ where: { id: existing.id } })
      const count = await prisma.attemptUpvote.count({ where: { attemptId } })
      return NextResponse.json({ upvoted: false, count })
    }

    await prisma.attemptUpvote.create({
      data: { attemptId, userId: user.id },
    })

    if (attempt.userId !== user.id) {
      await createNotification({
        userId: attempt.userId,
        type: 'ATTEMPT_UPVOTE',
        referenceType: 'ATTEMPT',
        referenceId: attemptId,
        title: 'Someone cheered you on',
        body: `${user.name || user.username} upvoted your attempt`,
      })
    }

    const count = await prisma.attemptUpvote.count({ where: { attemptId } })
    return NextResponse.json({ upvoted: true, count })
  } catch (error) {
    console.error('Attempt upvote error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
