# Backend Architecture

## Google Sheets Service Layer

```typescript
// Service layer abstraction over Google Sheets API
class GoogleSheetsBackend {
  private readonly sheetsService: GoogleSheetsService
  private readonly cacheService: CacheService
  private readonly syncService: SyncService

  constructor() {
    this.sheetsService = new GoogleSheetsService()
    this.cacheService = new CacheService()
    this.syncService = new SyncService()
  }

  // Data access layer
  async getCafes(filters: FilterOptions = {}): Promise<PaginatedResponse<Cafe>> {
    const cacheKey = `cafes:${JSON.stringify(filters)}`

    // Try cache first
    const cached = await this.cacheService.get(cacheKey)
    if (cached && !this.isCacheStale(cached)) {
      return this.filterAndPaginate(cached.data, filters)
    }

    try {
      // Fetch from Google Sheets
      const rawData = await this.sheetsService.getRange('Cafes!A2:R1000')
      const cafes = this.transformRowsToCafes(rawData.values)

      // Cache for 1 hour
      await this.cacheService.set(cacheKey, {
        data: cafes,
        timestamp: Date.now(),
        ttl: 3600000,
      })

      return this.filterAndPaginate(cafes, filters)
    } catch (error) {
      // Fallback to stale cache if available
      if (cached) {
        console.warn('Using stale cache due to API error:', error)
        return this.filterAndPaginate(cached.data, filters)
      }
      throw new BackendError('Failed to fetch cafes', error)
    }
  }

  async addCafe(cafe: Cafe): Promise<void> {
    // Add to offline queue for reliability
    await this.syncService.queueOperation({
      type: 'add_cafe',
      data: cafe,
      retries: 0,
    })

    try {
      const row = this.transformCafeToSheetRow(cafe)
      await this.sheetsService.appendRow('Cafes', row)

      // Update cache optimistically
      await this.invalidateCafesCache()
    } catch (error) {
      console.error('Failed to add cafe immediately:', error)
      // Will be retried by sync service
    }
  }

  async addRating(rating: CafeRating): Promise<void> {
    await this.syncService.queueOperation({
      type: 'add_rating',
      data: rating,
      retries: 0,
    })

    try {
      const row = this.transformRatingToSheetRow(rating)
      await this.sheetsService.appendRow('Ratings', row)

      // Update cafe's love count in cache
      await this.updateCafeLoveCount(rating.cafeId, rating.loveGiven)
    } catch (error) {
      console.error('Failed to add rating immediately:', error)
    }
  }

  // Background sync processing
  async processSyncQueue(): Promise<void> {
    const operations = await this.syncService.getPendingOperations()

    for (const operation of operations) {
      try {
        switch (operation.type) {
          case 'add_cafe':
            await this.sheetsService.appendRow(
              'Cafes',
              this.transformCafeToSheetRow(operation.data)
            )
            break

          case 'add_rating':
            await this.sheetsService.appendRow(
              'Ratings',
              this.transformRatingToSheetRow(operation.data)
            )
            break

          default:
            console.warn('Unknown operation type:', operation.type)
        }

        await this.syncService.markCompleted(operation.id)
      } catch (error) {
        await this.syncService.incrementRetries(operation.id)

        if (operation.retries >= 3) {
          console.error('Operation failed after 3 retries:', operation)
          await this.syncService.markFailed(operation.id)
        }
      }
    }
  }

  // Data transformation utilities
  private transformRowsToCafes(rows: any[][]): Cafe[] {
    return rows
      .filter(row => row.length >= 18) // Ensure complete rows
      .map(row => ({
        id: row[0],
        name: row[1],
        location: {
          address: row[2],
          coordinates: { lat: parseFloat(row[3]), lng: parseFloat(row[4]) },
          city: row[5],
          district: row[6],
        },
        workMetrics: {
          wifiSpeed: row[7] as WifiSpeed,
          comfortRating: parseInt(row[8]) as ComfortRating,
          noiseLevel: row[9] as NoiseLevel,
          amenities: JSON.parse(row[10] || '[]'),
        },
        operatingHours: JSON.parse(row[11] || '{}'),
        images: JSON.parse(row[12] || '[]'),
        community: {
          loveCount: parseInt(row[13]) || 0,
          lastUpdated: new Date(row[14]),
          contributorId: row[15],
          verificationStatus: row[16] as VerificationStatus,
        },
        createdAt: new Date(row[17]),
        updatedAt: new Date(row[17]),
      }))
  }

  private transformCafeToSheetRow(cafe: Cafe): any[] {
    return [
      cafe.id,
      cafe.name,
      cafe.location.address,
      cafe.location.coordinates.lat,
      cafe.location.coordinates.lng,
      cafe.location.city,
      cafe.location.district || '',
      cafe.workMetrics.wifiSpeed,
      cafe.workMetrics.comfortRating,
      cafe.workMetrics.noiseLevel,
      JSON.stringify(cafe.workMetrics.amenities),
      JSON.stringify(cafe.operatingHours),
      JSON.stringify(cafe.images),
      cafe.community.loveCount,
      new Date().toISOString(),
      cafe.community.contributorId,
      cafe.community.verificationStatus,
      cafe.createdAt.toISOString(),
    ]
  }
}

// Background sync service
class SyncService {
  private db: IDBDatabase

  async queueOperation(operation: SyncOperation): Promise<void> {
    const transaction = this.db.transaction(['sync_queue'], 'readwrite')
    const store = transaction.objectStore('sync_queue')

    await store.add({
      id: generateId(),
      ...operation,
      createdAt: new Date(),
    })
  }

  async getPendingOperations(): Promise<SyncOperation[]> {
    const transaction = this.db.transaction(['sync_queue'], 'readonly')
    const store = transaction.objectStore('sync_queue')

    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async markCompleted(operationId: string): Promise<void> {
    const transaction = this.db.transaction(['sync_queue'], 'readwrite')
    const store = transaction.objectStore('sync_queue')
    await store.delete(operationId)
  }

  async incrementRetries(operationId: string): Promise<void> {
    const transaction = this.db.transaction(['sync_queue'], 'readwrite')
    const store = transaction.objectStore('sync_queue')

    const operation = await store.get(operationId)
    if (operation) {
      operation.retries += 1
      await store.put(operation)
    }
  }
}
```

---
