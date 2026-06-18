import type { NextRequest } from 'next/server'

const DEV_ORIGIN_PATTERNS = [
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
  /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/,
  /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/,
]

export function isAllowedMobileOrigin(origin: string): boolean {
  const allowDev =
    process.env.NODE_ENV === 'development' || process.env.MOBILE_CORS_DEV === 'true'

  if (allowDev) {
    return DEV_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin))
  }

  const extra = process.env.MOBILE_CORS_ORIGINS?.split(',').map((o) => o.trim()) ?? []
  return extra.includes(origin)
}

export function corsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get('origin')
  if (!origin || !isAllowedMobileOrigin(origin)) return {}

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

export function applyCorsHeaders(
  request: NextRequest,
  headers: Headers
): void {
  for (const [key, value] of Object.entries(corsHeaders(request))) {
    headers.set(key, value)
  }
}
