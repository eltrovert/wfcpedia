import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Cafe } from '../types/cafe'
import { cacheService } from '../services/cacheService'

/**
 * Cache metadata interface
 */
interface CacheMetadata {
  lastUpdated: string
  ttl: number
  size: number
  hitCount: number
  missCount: number
}

/**
 * Sync queue item status
 */
interface SyncQueueStatus {
  id: string
  type: string
  status: 'pending' | 'syncing' | 'failed' | 'completed'
  retries: number
  lastAttempt?: string
  error?: string
}

/**
 * Cache store state interface
 */
interface CacheState {
  // Cached data
  cafes: Cafe[]
  cafeMetadata: CacheMetadata

  // Sync queue
  syncQueue: SyncQueueStatus[]
  isSyncing: boolean
  lastSyncAttempt: string | null
  lastSuccessfulSync: string | null

  // Cache statistics
  cacheStats: {
    totalEntries: number
    totalSize: number // bytes
    hitRate: number
    lastCleanup: string | null
  }

  // Network and performance
  isOffline: boolean
  networkSpeed: 'slow' | 'medium' | 'fast'
  adaptiveQuality: boolean

  // Cache configuration
  config: {
    maxCacheSize: number // bytes
    defaultTTL: number // milliseconds
    enableCompression: boolean
    autoCleanup: boolean
  }
}

/**
 * Cache store actions interface
 */
interface CacheActions {
  // Cache management
  loadCachedCafes: () => Promise<void>
  setCachedCafes: (cafes: Cafe[]) => Promise<void>
  addCachedCafe: (cafe: Cafe) => Promise<void>
  updateCachedCafe: (cafe: Cafe) => Promise<void>
  removeCachedCafe: (cafeId: string) => Promise<void>
  clearCache: () => Promise<void>

  // Sync queue management
  loadSyncQueue: () => Promise<void>
  addToSyncQueue: (
    item: Omit<SyncQueueStatus, 'id' | 'status' | 'retries'>
  ) => Promise<void>
  updateSyncQueueItem: (
    id: string,
    updates: Partial<SyncQueueStatus>
  ) => Promise<void>
  removeFromSyncQueue: (id: string) => Promise<void>
  processSyncQueue: () => Promise<void>

  // Cache statistics and maintenance
  updateCacheStats: () => Promise<void>
  cleanupExpiredCache: () => Promise<void>
  optimizeCache: () => Promise<void>

  // Network and performance
  setOfflineStatus: (isOffline: boolean) => void
  setNetworkSpeed: (speed: 'slow' | 'medium' | 'fast') => void
  updateAdaptiveQuality: () => void

  // Configuration
  updateCacheConfig: (config: Partial<CacheState['config']>) => void

  // Utility actions
  getCacheHealth: () => Promise<{
    health: 'good' | 'warning' | 'critical'
    issues: string[]
    recommendations: string[]
  }>
  exportCacheData: () => Promise<{
    cafes: Cafe[]
    syncQueue: SyncQueueStatus[]
    stats: CacheState['cacheStats']
    exportedAt: string
  }>
  importCacheData: (data: {
    cafes: Cafe[]
    syncQueue: SyncQueueStatus[]
    exportedAt: string
  }) => Promise<void>
}

/**
 * Combined cache store type
 */
type CacheStore = CacheState & CacheActions

/**
 * Initial state
 */
const initialState: CacheState = {
  cafes: [],
  cafeMetadata: {
    lastUpdated: '',
    ttl: 60 * 60 * 1000, // 1 hour
    size: 0,
    hitCount: 0,
    missCount: 0,
  },
  syncQueue: [],
  isSyncing: false,
  lastSyncAttempt: null,
  lastSuccessfulSync: null,
  cacheStats: {
    totalEntries: 0,
    totalSize: 0,
    hitRate: 0,
    lastCleanup: null,
  },
  isOffline: !navigator.onLine,
  networkSpeed: 'medium',
  adaptiveQuality: true,
  config: {
    maxCacheSize: 50 * 1024 * 1024, // 50MB
    defaultTTL: 60 * 60 * 1000, // 1 hour
    enableCompression: true,
    autoCleanup: true,
  },
}

