/**
 * Rate limiting with in-memory fallback and optional Upstash Redis REST API.
 * Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN for multi-instance production.
 */

interface RateLimitRecord {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitRecord>()

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  }, 60_000)
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  reset: number
}

async function upstashRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null

  const windowSec = Math.ceil(windowMs / 1000)
  const redisKey = `ratelimit:${key}`

  try {
    const response = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify([
        ['INCR', redisKey],
        ['EXPIRE', redisKey, windowSec, 'NX'],
        ['TTL', redisKey],
      ]),
    })

    if (!response.ok) return null

    const results = await response.json()
    const count = results[0]?.result ?? 1
    const ttl = results[2]?.result ?? windowSec
    const reset = Date.now() + ttl * 1000

    return {
      allowed: count <= maxRequests,
      remaining: Math.max(0, maxRequests - count),
      reset,
    }
  } catch {
    return null
  }
}

function memoryRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    const resetTime = now + windowMs
    rateLimitStore.set(key, { count: 1, resetTime })
    return { allowed: true, remaining: maxRequests - 1, reset: resetTime }
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, reset: record.resetTime }
  }

  record.count++
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    reset: record.resetTime,
  }
}

export async function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult> {
  const upstash = await upstashRateLimit(key, maxRequests, windowMs)
  if (upstash) return upstash
  return memoryRateLimit(key, maxRequests, windowMs)
}
