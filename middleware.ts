import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function rateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET })
  
  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const identifier = token?.id || request.ip || 'anonymous'
    
    // Different limits for different endpoints
    if (request.nextUrl.pathname.includes('/challenges/create')) {
      // Max 10 challenge creations per day
      if (!rateLimit(`create-challenge:${identifier}`, 10, 24 * 60 * 60 * 1000)) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Maximum 10 challenges per day.' },
          { status: 429 }
        )
      }
    }
    
    if (request.nextUrl.pathname.includes('/friends/send-request')) {
      // Max 5 friend requests per hour
      if (!rateLimit(`friend-request:${identifier}`, 5, 60 * 60 * 1000)) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Maximum 5 friend requests per hour.' },
          { status: 429 }
        )
      }
    }
    
    if (request.nextUrl.pathname.includes('/messages')) {
      // Max 20 messages per minute
      if (!rateLimit(`message:${identifier}`, 20, 60 * 1000)) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please slow down.' },
          { status: 429 }
        )
      }
    }
  }
  
  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token || (token as any).role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
    '/admin/:path*',
  ],
}