/**
 * Cache store for managing offline data and sync operations
 * Provides intelligent caching with automatic cleanup and optimization
 */
export const useCacheStore = create<CacheStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Cache management
      loadCachedCafes: async () => {
        try {
          const cachedCafes = await cacheService.getCachedCafes()
          const metadata = {
            ...get().cafeMetadata,
            lastUpdated: new Date().toISOString(),
            size: new Blob([JSON.stringify(cachedCafes)]).size,
            hitCount: get().cafeMetadata.hitCount + 1,
          }

          set({
            cafes: cachedCafes,
            cafeMetadata: metadata,
          })

          // Update cache stats
          get().updateCacheStats()
        } catch (error) {
          console.error('Failed to load cached cafes:', error)
          set(state => ({
            cafeMetadata: {
              ...state.cafeMetadata,
              missCount: state.cafeMetadata.missCount + 1,
            },
          }))
        }
      },

      setCachedCafes: async (cafes: Cafe[]) => {
        try {
          await cacheService.cacheCafes(cafes)

          const metadata = {
            ...get().cafeMetadata,
            lastUpdated: new Date().toISOString(),
            size: new Blob([JSON.stringify(cafes)]).size,
          }

          set({
            cafes,
            cafeMetadata: metadata,
          })

          // Update cache stats
          get().updateCacheStats()
        } catch (error) {
          console.error('Failed to cache cafes:', error)
          throw error
        }
      },

      addCachedCafe: async (cafe: Cafe) => {
        try {
          const currentCafes = get().cafes
          const updatedCafes = [
            cafe,
            ...currentCafes.filter(c => c.id !== cafe.id),
          ]

          await get().setCachedCafes(updatedCafes)
        } catch (error) {
          console.error('Failed to add cached cafe:', error)
          throw error
        }
      },

      updateCachedCafe: async (cafe: Cafe) => {
        try {
          const currentCafes = get().cafes
          const updatedCafes = currentCafes.map(c =>
            c.id === cafe.id ? cafe : c
          )

          await get().setCachedCafes(updatedCafes)
        } catch (error) {
          console.error('Failed to update cached cafe:', error)
          throw error
        }
      },

      removeCachedCafe: async (cafeId: string) => {
        try {
          const currentCafes = get().cafes
          const filteredCafes = currentCafes.filter(c => c.id !== cafeId)

          await get().setCachedCafes(filteredCafes)
        } catch (error) {
          console.error('Failed to remove cached cafe:', error)
          throw error
        }
      },

      clearCache: async () => {
        try {
          await cacheService.clearAll()

          set({
            cafes: [],
            cafeMetadata: {
              ...initialState.cafeMetadata,
              lastUpdated: new Date().toISOString(),
            },
            cacheStats: {
              ...initialState.cacheStats,
              lastCleanup: new Date().toISOString(),
            },
          })
        } catch (error) {
          console.error('Failed to clear cache:', error)
          throw error
        }
      },

      // Sync queue management
      loadSyncQueue: async () => {
        try {
          const queueItems = await cacheService.getSyncQueue()
          const statusItems: SyncQueueStatus[] = queueItems.map(item => ({
            id: item.id,
            type: item.type,
            status: 'pending',
            retries: item.retries,
            lastAttempt: item.lastAttempt,
          }))

          set({ syncQueue: statusItems })
        } catch (error) {
          console.error('Failed to load sync queue:', error)
        }
      },

      addToSyncQueue: async (
        item: Omit<SyncQueueStatus, 'id' | 'status' | 'retries'>
      ) => {
        try {
          const queueItem: SyncQueueStatus = {
            id: crypto.randomUUID(),
            status: 'pending',
            retries: 0,
            ...item,
          }

          // Add to cache service
          await cacheService.addToSyncQueue({
            type: item.type,
            data: {}, // Would contain actual data
            lastAttempt: undefined,
          })

          // Update local state
          set(state => ({
            syncQueue: [...state.syncQueue, queueItem],
          }))
        } catch (error) {
          console.error('Failed to add to sync queue:', error)
          throw error
        }
      },

      updateSyncQueueItem: async (
        id: string,
        updates: Partial<SyncQueueStatus>
      ) => {
        set(state => ({
          syncQueue: state.syncQueue.map(item =>
            item.id === id ? { ...item, ...updates } : item
          ),
        }))

        // Update in cache service if needed
        if (updates.status === 'completed') {
          try {
            await cacheService.removeFromSyncQueue(id)
          } catch (error) {
            console.warn(
              'Failed to remove completed item from sync queue:',
              error
            )
          }
        }
      },

      removeFromSyncQueue: async (id: string) => {
        try {
          await cacheService.removeFromSyncQueue(id)

          set(state => ({
            syncQueue: state.syncQueue.filter(item => item.id !== id),
          }))
        } catch (error) {
          console.error('Failed to remove from sync queue:', error)
          throw error
        }
      },

      processSyncQueue: async () => {
        const state = get()

        if (state.isSyncing || state.isOffline) {
          return
        }

        const pendingItems = state.syncQueue.filter(
          item => item.status === 'pending' || item.status === 'failed'
        )

        if (pendingItems.length === 0) {
          return
        }

        set({
          isSyncing: true,
          lastSyncAttempt: new Date().toISOString(),
        })

        try {
          for (const item of pendingItems) {
            // Update status to syncing
            await get().updateSyncQueueItem(item.id, {
              status: 'syncing',
              lastAttempt: new Date().toISOString(),
            })

            try {
              // Simulate sync operation (would call actual API here)
              await new Promise(resolve => setTimeout(resolve, 1000))

              // Mark as completed
              await get().updateSyncQueueItem(item.id, { status: 'completed' })
            } catch (error) {
              // Mark as failed
              await get().updateSyncQueueItem(item.id, {
                status: 'failed',
                retries: item.retries + 1,
                error: error instanceof Error ? error.message : 'Unknown error',
              })
            }
          }

          set({
            lastSuccessfulSync: new Date().toISOString(),
          })
        } catch (error) {
          console.error('Sync queue processing failed:', error)
        } finally {
          set({ isSyncing: false })
        }
      },

      // Cache statistics and maintenance
      updateCacheStats: async () => {
        try {
          const stats = await cacheService.getStats()
          const metadata = get().cafeMetadata

          const hitRate =
            metadata.hitCount + metadata.missCount > 0
              ? (metadata.hitCount / (metadata.hitCount + metadata.missCount)) *
                100
              : 0

          set({
            cacheStats: {
              totalEntries: stats.totalCafes + stats.totalCacheEntries,
              totalSize: metadata.size,
              hitRate: Math.round(hitRate),
              lastCleanup: get().cacheStats.lastCleanup,
            },
          })
        } catch (error) {
          console.warn('Failed to update cache stats:', error)
        }
      },

      cleanupExpiredCache: async () => {
        try {
          await cacheService.clearExpired()

          set(state => ({
            cacheStats: {
              ...state.cacheStats,
              lastCleanup: new Date().toISOString(),
            },
          }))

          // Reload cache after cleanup
          await get().loadCachedCafes()
        } catch (error) {
          console.error('Failed to cleanup expired cache:', error)
        }
      },

      optimizeCache: async () => {
        const state = get()

        try {
          // Remove least recently used items if cache is too large
          if (state.cacheStats.totalSize > state.config.maxCacheSize) {
            const cafesToKeep = Math.floor(state.cafes.length * 0.8) // Keep 80%
            const optimizedCafes = state.cafes
              .sort(
                (a, b) =>
                  new Date(b.updatedAt).getTime() -
                  new Date(a.updatedAt).getTime()
              )
              .slice(0, cafesToKeep)

            await get().setCachedCafes(optimizedCafes)
          }

          // Cleanup expired items
          await get().cleanupExpiredCache()

          console.warn('Cache optimization completed')
        } catch (error) {
          console.error('Cache optimization failed:', error)
        }
      },

      // Network and performance
      setOfflineStatus: (isOffline: boolean) => {
        set({ isOffline })

        if (!isOffline) {
          // Try to process sync queue when coming back online
          setTimeout(() => {
            get().processSyncQueue().catch(console.warn)
          }, 1000)
        }
      },

      setNetworkSpeed: (speed: 'slow' | 'medium' | 'fast') => {
        set({ networkSpeed: speed })

        if (get().adaptiveQuality) {
          get().updateAdaptiveQuality()
        }
      },

      updateAdaptiveQuality: () => {
        const state = get()

        if (!state.adaptiveQuality) return

        // Adjust cache behavior based on network conditions
        const newConfig = { ...state.config }

        switch (state.networkSpeed) {
          case 'slow':
            newConfig.defaultTTL = 2 * 60 * 60 * 1000 // 2 hours
            newConfig.enableCompression = true
            break
          case 'medium':
            newConfig.defaultTTL = 60 * 60 * 1000 // 1 hour
            newConfig.enableCompression = true
            break
          case 'fast':
            newConfig.defaultTTL = 30 * 60 * 1000 // 30 minutes
            newConfig.enableCompression = false
            break
        }

        set({ config: newConfig })
      },

      // Configuration
      updateCacheConfig: (config: Partial<CacheState['config']>) => {
        set(state => ({
          config: {
            ...state.config,
            ...config,
          },
        }))
      },

      // Utility actions
      getCacheHealth: async () => {
        const state = get()
        await get().updateCacheStats()

        const health: 'good' | 'warning' | 'critical' =
          state.cacheStats.hitRate < 50
            ? 'critical'
            : state.cacheStats.hitRate < 75
              ? 'warning'
              : 'good'

        const issues: string[] = []
        const recommendations: string[] = []

        if (state.cacheStats.hitRate < 50) {
          issues.push('Low cache hit rate')
          recommendations.push(
            'Consider increasing cache TTL or improving cache strategy'
          )
        }

        if (state.cacheStats.totalSize > state.config.maxCacheSize * 0.9) {
          issues.push('Cache size near limit')
          recommendations.push(
            'Run cache optimization or increase max cache size'
          )
        }

        if (
          state.syncQueue.filter(item => item.status === 'failed').length > 5
        ) {
          issues.push('Multiple sync failures')
          recommendations.push(
            'Check network connection and retry failed sync items'
          )
        }

        return { health, issues, recommendations }
      },

      exportCacheData: async () => {
        const state = get()

        return {
          cafes: state.cafes,
          syncQueue: state.syncQueue,
          stats: state.cacheStats,
          exportedAt: new Date().toISOString(),
        }
      },

      importCacheData: async data => {
        try {
          // Import cafes
          await get().setCachedCafes(data.cafes)

          // Import sync queue
          set({ syncQueue: data.syncQueue })

          console.warn('Cache data imported successfully')
        } catch (error) {
          console.error('Failed to import cache data:', error)
          throw error
        }
      },
    }),
    {
      name: 'cache-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist configuration and essential metadata
      partialize: state => ({
        config: state.config,
        lastSuccessfulSync: state.lastSuccessfulSync,
        networkSpeed: state.networkSpeed,
        adaptiveQuality: state.adaptiveQuality,
      }),
    }
  )
)

// Auto-sync with network status
window.addEventListener('online', () => {
  useCacheStore.getState().setOfflineStatus(false)
})

window.addEventListener('offline', () => {
  useCacheStore.getState().setOfflineStatus(true)
})

// Auto-cleanup expired cache every hour
if (typeof window !== 'undefined') {
  setInterval(
    () => {
      const state = useCacheStore.getState()
      if (state.config.autoCleanup && !state.isOffline) {
        state.cleanupExpiredCache().catch(console.warn)
      }
    },
    60 * 60 * 1000
  ) // 1 hour
}
