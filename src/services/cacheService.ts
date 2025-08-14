import type { Cafe } from '../types/cafe'
import type { CacheEntry, SyncQueueItem } from '../types/api'

/**
 * IndexedDB-based caching service for offline functionality
 */
export class CacheService {
  private dbName = 'wfc-pedia-cache'
  private dbVersion = 1
  private db: IDBDatabase | null = null

  // Store names
  private readonly CAFES_STORE = 'cafes'
  private readonly CACHE_STORE = 'cache'
  private readonly SYNC_QUEUE_STORE = 'sync_queue'

  // Cache TTL (1 hour)
  private readonly DEFAULT_TTL = 60 * 60 * 1000

  constructor() {
    this.initializeDB()
  }

  /**
   * Initialize IndexedDB database and object stores
   */
  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(new Error('Failed to open IndexedDB'))

      request.onsuccess = event => {
        this.db = (event.target as IDBOpenDBRequest).result
        resolve()
      }

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result

        // Cafes store
        if (!db.objectStoreNames.contains(this.CAFES_STORE)) {
          const cafesStore = db.createObjectStore(this.CAFES_STORE, {
            keyPath: 'id',
          })
          cafesStore.createIndex('city', 'location.city', { unique: false })
          cafesStore.createIndex('updated_at', 'updatedAt', { unique: false })
          cafesStore.createIndex('love_count', 'community.loveCount', {
            unique: false,
          })
        }

