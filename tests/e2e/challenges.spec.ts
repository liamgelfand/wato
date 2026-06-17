import { test, expect } from '@playwright/test'

test.describe('Challenge Feed', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'demo1@test.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/')
  })

  test('should display challenge cards', async ({ page }) => {
    const challengeCards = page.locator('[data-testid="challenge-card"]')
    await expect(challengeCards.first()).toBeVisible()

    const firstCard = challengeCards.first()
    await expect(firstCard.getByText(/\d+ pts/i)).toBeVisible()
  })

  test('should filter challenges by category', async ({ page }) => {
    await page.getByLabel('Filter by category').click()
    await page.getByRole('option', { name: 'Fitness' }).click()

    await page.waitForURL(/\?.*category=FITNESS/)
    const categoryBadges = page.getByText('Fitness', { exact: true })
    await expect(categoryBadges.first()).toBeVisible()
  })

  test('should navigate to challenge detail', async ({ page }) => {
    const firstChallenge = page.locator('[data-testid="challenge-card"]').first()
    const title = await firstChallenge.getByRole('heading', { level: 3 }).textContent()

    await firstChallenge.getByRole('link', { name: title!.trim() }).click()

    await expect(page).toHaveURL(/\/challenge\/[a-zA-Z0-9]+/)
    await expect(page.getByText(title!.trim())).toBeVisible()
    await expect(page.getByText(/points/i)).toBeVisible()
  })
})

test.describe('Create Challenge', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'demo1@test.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/')
  })

  test('should create a new challenge', async ({ page }) => {
    await page.goto('/create')

    await page.fill('#title', 'E2E Test Challenge')
    await page.fill('#description', 'This is a test challenge created by E2E tests')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL(/\/challenge\/[a-zA-Z0-9]+/)
    await expect(page.getByText('E2E Test Challenge')).toBeVisible()
  })

  test('should show validation errors', async ({ page }) => {
    await page.goto('/create')

    await page.fill('#title', '')
    await page.fill('#description', '')
    await page.click('button[type="submit"]')

    await expect(page.locator('input:invalid, textarea:invalid').first()).toBeVisible()
  })
})
