import { QueryClient } from '@tanstack/react-query'
import { getNetworkStatus } from '../utils/network'

/**
 * Create and configure React Query client for optimal mobile performance
 * Includes offline-first configuration and Indonesian network optimization
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache for 5 minutes by default
        staleTime: 5 * 60 * 1000,
        // Keep data in cache for 10 minutes
        gcTime: 10 * 60 * 1000, // Previously cacheTime
        // Retry 3 times on failure with exponential backoff
        retry: (failureCount, error) => {
          // Don't retry if we're offline
          const networkStatus = getNetworkStatus()
          if (!networkStatus.online) return false

          // Don't retry more than 3 times
          if (failureCount >= 3) return false

          // Don't retry on 4xx errors (client errors)
          if (error && typeof error === 'object' && 'status' in error) {
            const status = (error as { status: number }).status
            if (status >= 400 && status < 500) return false
          }

          return true
        },
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Don't refetch on window focus (mobile optimization)
        refetchOnWindowFocus: false,
        // Refetch on reconnect
        refetchOnReconnect: true,
        // Background refetch interval - 15 minutes
        refetchInterval: 15 * 60 * 1000,
        // Only refetch in background if data is stale
        refetchIntervalInBackground: false,
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
        retryDelay: 2000,
      },
    },
  })
}

// Create singleton query client instance
let queryClient: QueryClient | null = null

export function getQueryClient(): QueryClient {
  if (!queryClient) {
    queryClient = createQueryClient()
  }
  return queryClient
}
