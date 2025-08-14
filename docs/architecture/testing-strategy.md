# Testing Strategy

## Testing Pyramid

```typescript
// Unit Tests (70% of tests)
describe('CafeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGoogleSheetsAPI.reset();
  });

  it('should fetch cafes with caching', async () => {
    const mockCafes = [createMockCafe()];
    mockGoogleSheetsAPI.getCafes.mockResolvedValue(mockCafes);

    const result = await cafeService.getCafes();

    expect(result).toEqual(mockCafes);
    expect(mockGoogleSheetsAPI.getCafes).toHaveBeenCalledOnce();
  });

  it('should handle API failures gracefully', async () => {
    mockGoogleSheetsAPI.getCafes.mockRejectedValue(new Error('API Error'));

    const result = await cafeService.getCafes();

    expect(result).toEqual([]);
    expect(mockErrorHandler.logError).toHaveBeenCalled();
  });

  it('should validate cafe data before submission', () => {
    const invalidCafe = createMockCafe({ name: '' });

    expect(() => cafeService.validateCafe(invalidCafe))
      .toThrow('Cafe name is required');
  });
});

// Component Tests (20% of tests)
describe('CafeCard', () => {
  const mockCafe = createMockCafe();

  it('should render cafe information correctly', () => {
    render(<CafeCard cafe={mockCafe} />);

    expect(screen.getByText(mockCafe.name)).toBeInTheDocument();
    expect(screen.getByText(mockCafe.location.city)).toBeInTheDocument();
    expect(screen.getByLabelText(/wifi speed/i)).toBeInTheDocument();
  });

  it('should handle love button interaction', async () => {
    const user = userEvent.setup();
    const mockOnLove = vi.fn();

    render(<CafeCard cafe={mockCafe} onLove={mockOnLove} />);

    await user.click(screen.getByLabelText(/add to favorites/i));

    expect(mockOnLove).toHaveBeenCalledWith(mockCafe.id, true);
  });

  it('should be accessible with keyboard navigation', async () => {
    render(<CafeCard cafe={mockCafe} />);

    const card = screen.getByLabelText(`View details for ${mockCafe.name}`);

    expect(card).toHaveAttribute('tabindex', '0');
    expect(card).toHaveAttribute('role', 'button');
  });
});

// Integration Tests (10% of tests)
describe('Add Cafe Flow', () => {
  beforeEach(() => {
    setupMockGeolocation();
    setupMockGoogleSheetsAPI();
  });

  it('should complete full cafe addition workflow', async () => {
    const user = userEvent.setup();

    render(<App />);

    // Navigate to add cafe
    await user.click(screen.getByText('Add Café'));

    // Fill basic information
    await user.type(screen.getByLabelText(/cafe name/i), 'Test Café');
    await user.click(screen.getByText('Use Current Location'));

    // Continue to work criteria
    await user.click(screen.getByText('Next'));

    // Select work criteria
    await user.click(screen.getByLabelText(/fast wifi/i));
    await user.click(screen.getByLabelText(/4 stars/i));

    // Continue to submission
    await user.click(screen.getByText('Next'));

    // Submit
    await user.click(screen.getByText('Add to Community'));

    // Verify success
    expect(await screen.findByText(/successfully added/i)).toBeInTheDocument();
    expect(mockGoogleSheetsAPI.addCafe).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Test Café' })
    );
  });
});
```

## E2E Testing

```typescript
// Playwright E2E Tests
import { test, expect } from '@playwright/test'

test.describe('Mobile User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Mock geolocation
    await page.context().grantPermissions(['geolocation'])
    await page.setGeolocation({ latitude: -6.2088, longitude: 106.8456 }) // Jakarta

    // Mock Google Sheets API
    await page.route('**/sheets.googleapis.com/**', route => {
      route.fulfill({ json: mockSheetsResponse })
    })
  })

  test('should discover cafes on mobile device', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/')

    // Wait for location permission and data load
    await expect(page.locator('[data-testid="cafe-card"]')).toBeVisible()

    // Verify mobile-first design
    const bottomNav = page.locator('[data-testid="bottom-navigation"]')
    await expect(bottomNav).toBeVisible()
    await expect(bottomNav).toHaveCSS('position', 'fixed')

    // Test infinite scroll
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.locator('[data-testid="cafe-card"]')).toHaveCount(20)
  })

  test('should work offline', async ({ page, context }) => {
    // Load app online first
    await page.goto('/')
    await expect(page.locator('[data-testid="cafe-card"]')).toBeVisible()

    // Go offline
    await context.setOffline(true)
    await page.reload()

    // Verify offline functionality
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible()
    await expect(page.locator('[data-testid="cafe-card"]')).toBeVisible() // From cache

    // Test offline cafe addition
    await page.click('[data-testid="add-cafe-button"]')
    await page.fill('[data-testid="cafe-name"]', 'Offline Test Café')
    await page.click('[data-testid="submit-button"]')

    await expect(page.locator('[data-testid="offline-queue-indicator"]')).toBeVisible()
  })

  test('should meet performance benchmarks', async ({ page }) => {
    const start = Date.now()

    await page.goto('/')

    // Wait for first contentful paint
    await page.waitForSelector('[data-testid="cafe-card"]')

    const loadTime = Date.now() - start
    expect(loadTime).toBeLessThan(2500) // 2.5s target

    // Check Lighthouse performance (if configured)
    const lighthouse = await page.evaluate(
      () => window.performance.getEntriesByType('navigation')[0]
    )
    expect(lighthouse.domContentLoadedEventEnd).toBeLessThan(1500) // 1.5s FCP target
  })
})
```

## Performance Testing

```bash

```
