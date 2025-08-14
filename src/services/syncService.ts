import type { Cafe, CafeRating } from '../types/cafe'
import type { SyncQueueItem } from '../types/api'
import { cacheService } from './cacheService'
import { googleSheetsService } from './googleSheetsService'
import { getNetworkStatus, addNetworkListeners } from '../utils/network'

/**
 * Service for managing offline synchronization and background sync
 */
export class SyncService {
  private syncInProgress = false
  private syncRetryDelay = 5000 // 5 seconds initial delay
  private maxRetries = 3
  private networkListenerCleanup?: () => void

  constructor() {
    this.setupNetworkListeners()
    this.startPeriodicSync()
  }

  /**
   * Setup network status listeners for automatic sync when coming online
   */
  private setupNetworkListeners(): void {
    this.networkListenerCleanup = addNetworkListeners(
      () => {
        console.warn('Network came online, starting sync...')
        this.syncPendingOperations()
      },
      () => {
        console.warn('Network went offline')
      }
    )
  }

  /**
   * Start periodic sync (every 5 minutes when online)
   */
  private startPeriodicSync(): void {
    setInterval(
      () => {
        const networkStatus = getNetworkStatus()
        if (networkStatus.online && !this.syncInProgress) {
          this.syncPendingOperations()
        }
      },
      5 * 60 * 1000
    ) // 5 minutes
  }

  /**
   * Queue cafe for offline creation
   */
  async queueCafeCreation(cafe: Cafe): Promise<void> {
    await cacheService.addToSyncQueue({
      type: 'addCafe',
      data: cafe,
    })

    // Try immediate sync if online
    const networkStatus = getNetworkStatus()
    if (networkStatus.online) {
      this.syncPendingOperations()
    }
  }

  /**
   * Queue rating for offline creation
   */
  async queueRatingCreation(rating: CafeRating): Promise<void> {
    await cacheService.addToSyncQueue({
      type: 'addRating',
      data: rating,
    })

    // Try immediate sync if online
    const networkStatus = getNetworkStatus()
    if (networkStatus.online) {
      this.syncPendingOperations()
    }
  }

  /**
   * Queue cafe for offline update
   */
  async queueCafeUpdate(cafe: Cafe): Promise<void> {
    await cacheService.addToSyncQueue({
      type: 'updateCafe',
      data: cafe,
    })

    // Try immediate sync if online
    const networkStatus = getNetworkStatus()
    if (networkStatus.online) {
      this.syncPendingOperations()
    }
  }

  /**
   * Sync all pending operations
   */
  async syncPendingOperations(): Promise<void> {
    if (this.syncInProgress) {
      console.warn('Sync already in progress, skipping...')
      return
    }

    const networkStatus = getNetworkStatus()
    if (!networkStatus.online) {
      console.warn('Device offline, sync postponed')
      return
    }

    this.syncInProgress = true

    try {
      const syncQueue = await cacheService.getSyncQueue()
      console.warn(`Starting sync of ${syncQueue.length} pending operations`)

      const results = await Promise.allSettled(
        syncQueue.map(item => this.processSyncItem(item))
      )

      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length

      console.warn(`Sync completed: ${successful} successful, ${failed} failed`)

      // Clean up successful items and update failed ones
      await this.cleanupSyncQueue(syncQueue, results)
    } catch (error) {
      console.error('Sync process failed:', error)
    } finally {
      this.syncInProgress = false
    }
  }

  /**
   * Process a single sync queue item
   */
  private async processSyncItem(item: SyncQueueItem): Promise<void> {
    try {
      switch (item.type) {
        case 'addCafe':
          await googleSheetsService.getInstance().addCafe(item.data as Cafe)
          break
        case 'addRating':
          await googleSheetsService
            .getInstance()
            .addRating(item.data as CafeRating)
          break
        case 'updateCafe':
          await googleSheetsService.getInstance().updateCafe(item.data as Cafe)
          break
        default:
          throw new Error(`Unknown sync operation type: ${item.type}`)
      }
      console.warn(
        `✅ Sync completed successfully for ${item.type} (ID: ${item.id})`
      )
    } catch (error) {
      console.error(`❌ Sync failed for ${item.type} (ID: ${item.id}):`, error)
      throw error
    }
  }

  /**
   * Cleanup sync queue based on results
   */
  private async cleanupSyncQueue(
    syncQueue: SyncQueueItem[],
    results: PromiseSettledResult<void>[]
  ): Promise<void> {
    for (let i = 0; i < syncQueue.length; i++) {
      const item = syncQueue[i]
      const result = results[i]

      if (result.status === 'fulfilled') {
        // Remove successful items
        await cacheService.removeFromSyncQueue(item.id)
      } else {
        // Update failed items with retry count
        const updatedItem = {
          ...item,
          retries: item.retries + 1,
          lastAttempt: new Date().toISOString(),
        }

        if (updatedItem.retries >= this.maxRetries) {
          // Remove items that exceeded max retries
          console.warn(
            `Removing sync item ${item.id} after ${this.maxRetries} failed attempts`
          )
          await cacheService.removeFromSyncQueue(item.id)
        } else {
          // Update retry count
          await cacheService.updateSyncQueueItem(updatedItem)
        }
      }
    }
  }

  /**
   * Manual sync trigger
   */
  async forcSync(): Promise<{ success: boolean; message: string }> {
    const networkStatus = getNetworkStatus()
    if (!networkStatus.online) {
      return { success: false, message: 'Device is offline' }
    }

    try {
      await this.syncPendingOperations()
      return { success: true, message: 'Sync completed successfully' }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Sync failed',
      }
    }
  }

  /**
   * Get sync status information
   */
  async getSyncStatus(): Promise<{
    inProgress: boolean
    pendingOperations: number
    networkOnline: boolean
  }> {
    const syncQueue = await cacheService.getSyncQueue()
    const networkStatus = getNetworkStatus()

    return {
      inProgress: this.syncInProgress,
      pendingOperations: syncQueue.length,
      networkOnline: networkStatus.online,
    }
  }

  /**
   * Clear all pending sync operations (useful for testing or reset)
   */
  async clearSyncQueue(): Promise<void> {
    const db = await (
      cacheService as { ensureDB(): Promise<IDBDatabase> }
    ).ensureDB()
    const transaction = db.transaction(['sync_queue'], 'readwrite')
    const store = transaction.objectStore('sync_queue')

    return new Promise<void>((resolve, reject) => {
      const request = store.clear()
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Cleanup resources when service is destroyed
   */
  destroy(): void {
    if (this.networkListenerCleanup) {
      this.networkListenerCleanup()
    }
  }
}

// Singleton instance for the application
export const syncService = new SyncService()
