import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'
import { followUser, unfollowUser } from '@/lib/follows'

export async function POST(request: Request) {
  const user = await getApiUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { userId, action } = await request.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  try {
    if (action === 'unfollow') {
      await unfollowUser(user.id, userId)
    } else {
      await followUser(user.id, userId)
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 400 }
    )
  }
}
