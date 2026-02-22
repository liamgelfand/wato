/**
 * Health Check Endpoint
 * 
 * Provides comprehensive health status for:
 * - Database connectivity and latency
 * - Connection pool statistics
 * - Application uptime
 * - Memory usage
 * 
 * Used by:
 * - Docker health checks
 * - Load balancers
 * - Monitoring systems
 */

import { NextResponse } from 'next/server'
import { checkDatabaseHealth, getPoolStats } from '@/lib/db'
import { env } from '@/lib/env'

const startTime = Date.now()

export async function GET() {
  try {
    // Check database health
    const dbHealth = await checkDatabaseHealth()
    
    // Get connection pool stats
    const poolStats = getPoolStats()

    // Calculate uptime
    const uptime = Math.floor((Date.now() - startTime) / 1000)

    // Memory usage (if available)
    const memoryUsage = typeof process !== 'undefined' 
      ? process.memoryUsage()
      : undefined

    if (!dbHealth.healthy) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          checks: {
            database: {
              status: 'down',
              error: dbHealth.error,
            },
          },
        },
        { status: 503 }
      )
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime,
      version: process.env.npm_package_version || 'unknown',
      environment: env.NODE_ENV,
      checks: {
        database: {
          status: 'up',
          latency: dbHealth.latency,
          pool: {
            total: poolStats.totalCount,
            idle: poolStats.idleCount,
            waiting: poolStats.waitingCount,
          },
        },
        memory: memoryUsage
          ? {
              rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
              heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
              heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
            }
          : undefined,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// HEAD request for simple alive check
export async function HEAD() {
  return new Response(null, { status: 200 })
}
