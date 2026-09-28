import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'
import { getUnreadCount } from '@/lib/notifications'

export async function GET(request: Request) {
  try {
    const user = await getApiUser(request)
    if (!user) {
      return NextResponse.json({ count: 0 })
    }

    const count = await getUnreadCount(user.id)
    return NextResponse.json({ count })
  } catch (error) {
    console.error('Unread count error:', error)
    return NextResponse.json({ count: 0 })
  }
}
