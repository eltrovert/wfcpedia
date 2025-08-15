import React, { useState, useEffect } from 'react'
import type { Cafe, FilterOptions } from '../types/cafe'
import { CafeGallery } from '../components/cafe'
import { TouchTarget } from '../components/ui/TouchTarget'
import { useLocation } from '../hooks'

/**
 * Home page component featuring café gallery with location-based defaults
 * Implements mobile-first design with bottom navigation integration
 */
export function Home(): JSX.Element {
  const [filters, setFilters] = useState<FilterOptions>({})
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null)
  const [showLocationPrompt, setShowLocationPrompt] = useState(false)

  const {
    location,
    loading: locationLoading,
    error: locationError,
    permissionStatus,
    requestLocation,
    clearError,
    getCurrentCity,
  } = useLocation()

  // Update filters when location changes
  useEffect(() => {
    const currentCity = getCurrentCity()
    if (currentCity && currentCity !== filters.city) {
      setFilters(prev => ({
        ...prev,
        city: currentCity,
      }))
    }
  }, [location, getCurrentCity, filters.city])

  // Show location prompt if permission is not granted
  useEffect(() => {
    if (permissionStatus === 'prompt' || permissionStatus === 'denied') {
      setShowLocationPrompt(true)
    }
  }, [permissionStatus])

  const handleCafeSelect = (cafe: Cafe) => {
    setSelectedCafe(cafe)
    // TODO: Navigate to café detail view or open modal
    console.log('Selected café:', cafe.name)
  }

  const handleLocationRefresh = async () => {
    clearError()
    await requestLocation()
  }

  const handleLocationPromptAccept = async () => {
    setShowLocationPrompt(false)
    await requestLocation()
  }

  const handleLocationPromptDecline = () => {
    setShowLocationPrompt(false)
    // Set default to Jakarta if user declines location access
    setFilters(prev => ({
      ...prev,
      city: 'Jakarta',
    }))
  }

  const handleFilterToggle = () => {
    // TODO: Open filter modal or drawer
    console.log('Opening filters...')
  }

  // Get location display text
  const getLocationText = () => {
    if (locationLoading) return 'Finding your location...'
    if (locationError) return 'Location unavailable'
    if (location) {
      return location.district
        ? `${location.district}, ${location.city}`
        : location.city
    }
    return filters.city || 'Jakarta & Bali'
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header with location and actions */}
      <header className='bg-white border-b border-gray-200 sticky top-0 z-20'>
        <div className='px-4 py-3'>
          <div className='flex items-center justify-between'>
            {/* Location Display */}
            <div className='flex items-center gap-2 flex-1'>
              <span className='text-2xl'>
                {locationLoading ? '🔄' : locationError ? '❌' : '📍'}
              </span>
              <div>
                <h1 className='text-sm font-medium text-gray-900'>
                  Work-Friendly Cafés
                </h1>
                <p className='text-xs text-gray-600'>{getLocationText()}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex items-center gap-2'>
              <TouchTarget
                onClick={handleLocationRefresh}
                variant='ghost'
                ariaLabel='Refresh location'
                className='min-h-9 min-w-9'
              >
                <span className='text-lg'>🔄</span>
              </TouchTarget>

              <TouchTarget
                onClick={handleFilterToggle}
                variant='ghost'
                ariaLabel='Filter cafés'
                className='min-h-9 min-w-9'
              >
                <span className='text-lg'>⚙️</span>
              </TouchTarget>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Bar - Will be implemented in future tasks */}
      <div className='bg-white border-b border-gray-100'>
        <div className='px-4 py-2'>
          <div className='flex items-center gap-2 overflow-x-auto'>
            <div className='text-xs text-gray-500 whitespace-nowrap'>
              Quick filters: All • Near me • Fast WiFi • Quiet • 24/7
            </div>
          </div>
        </div>
      </div>

      {/* Main Gallery Content */}
      <main className='px-4 py-4'>
        <CafeGallery
          filters={filters}
          onCafeSelect={handleCafeSelect}
          className='pb-20' // Space for bottom navigation
        />
      </main>

      {/* Floating Add Button - Placeholder for future implementation */}
      <div className='fixed bottom-20 right-4 z-10'>
        <TouchTarget
          variant='primary'
          className='w-14 h-14 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600'
          ariaLabel='Add new café'
          onClick={() => console.log('Add café clicked')}
        >
          <span className='text-xl text-white'>+</span>
        </TouchTarget>
      </div>

      {/* Location Permission Prompt */}
      {showLocationPrompt && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40'>
          <div className='bg-white rounded-lg p-6 max-w-sm w-full'>
            <div className='text-center mb-4'>
              <span className='text-4xl block mb-2'>📍</span>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Find Cafés Near You
              </h3>
              <p className='text-sm text-gray-600'>
                Allow location access to discover work-friendly cafés in your
                area for a personalized experience.
              </p>
            </div>
            <div className='flex gap-3'>
              <TouchTarget
                onClick={handleLocationPromptDecline}
                variant='secondary'
                className='flex-1'
              >
                Not Now
              </TouchTarget>
              <TouchTarget
                onClick={handleLocationPromptAccept}
                variant='primary'
                className='flex-1'
              >
                Allow Location
              </TouchTarget>
            </div>
          </div>
        </div>
      )}

      {/* Location Error Banner */}
      {locationError && !showLocationPrompt && (
        <div className='fixed top-16 left-4 right-4 bg-orange-100 border border-orange-200 rounded-lg p-3 z-30'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <span className='text-orange-500'>⚠️</span>
              <p className='text-sm text-orange-800'>{locationError}</p>
            </div>
            <div className='flex items-center gap-2'>
              <TouchTarget
                onClick={handleLocationRefresh}
                variant='ghost'
                className='min-h-8 min-w-8 text-orange-600'
                ariaLabel='Retry location'
              >
                🔄
              </TouchTarget>
              <TouchTarget
                onClick={clearError}
                variant='ghost'
                className='min-h-8 min-w-8 text-orange-600'
                ariaLabel='Dismiss error'
              >
                ✕
              </TouchTarget>
            </div>
          </div>
        </div>
      )}

      {/* Selected Café Debug Info - Remove in production */}
      {selectedCafe && (
        <div className='fixed top-20 left-4 right-4 bg-black/80 text-white p-4 rounded-lg z-30'>
          <h3 className='font-medium'>Selected: {selectedCafe.name}</h3>
          <p className='text-sm opacity-80'>
            {selectedCafe.location.district}, {selectedCafe.location.city}
          </p>
          <TouchTarget
            onClick={() => setSelectedCafe(null)}
            variant='ghost'
            className='mt-2 text-white border-white'
          >
            Close
          </TouchTarget>
        </div>
      )}
    </div>
  )
}