        // Generic cache store
        if (!db.objectStoreNames.contains(this.CACHE_STORE)) {
          const cacheStore = db.createObjectStore(this.CACHE_STORE, {
            keyPath: 'key',
          })
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false })
        }

        // Sync queue store for offline operations
        if (!db.objectStoreNames.contains(this.SYNC_QUEUE_STORE)) {
          const syncStore = db.createObjectStore(this.SYNC_QUEUE_STORE, {
            keyPath: 'id',
          })
          syncStore.createIndex('type', 'type', { unique: false })
          syncStore.createIndex('created_at', 'createdAt', { unique: false })
        }
      }
    })
  }

  /**
   * Ensure database is ready with retry logic
   */
  private async ensureDB(): Promise<IDBDatabase> {
    if (this.db) return this.db

    try {
      await this.initializeDB()
      if (!this.db) throw new Error('Database initialization returned null')
      return this.db
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error)
      // Attempt recovery by resetting DB state
      this.db = null
      throw new Error(
        `IndexedDB initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Cache cafes data
   */
  async cacheCafes(cafes: Cafe[]): Promise<void> {
    const db = await this.ensureDB()
    const transaction = db.transaction([this.CAFES_STORE], 'readwrite')
    const store = transaction.objectStore(this.CAFES_STORE)

    const promises = cafes.map(cafe => {
      return new Promise<void>((resolve, reject) => {
        const request = store.put(cafe)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    })

    await Promise.all(promises)
  }

  /**
   * Get cached cafes
   */
  async getCachedCafes(): Promise<Cafe[]> {
    const db = await this.ensureDB()
    const transaction = db.transaction([this.CAFES_STORE], 'readonly')
    const store = transaction.objectStore(this.CAFES_STORE)

    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get cached cafe by ID
   */
  async getCachedCafe(id: string): Promise<Cafe | null> {
    const db = await this.ensureDB()
    const transaction = db.transaction([this.CAFES_STORE], 'readonly')
    const store = transaction.objectStore(this.CAFES_STORE)

    return new Promise((resolve, reject) => {
      const request = store.get(id)
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Generic cache set with TTL
   */
  async set<T = unknown>(
    key: string,
    data: T,
    ttl: number = this.DEFAULT_TTL
  ): Promise<void> {
    const db = await this.ensureDB()
    const transaction = db.transaction([this.CACHE_STORE], 'readwrite')
    const store = transaction.objectStore(this.CACHE_STORE)

    const cacheEntry: CacheEntry<T> = {
      key,
      data,
      timestamp: Date.now(),
      ttl,
    }

    return new Promise((resolve, reject) => {
      const request = store.put(cacheEntry)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Generic cache get with TTL check
   */
  async get<T = unknown>(key: string): Promise<T | null> {
    const db = await this.ensureDB()
    const transaction = db.transaction([this.CACHE_STORE], 'readonly')
    const store = transaction.objectStore(this.CACHE_STORE)

    return new Promise((resolve, reject) => {
      const request = store.get(key)
      request.onsuccess = () => {
        const result: CacheEntry<T> | undefined = request.result

        if (!result) {
          resolve(null)
          return
        }

        // Check TTL
        const now = Date.now()
        if (now - result.timestamp > result.ttl) {
          // Cache expired, remove it and return null
          this.remove(key).catch(console.warn)
          resolve(null)
          return
        }

        resolve(result.data)
      }
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Remove cache entry
   */
  async remove(key: string): Promise<void> {
    const db = await this.ensureDB()
    const transaction = db.transaction([this.CACHE_STORE], 'readwrite')
    const store = transaction.objectStore(this.CACHE_STORE)

    return new Promise((resolve, reject) => {
      const request = store.delete(key)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Clear expired cache entries
   */
  async clearExpired(): Promise<void> {
    const db = await this.ensureDB()
    const transaction = db.transaction([this.CACHE_STORE], 'readwrite')
    const store = transaction.objectStore(this.CACHE_STORE)

    const now = Date.now()

    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => {
        const entries: CacheEntry[] = request.result || []
        const expiredKeys = entries
          .filter(entry => now - entry.timestamp > entry.ttl)
          .map(entry => entry.key)

        const deletePromises = expiredKeys.map(key => {
          return new Promise<void>((resolve, reject) => {
            const deleteRequest = store.delete(key)
            deleteRequest.onsuccess = () => resolve()
            deleteRequest.onerror = () => reject(deleteRequest.error)
          })
        })

        Promise.all(deletePromises)
          .then(() => resolve())
          .catch(reject)
      }
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Add item to sync queue for offline operations
   */
  async addToSyncQueue(
    item: Omit<SyncQueueItem, 'id' | 'retries' | 'createdAt'>
  ): Promise<void> {
    const db = await this.ensureDB()
    const transaction = db.transaction([this.SYNC_QUEUE_STORE], 'readwrite')
    const store = transaction.objectStore(this.SYNC_QUEUE_STORE)

    const queueItem: SyncQueueItem = {
      id: crypto.randomUUID(),
      retries: 0,
      createdAt: new Date().toISOString(),
      ...item,
    }

    return new Promise((resolve, reject) => {
      const request = store.add(queueItem)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get pending sync queue items
   */
  async getSyncQueue(): Promise<SyncQueueItem[]> {
    const db = await this.ensureDB()
    const transaction = db.transaction([this.SYNC_QUEUE_STORE], 'readonly')
    const store = transaction.objectStore(this.SYNC_QUEUE_STORE)

    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Remove item from sync queue
   */
  async removeFromSyncQueue(id: string): Promise<void> {
    const db = await this.ensureDB()
    const transaction = db.transaction([this.SYNC_QUEUE_STORE], 'readwrite')
    const store = transaction.objectStore(this.SYNC_QUEUE_STORE)

    return new Promise((resolve, reject) => {
      const request = store.delete(id)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Update sync queue item (for retry logic)
   */
  async updateSyncQueueItem(item: SyncQueueItem): Promise<void> {
    const db = await this.ensureDB()
    const transaction = db.transaction([this.SYNC_QUEUE_STORE], 'readwrite')
    const store = transaction.objectStore(this.SYNC_QUEUE_STORE)

    return new Promise((resolve, reject) => {
      const request = store.put(item)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Clear all cache data with error recovery
   */
  async clearAll(): Promise<void> {
    try {
      const db = await this.ensureDB()
      const transaction = db.transaction(
        [this.CAFES_STORE, this.CACHE_STORE],
        'readwrite'
      )

      const promises = [
        new Promise<void>((resolve, reject) => {
          const request = transaction.objectStore(this.CAFES_STORE).clear()
          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        }),
        new Promise<void>((resolve, reject) => {
          const request = transaction.objectStore(this.CACHE_STORE).clear()
          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        }),
      ]

      await Promise.all(promises)
      console.warn('✅ All cache data cleared successfully')
    } catch (error) {
      console.error('❌ Failed to clear cache data:', error)
      // Attempt to reset database connection on failure
      this.db = null
      throw new Error(
        `Cache clear operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    totalCafes: number
    totalCacheEntries: number
    syncQueueSize: number
  }> {
    const db = await this.ensureDB()
    const transaction = db.transaction(
      [this.CAFES_STORE, this.CACHE_STORE, this.SYNC_QUEUE_STORE],
      'readonly'
    )

    const promises = [
      new Promise<number>((resolve, reject) => {
        const request = transaction.objectStore(this.CAFES_STORE).count()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      }),
      new Promise<number>((resolve, reject) => {
        const request = transaction.objectStore(this.CACHE_STORE).count()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      }),
      new Promise<number>((resolve, reject) => {
        const request = transaction.objectStore(this.SYNC_QUEUE_STORE).count()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      }),
    ]

    const [totalCafes, totalCacheEntries, syncQueueSize] =
      await Promise.all(promises)

    return {
      totalCafes,
      totalCacheEntries,
      syncQueueSize,
    }
  }
}

// Singleton instance for the application
export const cacheService = new CacheService()
