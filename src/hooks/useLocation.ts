import { useState, useEffect, useCallback } from 'react'
import { locationService } from '../services'
import type { Location } from '../types/cafe'

interface LocationState {
  location: Location | null
  loading: boolean
  error: string | null
  permissionStatus: 'prompt' | 'granted' | 'denied' | null
}

interface UseLocationResult extends LocationState {
  requestLocation: () => Promise<void>
  clearError: () => void
  getCurrentCity: () => string | null
}

/**
 * Custom hook for GPS-based location services integration
 * Provides geolocation with permission handling and fallbacks
 */
export function useLocation(): UseLocationResult {
  const [state, setState] = useState<LocationState>({
    location: null,
    loading: false,
    error: null,
    permissionStatus: null,
  })

  // Check for geolocation support
  const isGeolocationSupported = 'geolocation' in navigator

  // Get current position with enhanced error handling
  const getCurrentPosition = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!isGeolocationSupported) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 15000, // 15 seconds
        maximumAge: 300000, // 5 minutes cache
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        error => {
          let errorMessage = 'Failed to get location'

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out'
              break
            default:
              errorMessage = `Location error: ${error.message}`
          }

          reject(new Error(errorMessage))
        },
        options
      )
    })
  }, [isGeolocationSupported])

  // Request location permission and get current location
  const requestLocation = useCallback(async (): Promise<void> => {
    if (!isGeolocationSupported) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation not supported on this device',
        permissionStatus: 'denied',
      }))
      return
    }

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
    }))

    try {
      // Check permission status if available
      if ('permissions' in navigator) {
        try {
          const permission = await navigator.permissions.query({
            name: 'geolocation',
          })
          setState(prev => ({
            ...prev,
            permissionStatus: permission.state as
              | 'granted'
              | 'denied'
              | 'prompt',
          }))
        } catch (permError) {
          console.warn('Failed to check geolocation permission:', permError)
        }
      }

      // Get current position
      const position = await getCurrentPosition()
      const { latitude, longitude } = position.coords

      try {
        // Use LocationService to get address and city information
        const locationData = await locationService.coordinatesToAddress(
          latitude,
          longitude
        )

        setState(prev => ({
          ...prev,
          location: locationData,
          loading: false,
          error: null,
          permissionStatus: 'granted',
        }))
      } catch (geocodingError) {
        console.warn(
          'Geocoding failed, using coordinates only:',
          geocodingError
        )

        // Fallback to coordinates with default city
        const fallbackLocation: Location = {
          latitude,
          longitude,
          address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          city: 'Jakarta', // Default to Jakarta for Indonesian context
          district: undefined,
        }

        setState(prev => ({
          ...prev,
          location: fallbackLocation,
          loading: false,
          error: 'Location found, but address lookup failed',
          permissionStatus: 'granted',
        }))
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown location error'

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        permissionStatus: errorMessage.includes('denied') ? 'denied' : 'prompt',
      }))
    }
  }, [isGeolocationSupported, getCurrentPosition])

  // Clear error state
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }))
  }, [])

  // Get current city name or fallback
  const getCurrentCity = useCallback((): string | null => {
    return state.location?.city || null
  }, [state.location])

  // Auto-request location on mount if permission is granted
  useEffect(() => {
    const checkAndRequestLocation = async () => {
      if (!isGeolocationSupported) return

      try {
        // Check if permission is already granted
        if ('permissions' in navigator) {
          const permission = await navigator.permissions.query({
            name: 'geolocation',
          })
          if (permission.state === 'granted') {
            await requestLocation()
          }
        }
      } catch (error) {
        console.warn('Failed to auto-request location:', error)
      }
    }

    checkAndRequestLocation()
  }, [isGeolocationSupported, requestLocation])

  return {
    location: state.location,
    loading: state.loading,
    error: state.error,
    permissionStatus: state.permissionStatus,
    requestLocation,
    clearError,
    getCurrentCity,
  }
}
