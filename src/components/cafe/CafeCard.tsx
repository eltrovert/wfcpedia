import React from 'react'
import type { Cafe } from '../../types/cafe'
import { TouchTarget, ProgressiveImage } from '../ui'

interface CafeCardProps {
  cafe: Cafe
  onLoveToggle?: (cafeId: string) => void
  onCardClick: (cafe: Cafe) => void
  className?: string
}

/**
 * Mobile-optimized café card component with work metrics display
 * Features 16:9 aspect ratio and overlay information for gallery display
 */
export function CafeCard({
  cafe,
  onLoveToggle,
  onCardClick,
  className = '',
}: CafeCardProps): JSX.Element {
  const handleLoveClick = () => {
    onLoveToggle?.(cafe.id)
  }

  const handleCardClick = () => {
    onCardClick?.(cafe)
  }

  // Get primary image or fallback to placeholder
  const primaryImage = cafe.images?.[0]?.url || cafe.images?.[0]?.thumbnailUrl
  const thumbnailImage = cafe.images?.[0]?.thumbnailUrl || primaryImage

  // Format operating hours for current day
  const today = new Date()
    .toLocaleDateString('en', { weekday: 'short' })
    .toLowerCase() // 'mon', 'tue', etc.
  const todayHours = cafe.operatingHours[today]
  const hoursText = todayHours?.is24Hours
    ? '24 hours'
    : todayHours
      ? `${todayHours.open} - ${todayHours.close}`
      : 'Closed'

  // Format WiFi speed display
  const wifiDisplay = {
    slow: { text: 'Slow WiFi', color: 'text-orange-400' },
    medium: { text: 'Good WiFi', color: 'text-yellow-400' },
    fast: { text: 'Fast WiFi', color: 'text-green-400' },
    fiber: { text: 'Fiber WiFi', color: 'text-emerald-400' },
  }[cafe.workMetrics.wifiSpeed]

  // Format noise level display
  const noiseDisplay = {
    quiet: { text: 'Quiet', icon: '🔇' },
    moderate: { text: 'Moderate', icon: '🔉' },
    lively: { text: 'Lively', icon: '🔊' },
  }[cafe.workMetrics.noiseLevel]

  // Generate comfort rating stars
  const generateStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={i < rating ? 'text-yellow-400' : 'text-gray-300'}
      >
        ⭐
      </span>
    ))
  }

  return (
    <div
      className={`relative overflow-hidden rounded-lg shadow-sm bg-white cursor-pointer transition-transform active:scale-95 ${className}`}
      onClick={handleCardClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCardClick()
        }
      }}
      role='button'
      tabIndex={0}
      aria-label={`Café ${cafe.name} in ${cafe.location.district || cafe.location.city}. Press Enter to view details.`}
    >
      {/* Image Container - 16:9 Aspect Ratio */}
      <div className='relative w-full aspect-video bg-gray-200'>
        <ProgressiveImage
          src={primaryImage || ''}
          thumbnailSrc={thumbnailImage}
          alt={`${cafe.name} café workspace`}
          aspectRatio='video'
          className='w-full h-full'
        />

        {/* Overlay with gradient for text readability */}
        <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />

        {/* Love Button - Top Right */}
        <div className='absolute top-2 right-2'>
          <TouchTarget
            onClick={handleLoveClick}
            variant='ghost'
            className='bg-white/20 backdrop-blur-sm text-white border-none min-h-8 min-w-8 rounded-full'
            ariaLabel={`${cafe.community.loveCount} loves for ${cafe.name}`}
          >
            <span className='flex items-center gap-1 text-sm'>
              ❤️ {cafe.community.loveCount}
            </span>
          </TouchTarget>
        </div>

        {/* Verification Badge - Top Left */}
        {cafe.community.verificationStatus !== 'unverified' && (
          <div className='absolute top-2 left-2'>
            <span className='px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-medium'>
              {cafe.community.verificationStatus === 'verified'
                ? '✓ Verified'
                : '⭐ Premium'}
            </span>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className='p-3 space-y-2'>
        {/* Café Name and Location */}
        <div>
          <h3 className='font-semibold text-lg text-gray-900 line-clamp-1'>
            {cafe.name}
          </h3>
          <p className='text-sm text-gray-600 line-clamp-1'>
            {cafe.location.district && `${cafe.location.district}, `}
            {cafe.location.city}
          </p>
        </div>

        {/* Work Metrics Row */}
        <div className='flex items-center justify-between text-xs'>
          {/* WiFi Speed */}
          <div className='flex items-center gap-1'>
            <span className={wifiDisplay.color}>📶</span>
            <span className={wifiDisplay.color}>{wifiDisplay.text}</span>
          </div>

          {/* Comfort Rating */}
          <div className='flex items-center gap-1'>
            {generateStars(cafe.workMetrics.comfortRating)}
          </div>

          {/* Noise Level */}
          <div className='flex items-center gap-1'>
            <span>{noiseDisplay.icon}</span>
            <span className='text-gray-600'>{noiseDisplay.text}</span>
          </div>
        </div>

        {/* Operating Hours */}
        <div className='flex items-center justify-between text-xs text-gray-500'>
          <span>Today: {hoursText}</span>
          {cafe.workMetrics.amenities.includes('24/7') && (
            <span className='px-2 py-1 bg-green-100 text-green-700 rounded-full'>
              24/7
            </span>
          )}
        </div>

        {/* Key Amenities */}
        {cafe.workMetrics.amenities.length > 0 && (
          <div className='flex flex-wrap gap-1'>
            {cafe.workMetrics.amenities.slice(0, 4).map(amenity => (
              <span
                key={amenity}
                className='px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full'
              >
                {amenity}
              </span>
            ))}
            {cafe.workMetrics.amenities.length > 4 && (
              <span className='px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full'>
                +{cafe.workMetrics.amenities.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
