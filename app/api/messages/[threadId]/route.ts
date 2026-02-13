import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { threadId: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id

    const thread = await prisma.messageThread.findUnique({
      where: { id: params.threadId },
      include: {
        userA: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
          },
        },
        userB: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    })

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      )
    }

    // Check if user is part of the thread
    if (thread.userAId !== userId && thread.userBId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const messages = await prisma.message.findMany({
      where: { threadId: params.threadId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    })

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        threadId: params.threadId,
        senderId: { not: userId },
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    })

    return NextResponse.json({ thread, messages })
  } catch (error) {
    console.error('Fetch thread error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
