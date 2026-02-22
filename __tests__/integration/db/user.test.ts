/**
 * Database integration tests
 * Tests Prisma queries and database operations
 * 
 * NOTE: These tests require a test database running
 * Run: npm run docker:test
 */
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

// Skip these tests if no database is available
const isDatabaseAvailable = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch {
    return false
  }
}

describe('User Database Operations', () => {
  const testEmail = `test-${Date.now()}@example.com`
  let createdUserId: string
  let dbAvailable = false

  beforeAll(async () => {
    dbAvailable = await isDatabaseAvailable()
    if (!dbAvailable) {
      console.warn('⚠️  Test database not available - skipping database tests')
      console.warn('   Run: npm run docker:test')
    }
  })

  afterAll(async () => {
    // Clean up test user
    if (createdUserId && dbAvailable) {
      try {
        await prisma.user.delete({
          where: { id: createdUserId },
        })
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    await prisma.$disconnect()
  })

  it('should create a new user', async () => {
    if (!dbAvailable) {
      console.log('Skipping: database not available')
      return
    }
    const hashedPassword = await bcrypt.hash('testpassword123', 10)

    const user = await prisma.user.create({
      data: {
        email: testEmail,
        username: `testuser_${Date.now()}`,
        name: 'Test User',
        passwordHash: hashedPassword,
      },
    })

    createdUserId = user.id

    expect(user).toHaveProperty('id')
    expect(user.email).toBe(testEmail)
    expect(user.role).toBe('USER')
  })

  it('should find user by email', async () => {
    if (!dbAvailable) {
      console.log('Skipping: database not available')
      return
    }

    const user = await prisma.user.findUnique({
      where: { email: testEmail },
    })

    expect(user).not.toBeNull()
    expect(user?.email).toBe(testEmail)
  })

  it('should update user profile', async () => {
    if (!dbAvailable) {
      console.log('Skipping: database not available')
      return
    }

    const updatedUser = await prisma.user.update({
      where: { id: createdUserId },
      data: {
        name: 'Updated Test User',
        bio: 'This is a test bio',
      },
    })

    expect(updatedUser.name).toBe('Updated Test User')
    expect(updatedUser.bio).toBe('This is a test bio')
  })

  it('should enforce unique email constraint', async () => {
    if (!dbAvailable) {
      console.log('Skipping: database not available')
      return
    }

    await expect(
      prisma.user.create({
        data: {
          email: testEmail, // Duplicate email
          username: `anotheruser_${Date.now()}`,
          name: 'Another User',
          passwordHash: 'hash',
        },
      })
    ).rejects.toThrow()
  })
})
