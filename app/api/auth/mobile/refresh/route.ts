import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createAccessToken, rotateRefreshToken } from '@/lib/mobile-tokens'

export async function POST(request: Request) {
  try {
    const { refreshToken } = await request.json()
    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token required' }, { status: 400 })
    }

    const rotated = await rotateRefreshToken(refreshToken)
    if (!rotated) {
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: rotated.userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const accessToken = await createAccessToken(user)

    return NextResponse.json({
      accessToken,
      refreshToken: rotated.newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        totalPoints: user.totalPoints,
      },
    })
  } catch (error) {
    console.error('Mobile refresh error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
