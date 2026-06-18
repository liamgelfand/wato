import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'
import { createTeam, getUserTeams } from '@/lib/teams'

export async function GET(request: Request) {
  const user = await getApiUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const teams = await getUserTeams(user.id)
  return NextResponse.json({ teams })
}

export async function POST(request: Request) {
  const user = await getApiUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, description } = await request.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Team name required' }, { status: 400 })
  }

  const team = await createTeam(user.id, name.trim(), description?.trim())
  return NextResponse.json({ team }, { status: 201 })
}
