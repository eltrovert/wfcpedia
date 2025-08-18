/**
 * Network optimization utilities for Indonesian mobile networks
 * Optimizes performance for 3G/4G connections and data-conscious users
 */

export interface NetworkCondition {
  type: 'offline' | '2g' | '3g' | '4g' | 'wifi'
  effectiveType: '2g' | '3g' | '4g' | 'wifi'
  downlink: number // Mbps
  rtt: number // Round trip time in ms
  saveData: boolean
}

export interface OptimizationConfig {
  maxImageSize: number // KB
  enableLazyLoading: boolean
  enablePrefetch: boolean
  compressionLevel: 'low' | 'medium' | 'high'
  batchSize: number
}

/**
 * Get current network condition
 */
export function getNetworkCondition(): NetworkCondition {
  if (typeof navigator === 'undefined') {
    return {
      type: 'wifi',
      effectiveType: '4g',
      downlink: 10,
      rtt: 100,
      saveData: false,
    }
  }

  // Use Network Information API if available
  const connection =
    (
      navigator as Navigator & {
        connection?: {
          type?: string
          effectiveType?: string
          downlink?: number
          rtt?: number
          saveData?: boolean
        }
        mozConnection?: {
          type?: string
          effectiveType?: string
          downlink?: number
          rtt?: number
          saveData?: boolean
        }
        webkitConnection?: {
          type?: string
          effectiveType?: string
          downlink?: number
          rtt?: number
          saveData?: boolean
        }
      }
    ).connection ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as any).mozConnection ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as any).webkitConnection

  if (connection) {
    return {
      type: connection.type || 'wifi',
      effectiveType: connection.effectiveType || '4g',
      downlink: connection.downlink || 10,
      rtt: connection.rtt || 100,
      saveData: connection.saveData || false,
    }
  }

  // Fallback: estimate based on user agent and online status
  const isOnline = navigator.onLine
  if (!isOnline) {
    return {
      type: 'offline',
      effectiveType: '2g',
      downlink: 0,
      rtt: Infinity,
      saveData: true,
    }
  }

  // Conservative estimate for Indonesian mobile networks
  return {
    type: '4g',
    effectiveType: '3g', // Conservative estimate
    downlink: 5, // Average Indonesian mobile speed
    rtt: 200, // Higher latency for mobile networks
    saveData: false,
  }
}

/**
 * Get optimization configuration based on network conditions
 */
export function getOptimizationConfig(
  networkCondition?: NetworkCondition
): OptimizationConfig {
  const condition = networkCondition || getNetworkCondition()

  // Offline or save data mode
  if (condition.type === 'offline' || condition.saveData) {
    return {
      maxImageSize: 20, // 20KB max
      enableLazyLoading: true,
      enablePrefetch: false,
      compressionLevel: 'high',
      batchSize: 3,
    }
  }

  // Slow connections (2G, slow 3G)
  if (
    condition.effectiveType === '2g' ||
    (condition.effectiveType === '3g' && condition.downlink < 2)
  ) {
    return {
      maxImageSize: 50, // 50KB max
      enableLazyLoading: true,
      enablePrefetch: false,
      compressionLevel: 'high',
      batchSize: 5,
    }
  }

  // Regular 3G
  if (condition.effectiveType === '3g') {
    return {
      maxImageSize: 100, // 100KB max
      enableLazyLoading: true,
      enablePrefetch: true,
      compressionLevel: 'medium',
      batchSize: 8,
    }
  }

  // 4G and WiFi
  return {
    maxImageSize: 200, // 200KB max
    enableLazyLoading: true,
    enablePrefetch: true,
    compressionLevel: 'medium',
    batchSize: 12,
  }
}

/**
 * Optimize image URL for current network conditions
 */
