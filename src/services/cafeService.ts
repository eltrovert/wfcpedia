import type { Cafe, CafeRating, FilterOptions } from '../types/cafe'
import { googleSheetsService, GoogleSheetsError } from './googleSheetsService'
import { cacheService } from './cacheService'
import { syncService } from './syncService'
import { getNetworkStatus, getCacheStrategy } from '../utils/network'

/**
 * Main service layer that combines Google Sheets, caching, and sync services
 * Implements offline-first patterns with optimistic updates
 */
export class CafeService {
  private readonly CAFES_CACHE_KEY = 'cafes-list'
  private readonly CACHE_TTL = 60 * 60 * 1000 // 1 hour

  /**
   * Get cafes with cache-first strategy
   */
  async getCafes(
    filters?: FilterOptions,
    forceRefresh = false
  ): Promise<Cafe[]> {
    const cacheStrategy = getCacheStrategy()
    const networkStatus = getNetworkStatus()

    try {
      if (
        cacheStrategy === 'cache-only' ||
        (!forceRefresh && cacheStrategy === 'cache-first')
      ) {
        // Try cache first
        const cached = await this.getCachedCafes(filters)
        if (cached.length > 0) {
          // If we're online and using cache-first, try to refresh in background
          if (networkStatus.online && cacheStrategy === 'cache-first') {
            this.refreshCafesInBackground(filters)
          }
          return cached
        }
      }

      if (networkStatus.online) {
        // Fetch from API
        const cafes = await googleSheetsService.getCafes(filters)

        // Cache the results
        await cacheService.cacheCafes(cafes)
        await cacheService.set(this.CAFES_CACHE_KEY, cafes, this.CACHE_TTL)

        return cafes
      } else {
        // Offline fallback to cache
        return await this.getCachedCafes(filters)
      }
    } catch (error) {
      console.error('Failed to fetch cafes:', error)

      // Fallback to cache on any error
      const cached = await this.getCachedCafes(filters)
      if (cached.length > 0) {
        console.warn('Falling back to cached data')
        return cached
      }

      throw error
    }
  }

  /**
   * Get single cafe by ID
   */
  async getCafe(id: string): Promise<Cafe | null> {
    try {
      // Try cache first
      const cached = await cacheService.getCachedCafe(id)
      if (cached) {
        return cached
      }

      // If not in cache and we're online, fetch all cafes (Google Sheets limitation)
      const networkStatus = getNetworkStatus()
      if (networkStatus.online) {
        const cafes = await this.getCafes()
        return cafes.find(cafe => cafe.id === id) || null
      }

      return null
    } catch (error) {
      console.error(`Failed to fetch cafe ${id}:`, error)
      return null
    }
  }

  /**
   * Add new cafe with optimistic updates
   */
  async addCafe(cafe: Cafe): Promise<void> {
    const networkStatus = getNetworkStatus()

    try {
      // Optimistic update - add to cache immediately
      const existingCafes = await this.getCachedCafes()
      const updatedCafes = [...existingCafes, cafe]
      await cacheService.cacheCafes(updatedCafes)

      if (networkStatus.online) {
        // Try to sync immediately
        await googleSheetsService.addCafe(cafe)
      } else {
        // Queue for offline sync
        await syncService.queueCafeCreation(cafe)
      }
    } catch (error) {
      // Remove from optimistic update if sync fails
      const existingCafes = await this.getCachedCafes()
      const revertedCafes = existingCafes.filter(c => c.id !== cafe.id)
      await cacheService.cacheCafes(revertedCafes)

      if (error instanceof GoogleSheetsError) {
        // Queue for retry if it's a transient error
        await syncService.queueCafeCreation(cafe)
      }

      throw error
    }
  }

  /**
   * Update existing cafe with optimistic updates
   */
  async updateCafe(cafe: Cafe): Promise<void> {
    const networkStatus = getNetworkStatus()

    try {
      // Optimistic update - update cache immediately
      const existingCafes = await this.getCachedCafes()
      const updatedCafes = existingCafes.map(c => (c.id === cafe.id ? cafe : c))
      await cacheService.cacheCafes(updatedCafes)

      if (networkStatus.online) {
        // Try to sync immediately
        await googleSheetsService.updateCafe(cafe)
      } else {
        // Queue for offline sync
        await syncService.queueCafeUpdate(cafe)
      }
    } catch (error) {
      // Revert optimistic update if sync fails
      // We'd need the original cafe data to revert properly
      // For now, we'll re-fetch from cache or accept the optimistic state

      if (error instanceof GoogleSheetsError) {
        // Queue for retry if it's a transient error
        await syncService.queueCafeUpdate(cafe)
      }

      throw error
    }
  }

