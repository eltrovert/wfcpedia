import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { FilterOptions } from '../types/cafe'
import { cafeService } from '../services'

/**
 * React Query keys for café data
 */
export const cafeKeys = {
  all: ['cafes'] as const,
  lists: () => [...cafeKeys.all, 'list'] as const,
  list: (filters?: FilterOptions) =>
    [...cafeKeys.lists(), { filters }] as const,
  details: () => [...cafeKeys.all, 'detail'] as const,
  detail: (id: string) => [...cafeKeys.details(), id] as const,
}

interface UseCafesOptions {
  filters?: FilterOptions
  enabled?: boolean
}

/**
 * Custom hook for fetching café data with React Query
 * Provides caching, background updates, and offline support
 */
export function useCafes({ filters, enabled = true }: UseCafesOptions = {}) {
  return useQuery({
    queryKey: cafeKeys.list(filters),
    queryFn: () => cafeService.getCafes(filters),
    enabled,
    // Additional mobile-specific options
    staleTime: 10 * 60 * 1000, // 10 minutes - cafés don't change frequently
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    refetchOnMount: 'always', // Always check for fresh data on mount
  })
}

interface UseInfiniteCafesOptions {
  filters?: FilterOptions
  enabled?: boolean
  pageSize?: number
}

/**
 * Custom hook for infinite café loading with React Query
 * Provides pagination and optimized performance for mobile
 */
export function useInfiniteCafes({
  filters,
  enabled = true,
  pageSize = 10,
}: UseInfiniteCafesOptions = {}) {
  return useInfiniteQuery({
    queryKey: [...cafeKeys.list(filters), 'infinite'],
    queryFn: async ({ pageParam = 0 }) => {
      // For now, return all cafés and simulate pagination
      // TODO: Implement actual pagination in cafeService
      const allCafes = await cafeService.getCafes(filters)
      const startIndex = pageParam * pageSize
      const endIndex = startIndex + pageSize
      const cafes = allCafes.slice(startIndex, endIndex)

      return {
        cafes,
        nextCursor: endIndex < allCafes.length ? pageParam + 1 : undefined,
        hasMore: endIndex < allCafes.length,
        totalCount: allCafes.length,
      }
    },
    initialPageParam: 0,
    getNextPageParam: lastPage => lastPage.nextCursor,
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes cache
  })
}

interface UseCafeOptions {
  id: string
  enabled?: boolean
}

/**
 * Custom hook for fetching individual café data
 */
export function useCafe({ id, enabled = true }: UseCafeOptions) {
  return useQuery({
    queryKey: cafeKeys.detail(id),
    queryFn: async () => {
      // TODO: Implement cafeService.getCafe(id) method
      const cafes = await cafeService.getCafes()
      const cafe = cafes.find(c => c.id === id)
      if (!cafe) throw new Error(`Café with id ${id} not found`)
      return cafe
    },
    enabled: enabled && !!id,
    staleTime: 15 * 60 * 1000, // Individual cafés can be cached longer
    gcTime: 60 * 60 * 1000, // 1 hour cache
  })
}

/**
 * Helper hook to invalidate café queries
 */
export function useCafeInvalidation() {
  const queryClient = useQueryClient()

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: cafeKeys.all })
    },
    invalidateLists: () => {
      queryClient.invalidateQueries({ queryKey: cafeKeys.lists() })
    },
    invalidateList: (filters?: FilterOptions) => {
      queryClient.invalidateQueries({ queryKey: cafeKeys.list(filters) })
    },
    invalidateDetail: (id: string) => {
      queryClient.invalidateQueries({ queryKey: cafeKeys.detail(id) })
    },
  }
}
