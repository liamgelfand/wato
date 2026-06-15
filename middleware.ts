import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    if (request.nextUrl.pathname.startsWith('/api/auth')) {
      return NextResponse.next()
    }

    const identifier =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'anonymous'

    if (request.nextUrl.pathname.includes('/challenges/create')) {
      const limit = await rateLimit(`create-challenge:${identifier}`, 10, 24 * 60 * 60 * 1000)
      if (!limit.allowed) {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message: 'Maximum 10 challenges per day',
            retryAfter: Math.ceil((limit.reset - Date.now()) / 1000),
          },
          { status: 429 }
        )
      }
    }

    if (request.nextUrl.pathname.includes('/friends/send-request')) {
      const limit = await rateLimit(`friend-request:${identifier}`, 5, 60 * 60 * 1000)
      if (!limit.allowed) {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message: 'Maximum 5 friend requests per hour',
            retryAfter: Math.ceil((limit.reset - Date.now()) / 1000),
          },
          { status: 429 }
        )
      }
    }

    if (request.nextUrl.pathname.includes('/messages') && request.method === 'POST') {
      const limit = await rateLimit(`message:${identifier}`, 20, 60 * 1000)
      if (!limit.allowed) {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message: 'Please slow down. Maximum 20 messages per minute',
            retryAfter: Math.ceil((limit.reset - Date.now()) / 1000),
          },
          { status: 429 }
        )
      }
    }

    const limit = await rateLimit(`api-general:${identifier}`, 100, 60 * 1000)
    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later',
          retryAfter: Math.ceil((limit.reset - Date.now()) / 1000),
        },
        { status: 429 }
      )
    }
  }

  const response = NextResponse.next()
  response.headers.set('X-Request-ID', crypto.randomUUID())
  return response
}

export const config = {
  matcher: ['/api/:path*'],
}
