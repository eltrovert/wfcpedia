# API Specification

## Google Sheets Integration

```typescript
// Google Sheets Service Layer
class GoogleSheetsService {
  private readonly SPREADSHEET_ID = process.env.VITE_SHEETS_ID
  private readonly API_KEY = process.env.VITE_GOOGLE_API_KEY
  private readonly BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets'

  // Rate limiting: 300 requests/minute
  private rateLimiter = new RateLimiter(300, 60000)

  // Café CRUD Operations
  async getCafes(filters?: FilterOptions): Promise<Cafe[]> {
    // Sheet: 'Cafes' - Range: A2:Z1000
    const response = await this.rateLimitedFetch(
      `${this.BASE_URL}/${this.SPREADSHEET_ID}/values/Cafes!A2:Z1000`
    )
    return this.transformRowsToCafes(response.values)
  }

  async addCafe(cafe: Cafe): Promise<void> {
    // Optimistic update with offline queue
    await this.cacheService.addOptimisticUpdate('cafe', cafe)

    const row = this.transformCafeToRow(cafe)
    await this.rateLimitedFetch(`${this.BASE_URL}/${this.SPREADSHEET_ID}/values/Cafes:append`, {
      method: 'POST',
      body: JSON.stringify({
        range: 'Cafes!A:Z',
        majorDimension: 'ROWS',
        values: [row],
      }),
    })
  }

  async addRating(rating: CafeRating): Promise<void> {
    // Sheet: 'Ratings' - Anonymous tracking
    const row = this.transformRatingToRow(rating)
    await this.backgroundSync.queue('rating', row)
  }

  // Cache-aware data fetching
  private async rateLimitedFetch(url: string, options?: RequestInit) {
    await this.rateLimiter.acquire()

    // Check cache first (1-hour TTL)
    const cacheKey = this.generateCacheKey(url, options)
    const cached = await this.cacheService.get(cacheKey)

    if (cached && !this.isCacheExpired(cached)) {
      return cached.data
    }

    try {
      const response = await fetch(`${url}?key=${this.API_KEY}`, options)

      if (!response.ok) {
        throw new APIError(response.status, response.statusText)
      }

      const data = await response.json()

      // Cache successful responses
      await this.cacheService.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl: 3600000, // 1 hour
      })

      return data
    } catch (error) {
      // Network failure - return stale cache if available
      if (cached) {
        return cached.data
      }
      throw error
    }
  }
}

// Cache Service for Offline Support
class CacheService {
  private db: IDBDatabase

  async get(key: string): Promise<CachedData | null> {
    // IndexedDB implementation
  }

  async set(key: string, data: CachedData): Promise<void> {
    // IndexedDB implementation with compression
  }

  async addOptimisticUpdate(type: string, data: any): Promise<void> {
    // Queue changes for background sync
  }
}
```

---