export function optimizeImageUrl(
  originalUrl: string,
  targetSize: { width: number; height: number },
  networkCondition?: NetworkCondition
): string {
  const config = getOptimizationConfig(networkCondition)

  // If it's a demo image or placeholder, return as-is
  if (originalUrl.includes('placeholder') || originalUrl.includes('demo')) {
    return originalUrl
  }

  // For actual implementation, this would integrate with image optimization service
  // For now, return original URL with quality parameters
  const url = new URL(originalUrl, window.location.origin)

  // Add optimization parameters
  url.searchParams.set('w', targetSize.width.toString())
  url.searchParams.set('h', targetSize.height.toString())

  // Set quality based on network condition
  const quality =
    config.compressionLevel === 'high'
      ? '60'
      : config.compressionLevel === 'medium'
        ? '75'
        : '85'
  url.searchParams.set('q', quality)

  // WebP format for modern browsers on slower connections
  if (config.compressionLevel === 'high' && supportsWebP()) {
    url.searchParams.set('f', 'webp')
  }

  return url.toString()
}

/**
 * Check if browser supports WebP format
 */
function supportsWebP(): boolean {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
}

/**
 * Preload critical onboarding assets
 */
export async function preloadOnboardingAssets(
  networkCondition?: NetworkCondition
): Promise<void> {
  const config = getOptimizationConfig(networkCondition)

  if (!config.enablePrefetch) {
    return
  }

  // Preload critical CSS for onboarding
  const criticalStyles = [
    'components.css', // If onboarding styles are separate
  ]

  // Create link elements for preloading
  criticalStyles.forEach(href => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'style'
    link.href = href
    document.head.appendChild(link)
  })

  // Preload essential fonts
  const fonts = [
    // Add essential font URLs here
  ]

  fonts.forEach(href => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'font'
    link.type = 'font/woff2'
    link.href = href
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  })
}

/**
 * Create a performance observer for monitoring
 */
export function createPerformanceObserver(): PerformanceObserver | null {
  if (typeof PerformanceObserver === 'undefined') {
    return null
  }

  const observer = new PerformanceObserver(list => {
    const entries = list.getEntries()

    entries.forEach(entry => {
      // Monitor large resource loads
      if (entry.entryType === 'resource' && entry.transferSize > 100 * 1024) {
        // > 100KB
        console.warn(
          `Large resource loaded: ${entry.name} (${(entry.transferSize / 1024).toFixed(1)}KB)`
        )
      }

      // Monitor long tasks
      if (entry.entryType === 'longtask' && entry.duration > 50) {
        console.warn(`Long task detected: ${entry.duration.toFixed(1)}ms`)
      }
    })
  })

  try {
    observer.observe({ entryTypes: ['resource', 'longtask'] })
    return observer
  } catch (error) {
    console.warn('Performance observer not supported:', error)
    return null
  }
}

/**
 * Get data usage estimate for onboarding
 */
export function getOnboardingDataUsage(): {
  estimated: number // KB
  breakdown: Record<string, number>
} {
  return {
    estimated: 850, // Total estimated data usage in KB
    breakdown: {
      'HTML/CSS/JS': 300,
      'Images and icons': 200,
      Fonts: 150,
      'Interactive demos': 100,
      'API calls': 50,
      Analytics: 50,
    },
  }
}

/**
 * Check if device is likely on mobile data
 */
export function isLikelyMobileData(): boolean {
  const connection = getNetworkCondition()

  // If save data is enabled, likely on mobile
  if (connection.saveData) return true

  // If connection type indicates mobile
  if (['cellular', '3g', '4g'].includes(connection.type)) return true

  // If effective type suggests mobile speeds
  if (connection.effectiveType === '3g' && connection.downlink < 5) return true

  return false
}

/**
 * Optimize onboarding experience for Indonesian networks
 */
export function optimizeForIndonesianNetworks(): OptimizationConfig {
  const networkCondition = getNetworkCondition()
  const config = getOptimizationConfig(networkCondition)

  // Additional Indonesian-specific optimizations
  if (isLikelyMobileData()) {
    return {
      ...config,
      maxImageSize: Math.min(config.maxImageSize, 75), // Conservative limit
      batchSize: Math.min(config.batchSize, 6), // Smaller batches
      compressionLevel: 'high', // Always use high compression
    }
  }

  return config
}
