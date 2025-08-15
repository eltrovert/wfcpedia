import type { NetworkStatus } from '../types/api'

/**
 * Network connection interface for browser APIs
 */
interface NetworkConnection {
  effectiveType?: string
  downlink?: number
  rtt?: number
  operator?: string
}

/**
 * Network monitoring error classes
 */
export class NetworkError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'NetworkError'
  }
}

/**
 * Enhanced network status interface
 */
export interface EnhancedNetworkStatus extends NetworkStatus {
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'offline'
  latency: number | null
  bandwidth: number | null // Mbps
  stability: number // 0-100, higher is more stable
  location: 'indonesia' | 'international' | 'unknown'
  provider: string | null
  lastMeasured: string
}

/**
 * Network statistics interface
 */
export interface NetworkStatistics {
  averageLatency: number
  averageBandwidth: number
  uptime: number // percentage
  connectionEvents: Array<{
    type: 'online' | 'offline' | 'slow' | 'fast'
    timestamp: string
    duration?: number
  }>
  qualityHistory: Array<{
    timestamp: string
    quality: EnhancedNetworkStatus['quality']
    latency: number
    bandwidth: number
  }>
}

/**
 * Adaptive configuration based on network conditions
 */
export interface AdaptiveConfig {
  requestTimeout: number
  retryAttempts: number
  batchSize: number
  imageQuality: number // 0-100
  cacheStrategy: 'aggressive' | 'normal' | 'minimal'
  syncFrequency: number // minutes
}

/**
 * Service for advanced network monitoring and adaptation
 * Optimized for Indonesian mobile networks with adaptive performance
 */
/**
 * Circuit breaker for network requests
 */
class CircuitBreaker {
  private failureCount = 0
  private state: 'closed' | 'open' | 'half-open' = 'closed'
  private nextAttempt = 0

  constructor(
    private readonly failureThreshold = 5,
    private readonly recoveryTimeout = 30000 // 30 seconds
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN')
      }
      this.state = 'half-open'
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    this.failureCount = 0
    this.state = 'closed'
  }

  private onFailure(): void {
    this.failureCount++
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'open'
      this.nextAttempt = Date.now() + this.recoveryTimeout
    }
  }

  getState(): string {
    return this.state
  }
}

export class NetworkService {
  private currentStatus: EnhancedNetworkStatus | null = null
  private eventListeners: Array<(status: EnhancedNetworkStatus) => void> = []
  private statisticsCache: NetworkStatistics | null = null
  private monitoringInterval: NodeJS.Timeout | null = null
  private speedTestWorker: Worker | null = null
  private circuitBreaker = new CircuitBreaker()

  // Indonesian mobile network providers
  private readonly INDONESIAN_PROVIDERS = [
    'telkomsel',
    'indosat',
    'xl',
    'tri',
    'smartfren',
    'axis',
  ]

  // Speed test endpoints for latency measurement
  private readonly SPEED_TEST_ENDPOINTS = [
    'https://www.google.com/generate_204', // Fast, reliable
    'https://cloudflare.com/cdn-cgi/trace',
    'https://httpbin.org/ip',
  ]

  // Default adaptive configurations
  private readonly ADAPTIVE_CONFIGS: Record<
    EnhancedNetworkStatus['quality'],
    AdaptiveConfig
  > = {
    excellent: {
      requestTimeout: 10000,
      retryAttempts: 2,
      batchSize: 20,
      imageQuality: 95,
      cacheStrategy: 'normal',
      syncFrequency: 5,
    },
    good: {
      requestTimeout: 15000,
      retryAttempts: 3,
      batchSize: 15,
      imageQuality: 85,
      cacheStrategy: 'normal',
      syncFrequency: 10,
    },
    fair: {
      requestTimeout: 20000,
      retryAttempts: 3,
      batchSize: 10,
      imageQuality: 70,
      cacheStrategy: 'aggressive',
      syncFrequency: 15,
    },
    poor: {
      requestTimeout: 30000,
      retryAttempts: 5,
      batchSize: 5,
      imageQuality: 50,
      cacheStrategy: 'aggressive',
      syncFrequency: 30,
    },
    offline: {
      requestTimeout: 5000,
      retryAttempts: 1,
      batchSize: 1,
      imageQuality: 30,
      cacheStrategy: 'minimal',
      syncFrequency: 60,
    },
  }

  constructor() {
    this.initialize()
  }

  /**
   * Initialize network monitoring
   */
  private async initialize(): Promise<void> {
    try {
      // Initial status check
      await this.updateNetworkStatus()

      // Setup browser event listeners
      this.setupBrowserListeners()

      // Start continuous monitoring
      this.startContinuousMonitoring()

      // Initialize speed test worker
      this.initializeSpeedTestWorker()

      console.warn('NetworkService initialized successfully')
    } catch (error) {
      console.error('Failed to initialize NetworkService:', error)
    }
  }

