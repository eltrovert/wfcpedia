import type { NetworkStatus } from '../types/api'

interface NetworkConnectionAPI {
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g'
  downlink?: number
  rtt?: number
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkConnectionAPI
  mozConnection?: NetworkConnectionAPI
  webkitConnection?: NetworkConnectionAPI
}

/**
 * Detect current network conditions safely
 */
export const getNetworkStatus = (): NetworkStatus => {
  if (typeof navigator === 'undefined') {
    return { online: true }
  }

  const nav = navigator as NavigatorWithConnection
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection

  return {
    online: navigator.onLine,
    effectiveType: connection?.effectiveType,
    downlink: connection?.downlink,
    rtt: connection?.rtt,
  }
}

/**
 * Check if network conditions are suitable for data fetching
 */
export const isNetworkSuitable = (): boolean => {
  const status = getNetworkStatus()

  if (!status.online) return false

  // If we can't detect connection type, assume it's suitable
  if (!status.effectiveType) return true

  // Avoid heavy operations on slow connections
  return !['slow-2g', '2g'].includes(status.effectiveType)
}

/**
 * Get recommended cache strategy based on network conditions
 */
export const getCacheStrategy = ():
  | 'cache-first'
  | 'network-first'
  | 'cache-only' => {
  const status = getNetworkStatus()

  if (!status.online) return 'cache-only'

  if (
    status.effectiveType &&
    ['slow-2g', '2g'].includes(status.effectiveType)
  ) {
    return 'cache-first'
  }

  return 'network-first'
}

/**
 * Add network status change listeners
 */
export const addNetworkListeners = (
  onOnline: () => void,
  onOffline: () => void
): (() => void) => {
  if (typeof window === 'undefined') {
    return () => {}
  }

  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)

  return () => {
    window.removeEventListener('online', onOnline)
    window.removeEventListener('offline', onOffline)
  }
}
