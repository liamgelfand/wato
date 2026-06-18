import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'
import { prisma } from '@/lib/db'
import { revokeUserRefreshTokens } from '@/lib/mobile-tokens'

export async function DELETE(request: Request) {
  const user = await getApiUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  if (body.confirm !== user.username) {
    return NextResponse.json(
      { error: 'Type your username to confirm deletion' },
      { status: 400 }
    )
  }

  await revokeUserRefreshTokens(user.id)
  await prisma.user.delete({ where: { id: user.id } })

  return NextResponse.json({ success: true })
}