  /**
   * Get current enhanced network status
   */
  async getNetworkStatus(): Promise<EnhancedNetworkStatus> {
    if (!this.currentStatus) {
      await this.updateNetworkStatus()
    }
    if (!this.currentStatus)
      throw new NetworkError(
        'Network status not available',
        'STATUS_UNAVAILABLE'
      )
    return this.currentStatus
  }

  /**
   * Update network status with comprehensive measurements
   */
  async updateNetworkStatus(): Promise<EnhancedNetworkStatus> {
    try {
      const basicStatus = this.getBasicNetworkStatus()
      const latency = await this.measureLatency()
      const bandwidth = await this.estimateBandwidth()
      const quality = this.calculateNetworkQuality(
        basicStatus,
        latency,
        bandwidth
      )
      const stability = await this.calculateStability()
      const location = this.detectLocation()
      const provider = this.detectProvider()

      const enhancedStatus: EnhancedNetworkStatus = {
        ...basicStatus,
        quality,
        latency,
        bandwidth,
        stability,
        location,
        provider,
        lastMeasured: new Date().toISOString(),
      }

      this.currentStatus = enhancedStatus
      this.updateStatistics(enhancedStatus)
      this.notifyListeners(enhancedStatus)

      return enhancedStatus
    } catch (error) {
      console.error('Failed to update network status:', error)

      // Fallback to basic status
      const fallbackStatus: EnhancedNetworkStatus = {
        online: navigator.onLine,
        quality: navigator.onLine ? 'fair' : 'offline',
        latency: null,
        bandwidth: null,
        stability: 50,
        location: 'unknown',
        provider: null,
        lastMeasured: new Date().toISOString(),
      }

      this.currentStatus = fallbackStatus
      return fallbackStatus
    }
  }

  /**
   * Measure network latency using multiple endpoints
   */
  private async measureLatency(): Promise<number | null> {
    if (!navigator.onLine) return null

    try {
      const measurements: number[] = []

      for (const endpoint of this.SPEED_TEST_ENDPOINTS.slice(0, 2)) {
        try {
          const startTime = performance.now()
          const abortController = new AbortController()
          const timeoutId = setTimeout(() => abortController.abort(), 5000)

          await fetch(endpoint, {
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-cache',
            signal: abortController.signal,
          })

          clearTimeout(timeoutId)
          const latency = performance.now() - startTime
          if (latency > 0 && latency < 10000) {
            // Reasonable range
            measurements.push(latency)
          }
        } catch (error) {
          // Ignore individual endpoint failures but log for debugging
          console.warn(`Latency measurement failed for ${endpoint}:`, error)
        }
      }

      if (measurements.length === 0) return null

      // Return median latency
      measurements.sort((a, b) => a - b)
      const mid = Math.floor(measurements.length / 2)
      return measurements.length % 2 === 0
        ? (measurements[mid - 1] + measurements[mid]) / 2
        : measurements[mid]
    } catch (error) {
      console.warn('Latency measurement failed:', error)
      return null
    }
  }

  /**
   * Estimate bandwidth using connection API
   */
  private async estimateBandwidth(): Promise<number | null> {
    try {
      // Use Connection API if available
      const connection =
        (navigator as unknown as { connection?: { downlink?: number } })
          .connection ||
        (navigator as unknown as { mozConnection?: { downlink?: number } })
          .mozConnection ||
        (navigator as unknown as { webkitConnection?: { downlink?: number } })
          .webkitConnection

      if (connection && connection.downlink) {
        return connection.downlink // Mbps
      }

      // Fallback to rough estimation based on effective type
      if (connection && connection.effectiveType) {
        const estimates = {
          'slow-2g': 0.05,
          '2g': 0.25,
          '3g': 1.5,
          '4g': 10,
        }
        return (
          estimates[connection.effectiveType as keyof typeof estimates] || null
        )
      }

      return null
    } catch (error) {
      console.warn('Bandwidth estimation failed:', error)
      return null
    }
  }

