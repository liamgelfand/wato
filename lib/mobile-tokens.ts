import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto'
import type { UserRole } from '@prisma/client'
import { prisma } from '@/lib/db'

const ACCESS_TTL_SEC = 7 * 24 * 60 * 60
const REFRESH_DAYS = 30

function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('NEXTAUTH_SECRET must be at least 32 characters')
  }
  return secret
}

function b64url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function signJwt(payload: Record<string, unknown>): string {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = b64url(JSON.stringify(payload))
  const sig = createHmac('sha256', getSecret()).update(`${header}.${body}`).digest('base64url')
  return `${header}.${body}.${sig}`
}

function verifyJwt(token: string): Record<string, unknown> | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [header, body, sig] = parts
  const expected = createHmac('sha256', getSecret())
    .update(`${header}.${body}`)
    .digest('base64url')
  try {
    const a = Buffer.from(sig)
    const b = Buffer.from(expected)
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  } catch {
    return null
  }
  try {
    const json = Buffer.from(body.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
    const payload = JSON.parse(json) as Record<string, unknown>
    if (typeof payload.exp === 'number' && payload.exp < Date.now() / 1000) return null
    return payload
  } catch {
    return null
  }
}

export interface AccessTokenPayload {
  sub: string
  email: string
  username: string
  name: string | null
  role: UserRole
  avatarUrl: string | null
}

export async function createAccessToken(user: {
  id: string
  email: string
  username: string
  name: string | null
  role: UserRole
  avatarUrl: string | null
}): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  return signJwt({
    sub: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
    iat: now,
    exp: now + ACCESS_TTL_SEC,
  })
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload | null> {
  const payload = verifyJwt(token)
  if (!payload || typeof payload.sub !== 'string') return null
  return {
    sub: payload.sub,
    email: String(payload.email ?? ''),
    username: String(payload.username ?? ''),
    name: payload.name ? String(payload.name) : null,
    role: payload.role as UserRole,
    avatarUrl: payload.avatarUrl ? String(payload.avatarUrl) : null,
  }
}

export async function createRefreshToken(userId: string): Promise<string> {
  const raw = randomBytes(32).toString('hex')
  const tokenHash = createHash('sha256').update(raw).digest('hex')
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + REFRESH_DAYS)

  await prisma.mobileRefreshToken.create({
    data: { userId, tokenHash, expiresAt },
  })

  return raw
}

export async function rotateRefreshToken(raw: string): Promise<{
  userId: string
  newRefreshToken: string
} | null> {
  const tokenHash = createHash('sha256').update(raw).digest('hex')
  const record = await prisma.mobileRefreshToken.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          role: true,
          avatarUrl: true,
        },
      },
    },
  })

  if (!record || record.expiresAt < new Date()) {
    if (record) {
      await prisma.mobileRefreshToken.delete({ where: { id: record.id } })
    }
    return null
  }

  await prisma.mobileRefreshToken.delete({ where: { id: record.id } })
  const newRefreshToken = await createRefreshToken(record.userId)

  return { userId: record.userId, newRefreshToken }
}

export async function revokeUserRefreshTokens(userId: string): Promise<void> {
  await prisma.mobileRefreshToken.deleteMany({ where: { userId } })
}
