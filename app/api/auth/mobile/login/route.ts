import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { createAccessToken, createRefreshToken } from '@/lib/mobile-tokens'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user?.password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const accessToken = await createAccessToken(user)
    const refreshToken = await createRefreshToken(user.id)

    return NextResponse.json({
      accessToken,
      refreshToken,
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
    console.error('Mobile login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