  /**
   * Calculate overall network quality score
   */
  private calculateNetworkQuality(
    basicStatus: NetworkStatus,
    latency: number | null,
    bandwidth: number | null
  ): EnhancedNetworkStatus['quality'] {
    if (!basicStatus.online) return 'offline'

    let score = 0
    let factors = 0

    // Latency scoring (40% weight)
    if (latency !== null) {
      if (latency < 100) score += 40
      else if (latency < 300) score += 30
      else if (latency < 600) score += 20
      else if (latency < 1000) score += 10
      factors += 40
    }

    // Bandwidth scoring (40% weight)
    if (bandwidth !== null) {
      if (bandwidth >= 10) score += 40
      else if (bandwidth >= 5) score += 30
      else if (bandwidth >= 1) score += 20
      else if (bandwidth >= 0.5) score += 10
      factors += 40
    }

    // Connection type scoring (20% weight)
    if (basicStatus.effectiveType) {
      const typeScores = {
        '4g': 20,
        '3g': 15,
        '2g': 10,
        'slow-2g': 5,
      }
      score += typeScores[basicStatus.effectiveType] || 10
      factors += 20
    }

    // Normalize score
    const normalizedScore = factors > 0 ? (score / factors) * 100 : 50

    // Map to quality levels
    if (normalizedScore >= 85) return 'excellent'
    if (normalizedScore >= 70) return 'good'
    if (normalizedScore >= 50) return 'fair'
    return 'poor'
  }

  /**
   * Calculate network stability based on historical data
   */
  private async calculateStability(): Promise<number> {
    if (!this.statisticsCache) return 50

    const recentEvents = this.statisticsCache.connectionEvents.filter(event => {
      const eventTime = new Date(event.timestamp).getTime()
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
      return eventTime > fiveMinutesAgo
    })

    // More events = less stability
    const eventPenalty = Math.min(recentEvents.length * 10, 50)
    return Math.max(0, 100 - eventPenalty)
  }

  /**
   * Detect user's approximate location based on network characteristics
   */
  private detectLocation(): EnhancedNetworkStatus['location'] {
    try {
      // Check timezone for Indonesia
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (timezone.includes('Jakarta') || timezone.includes('Asia/Jakarta')) {
        return 'indonesia'
      }

      // Check language preferences
      const languages = navigator.languages || [navigator.language]
      if (languages.some(lang => lang.startsWith('id'))) {
        return 'indonesia'
      }

      return 'unknown'
    } catch {
      return 'unknown'
    }
  }

  /**
   * Detect mobile network provider (simplified)
   */
  private detectProvider(): string | null {
    try {
      // This would typically use navigator.connection.operator
      // For now, return null as it's not widely supported
      const connection = (
        navigator as unknown as { connection?: { operator?: string } }
      ).connection
      if (connection && connection.operator) {
        return connection.operator.toLowerCase()
      }
      return null
    } catch {
      return null
    }
  }

  /**
   * Get basic network status from browser APIs
   */
  private getBasicNetworkStatus(): NetworkStatus {
    const connection =
      (navigator as unknown as { connection?: NetworkConnection }).connection ||
      (navigator as unknown as { mozConnection?: NetworkConnection })
        .mozConnection ||
      (navigator as unknown as { webkitConnection?: NetworkConnection })
        .webkitConnection

    return {
      online: navigator.onLine,
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt,
    }
  }

  /**
   * Get adaptive configuration based on current network conditions
   */
  async getAdaptiveConfig(): Promise<AdaptiveConfig> {
    const status = await this.getNetworkStatus()
    return { ...this.ADAPTIVE_CONFIGS[status.quality] }
  }

  /**
   * Get network statistics
   */
  async getNetworkStatistics(): Promise<NetworkStatistics> {
    if (!this.statisticsCache) {
      this.statisticsCache = {
        averageLatency: 0,
        averageBandwidth: 0,
        uptime: 100,
        connectionEvents: [],
        qualityHistory: [],
      }
    }
    return this.statisticsCache
  }

  /**
   * Test network speed on demand
   */
  async performSpeedTest(): Promise<{
    latency: number | null
    bandwidth: number | null
    quality: EnhancedNetworkStatus['quality']
  }> {
    const latency = await this.measureLatency()
    const bandwidth = await this.estimateBandwidth()
    const basicStatus = this.getBasicNetworkStatus()
    const quality = this.calculateNetworkQuality(
      basicStatus,
      latency,
      bandwidth
    )

    return { latency, bandwidth, quality }
  }

  /**
   * Check if network conditions are suitable for operation
   */
  async isNetworkSuitableFor(
    operation: 'sync' | 'upload' | 'download' | 'realtime'
  ): Promise<boolean> {
    const status = await this.getNetworkStatus()

    if (!status.online) return false

    const requirements = {
      sync: { minQuality: 'poor', maxLatency: 5000 },
      upload: { minQuality: 'fair', maxLatency: 3000 },
      download: { minQuality: 'fair', maxLatency: 2000 },
      realtime: { minQuality: 'good', maxLatency: 500 },
    }

    const req = requirements[operation]
    const qualityLevels = ['offline', 'poor', 'fair', 'good', 'excellent']
    const currentQualityIndex = qualityLevels.indexOf(status.quality)
    const minQualityIndex = qualityLevels.indexOf(req.minQuality)

    if (currentQualityIndex < minQualityIndex) return false
    if (status.latency && status.latency > req.maxLatency) return false

    return true
  }

