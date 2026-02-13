import { prisma } from './db'
import { NotificationType } from '@prisma/client'

interface CreateNotificationInput {
  userId: string
  type: NotificationType
  referenceType?: string
  referenceId?: string
  title: string
  body: string
}

export async function createNotification(input: CreateNotificationInput): Promise<void> {
  await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      referenceType: input.referenceType,
      referenceId: input.referenceId,
      title: input.title,
      body: input.body,
      read: false,
    },
  })
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  })
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: {
      read: true,
    },
  })
}

export async function getUnreadCount(userId: string): Promise<number> {
  return await prisma.notification.count({
    where: {
      userId,
      read: false,
    },
  })
}

export async function getNotifications(userId: string, limit = 20, cursor?: string) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
  })

  let nextCursor: string | undefined = undefined
  if (notifications.length > limit) {
    const nextItem = notifications.pop()
    nextCursor = nextItem?.id
  }

  return {
    notifications,
    nextCursor,
  }
}

export async function deleteNotification(notificationId: string, userId: string): Promise<void> {
  await prisma.notification.delete({
    where: {
      id: notificationId,
      userId, // Ensure user owns the notification
    },
  })
}
