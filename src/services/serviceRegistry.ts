import { cafeService } from './cafeService'
import { locationService } from './locationService'
import { imageService } from './imageService'
import { validationService } from './validationService'
import { userSessionService } from './userSessionService'
import { preferencesService } from './preferencesService'
import { visitHistoryService } from './visitHistoryService'
import { contributionTrackingService } from './contributionTrackingService'
import { networkService } from './networkService'
import { storageService } from './storageService'
import { cacheService } from './cacheService'
import { syncService } from './syncService'
import { googleSheetsService } from './googleSheetsService'

/**
 * Service registry interface for type safety
 */
interface ServiceMap {
  cafeService: typeof cafeService
  locationService: typeof locationService
  imageService: typeof imageService
  validationService: typeof validationService
  userSessionService: typeof userSessionService
  preferencesService: typeof preferencesService
  visitHistoryService: typeof visitHistoryService
  contributionTrackingService: typeof contributionTrackingService
  networkService: typeof networkService
  storageService: typeof storageService
  cacheService: typeof cacheService
  syncService: typeof syncService
  googleSheetsService: typeof googleSheetsService
}

/**
 * Type-safe service registry for dependency injection and service locator pattern
 */
export class ServiceRegistry {
  private services = new Map<keyof ServiceMap, ServiceMap[keyof ServiceMap]>()
  private initialized = false
  private initializationPromise: Promise<void> | null = null

  constructor() {
    this.registerServices()
  }

  /**
   * Register all services with type safety
   */
  private registerServices(): void {
    // Core services
    this.services.set('cafeService', cafeService)
    this.services.set('locationService', locationService)
    this.services.set('imageService', imageService)
    this.services.set('validationService', validationService)

    // User services
    this.services.set('userSessionService', userSessionService)
    this.services.set('preferencesService', preferencesService)
    this.services.set('visitHistoryService', visitHistoryService)
    this.services.set(
      'contributionTrackingService',
      contributionTrackingService
    )

    // Infrastructure services
    this.services.set('networkService', networkService)
    this.services.set('storageService', storageService)
    this.services.set('cacheService', cacheService)
    this.services.set('syncService', syncService)
    this.services.set('googleSheetsService', googleSheetsService)
  }

  /**
   * Get service by name with type safety
   */
  getService<K extends keyof ServiceMap>(name: K): ServiceMap[K] {
    const service = this.services.get(name)
    if (!service) {
      throw new Error(`Service '${String(name)}' not found`)
    }
    return service as ServiceMap[K]
  }

  /**
   * Initialize all services with proper dependency resolution
   */
  async initialize(): Promise<void> {
    if (this.initialized) return
    if (this.initializationPromise) return this.initializationPromise

    this.initializationPromise = this.performInitialization()
    return this.initializationPromise
  }

  /**
   * Perform actual service initialization
   */
  private async performInitialization(): Promise<void> {
    try {
      console.warn('Initializing service registry...')

      // Initialize services in dependency order
      const networkService = this.getService('networkService')
      await networkService.initialize?.()

      // Initialize other services that depend on network
      const initPromises = [
        this.getService('cacheService').initialize?.(),
        this.getService('userSessionService').initializeSession?.(),
      ].filter(Boolean)

      await Promise.allSettled(initPromises)

      this.initialized = true
      console.warn('Service registry initialization completed')
    } catch (error) {
      console.error('Failed to initialize services:', error)
      this.initializationPromise = null
      throw error
    }
  }

  /**
   * Get all services
   */
  getAllServices(): Map<string, unknown> {
    return new Map(this.services)
  }

  /**
   * Check if service exists
   */
  hasService(name: string): boolean {
    return this.services.has(name)
  }
}

// Singleton instance
export const serviceRegistry = new ServiceRegistry()
