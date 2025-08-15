import React, { useState, useCallback, useRef } from 'react'
import type { Cafe, FilterOptions } from '../../types/cafe'
import { CafeCard } from './CafeCard'
import { InfiniteScroll } from '../ui'
import { useCafes } from '../../hooks'

interface CafeGalleryProps {
  filters?: FilterOptions
  onCafeSelect?: (cafe: Cafe) => void
  className?: string
}

/**
 * Mobile-optimized café gallery with infinite scroll and pull-to-refresh
 * Implements offline-first data loading with service layer integration
 */
export function CafeGallery({
  filters,
  onCafeSelect,
  className = '',
}: CafeGalleryProps): JSX.Element {
  const [refreshing, setRefreshing] = useState(false)

  const galleryRef = useRef<HTMLDivElement>(null)

  // Use React Query for data fetching
  const {
    data: cafes = [],
    isLoading: loading,
    error,
    refetch,
    isFetching,
  } = useCafes({ filters })

  // Track pull-to-refresh state
  const [pullToRefreshState, setPullToRefreshState] = useState({
    startY: 0,
    currentY: 0,
    isActive: false,
    threshold: 80,
  })

  // Load more cafés for infinite scroll
  const loadMoreCafes = useCallback(async () => {
    // TODO: Implement actual infinite scroll with useInfiniteCafes hook
    console.log('Load more triggered - pagination not yet implemented')
  }, [])

  // Refresh function for pull-to-refresh
  const refreshCafes = useCallback(async () => {
    setRefreshing(true)
    try {
      await refetch()
    } catch (err) {
      console.error('Failed to refresh cafés:', err)
    } finally {
      setRefreshing(false)
    }
  }, [refetch])

  // Handle love toggle with optimistic updates
  const handleLoveToggle = useCallback(async (cafeId: string) => {
    try {
      // TODO: Implement actual love toggle through service layer
      // This would use React Query mutations for optimistic updates
      console.log('Love toggled for café:', cafeId)
    } catch (err) {
      console.error('Failed to toggle love:', err)
    }
  }, [])

  // Pull-to-refresh functionality for mobile
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0) {
      setPullToRefreshState(prev => ({
        ...prev,
        startY: e.touches[0].clientY,
        isActive: true,
      }))
    }
  }, [])

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!pullToRefreshState.isActive || window.scrollY > 0) return

      const currentY = e.touches[0].clientY
      const diff = currentY - pullToRefreshState.startY

      if (diff > 0) {
        setPullToRefreshState(prev => ({
          ...prev,
          currentY: Math.min(diff, prev.threshold * 1.5),
        }))
      }
    },
    [
      pullToRefreshState.isActive,
      pullToRefreshState.startY,
      pullToRefreshState.threshold,
    ]
  )

  const handleTouchEnd = useCallback(() => {
    if (!pullToRefreshState.isActive) return

    const shouldRefresh =
      pullToRefreshState.currentY >= pullToRefreshState.threshold

    if (shouldRefresh && !refreshing) {
      refreshCafes()
    }

    setPullToRefreshState(prev => ({
      ...prev,
      startY: 0,
      currentY: 0,
      isActive: false,
    }))
  }, [pullToRefreshState, refreshing, refreshCafes])

  // Initialize touch events for pull-to-refresh
  useEffect(() => {
    const element = galleryRef.current
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className='space-y-4'>
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className='bg-white rounded-lg shadow-sm overflow-hidden'>
          <div className='w-full aspect-video bg-gray-200 animate-pulse' />
          <div className='p-3 space-y-2'>
            <div className='h-6 bg-gray-200 rounded animate-pulse' />
            <div className='h-4 bg-gray-200 rounded w-3/4 animate-pulse' />
            <div className='flex justify-between'>
              <div className='h-3 bg-gray-200 rounded w-1/4 animate-pulse' />
              <div className='h-3 bg-gray-200 rounded w-1/4 animate-pulse' />
              <div className='h-3 bg-gray-200 rounded w-1/4 animate-pulse' />
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  // Empty state component
  const EmptyState = () => (
    <div className='text-center py-12'>
      <div className='text-6xl mb-4'>☕</div>
      <h3 className='text-lg font-medium text-gray-900 mb-2'>No cafés found</h3>
      <p className='text-gray-600 mb-4'>
        Try adjusting your filters or check back later for new additions.
      </p>
      <button
        onClick={() => loadCafes(true)}
        className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
      >
        Refresh
      </button>
    </div>
  )

  // Error state component
  const ErrorState = () => (
    <div className='text-center py-12'>
      <div className='text-6xl mb-4'>⚠️</div>
      <h3 className='text-lg font-medium text-gray-900 mb-2'>
        Something went wrong
      </h3>
      <p className='text-gray-600 mb-4'>
        {error instanceof Error
          ? error.message
          : 'Failed to load cafés. Please try again.'}
      </p>
      <button
        onClick={() => refetch()}
        className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
      >
        Try Again
      </button>
    </div>
  )

  // Calculate pull-to-refresh transform
  const pullTransform =
    pullToRefreshState.currentY > 0
      ? `translateY(${pullToRefreshState.currentY}px)`
      : 'translateY(0)'

  return (
    <div ref={galleryRef} className={`relative ${className}`}>
      {/* Pull-to-refresh indicator */}
      {(refreshing || pullToRefreshState.currentY > 0) && (
        <div
          className='absolute top-0 left-0 right-0 flex items-center justify-center py-4 bg-white z-10'
          style={{
            transform: `translateY(${Math.max(0, pullToRefreshState.currentY - 60)}px)`,
          }}
        >
          <div className='flex items-center gap-2 text-blue-500'>
            <div
              className={`w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full ${refreshing ? 'animate-spin' : ''}`}
            />
            <span className='text-sm font-medium'>
              {refreshing
                ? 'Refreshing...'
                : pullToRefreshState.currentY >= pullToRefreshState.threshold
                  ? 'Release to refresh'
                  : 'Pull to refresh'}
            </span>
          </div>
        </div>
      )}

      {/* Gallery content */}
      <div
        style={{
          transform: pullTransform,
          transition: pullToRefreshState.isActive
            ? 'none'
            : 'transform 0.2s ease-out',
        }}
      >
        {loading && cafes.length === 0 ? (
          <LoadingSkeleton />
        ) : error && cafes.length === 0 ? (
          <ErrorState />
        ) : cafes.length === 0 ? (
          <EmptyState />
        ) : (
          <InfiniteScroll
            onLoadMore={loadMoreCafes}
            hasMore={false} // Disable infinite scroll until pagination is implemented
            loading={loading || isFetching}
            className='space-y-4'
          >
            {/* Café cards grid - single column for mobile-first */}
            {cafes.map(cafe => (
              <CafeCard
                key={cafe.id}
                cafe={cafe}
                onLoveToggle={handleLoveToggle}
                onCardClick={onCafeSelect}
                className='w-full'
              />
            ))}
          </InfiniteScroll>
        )}
      </div>
    </div>
  )
}
