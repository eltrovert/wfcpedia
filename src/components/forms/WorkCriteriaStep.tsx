import React, { useState } from 'react'
import { TouchTarget } from '../ui/TouchTarget'
import type { NewCafeSubmission } from './AddCafeForm'

interface WorkCriteriaStepProps {
  data: NewCafeSubmission
  onChange: (data: Partial<NewCafeSubmission>) => void
  onValidate: () => Promise<boolean>
  errors: Record<string, string>
}

const WIFI_SPEED_OPTIONS = [
  {
    value: 'slow' as const,
    label: 'Slow',
    description: 'Basic browsing, email',
    icon: '📶',
    details: 'Up to 5 Mbps - Good for text, light web browsing',
  },
  {
    value: 'medium' as const,
    label: 'Medium',
    description: 'Video calls, file uploads',
    icon: '📶📶',
    details: '5-25 Mbps - Handles video calls, moderate file transfers',
  },
  {
    value: 'fast' as const,
    label: 'Fast',
    description: 'HD streaming, large files',
    icon: '📶📶📶',
    details: '25-100 Mbps - Great for streaming, fast downloads',
  },
  {
    value: 'fiber' as const,
    label: 'Fiber',
    description: 'Professional work, 4K streaming',
    icon: '📶📶📶📶',
    details: '100+ Mbps - Lightning fast, perfect for any task',
  },
]

const NOISE_LEVEL_OPTIONS = [
  {
    value: 'quiet' as const,
    label: 'Quiet',
    description: 'Library-like, focused work',
    icon: '🔇',
    details: 'Minimal background noise, great for calls and concentration',
  },
  {
    value: 'moderate' as const,
    label: 'Moderate',
    description: 'Light chatter, background music',
    icon: '🔉',
    details: 'Comfortable background ambiance, suitable for most work',
  },
  {
    value: 'lively' as const,
    label: 'Lively',
    description: 'Bustling atmosphere, social',
    icon: '🔊',
    details: 'Active environment, better for collaborative or casual work',
  },
]

const AMENITY_OPTIONS = [
  {
    value: '24/7' as const,
    label: '24/7 Access',
    description: 'Open around the clock',
    icon: '⏰',
  },
  {
    value: 'power' as const,
    label: 'Power Outlets',
    description: 'Easily accessible charging',
    icon: '🔌',
  },
  {
    value: 'ac' as const,
    label: 'Air Conditioning',
    description: 'Climate controlled',
    icon: '❄️',
  },
  {
    value: 'lighting' as const,
    label: 'Good Lighting',
    description: 'Bright workspace',
    icon: '💡',
  },
  {
    value: 'food' as const,
    label: 'Food Available',
    description: 'Meals and snacks',
    icon: '🍽️',
  },
]

const COMFORT_RATINGS = [
  { value: 1, label: 'Poor', description: 'Uncomfortable seating, cramped' },
  { value: 2, label: 'Fair', description: 'Basic seating, limited space' },
  {
    value: 3,
    label: 'Good',
    description: 'Comfortable for short work sessions',
  },
  {
    value: 4,
    label: 'Very Good',
    description: 'Comfortable for extended work',
  },
  {
    value: 5,
    label: 'Excellent',
    description: 'Premium comfort, ergonomic setup',
  },
]

