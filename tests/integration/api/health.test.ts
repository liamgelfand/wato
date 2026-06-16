/**
 * @jest-environment node
 */
/**
 * Integration test for health check API
 */
import { GET } from '@/app/api/health/route'
import { checkDatabaseHealth } from '@/lib/db'

const isDatabaseAvailable = async () => {
  try {
    const health = await checkDatabaseHealth()
    return health.healthy
  } catch {
    return false
  }
}

describe('/api/health', () => {
  it('should return health status when database is available', async () => {
    if (!(await isDatabaseAvailable())) {
      console.warn('Skipping: database not available')
      return
    }

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('status', 'healthy')
    expect(data).toHaveProperty('timestamp')
    expect(data.checks.database.status).toBe('up')
  })

  it('should report database status in checks', async () => {
    const response = await GET()
    const data = await response.json()

    expect(data).toHaveProperty('checks')
    expect(data.checks).toHaveProperty('database')
    expect(['up', 'down']).toContain(data.checks.database.status)

    if (data.checks.database.status === 'up') {
      expect(response.status).toBe(200)
      expect(data.checks.database).toHaveProperty('latency')
    } else {
      expect(response.status).toBe(503)
      expect(data.status).toBe('unhealthy')
    }
  })
})
