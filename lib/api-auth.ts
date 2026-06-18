import type { UserRole } from '@prisma/client'
import { auth } from '@/lib/auth'
import { verifyAccessToken } from '@/lib/mobile-tokens'

export interface ApiUser {
  id: string
  email: string
  username: string
  name: string | null
  role: UserRole
  avatarUrl: string | null
}

export async function getApiUser(request?: Request): Promise<ApiUser | null> {
  if (request) {
    const header = request.headers.get('authorization')
    if (header?.startsWith('Bearer ')) {
      const token = header.slice(7)
      const payload = await verifyAccessToken(token)
      if (payload) {
        return {
          id: payload.sub,
          email: payload.email,
          username: payload.username,
          name: payload.name,
          role: payload.role,
          avatarUrl: payload.avatarUrl,
        }
      }
    }
  }

  const session = await auth()
  if (!session?.user?.id) return null

  return {
    id: session.user.id,
    email: session.user.email ?? '',
    username: session.user.username,
    name: session.user.name ?? null,
    role: session.user.role,
    avatarUrl: session.user.avatarUrl ?? null,
  }
}

export async function requireApiUser(request?: Request): Promise<ApiUser> {
  const user = await getApiUser(request)
  if (!user) {
    throw new Error('UNAUTHORIZED')
  }
  return user
}
