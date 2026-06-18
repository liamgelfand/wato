import { prisma } from '@/lib/db'

interface PushMessage {
  title: string
  body: string
  data?: Record<string, string>
}

/** Send push via Expo Push API (works for Expo mobile apps). */
export async function sendPushToUser(userId: string, message: PushMessage): Promise<void> {
  const tokens = await prisma.deviceToken.findMany({
    where: { userId },
    select: { token: true },
  })

  if (tokens.length === 0) return

  const expoUrl = process.env.EXPO_PUSH_URL ?? 'https://exp.host/--/api/v2/push/send'
  const messages = tokens.map(({ token }) => ({
    to: token,
    title: message.title,
    body: message.body,
    data: message.data,
    sound: 'default',
  }))

  try {
    await fetch(expoUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(messages),
    })
  } catch (error) {
    console.error('Push notification failed:', error)
  }
}

export async function sendPushToUsers(
  userIds: string[],
  message: PushMessage
): Promise<void> {
  await Promise.all(userIds.map((userId) => sendPushToUser(userId, message)))
}