  /**
   * Add cafe rating with optimistic updates
   */
  async addRating(rating: CafeRating): Promise<void> {
    const networkStatus = getNetworkStatus()

    try {
      if (networkStatus.online) {
        // Try to sync immediately
        await googleSheetsService.addRating(rating)
      } else {
        // Queue for offline sync
        await syncService.queueRatingCreation(rating)
      }

      // Update love count if rating includes it
      if (rating.loveGiven) {
        await this.incrementCafeLoveCount(rating.cafeId)
      }
    } catch (error) {
      if (error instanceof GoogleSheetsError) {
        // Queue for retry if it's a transient error
        await syncService.queueRatingCreation(rating)
      }

      throw error
    }
  }

  /**
   * Get ratings for a specific cafe
   */
  async getCafeRatings(cafeId: string): Promise<CafeRating[]> {
    const networkStatus = getNetworkStatus()

    try {
      if (networkStatus.online) {
        return await googleSheetsService.getCafeRatings(cafeId)
      } else {
        // For offline mode, we'd need to cache ratings separately
        // This is a limitation of the current implementation
        return []
      }
    } catch (error) {
      console.error(`Failed to fetch ratings for cafe ${cafeId}:`, error)
      return []
    }
  }

  /**
   * Refresh cafes in background (for cache-first strategy)
   */
  private async refreshCafesInBackground(
    filters?: FilterOptions
  ): Promise<void> {
    try {
      const cafes = await googleSheetsService.getCafes(filters)
      await cacheService.cacheCafes(cafes)
      await cacheService.set(this.CAFES_CACHE_KEY, cafes, this.CACHE_TTL)
    } catch (error) {
      console.warn('Background refresh failed:', error)
    }
  }

  /**
   * Get cached cafes with optional filtering
   */
  private async getCachedCafes(filters?: FilterOptions): Promise<Cafe[]> {
    let cafes = await cacheService.getCachedCafes()

    // Apply filters if provided
    if (filters) {
      cafes = this.applyCafeFilters(cafes, filters)
    }

    return cafes
  }

  /**
   * Apply filters to cafe list (same logic as in GoogleSheetsService)
   */
  private applyCafeFilters(cafes: Cafe[], filters: FilterOptions): Cafe[] {
    return cafes.filter(cafe => {
      if (filters.city && cafe.location.city !== filters.city) return false
      if (filters.district && cafe.location.district !== filters.district)
        return false
      if (filters.wifiSpeed && cafe.workMetrics.wifiSpeed !== filters.wifiSpeed)
        return false
      if (
        filters.noiseLevel &&
        cafe.workMetrics.noiseLevel !== filters.noiseLevel
      )
        return false
      if (
        filters.minComfortRating &&
        cafe.workMetrics.comfortRating < filters.minComfortRating
      )
        return false
      if (
        filters.verificationStatus &&
        cafe.community.verificationStatus !== filters.verificationStatus
      )
        return false

      if (filters.amenities && filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every(amenity =>
          cafe.workMetrics.amenities.includes(amenity)
        )
        if (!hasAllAmenities) return false
      }

      return true
    })
  }

  /**
   * Increment cafe love count (optimistic update)
   */
  private async incrementCafeLoveCount(cafeId: string): Promise<void> {
    const existingCafes = await this.getCachedCafes()
    const updatedCafes = existingCafes.map(cafe => {
      if (cafe.id === cafeId) {
        return {
          ...cafe,
          community: {
            ...cafe.community,
            loveCount: cafe.community.loveCount + 1,
            lastUpdated: new Date().toISOString(),
          },
          updatedAt: new Date().toISOString(),
        }
      }
      return cafe
    })

    await cacheService.cacheCafes(updatedCafes)
  }

  /**
   * Force refresh all data from API
   */
  async forceRefresh(): Promise<Cafe[]> {
    return this.getCafes(undefined, true)
  }

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    await cacheService.clearAll()
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<{
    inProgress: boolean
    pendingOperations: number
    networkOnline: boolean
  }> {
    return await syncService.getSyncStatus()
  }

  /**
   * Force sync pending operations
   */
  async forceSync(): Promise<{ success: boolean; message: string }> {
    return await syncService.forcSync()
  }

  /**
   * Get service statistics
   */
  async getStats(): Promise<{
    cache: {
      totalCafes: number
      totalCacheEntries: number
      syncQueueSize: number
    }
    rateLimit: {
      requestsPerMinute: number
      currentRequests: number
      resetTime: number
    }
    sync: {
      inProgress: boolean
      pendingOperations: number
      networkOnline: boolean
    }
    network: {
      online: boolean
      effectiveType?: string
      downlink?: number
      rtt?: number
    }
  }> {
    const cacheStats = await cacheService.getStats()
    const rateLimitInfo = googleSheetsService.getRateLimitInfo()
    const syncStatus = await this.getSyncStatus()

    return {
      cache: cacheStats,
      rateLimit: rateLimitInfo,
      sync: syncStatus,
      network: getNetworkStatus(),
    }
  }
}

// Singleton instance for the application
export const cafeService = new CafeService()
