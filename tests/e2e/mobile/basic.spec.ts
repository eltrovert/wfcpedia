import { test, expect } from '@playwright/test'

test.describe('Basic Mobile Tests', () => {
  test('should load home page with correct title', async ({ page }) => {
    await page.goto('/')

    // Check page loads
    await expect(page).toHaveTitle(/Vite \+ React/)

    // Check main heading exists
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
    await expect(heading).toHaveText('WFC Pedia')

    // Check subtitle
    await expect(page.locator('text=Find Your Perfect Work Café')).toBeVisible()

    // Verify mobile viewport
    const viewport = page.viewportSize()
    expect(viewport?.width).toBe(375)
    expect(viewport?.height).toBe(667)
  })

  test('should have button with correct touch target size', async ({
    page,
  }) => {
    await page.goto('/')

    const button = page.locator('button')
    await expect(button).toBeVisible()
    await expect(button).toHaveText(/Test Counter:/)

    const boundingBox = await button.boundingBox()
    expect(boundingBox?.height).toBeGreaterThanOrEqual(44)
    expect(boundingBox?.width).toBeGreaterThanOrEqual(100)
  })

  test('should display development environment status', async ({ page }) => {
    await page.goto('/')

    // Check status indicators
    await expect(page.locator('text=✓ TypeScript')).toBeVisible()
    await expect(page.locator('text=✓ Tailwind')).toBeVisible()
    await expect(page.locator('text=✓ Testing')).toBeVisible()
    await expect(page.locator('text=✓ PWA')).toBeVisible()
  })
})
