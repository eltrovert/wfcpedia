import { test, expect } from '@playwright/test'
import {
  runAxeTest,
  runAxeTestWithOptions,
} from '../../accessibility/axe-utils'

test.describe('Basic Accessibility Tests', () => {
  test('should meet WCAG accessibility standards on home page', async ({
    page,
  }) => {
    await page.goto('/')

    // Wait for page to fully load
    await page.waitForLoadState('networkidle')

    // Run comprehensive accessibility scan
    await runAxeTest(page)
  })

  test('should have proper focus management', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Test keyboard navigation
    await page.keyboard.press('Tab')

    // Check that focused element is visible and has focus styles
    const focusedElement = await page.evaluate(() => {
      const focused = document.activeElement
      if (!focused) return null

      const styles = window.getComputedStyle(focused)
      const rect = focused.getBoundingClientRect()

      return {
        tag: focused.tagName,
        visible: rect.width > 0 && rect.height > 0,
        hasOutline: styles.outline !== 'none' || styles.outlineStyle !== 'none',
      }
    })

    expect(focusedElement?.visible).toBe(true)
  })

  test('should have proper touch target sizes', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check all interactive elements meet 44px minimum touch target
    const smallTargets = await page.evaluate(() => {
      const interactive = document.querySelectorAll(
        'button, a, input, [role="button"], [onclick]'
      )
      const small: Element[] = []

      interactive.forEach(el => {
        const rect = el.getBoundingClientRect()
        if (rect.width < 44 || rect.height < 44) {
          small.push(el)
        }
      })

      return small.map(el => ({
        tagName: el.tagName,
        className: el.className,
        width: el.getBoundingClientRect().width,
        height: el.getBoundingClientRect().height,
      }))
    })

    expect(smallTargets).toHaveLength(0)
  })

  test('should have proper semantic HTML structure', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check for proper heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
    expect(headings.length).toBeGreaterThan(0)

    // Check for main content area
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })
})
