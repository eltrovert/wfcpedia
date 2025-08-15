import { cacheService } from './cacheService'
import type { Cafe } from '../types/cafe'
import type { UserSession, VisitHistoryEntry } from '../types/user'

/**
 * Storage error classes
 */
export class StorageError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'StorageError'
  }
}

/**
 * Storage configuration interface
 */
interface StorageConfig {
  enableCompression: boolean
  enableEncryption: boolean
  maxSize: number // bytes
  autoCleanup: boolean
  syncEnabled: boolean
}

/**
 * Unified local data management service
 * Provides abstraction over IndexedDB, localStorage, and sessionStorage
 */
export class StorageService {
  private config: StorageConfig = {
    enableCompression: true,
    enableEncryption: false,
    maxSize: 100 * 1024 * 1024, // 100MB
    autoCleanup: true,
    syncEnabled: true,
  }

  /**
   * Store cafe data
   */
  async storeCafe(cafe: Cafe): Promise<void> {
    try {
      await cacheService.cacheCafes([cafe])
    } catch (error) {
      throw new StorageError('Failed to store cafe', 'STORE_ERROR', error)
    }
  }

  /**
   * Store multiple cafes
   */
  async storeCafes(cafes: Cafe[]): Promise<void> {
    try {
      await cacheService.cacheCafes(cafes)
    } catch (error) {
      throw new StorageError('Failed to store cafes', 'STORE_ERROR', error)
    }
  }

  /**
   * Retrieve cafe by ID
   */
  async getCafe(id: string): Promise<Cafe | null> {
    try {
      return await cacheService.getCachedCafe(id)
    } catch (error) {
      throw new StorageError('Failed to retrieve cafe', 'RETRIEVE_ERROR', error)
    }
  }

  /**
   * Retrieve all cafes
   */
  async getCafes(): Promise<Cafe[]> {
    try {
      return await cacheService.getCachedCafes()
    } catch (error) {
      throw new StorageError(
        'Failed to retrieve cafes',
        'RETRIEVE_ERROR',
        error
      )
    }
  }

  /**
   * Store user session data
   */
  async storeUserSession(session: UserSession): Promise<void> {
    try {
      await cacheService.set(`user-session-${session.sessionId}`, session)
    } catch (error) {
      throw new StorageError(
        'Failed to store user session',
        'STORE_ERROR',
        error
      )
    }
  }

  /**
   * Retrieve user session
   */
  async getUserSession(sessionId: string): Promise<UserSession | null> {
    try {
      return await cacheService.get<UserSession>(`user-session-${sessionId}`)
    } catch (error) {
      throw new StorageError(
        'Failed to retrieve user session',
        'RETRIEVE_ERROR',
        error
      )
    }
  }

  /**
   * Store visit history
   */
  async storeVisitHistory(visits: VisitHistoryEntry[]): Promise<void> {
    try {
      await cacheService.set('visit-history', visits)
    } catch (error) {
      throw new StorageError(
        'Failed to store visit history',
        'STORE_ERROR',
        error
      )
    }
  }

  /**
   * Retrieve visit history
   */
  async getVisitHistory(): Promise<VisitHistoryEntry[]> {
    try {
      const visits =
        await cacheService.get<VisitHistoryEntry[]>('visit-history')
      return visits || []
    } catch (error) {
      throw new StorageError(
        'Failed to retrieve visit history',
        'RETRIEVE_ERROR',
        error
      )
    }
  }

  /**
   * Clear all data
   */
  async clearAll(): Promise<void> {
    try {
      await cacheService.clearAll()
      localStorage.clear()
      sessionStorage.clear()
    } catch (error) {
      throw new StorageError('Failed to clear all data', 'CLEAR_ERROR', error)
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    totalSize: number
    availableSpace: number
    usageByType: Record<string, number>
  }> {
    try {
      const stats = await cacheService.getStats()

      // Estimate localStorage usage
      let localStorageSize = 0
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          localStorageSize += localStorage[key].length
        }
      }

      return {
        totalSize: stats.totalCafes * 1024 + localStorageSize, // Rough estimate
        availableSpace: this.config.maxSize - stats.totalCafes * 1024,
        usageByType: {
          indexedDB: stats.totalCafes * 1024,
          localStorage: localStorageSize,
          sessionStorage: 0,
        },
      }
    } catch (error) {
      throw new StorageError(
        'Failed to get storage stats',
        'STATS_ERROR',
        error
      )
    }
  }

  /**
   * Update storage configuration
   */
  updateConfig(newConfig: Partial<StorageConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
}

// Singleton instance
export const storageService = new StorageService()
