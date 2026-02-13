import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendFriendRequestSchema } from '@/lib/validations'
import { createNotification } from '@/lib/notifications'

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    const validation = sendFriendRequestSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { username } = validation.data
    const userId = (session.user as any).id

    // Find user by username
    const targetUser = await prisma.user.findUnique({
      where: { username },
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (targetUser.id === userId) {
      return NextResponse.json(
        { error: 'Cannot send friend request to yourself' },
        { status: 400 }
      )
    }

    // Check if friendship already exists
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: userId, addresseeId: targetUser.id },
          { requesterId: targetUser.id, addresseeId: userId },
        ],
      },
    })

    if (existing) {
      if (existing.status === 'ACCEPTED') {
        return NextResponse.json(
          { error: 'Already friends' },
          { status: 400 }
        )
      }
      if (existing.status === 'PENDING') {
        return NextResponse.json(
          { error: 'Friend request already sent' },
          { status: 400 }
        )
      }
    }

    // Create friend request
    const friendship = await prisma.friendship.create({
      data: {
        requesterId: userId,
        addresseeId: targetUser.id,
        status: 'PENDING',
      },
    })

    // Notify target user
    await createNotification({
      userId: targetUser.id,
      type: 'FRIEND_REQUEST',
      referenceType: 'FRIENDSHIP',
      referenceId: friendship.id,
      title: 'New friend request',
      body: `${(session.user as any).username} sent you a friend request`,
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Friend request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
