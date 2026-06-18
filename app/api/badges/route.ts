import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'
import { getUserBadges } from '@/lib/badges'

export async function GET(request: Request) {
  const user = await getApiUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const badges = await getUserBadges(user.id)
  return NextResponse.json({ badges })
}
