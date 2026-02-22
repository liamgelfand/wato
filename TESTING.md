# Testing Guide

This document provides comprehensive information about testing in the DareScore application.

## Table of Contents

- [Overview](#overview)
- [Test Types](#test-types)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Structure](#test-structure)
- [Best Practices](#best-practices)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## Overview

DareScore implements a comprehensive testing strategy covering:

1. **Unit Tests** - Individual functions and components
2. **Integration Tests** - API routes and database operations
3. **End-to-End Tests** - Full user workflows
4. **BDD Tests** - Business requirements in human-readable format

### Test Stack

- **Jest** - Unit and integration test runner
- **React Testing Library** - Component testing
- **Playwright** - E2E browser automation
- **Cucumber** - BDD framework
- **Supertest** - API integration testing

### Coverage Goals

- **Overall Coverage**: 70%+
- **Critical Paths**: 90%+
- **New Features**: 80%+ coverage required

## Test Types

### 1. Unit Tests

Test individual functions, utilities, and components in isolation.

**Location**: `__tests__/unit/`

**Examples**:
- Pure utility functions (points calculation, validation)
- React components (UI rendering, props)
- Helper functions (formatters, parsers)

**Run**:
```bash
npm run test:unit
```

### 2. Integration Tests

Test how multiple parts work together (API routes, database operations).

**Location**: `__tests__/integration/`

**Examples**:
- API endpoint behavior
- Database queries
- Service layer interactions

**Run**:
```bash
npm run test:integration
```

### 3. End-to-End Tests

Test complete user workflows through the browser.

**Location**: `e2e/`

**Examples**:
- User authentication flow
- Creating and attempting challenges
- Leaderboard interaction

**Run**:
```bash
npm run test:e2e        # Headless mode
npm run test:e2e:ui     # Interactive UI mode
```

### 4. BDD Tests

Business-readable tests using Gherkin syntax.

**Location**: `features/`

**Examples**:
- Challenge creation scenarios
- Verification workflows
- Points awarding rules

**Run**:
```bash
npm run test:bdd
```

## Running Tests

### All Tests

```bash
# Run everything (unit, integration, e2e, bdd)
npm run test:all
```

### Development Mode

```bash
# Unit tests in watch mode (reruns on file changes)
npm test

# Or explicitly:
npm run test:unit -- --watch
```

### CI Mode

```bash
# Run with coverage (no watch mode)
npm run test:ci
```

### Specific Test Files

```bash
# Run specific test file
npm test -- __tests__/unit/lib/points.test.ts

# Run tests matching pattern
npm test -- --testPathPattern=challenges
```

### Coverage Report

```bash
# Generate coverage report
npm run test:ci

# View in browser
open coverage/lcov-report/index.html
```

## Writing Tests

### Unit Test Example

```typescript
// __tests__/unit/lib/points.test.ts
import { calculateChallengePoints } from '@/lib/points'
import { ChallengeDifficulty } from '@prisma/client'

describe('Points Calculation', () => {
  describe('calculateChallengePoints', () => {
    it('should calculate points correctly for MEDIUM difficulty', () => {
      const points = calculateChallengePoints(100, ChallengeDifficulty.MEDIUM)
      expect(points).toBe(150) // 100 * 1.5
    })

    it('should handle zero base points', () => {
      const points = calculateChallengePoints(0, ChallengeDifficulty.HARD)
      expect(points).toBe(0)
    })
  })
})
```

### Component Test Example

```typescript
// __tests__/unit/components/challenge-card.test.tsx
import { render, screen } from '@testing-library/react'
import ChallengeCard from '@/components/challenge/challenge-card'

describe('ChallengeCard', () => {
  const mockChallenge = {
    id: 'test-1',
    title: 'Test Challenge',
    description: 'Test description',
    // ...other props
  }

  it('should render challenge title', () => {
    render(<ChallengeCard challenge={mockChallenge} />)
    expect(screen.getByText('Test Challenge')).toBeInTheDocument()
  })

  it('should have link to detail page', () => {
    render(<ChallengeCard challenge={mockChallenge} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/challenge/test-1')
  })
})
```

### Integration Test Example

```typescript
// __tests__/integration/api/challenges.test.ts
import { POST } from '@/app/api/challenges/create/route'
import { prisma } from '@/lib/db'

describe('/api/challenges/create', () => {
  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('should create a new challenge', async () => {
    const request = new Request('http://localhost:3000/api/challenges/create', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Integration Test Challenge',
        description: 'Test description',
        category: 'FITNESS',
        difficulty: 'MEDIUM',
        basePoints: 100,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.challenge.title).toBe('Integration Test Challenge')
  })
})
```

### E2E Test Example

```typescript
// e2e/challenges.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Challenge Feed', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('input[type="email"]', 'demo1@test.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/')
  })

  test('should display challenge cards', async ({ page }) => {
    const challengeCards = page.locator('[data-testid="challenge-card"]')
    await expect(challengeCards.first()).toBeVisible()
  })

  test('should navigate to challenge detail', async ({ page }) => {
    const firstChallenge = page.locator('[data-testid="challenge-card"]').first()
    await firstChallenge.click()
    await expect(page).toHaveURL(/\/challenge\/[a-zA-Z0-9]+/)
  })
})
```

### BDD Test Example

```gherkin
# features/challenge-creation.feature
Feature: Challenge Creation
  As a registered user
  I want to create challenges
  So that other users can attempt them

  Scenario: Successfully create a valid challenge
    Given I am logged in as a user
    And I am on the create challenge page
    When I fill in the challenge form with valid data
    And I submit the challenge form
    Then I should see a success message
    And the challenge should be created in the database
```

```typescript
// features/step_definitions/challenge-steps.ts
import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'

Given('I am on the create challenge page', async function () {
  await this.page.goto('http://localhost:3000/create')
})

When('I fill in the challenge form with valid data', async function () {
  await this.page.fill('input[name="title"]', 'Test Challenge')
  await this.page.fill('textarea[name="description"]', 'Test description')
  // ...fill other fields
})

Then('I should see a success message', async function () {
  await expect(this.page.locator('text=/success/i')).toBeVisible()
})
```

## Test Structure

```
social_media_app/
├── __tests__/
│   ├── unit/
│   │   ├── lib/
│   │   │   ├── points.test.ts
│   │   │   ├── moderation.test.ts
│   │   │   └── validations.test.ts
│   │   └── components/
│   │       └── challenge-card.test.tsx
│   └── integration/
│       ├── api/
│       │   ├── health.test.ts
│       │   └── challenges.test.ts
│       └── db/
│           └── user.test.ts
├── e2e/
│   ├── auth.spec.ts
│   ├── challenges.spec.ts
│   ├── leaderboard.spec.ts
│   └── fixtures/
│       └── test-helpers.ts
└── features/
    ├── challenge-creation.feature
    ├── challenge-attempt.feature
    ├── leaderboard.feature
    └── step_definitions/
        ├── challenge-steps.ts
        └── common-steps.ts
```

## Best Practices

### General

1. **Test Behavior, Not Implementation**
   - Focus on what the code does, not how
   - Test from user's perspective
   - Avoid testing internal state

2. **Descriptive Test Names**
   ```typescript
   // ❌ Bad
   test('test 1', () => { ... })
   
   // ✅ Good
   test('should award 150 points for medium difficulty challenge', () => { ... })
   ```

3. **Arrange-Act-Assert Pattern**
   ```typescript
   test('example', () => {
     // Arrange - setup test data
     const input = 100
     
     // Act - perform action
     const result = calculatePoints(input)
     
     // Assert - verify result
     expect(result).toBe(150)
   })
   ```

4. **One Assertion Per Test** (when possible)
   - Makes failures easier to diagnose
   - Each test should verify one thing

5. **Use Test Data Builders**
   ```typescript
   const createMockChallenge = (overrides = {}) => ({
     id: 'test-id',
     title: 'Test Challenge',
     // ...defaults
     ...overrides,
   })
   ```

### Component Testing

1. **Query by Accessibility**
   ```typescript
   // ✅ Good - accessible
   screen.getByRole('button', { name: /submit/i })
   screen.getByLabelText(/email/i)
   
   // ❌ Avoid - fragile
   screen.getByClassName('submit-btn')
   ```

2. **User-Centric Queries**
   - `getByRole` - best for interactive elements
   - `getByLabelText` - for form fields
   - `getByText` - for text content
   - `getByTestId` - last resort

3. **Async Testing**
   ```typescript
   await waitFor(() => {
     expect(screen.getByText('Loaded')).toBeInTheDocument()
   })
   ```

### E2E Testing

1. **Independent Tests**
   - Each test should be runnable in isolation
   - Don't depend on order
   - Clean up after tests

2. **Use Page Object Pattern**
   ```typescript
   // e2e/fixtures/pages/login.page.ts
   export class LoginPage {
     async login(email: string, password: string) {
       await this.page.fill('[type="email"]', email)
       await this.page.fill('[type="password"]', password)
       await this.page.click('button[type="submit"]')
     }
   }
   ```

3. **Wait for Elements**
   ```typescript
   // ✅ Good
   await page.waitForSelector('[data-testid="challenge-card"]')
   
   // ❌ Avoid
   await page.waitForTimeout(5000)
   ```

### Database Testing

1. **Use Test Database**
   ```typescript
   // Always use separate test database
   DATABASE_URL=postgresql://postgres:testpass@localhost:5433/darescore_test
   ```

2. **Clean Up After Tests**
   ```typescript
   afterAll(async () => {
     await prisma.user.deleteMany({ where: { email: 'test@example.com' } })
     await prisma.$disconnect()
   })
   ```

3. **Use Transactions** (when possible)
   ```typescript
   beforeEach(async () => {
     await prisma.$executeRaw`BEGIN`
   })
   
   afterEach(async () => {
     await prisma.$executeRaw`ROLLBACK`
   })
   ```

## CI/CD Integration

Tests run automatically on GitHub Actions:

### On Pull Requests

- Linting and type checking
- Unit tests with coverage
- Integration tests
- E2E tests (critical paths)
- BDD scenarios

### On Merge to Main/Dev

- Full test suite
- Coverage report upload
- Docker build test

### Required Checks

PRs must pass:
- ✅ All tests pass
- ✅ Coverage ≥ 70%
- ✅ No linting errors
- ✅ TypeScript compiles

## Troubleshooting

### Tests Fail Locally but Pass in CI

1. **Database state**
   ```bash
   # Reset test database
   DATABASE_URL=postgresql://...test npm run db:migrate -- reset
   ```

2. **Dependency versions**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Environment variables**
   ```bash
   # Ensure .env.test is set correctly
   cp .env.test.example .env.test
   ```

### Slow Tests

1. **Parallel execution**
   ```bash
   # Run tests in parallel
   npm test -- --maxWorkers=4
   ```

2. **Focus on changed files**
   ```bash
   npm test -- --onlyChanged
   ```

3. **Skip slow tests during development**
   ```typescript
   test.skip('slow test', () => { ... })
   ```

### Flaky E2E Tests

1. **Add proper waits**
   ```typescript
   await page.waitForLoadState('networkidle')
   ```

2. **Increase timeouts**
   ```typescript
   test('flaky test', async ({ page }) => {
     test.setTimeout(60000) // 60 seconds
     // ...
   })
   ```

3. **Use test retries**
   ```typescript
   // playwright.config.ts
   retries: process.env.CI ? 2 : 0
   ```

### Database Connection Issues

```bash
# Check if test database is running
docker ps | grep test

# Start test database
docker-compose -f docker-compose.test.yml up -d db-test

# View logs
docker logs darescore-db-test
```

## Coverage Goals by Area

| Area | Target | Priority |
|------|--------|----------|
| Authentication | 90% | Critical |
| Points System | 95% | Critical |
| Challenge CRUD | 85% | High |
| Verification Flow | 90% | Critical |
| Messaging | 70% | Medium |
| UI Components | 75% | High |
| Utilities | 80% | High |

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Docs](https://playwright.dev/docs/intro)
- [Cucumber.js](https://cucumber.io/docs/cucumber/)
- [Testing Best Practices](https://testingjavascript.com/)

---

**Remember**: Good tests are an investment in code quality and confidence. Write tests that document behavior and catch real bugs!