  /**
   * Add event listener for network status changes
   */
  addNetworkStatusListener(
    listener: (status: EnhancedNetworkStatus) => void
  ): () => void {
    this.eventListeners.push(listener)

    // Return cleanup function
    return () => {
      const index = this.eventListeners.indexOf(listener)
      if (index > -1) {
        this.eventListeners.splice(index, 1)
      }
    }
  }

  /**
   * Setup browser event listeners
   */
  private setupBrowserListeners(): void {
    window.addEventListener('online', () => {
      this.recordConnectionEvent('online')
      this.updateNetworkStatus()
    })

    window.addEventListener('offline', () => {
      this.recordConnectionEvent('offline')
      this.updateNetworkStatus()
    })

    // Listen for connection changes
    const connection = (
      navigator as unknown as { connection?: EventTarget & NetworkConnection }
    ).connection
    if (connection) {
      connection.addEventListener('change', () => {
        this.updateNetworkStatus()
      })
    }
  }

  /**
   * Start continuous network monitoring
   */
  private startContinuousMonitoring(): void {
    // Monitor every 30 seconds when active
    this.monitoringInterval = setInterval(async () => {
      if (document.visibilityState === 'visible') {
        await this.updateNetworkStatus()
      }
    }, 30000)
  }

  /**
   * Initialize Web Worker for background speed tests
   */
  private initializeSpeedTestWorker(): void {
    try {
      // Create a simple worker for background speed tests
      const workerScript = `
        self.onmessage = function(e) {
          if (e.data.type === 'speedTest') {
            // Simplified speed test in worker
            setTimeout(() => {
              self.postMessage({
                type: 'speedTestResult',
                latency: Math.random() * 200 + 50,
                bandwidth: Math.random() * 10 + 1
              });
            }, 1000);
          }
        };
      `

      const blob = new Blob([workerScript], { type: 'application/javascript' })
      this.speedTestWorker = new Worker(URL.createObjectURL(blob))

      this.speedTestWorker.onmessage = event => {
        if (event.data.type === 'speedTestResult') {
          // Handle background speed test results
          console.warn('Background speed test result:', event.data)
        }
      }
    } catch (error) {
      console.warn('Failed to initialize speed test worker:', error)
    }
  }

  /**
   * Update statistics with new network status
   */
  private updateStatistics(status: EnhancedNetworkStatus): void {
    if (!this.statisticsCache) {
      this.statisticsCache = {
        averageLatency: 0,
        averageBandwidth: 0,
        uptime: 100,
        connectionEvents: [],
        qualityHistory: [],
      }
    }

    // Update averages
    if (status.latency !== null) {
      this.statisticsCache.averageLatency =
        (this.statisticsCache.averageLatency + status.latency) / 2
    }

    if (status.bandwidth !== null) {
      this.statisticsCache.averageBandwidth =
        (this.statisticsCache.averageBandwidth + status.bandwidth) / 2
    }

    // Add to quality history
    if (status.latency !== null && status.bandwidth !== null) {
      this.statisticsCache.qualityHistory.push({
        timestamp: status.lastMeasured,
        quality: status.quality,
        latency: status.latency,
        bandwidth: status.bandwidth,
      })

      // Keep only last 100 entries
      if (this.statisticsCache.qualityHistory.length > 100) {
        this.statisticsCache.qualityHistory =
          this.statisticsCache.qualityHistory.slice(-100)
      }
    }
  }

  /**
   * Record connection events
   */
  private recordConnectionEvent(
    type: 'online' | 'offline' | 'slow' | 'fast'
  ): void {
    if (!this.statisticsCache) return

    this.statisticsCache.connectionEvents.push({
      type,
      timestamp: new Date().toISOString(),
    })

    // Keep only last 50 events
    if (this.statisticsCache.connectionEvents.length > 50) {
      this.statisticsCache.connectionEvents =
        this.statisticsCache.connectionEvents.slice(-50)
    }
  }

  /**
   * Notify all listeners of status changes
   */
  private notifyListeners(status: EnhancedNetworkStatus): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(status)
      } catch (error) {
        console.warn('Network status listener error:', error)
      }
    })
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
    }

    if (this.speedTestWorker) {
      this.speedTestWorker.terminate()
    }

    this.eventListeners = []
  }
}

// Singleton instance for the application
export const networkService = new NetworkService()
