import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'
import { getTrendingChallenges } from '@/lib/trending'

export async function GET(request: Request) {
  const user = await getApiUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get('limit') ?? 20), 50)
  const challenges = await getTrendingChallenges(limit)
  return NextResponse.json({ challenges })
}
