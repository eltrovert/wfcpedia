# Mobile Testing Procedures

## Overview

This document outlines comprehensive testing procedures for mobile-first development of the WFC
Pedia application, ensuring optimal performance and user experience on mobile devices.

## Testing Environment Setup

### Required Tools

1. **Physical Devices** (Recommended)
   - Android device (mid-range, ~2GB RAM)
   - iOS device (iPhone 8 or newer)
   - Various screen sizes (5", 6", 6.5")

2. **Browser DevTools**
   - Chrome DevTools Device Mode
   - Firefox Responsive Design Mode
   - Safari Web Inspector (for iOS testing)

3. **Automated Testing**
   - Playwright with mobile viewports
   - Lighthouse CI for performance
   - axe-core for accessibility

### Network Simulation

```bash
# Chrome DevTools Network Throttling
# - Slow 3G: 400ms latency, 400kb/s down, 400kb/s up
# - Fast 3G: 150ms latency, 1.6mb/s down, 750kb/s up
# - Regular 4G: 20ms latency, 4mb/s down, 3mb/s up

# Command line network simulation
npm run test:e2e -- --network-conditions="Slow3G"
```

## Testing Checklist

### ✅ Viewport Testing

#### Standard Mobile Viewports

- [ ] **320×568** - iPhone SE (smallest)
- [ ] **375×667** - iPhone 8 (primary target)
- [ ] **414×896** - iPhone 11 Pro Max
- [ ] **360×640** - Android (Galaxy S5)
- [ ] **412×915** - Android (Pixel 5)

#### Testing Script

```bash
# Test all mobile viewports
npm run test:e2e:mobile

# Test specific viewport
npx playwright test --project="Mobile Chrome"
```

### ✅ Touch Target Testing

#### Minimum Requirements

- [ ] All interactive elements ≥ 44px
- [ ] Adequate spacing between touch targets (8px minimum)
- [ ] Touch feedback visible within 100ms

#### Manual Testing

```javascript
// Browser console script to check touch targets
const interactiveElements = document.querySelectorAll(
  'button, a, input, [role="button"], [onclick]'
)
const smallTargets = []

interactiveElements.forEach(el => {
  const rect = el.getBoundingClientRect()
  if (rect.width < 44 || rect.height < 44) {
    smallTargets.push({
      element: el,
      size: `${rect.width}×${rect.height}`,
      text: el.textContent?.trim() || el.getAttribute('aria-label') || 'No label',
    })
  }
})

console.table(smallTargets)
```

#### Automated Testing

```typescript
// tests/accessibility/touch-targets.spec.ts
test('all interactive elements meet minimum touch target size', async ({ page }) => {
  await page.goto('/')

  const smallTargets = await page.evaluate(() => {
    const interactive = document.querySelectorAll('button, a, input, [role="button"]')
    return Array.from(interactive)
      .filter(el => {
        const rect = el.getBoundingClientRect()
        return rect.width < 44 || rect.height < 44
      })
      .map(el => ({
        tag: el.tagName,
        class: el.className,
        width: el.getBoundingClientRect().width,
        height: el.getBoundingClientRect().height,
      }))
  })

  expect(smallTargets).toHaveLength(0)
})
```

### ✅ Performance Testing

#### Core Web Vitals Targets

- [ ] **First Contentful Paint (FCP)**: < 1.5s
- [ ] **Largest Contentful Paint (LCP)**: < 2.5s
- [ ] **First Input Delay (FID)**: < 100ms
- [ ] **Cumulative Layout Shift (CLS)**: < 0.1

#### Lighthouse Testing

```bash
# Run Lighthouse CI
npm run lighthouse:mobile

# Manual Lighthouse audit
lighthouse https://localhost:5173 --preset=perf --view
```

#### Performance Monitoring Script

```typescript
// tests/performance/core-web-vitals.spec.ts
import { test, expect } from '@playwright/test'

test('meets Core Web Vitals thresholds', async ({ page }) => {
  await page.goto('/')

  const metrics = await page.evaluate(() => {
    return new Promise(resolve => {
      new PerformanceObserver(list => {
        const entries = list.getEntries()
        const metrics = {}

        entries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            metrics.fcp = entry.startTime
          }
          if (entry.entryType === 'largest-contentful-paint') {
            metrics.lcp = entry.startTime
          }
        })

        resolve(metrics)
      }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] })

      // Timeout after 10 seconds
      setTimeout(() => resolve({}), 10000)
    })
  })

  if (metrics.fcp) {
    expect(metrics.fcp).toBeLessThan(1500) // 1.5s
  }
  if (metrics.lcp) {
    expect(metrics.lcp).toBeLessThan(2500) // 2.5s
  }
})
```

### ✅ Accessibility Testing

#### Screen Reader Testing

- [ ] **VoiceOver** (iOS Safari)
- [ ] **TalkBack** (Android Chrome)
- [ ] **NVDA** (Windows)

#### Keyboard Navigation

- [ ] All interactive elements reachable via Tab
- [ ] Focus indicators visible
- [ ] Logical tab order
- [ ] Escape key closes modals/menus

#### Automated Accessibility Testing

```typescript
// tests/accessibility/a11y.spec.ts
import { test } from '@playwright/test'
import { runAxeTest } from '../utils/axe-utils'

test.describe('Accessibility Tests', () => {
  test('home page meets WCAG 2.1 AA standards', async ({ page }) => {
    await page.goto('/')
    await runAxeTest(page)
  })

  test('navigation is keyboard accessible', async ({ page }) => {
    await page.goto('/')

    // Tab through all focusable elements
    const focusableCount = await page.evaluate(() => {
      return document.querySelectorAll(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ).length
    })

    for (let i = 0; i < focusableCount; i++) {
      await page.keyboard.press('Tab')

      const focusedElement = await page.evaluate(() => {
        const focused = document.activeElement
        return {
          tag: focused?.tagName,
          visible: focused ? getComputedStyle(focused).visibility !== 'hidden' : false,
          hasOutline: focused ? getComputedStyle(focused).outline !== 'none' : false,
        }
      })

      expect(focusedElement.visible).toBe(true)
      expect(focusedElement.hasOutline).toBe(true)
    }
  })
})
```

### ✅ Offline Testing

#### Service Worker Testing

- [ ] App shell loads offline
- [ ] Cached data displays
- [ ] Offline indicator shows
- [ ] Actions queue when offline

#### Testing Procedure

```typescript
// tests/offline/offline-functionality.spec.ts
test('works offline', async ({ page, context }) => {
  await page.goto('/')

  // Wait for app to load and cache resources
  await page.waitForLoadState('networkidle')

  // Go offline
  await context.setOffline(true)

  // Reload page
  await page.reload()

  // Should still work
  await expect(page.locator('body')).toBeVisible()
  await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible()

  // Test cached data
  const cafes = await page.locator('[data-testid="cafe-card"]')
  await expect(cafes).toHaveCountGreaterThan(0)
})
```

### ✅ Form Testing

#### Touch-Friendly Forms

- [ ] Input fields sized appropriately (44px min height)
- [ ] Labels clearly associated
- [ ] Error messages visible and descriptive
- [ ] Validation triggers appropriately

#### Form Testing Script

```typescript
// tests/forms/mobile-forms.spec.ts
test('cafe form is touch-friendly', async ({ page }) => {
  await page.goto('/add-cafe')

  // Check input sizes
  const inputs = await page.locator('input, textarea, select').all()

  for (const input of inputs) {
    const box = await input.boundingBox()
    expect(box?.height).toBeGreaterThanOrEqual(44)
  }

  // Test form submission
  await page.fill('[name="name"]', 'Test Café')
  await page.fill('[name="address"]', '123 Test Street')

  const submitButton = page.locator('[type="submit"]')
  await expect(submitButton).toBeVisible()

  const buttonBox = await submitButton.boundingBox()
  expect(buttonBox?.height).toBeGreaterThanOrEqual(44)
})
```

### ✅ Network Conditions Testing

#### Test Scenarios

- [ ] **Slow 3G**: App remains usable
- [ ] **Offline → Online**: Data syncs correctly
- [ ] **Poor connection**: Graceful degradation
- [ ] **Connection timeout**: Error handling works

#### Network Testing

```bash
# Test with different network conditions
npm run test:e2e -- --network-conditions="Slow3G"
npm run test:e2e -- --network-conditions="Fast3G"
npm run test:e2e -- --network-conditions="4G"
```

## Manual Testing Procedures

### Daily Testing Routine

1. **Morning Check** (5 minutes)

   ```bash
   npm run dev
   # Test on 375×667 viewport
   # Verify touch targets on main page
   # Check loading performance
   ```

2. **Feature Testing** (15 minutes)

   ```bash
   npm run test:e2e:mobile
   # Manual test new features on device
   # Verify accessibility with screen reader
   ```

3. **Pre-Deploy Testing** (30 minutes)
   ```bash
   npm run build
   npm run preview
   # Test production build
   # Run full Lighthouse audit
   # Test on multiple devices
   ```

### Weekly Comprehensive Testing

1. **Device Testing Matrix**
   - iOS Safari (iPhone 8, iPhone 12)
   - Android Chrome (various manufacturers)
   - Android Firefox (backup browser)

2. **Performance Regression Testing**

   ```bash
   npm run lighthouse:mobile:ci
   # Compare against baseline metrics
   # Flag any regressions > 10%
   ```

3. **Accessibility Audit**
   ```bash
   npm run test:accessibility
   # Manual screen reader testing
   # Keyboard navigation verification
   ```

## Automated Testing Integration

### CI/CD Pipeline

```yaml
# .github/workflows/mobile-testing.yml
name: Mobile Testing

on: [push, pull_request]

jobs:
  mobile-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run mobile tests
        run: npm run test:e2e:mobile

      - name: Run Lighthouse CI
        run: npm run lighthouse:mobile:ci

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: mobile-test-results
          path: test-results/
```

### Test Reporting

```typescript
// playwright.config.ts
export default defineConfig({
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/mobile-results.json' }],
    ['junit', { outputFile: 'test-results/mobile-results.xml' }],
  ],
})
```

## Debugging Mobile Issues

### Common Issues and Solutions

1. **Touch Events Not Working**

   ```javascript
   // Debug touch events
   element.addEventListener('touchstart', e => {
     console.log('Touch start:', e.touches[0])
   })
   ```

2. **Viewport Issues**

   ```html
   <!-- Ensure proper viewport meta tag -->
   <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
   ```

3. **Performance Problems**

   ```bash
   # Profile performance
   lighthouse --view --preset=perf --throttling.cpuSlowdownMultiplier=4
   ```

4. **iOS Safari Specific Issues**

   ```css
   /* Fix iOS bounce scrolling */
   body {
     overscroll-behavior: none;
     -webkit-overflow-scrolling: touch;
   }

   /* Fix iOS input zoom */
   input[type='text'] {
     font-size: 16px;
   }
   ```

## Performance Monitoring

### Real User Monitoring (RUM)

```typescript
// src/utils/performance.ts
export const trackCoreWebVitals = () => {
  const observer = new PerformanceObserver(list => {
    for (const entry of list.getEntries()) {
      // Send to analytics
      if (entry.entryType === 'navigation') {
        console.log('Page Load Time:', entry.duration)
      }
    }
  })

  observer.observe({ entryTypes: ['navigation', 'paint'] })
}
```

### Bundle Size Monitoring

```bash
# Check bundle sizes
npm run build
npx bundlesize

# Analyze bundle composition
npx vite-bundle-analyzer dist
```

This comprehensive testing approach ensures the WFC Pedia application delivers an excellent mobile
experience for all users.
