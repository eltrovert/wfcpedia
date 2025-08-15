import React, { useEffect, useRef, useCallback } from 'react'

interface InfiniteScrollProps {
  children: React.ReactNode
  onLoadMore: () => void
  hasMore: boolean
  loading: boolean
  threshold?: number
  rootMargin?: string
  className?: string
}

/**
 * High-performance infinite scroll component using Intersection Observer
 * Optimized for mobile performance with throttling and efficient rendering
 */
export function InfiniteScroll({
  children,
  onLoadMore,
  hasMore,
  loading,
  threshold = 0.1,
  rootMargin = '50px',
  className = '',
}: InfiniteScrollProps): JSX.Element {
  const observerRef = useRef<IntersectionObserver>()
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const loadingTimeoutRef = useRef<NodeJS.Timeout>()

  // Throttled load more function to prevent rapid multiple calls
  const throttledLoadMore = useCallback(() => {
    if (loading || !hasMore) return

    // Clear any existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
    }

    // Throttle the load more call by 500ms
    loadingTimeoutRef.current = setTimeout(() => {
      onLoadMore()
    }, 500)
  }, [onLoadMore, loading, hasMore])

  // Set up intersection observer
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return

    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      entries => {
        const [entry] = entries
        if (entry.isIntersecting && hasMore && !loading) {
          throttledLoadMore()
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    observerRef.current.observe(loadMoreRef.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, [hasMore, loading, threshold, rootMargin, throttledLoadMore])

  return (
    <div className={className}>
      {children}

      {/* Load more trigger element */}
      {hasMore && (
        <div
          ref={loadMoreRef}
          className='py-8 flex items-center justify-center'
          aria-live='polite'
          aria-atomic='true'
        >
          {loading ? (
            <div className='flex items-center gap-3 text-gray-500'>
              <div className='w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin' />
              <span className='text-sm font-medium'>Loading more cafés...</span>
            </div>
          ) : (
            <div className='text-gray-400 text-sm font-medium'>
              Scroll down for more
            </div>
          )}
        </div>
      )}

      {/* End of content indicator */}
      {!hasMore && !loading && (
        <div className='py-8 text-center'>
          <div className='text-gray-400 text-sm font-medium mb-2'>
            You've reached the end! ✨
          </div>
          <div className='text-xs text-gray-400'>
            All available cafés have been loaded
          </div>
        </div>
      )}
    </div>
  )
}
