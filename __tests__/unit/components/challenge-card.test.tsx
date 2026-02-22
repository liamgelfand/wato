import { render, screen } from '@testing-library/react'
import ChallengeCard from '@/components/challenge/challenge-card'

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>
})

// Mock Prisma to avoid database connection in unit tests
jest.mock('@/lib/db', () => ({
  prisma: {
    $on: jest.fn(),
    $disconnect: jest.fn(),
  },
}))

describe('ChallengeCard', () => {
  const mockChallenge = {
    id: 'test-challenge-1',
    title: 'Test Challenge',
    description: 'This is a test challenge description',
    category: 'FITNESS' as const,
    difficulty: 'MEDIUM' as const,
    points: 150,
    basePoints: 100,
    status: 'ACTIVE' as const,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    creatorId: 'user-1',
    creator: {
      username: 'testuser',
      avatarUrl: null,
    },
  }

  it('should render challenge title', () => {
    render(<ChallengeCard challenge={mockChallenge} />)
    expect(screen.getByText('Test Challenge')).toBeInTheDocument()
  })

  it('should render challenge description', () => {
    render(<ChallengeCard challenge={mockChallenge} />)
    expect(screen.getByText('This is a test challenge description')).toBeInTheDocument()
  })

  it('should render challenge points', () => {
    render(<ChallengeCard challenge={mockChallenge} />)
    expect(screen.getByText(/150/)).toBeInTheDocument()
  })

  it('should render creator username', () => {
    render(<ChallengeCard challenge={mockChallenge} />)
    expect(screen.getByText(/testuser/)).toBeInTheDocument()
  })

  it('should render category badge', () => {
    render(<ChallengeCard challenge={mockChallenge} />)
    // Category should be visible somewhere in the component
    expect(screen.getByText(/FITNESS/i)).toBeInTheDocument()
  })

  it('should render difficulty', () => {
    render(<ChallengeCard challenge={mockChallenge} />)
    // Difficulty should be visible somewhere in the component
    expect(screen.getByText(/MEDIUM/i)).toBeInTheDocument()
  })
})