export function WorkCriteriaStep({
  data,
  onChange,
  errors,
}: WorkCriteriaStepProps): JSX.Element {
  const [showWifiDetails, setShowWifiDetails] = useState(false)

  const handleWifiSpeedChange = (
    wifiSpeed: 'slow' | 'medium' | 'fast' | 'fiber'
  ): void => {
    onChange({
      workMetrics: {
        ...data.workMetrics,
        wifiSpeed,
      },
    })
  }

  const handleComfortRatingChange = (
    comfortRating: 1 | 2 | 3 | 4 | 5
  ): void => {
    onChange({
      workMetrics: {
        ...data.workMetrics,
        comfortRating,
      },
    })
  }

  const handleNoiseLevelChange = (
    noiseLevel: 'quiet' | 'moderate' | 'lively'
  ): void => {
    onChange({
      workMetrics: {
        ...data.workMetrics,
        noiseLevel,
      },
    })
  }

  const handleAmenityToggle = (
    amenity: '24/7' | 'power' | 'ac' | 'lighting' | 'food'
  ): void => {
    const currentAmenities = data.workMetrics.amenities
    const hasAmenity = currentAmenities.includes(amenity)

    onChange({
      workMetrics: {
        ...data.workMetrics,
        amenities: hasAmenity
          ? currentAmenities.filter(a => a !== amenity)
          : [...currentAmenities, amenity],
      },
    })
  }

  return (
    <div className='p-4 space-y-8'>
      {/* WiFi Speed */}
      <div>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-sm font-medium text-gray-700'>WiFi Speed *</h3>
          <TouchTarget
            variant='ghost'
            onClick={() => setShowWifiDetails(!showWifiDetails)}
            className='text-xs px-2 py-1'
            ariaLabel='Toggle WiFi speed details'
          >
            {showWifiDetails ? 'Hide Details' : 'Show Details'}
          </TouchTarget>
        </div>

        <div className='grid grid-cols-2 gap-3'>
          {WIFI_SPEED_OPTIONS.map(option => (
            <TouchTarget
              key={option.value}
              variant={
                data.workMetrics.wifiSpeed === option.value
                  ? 'primary'
                  : 'secondary'
              }
              onClick={() => handleWifiSpeedChange(option.value)}
              className={`p-4 h-auto flex flex-col items-center text-center gap-2 ${
                data.workMetrics.wifiSpeed === option.value
                  ? 'ring-2 ring-blue-500'
                  : ''
              }`}
              ariaLabel={`Select ${option.label} WiFi speed`}
            >
              <div className='text-2xl'>{option.icon}</div>
              <div className='font-medium'>{option.label}</div>
              <div className='text-xs text-gray-600'>{option.description}</div>
              {showWifiDetails && (
                <div className='text-xs text-gray-500 mt-1'>
                  {option.details}
                </div>
              )}
            </TouchTarget>
          ))}
        </div>

        {errors.wifiSpeed && (
          <p className='mt-2 text-sm text-red-600' role='alert'>
            {errors.wifiSpeed}
          </p>
        )}
      </div>

      {/* Comfort Rating */}
      <div>
        <h3 className='text-sm font-medium text-gray-700 mb-4'>
          Comfort Rating *
          <span className='text-gray-500 font-normal'> (Seating & Space)</span>
        </h3>

        <div className='space-y-3'>
          {COMFORT_RATINGS.map(rating => (
            <TouchTarget
              key={rating.value}
              variant={
                data.workMetrics.comfortRating === rating.value
                  ? 'primary'
                  : 'secondary'
              }
              onClick={() =>
                handleComfortRatingChange(rating.value as 1 | 2 | 3 | 4 | 5)
              }
              className={`w-full p-4 flex items-center gap-4 text-left ${
                data.workMetrics.comfortRating === rating.value
                  ? 'ring-2 ring-blue-500'
                  : ''
              }`}
              ariaLabel={`Rate comfort as ${rating.label}`}
            >
              <div className='flex'>
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-xl ${
                      i < rating.value ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <div>
                <div className='font-medium'>{rating.label}</div>
                <div className='text-sm text-gray-600'>
                  {rating.description}
                </div>
              </div>
            </TouchTarget>
          ))}
        </div>

        {errors.comfortRating && (
          <p className='mt-2 text-sm text-red-600' role='alert'>
            {errors.comfortRating}
          </p>
        )}
      </div>

      {/* Noise Level */}
      <div>
        <h3 className='text-sm font-medium text-gray-700 mb-4'>
          Noise Level *
        </h3>

        <div className='grid grid-cols-1 gap-3'>
          {NOISE_LEVEL_OPTIONS.map(option => (
            <TouchTarget
              key={option.value}
              variant={
                data.workMetrics.noiseLevel === option.value
                  ? 'primary'
                  : 'secondary'
              }
              onClick={() => handleNoiseLevelChange(option.value)}
              className={`p-4 flex items-center gap-4 text-left ${
                data.workMetrics.noiseLevel === option.value
                  ? 'ring-2 ring-blue-500'
                  : ''
              }`}
              ariaLabel={`Select ${option.label} noise level`}
            >
              <div className='text-2xl'>{option.icon}</div>
              <div>
                <div className='font-medium'>{option.label}</div>
                <div className='text-sm text-gray-600'>
                  {option.description}
                </div>
                <div className='text-xs text-gray-500 mt-1'>
                  {option.details}
                </div>
              </div>
            </TouchTarget>
          ))}
        </div>

        {errors.noiseLevel && (
          <p className='mt-2 text-sm text-red-600' role='alert'>
            {errors.noiseLevel}
          </p>
        )}
      </div>

      {/* Amenities */}
      <div>
        <h3 className='text-sm font-medium text-gray-700 mb-4'>
          Amenities{' '}
          <span className='text-gray-500 font-normal'>
            (Select all that apply)
          </span>
        </h3>

        <div className='grid grid-cols-1 gap-3'>
          {AMENITY_OPTIONS.map(amenity => {
            const isSelected = data.workMetrics.amenities.includes(
              amenity.value
            )

            return (
              <TouchTarget
                key={amenity.value}
                variant={isSelected ? 'primary' : 'secondary'}
                onClick={() => handleAmenityToggle(amenity.value)}
                className={`p-4 flex items-center gap-4 text-left ${
                  isSelected ? 'ring-2 ring-blue-500' : ''
                }`}
                ariaLabel={`${isSelected ? 'Remove' : 'Add'} ${amenity.label} amenity`}
              >
                <div className='text-2xl'>{amenity.icon}</div>
                <div className='flex-1'>
                  <div className='font-medium'>{amenity.label}</div>
                  <div className='text-sm text-gray-600'>
                    {amenity.description}
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                    isSelected
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'border-gray-300'
                  }`}
                >
                  {isSelected && <span className='text-sm'>✓</span>}
                </div>
              </TouchTarget>
            )
          })}
        </div>

        <div className='mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
          <p className='text-sm text-blue-800'>
            💡 <strong>Tip:</strong> Be honest about amenities. Accurate
            information helps remote workers choose the right workspace and sets
            proper expectations.
          </p>
        </div>
      </div>

      {/* Work Environment Summary */}
      {data.workMetrics.wifiSpeed &&
        data.workMetrics.comfortRating &&
        data.workMetrics.noiseLevel && (
          <div className='p-4 bg-green-50 border border-green-200 rounded-lg'>
            <h4 className='font-medium text-green-800 mb-2'>
              Work Environment Summary
            </h4>
            <div className='text-sm text-green-700 space-y-1'>
              <p>
                <strong>WiFi:</strong>{' '}
                {
                  WIFI_SPEED_OPTIONS.find(
                    o => o.value === data.workMetrics.wifiSpeed
                  )?.label
                }{' '}
                -
                {
                  WIFI_SPEED_OPTIONS.find(
                    o => o.value === data.workMetrics.wifiSpeed
                  )?.description
                }
              </p>
              <p>
                <strong>Comfort:</strong>{' '}
                {
                  COMFORT_RATINGS.find(
                    r => r.value === data.workMetrics.comfortRating
                  )?.label
                }
                ({data.workMetrics.comfortRating}/5 stars)
              </p>
              <p>
                <strong>Atmosphere:</strong>{' '}
                {
                  NOISE_LEVEL_OPTIONS.find(
                    o => o.value === data.workMetrics.noiseLevel
                  )?.label
                }{' '}
                -
                {
                  NOISE_LEVEL_OPTIONS.find(
                    o => o.value === data.workMetrics.noiseLevel
                  )?.description
                }
              </p>
              {data.workMetrics.amenities.length > 0 && (
                <p>
                  <strong>Amenities:</strong>{' '}
                  {data.workMetrics.amenities
                    .map(
                      a => AMENITY_OPTIONS.find(opt => opt.value === a)?.label
                    )
                    .join(', ')}
                </p>
              )}
            </div>
          </div>
        )}
    </div>
  )
}
