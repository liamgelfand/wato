import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'
import { getNotifications, markAllNotificationsRead } from '@/lib/notifications'

export async function GET(request: Request) {
  try {
    const user = await getApiUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor') ?? undefined
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50)

    const result = await getNotifications(user.id, limit, cursor)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Notifications error:', error)
    return NextResponse.json({ error: 'Failed to load notifications' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getApiUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    await markAllNotificationsRead(user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Mark all read error:', error)
    return NextResponse.json({ error: 'Failed to mark notifications read' }, { status: 500 })
  }
}
