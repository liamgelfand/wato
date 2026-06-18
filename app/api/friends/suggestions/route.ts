import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'
import { getFriendSuggestions } from '@/lib/friend-suggestions'

export async function GET(request: Request) {
  const user = await getApiUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const suggestions = await getFriendSuggestions(user.id)
  return NextResponse.json({ suggestions })
}
