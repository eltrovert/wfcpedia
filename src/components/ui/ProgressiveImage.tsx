import React, { useState, useRef, useEffect } from 'react'

interface ProgressiveImageProps {
  src: string
  alt: string
  thumbnailSrc?: string
  className?: string
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto'
  loading?: 'lazy' | 'eager'
  onLoad?: () => void
  onError?: () => void
  placeholder?: React.ReactNode
}

/**
 * Progressive image loading component optimized for mobile networks
 * Features lazy loading, thumbnail-to-full progressive loading, and intersection observer
 */
export function ProgressiveImage({
  src,
  alt,
  thumbnailSrc,
  className = '',
  aspectRatio = 'auto',
  loading = 'lazy',
  onLoad,
  onError,
  placeholder = null,
}: ProgressiveImageProps): JSX.Element {
  const [imageState, setImageState] = useState<
    'loading' | 'thumbnail' | 'loaded' | 'error'
  >('loading')
  const [isVisible, setIsVisible] = useState(loading === 'eager')
  const [currentSrc, setCurrentSrc] = useState<string | null>(null)

  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver>()

  // Aspect ratio classes
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video', // 16:9
    portrait: 'aspect-[3/4]', // 3:4 portrait
    auto: 'aspect-auto',
  }

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (loading === 'eager' || !containerRef.current) return

    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observerRef.current?.disconnect()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px', // Start loading 50px before coming into view
      }
    )

    observerRef.current.observe(containerRef.current)

    return () => {
      observerRef.current?.disconnect()
    }
  }, [loading])

  // Handle progressive image loading
  useEffect(() => {
    if (!isVisible) return

    const loadImage = async () => {
      try {
        // Start with thumbnail if available
        if (thumbnailSrc && imageState === 'loading') {
          setCurrentSrc(thumbnailSrc)
          setImageState('thumbnail')
        }

        // Create a new image to preload the full resolution
        const fullImage = new Image()

        fullImage.onload = () => {
          setCurrentSrc(src)
          setImageState('loaded')
          onLoad?.()
        }

        fullImage.onerror = () => {
          setImageState('error')
          onError?.()
        }

        // Start loading the full image
        fullImage.src = src
      } catch (error) {
        console.error('Failed to load image:', error)
        setImageState('error')
        onError?.()
      }
    }

    loadImage()
  }, [isVisible, src, thumbnailSrc, imageState, onLoad, onError])

  // Default placeholder component
  const defaultPlaceholder = (
    <div className='w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center'>
      <span className='text-4xl text-gray-400'>☕</span>
    </div>
  )

  // Error state component
  const errorFallback = (
    <div className='w-full h-full bg-gradient-to-br from-red-100 to-red-200 flex flex-col items-center justify-center'>
      <span className='text-2xl text-red-400 mb-2'>⚠️</span>
      <span className='text-sm text-red-600'>Image unavailable</span>
    </div>
  )

  // Loading skeleton
  const loadingSkeleton = (
    <div className='w-full h-full bg-gray-200 animate-pulse flex items-center justify-center'>
      <div className='w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin' />
    </div>
  )

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${aspectClasses[aspectRatio]} ${className}`}
    >
      {/* Show appropriate content based on state */}
      {!isVisible ? (
        placeholder || defaultPlaceholder
      ) : imageState === 'loading' ? (
        loadingSkeleton
      ) : imageState === 'error' ? (
        errorFallback
      ) : (
        <>
          {/* Actual image */}
          <img
            ref={imgRef}
            src={currentSrc || ''}
            alt={alt}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageState === 'loaded' ? 'opacity-100' : 'opacity-90'
            }`}
            draggable={false}
            // Add responsive image attributes for better mobile performance
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          />

          {/* Subtle loading indicator for progressive loading */}
          {imageState === 'thumbnail' && (
            <div className='absolute inset-0 bg-black/10 flex items-center justify-center'>
              <div className='w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin' />
            </div>
          )}
        </>
      )}

      {/* Accessibility enhancement - screen reader description */}
      <div className='sr-only' aria-live='polite' aria-atomic='true'>
        {imageState === 'loading' && `Loading image: ${alt}`}
        {imageState === 'loaded' && `Image loaded: ${alt}`}
        {imageState === 'error' && `Failed to load image: ${alt}`}
      </div>
    </div>
  )
}
