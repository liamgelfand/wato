import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

/**
 * In-Memory Rate Limiting
 * 
 * NOTE: For production with multiple instances, replace with:
 * - Redis + ioredis or upstash/ratelimit
 * - Cloudflare Rate Limiting
 * - AWS API Gateway throttling
 */

interface RateLimitRecord {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitRecord>()

// Clean up old entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  }, 60000) // Clean every minute
}

function rateLimit(key: string, maxRequests: number, windowMs: number): {
  allowed: boolean
  remaining: number
  reset: number
} {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    const resetTime = now + windowMs
    rateLimitStore.set(key, { count: 1, resetTime })
    return {
      allowed: true,
      remaining: maxRequests - 1,
      reset: resetTime,
    }
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      reset: record.resetTime,
    }
  }

  record.count++
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    reset: record.resetTime,
  }
}

export async function middleware(request: NextRequest) {
  const session = await auth()
  
  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Skip auth endpoints from rate limiting
    if (request.nextUrl.pathname.startsWith('/api/auth')) {
      return NextResponse.next()
    }

    const identifier = session?.user?.id || request.ip || request.headers.get('x-forwarded-for') || 'anonymous'
    
    // Different limits for different endpoints
    if (request.nextUrl.pathname.includes('/challenges/create')) {
      const limit = rateLimit(`create-challenge:${identifier}`, 10, 24 * 60 * 60 * 1000)
      if (!limit.allowed) {
        const response = NextResponse.json(
          { 
            error: 'Rate limit exceeded', 
            message: 'Maximum 10 challenges per day',
            retryAfter: Math.ceil((limit.reset - Date.now()) / 1000),
          },
          { status: 429 }
        )
        response.headers.set('X-RateLimit-Limit', '10')
        response.headers.set('X-RateLimit-Remaining', String(limit.remaining))
        response.headers.set('X-RateLimit-Reset', String(Math.floor(limit.reset / 1000)))
        response.headers.set('Retry-After', String(Math.ceil((limit.reset - Date.now()) / 1000)))
        return response
      }
    }
    
    if (request.nextUrl.pathname.includes('/friends/send-request')) {
      const limit = rateLimit(`friend-request:${identifier}`, 5, 60 * 60 * 1000)
      if (!limit.allowed) {
        const response = NextResponse.json(
          { 
            error: 'Rate limit exceeded',
            message: 'Maximum 5 friend requests per hour',
            retryAfter: Math.ceil((limit.reset - Date.now()) / 1000),
          },
          { status: 429 }
        )
        response.headers.set('X-RateLimit-Limit', '5')
        response.headers.set('X-RateLimit-Remaining', String(limit.remaining))
        response.headers.set('Retry-After', String(Math.ceil((limit.reset - Date.now()) / 1000)))
        return response
      }
    }
    
    if (request.nextUrl.pathname.includes('/messages') && request.method === 'POST') {
      const limit = rateLimit(`message:${identifier}`, 20, 60 * 1000)
      if (!limit.allowed) {
        const response = NextResponse.json(
          { 
            error: 'Rate limit exceeded',
            message: 'Please slow down. Maximum 20 messages per minute',
            retryAfter: Math.ceil((limit.reset - Date.now()) / 1000),
          },
          { status: 429 }
        )
        response.headers.set('X-RateLimit-Limit', '20')
        response.headers.set('X-RateLimit-Remaining', String(limit.remaining))
        response.headers.set('Retry-After', String(Math.ceil((limit.reset - Date.now()) / 1000)))
        return response
      }
    }

    // General API rate limit (catch-all)
    const limit = rateLimit(`api-general:${identifier}`, 100, 60 * 1000)
    if (!limit.allowed) {
      const response = NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later',
          retryAfter: Math.ceil((limit.reset - Date.now()) / 1000),
        },
        { status: 429 }
      )
      response.headers.set('X-RateLimit-Limit', '100')
      response.headers.set('X-RateLimit-Remaining', String(limit.remaining))
      response.headers.set('Retry-After', String(Math.ceil((limit.reset - Date.now()) / 1000)))
      return response
    }
  }
  
  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
  
  // Add security headers to all responses
  const response = NextResponse.next()
  
  // CSP Header
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self' data:;
    connect-src 'self';
    media-src 'self';
    frame-src 'self';
  `.replace(/\s{2,}/g, ' ').trim()
  
  response.headers.set('Content-Security-Policy', cspHeader)
  response.headers.set('X-Request-ID', crypto.randomUUID())
  
  return response
}

export const config = {
  matcher: [
    '/api/:path*',
    '/admin/:path*',
  ],
}
