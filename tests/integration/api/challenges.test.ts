/**
 * @jest-environment node
 */
/**
 * Integration tests for challenges API
 * These tests require a test database to be running
 * Run: npm run docker:test
 */
import { prisma } from '@/lib/db'
import { POST } from '@/app/api/challenges/create/route'
import { ChallengeCategory, ChallengeDifficulty } from '@prisma/client'

// Check if database is available
const isDatabaseAvailable = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch {
    return false
  }
}

// Mock NextAuth
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(() =>
    Promise.resolve({
      user: {
        id: 'test-user-1',
        email: 'test@example.com',
        username: 'testuser',
      },
    })
  ),
}))

describe('/api/challenges/create', () => {
  let testUser: any
  let dbAvailable = false

  beforeAll(async () => {
    dbAvailable = await isDatabaseAvailable()
    if (!dbAvailable) {
      console.warn('⚠️  Test database not available - skipping API tests')
      console.warn('   Run: npm run docker:test')
      return
    }
    // Create a test user
    testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        username: 'testuser',
        name: 'Test User',
        passwordHash: 'hashed_password',
      },
    })
  })

  afterAll(async () => {
    // Clean up test data
    if (dbAvailable && testUser) {
      try {
        await prisma.challenge.deleteMany({
          where: { creatorId: testUser.id },
        })
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    await prisma.$disconnect()
  })

  it('should create a new challenge with valid data', async () => {
    if (!dbAvailable) {
      console.log('Skipping: database not available')
      return
    }
    const validChallenge = {
      title: 'Integration Test Challenge',
      description: 'This is a test challenge for integration testing',
      category: ChallengeCategory.FITNESS,
      difficulty: ChallengeDifficulty.MEDIUM,
      basePoints: 100,
    }

    const request = new Request('http://localhost:3000/api/challenges/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validChallenge),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toHaveProperty('challenge')
    expect(data.challenge.title).toBe(validChallenge.title)
    expect(data.challenge.points).toBe(150) // 100 * 1.5 for MEDIUM
  })

  it('should reject challenge with banned words', async () => {
    if (!dbAvailable) {
      console.log('Skipping: database not available')
      return
    }
    
    const invalidChallenge = {
      title: 'Drinking Challenge',
      description: 'This contains alcohol',
      category: ChallengeCategory.FUNNY,
      difficulty: ChallengeDifficulty.EASY,
      basePoints: 50,
    }

    const request = new Request('http://localhost:3000/api/challenges/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidChallenge),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('banned')
  })

  it('should reject challenge with invalid data', async () => {
    if (!dbAvailable) {
      console.log('Skipping: database not available')
      return
    }
    
    const invalidChallenge = {
      title: 'A', // Too short
      description: 'Test',
      category: 'INVALID_CATEGORY',
      difficulty: ChallengeDifficulty.MEDIUM,
      basePoints: -10, // Negative points
    }

    const request = new Request('http://localhost:3000/api/challenges/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidChallenge),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
  })
})
