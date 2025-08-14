import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

export const runAxeTest = async (page: any, selector: string = 'body') => {
  const accessibilityScanResults = await new AxeBuilder({ page })
    .include(selector)
    .analyze()

  expect(accessibilityScanResults.violations).toEqual([])
}

export const runAxeTestWithOptions = async (
  page: any,
  options: {
    include?: string[]
    exclude?: string[]
    tags?: string[]
    rules?: Record<string, { enabled: boolean }>
  }
) => {
  let axeBuilder = new AxeBuilder({ page })

  if (options.include) {
    options.include.forEach(
      selector => (axeBuilder = axeBuilder.include(selector))
    )
  }

  if (options.exclude) {
    options.exclude.forEach(
      selector => (axeBuilder = axeBuilder.exclude(selector))
    )
  }

  if (options.tags) {
    axeBuilder = axeBuilder.withTags(options.tags)
  }

  if (options.rules) {
    Object.entries(options.rules).forEach(([rule, config]) => {
      axeBuilder = axeBuilder.disableRules([rule])
    })
  }

  const results = await axeBuilder.analyze()
  expect(results.violations).toEqual([])
}

// Common accessibility test patterns
export const testTouchTargetSize = test.extend({
  // Ensure all interactive elements meet 44px minimum touch target
  checkTouchTargets: async ({ page }, use) => {
    await use(async () => {
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
  },
})

export const testKeyboardNavigation = async (page: any) => {
  // Test that all interactive elements can be reached via keyboard
  await page.keyboard.press('Tab')

  const focusableElements = await page.evaluate(() => {
    const focusable = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    return Array.from(focusable).length
  })

  // Tab through all focusable elements
  for (let i = 0; i < focusableElements; i++) {
    await page.keyboard.press('Tab')

    // Verify focused element is visible and properly styled
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
    expect(focusedElement?.hasOutline).toBe(true)
  }
}
