import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  const user = await getApiUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { token, platform } = await request.json()
  if (!token || !platform) {
    return NextResponse.json({ error: 'token and platform required' }, { status: 400 })
  }

  await prisma.deviceToken.upsert({
    where: { token },
    create: { userId: user.id, token, platform },
    update: { userId: user.id, platform },
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const user = await getApiUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { token } = await request.json()
  if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 })

  await prisma.deviceToken.deleteMany({ where: { userId: user.id, token } })
  return NextResponse.json({ success: true })
}
