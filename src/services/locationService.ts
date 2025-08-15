import type { Location } from '../types/cafe'

/**
 * Location error classes
 */
export class LocationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'LocationError'
  }
}

export class GeolocationError extends LocationError {
  constructor(originalError: GeolocationPositionError) {
    const message = LocationService.getGeolocationErrorMessage(
      originalError.code
    )
    super(message, 'GEOLOCATION_ERROR', originalError)
  }
}

export class GeocodingError extends LocationError {
  constructor(message: string) {
    super(message, 'GEOCODING_ERROR')
  }
}

/**
 * Indonesian location data
 */
interface IndonesianCity {
  name: string
  province: string
  coordinates: { lat: number; lng: number }
  commonDistricts: string[]
}

/**
 * Geolocation position interface
 */
interface GeolocationPosition {
  coords: {
    latitude: number
    longitude: number
    accuracy: number
  }
  timestamp: number
}

/**
 * Service for handling GPS, geolocation, and Indonesian address operations
 */
export class LocationService {
  private readonly GEOCODING_CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours
  private readonly POSITION_TIMEOUT = 15000 // 15 seconds
  private readonly POSITION_MAX_AGE = 5 * 60 * 1000 // 5 minutes

  // Major Indonesian cities with coordinates and common districts
  private readonly indonesianCities: IndonesianCity[] = [
    {
      name: 'Jakarta',
      province: 'DKI Jakarta',
      coordinates: { lat: -6.2088, lng: 106.8456 },
      commonDistricts: [
        'Jakarta Pusat',
        'Jakarta Selatan',
        'Jakarta Utara',
        'Jakarta Barat',
        'Jakarta Timur',
        'Menteng',
        'Senayan',
        'Kemang',
        'Pondok Indah',
        'Kelapa Gading',
      ],
    },
    {
      name: 'Surabaya',
      province: 'Jawa Timur',
      coordinates: { lat: -7.2575, lng: 112.7521 },
      commonDistricts: [
        'Surabaya Pusat',
        'Surabaya Selatan',
        'Surabaya Utara',
        'Gubeng',
        'Wonokromo',
      ],
    },
    {
      name: 'Bandung',
      province: 'Jawa Barat',
      coordinates: { lat: -6.9175, lng: 107.6191 },
      commonDistricts: [
        'Bandung Wetan',
        'Bandung Kulon',
        'Coblong',
        'Dago',
        'Cihampelas',
      ],
    },
    {
      name: 'Medan',
      province: 'Sumatera Utara',
      coordinates: { lat: 3.5952, lng: 98.6722 },
      commonDistricts: [
        'Medan Kota',
        'Medan Barat',
        'Medan Timur',
        'Medan Utara',
        'Medan Selatan',
      ],
    },
    {
      name: 'Bekasi',
      province: 'Jawa Barat',
      coordinates: { lat: -6.2349, lng: 106.9896 },
      commonDistricts: [
        'Bekasi Kota',
        'Bekasi Barat',
        'Bekasi Timur',
        'Bekasi Utara',
        'Bekasi Selatan',
      ],
    },
    {
      name: 'Tangerang',
      province: 'Banten',
      coordinates: { lat: -6.1783, lng: 106.6319 },
      commonDistricts: [
        'Tangerang Kota',
        'Karawaci',
        'Serpong',
        'Alam Sutera',
        'BSD City',
      ],
    },
    {
      name: 'Depok',
      province: 'Jawa Barat',
      coordinates: { lat: -6.4025, lng: 106.7942 },
      commonDistricts: ['Beji', 'Pancoran Mas', 'Limo', 'Cinere', 'Margonda'],
    },
    {
      name: 'Semarang',
      province: 'Jawa Tengah',
      coordinates: { lat: -6.9667, lng: 110.4167 },
      commonDistricts: [
        'Semarang Tengah',
        'Semarang Utara',
        'Semarang Selatan',
        'Gajahmada',
        'Simpang Lima',
      ],
    },
    {
      name: 'Palembang',
      province: 'Sumatera Selatan',
      coordinates: { lat: -2.9761, lng: 104.7754 },
      commonDistricts: [
        'Ilir Barat',
        'Ilir Timur',
        'Seberang Ulu',
        'Bukit Kecil',
        'Gandus',
      ],
    },
    {
      name: 'Makassar',
      province: 'Sulawesi Selatan',
      coordinates: { lat: -5.1477, lng: 119.4327 },
      commonDistricts: [
        'Makassar Utara',
        'Makassar Selatan',
        'Panakkukang',
        'Tamalate',
        'Biringkanaya',
      ],
    },
    {
      name: 'Batam',
      province: 'Kepulauan Riau',
      coordinates: { lat: 1.1325, lng: 104.0534 },
      commonDistricts: [
        'Batam Kota',
        'Sekupang',
        'Nongsa',
        'Lubuk Baja',
        'Sagulung',
      ],
    },
    {
      name: 'Bogor',
      province: 'Jawa Barat',
      coordinates: { lat: -6.5944, lng: 106.7892 },
      commonDistricts: [
        'Bogor Tengah',
        'Bogor Utara',
        'Bogor Selatan',
        'Bogor Barat',
        'Bogor Timur',
      ],
    },
    {
      name: 'Pekanbaru',
      province: 'Riau',
      coordinates: { lat: 0.5071, lng: 101.4478 },
      commonDistricts: [
        'Sukajadi',
        'Lima Puluh',
        'Senapelan',
        'Bukit Raya',
        'Marpoyan Damai',
      ],
    },
    {
      name: 'Bandar Lampung',
      province: 'Lampung',
      coordinates: { lat: -5.3971, lng: 105.2946 },
      commonDistricts: [
        'Tanjung Karang Pusat',
        'Teluk Betung',
        'Kedaton',
        'Rajabasa',
        'Kemiling',
      ],
    },
    {
      name: 'Malang',
      province: 'Jawa Timur',
      coordinates: { lat: -7.9797, lng: 112.6304 },
      commonDistricts: [
        'Klojen',
        'Blimbing',
        'Lowokwaru',
        'Sukun',
        'Kedungkandang',
      ],
    },
    {
      name: 'Yogyakarta',
      province: 'DI Yogyakarta',
      coordinates: { lat: -7.7956, lng: 110.3695 },
      commonDistricts: [
        'Kraton',
        'Gondomanan',
        'Ngampilan',
        'Wirobrajan',
        'Gedongtengen',
      ],
    },
    {
      name: 'Solo',
      province: 'Jawa Tengah',
      coordinates: { lat: -7.5663, lng: 110.8287 },
      commonDistricts: [
        'Laweyan',
        'Serengan',
        'Pasar Kliwon',
        'Jebres',
        'Banjarsari',
      ],
    },
    {
      name: 'Denpasar',
      province: 'Bali',
      coordinates: { lat: -8.65, lng: 115.2167 },
      commonDistricts: [
        'Denpasar Selatan',
        'Denpasar Utara',
        'Denpasar Barat',
        'Denpasar Timur',
      ],
    },
    {
      name: 'Balikpapan',
      province: 'Kalimantan Timur',
      coordinates: { lat: -1.2379, lng: 116.8289 },
      commonDistricts: [
        'Balikpapan Kota',
        'Balikpapan Selatan',
        'Balikpapan Utara',
        'Balikpapan Barat',
        'Balikpapan Timur',
      ],
    },
    {
      name: 'Samarinda',
      province: 'Kalimantan Timur',
      coordinates: { lat: -0.495, lng: 117.1436 },
      commonDistricts: [
        'Samarinda Kota',
        'Samarinda Seberang',
        'Samarinda Utara',
        'Sungai Kunjang',
        'Palaran',
      ],
    },
  ]

  /**
   * Get current GPS position with high accuracy
   */
  async getCurrentPosition(): Promise<GeolocationPosition> {
    if (!navigator.geolocation) {
      throw new LocationError(
        'Geolocation is not supported by this browser',
        'NOT_SUPPORTED'
      )
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        position => resolve(position),
        error => reject(new GeolocationError(error)),
        {
          enableHighAccuracy: true,
          timeout: this.POSITION_TIMEOUT,
          maximumAge: this.POSITION_MAX_AGE,
        }
      )
    })
  }

  /**
   * Watch position changes for real-time location tracking
   */
  watchPosition(
    onPositionUpdate: (position: GeolocationPosition) => void,
    onError: (error: GeolocationError) => void
  ): number | null {
    if (!navigator.geolocation) {
      throw new LocationError(
        'Geolocation is not supported by this browser',
        'NOT_SUPPORTED'
      )
    }

    return navigator.geolocation.watchPosition(
      onPositionUpdate,
      error => onError(new GeolocationError(error)),
      {
        enableHighAccuracy: true,
        timeout: this.POSITION_TIMEOUT,
        maximumAge: this.POSITION_MAX_AGE,
      }
    )
  }

  /**
   * Clear position watch
   */
  clearWatch(watchId: number): void {
    if (navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId)
    }
  }

  /**
   * Convert coordinates to address using reverse geocoding
   * Note: In a real implementation, this would use Google Maps Geocoding API
   * For now, we'll use Indonesian city data and approximate matching
   */
  async coordinatesToAddress(
    latitude: number,
    longitude: number
  ): Promise<Location> {
    try {
      // Find the closest Indonesian city
      const closestCity = this.findClosestIndonesianCity(latitude, longitude)

      if (!closestCity) {
        throw new GeocodingError(
          'Location not found in supported Indonesian cities'
        )
      }

      // Calculate distance to determine if we're actually in the city
      const distance = this.calculateDistance(
        latitude,
        longitude,
        closestCity.coordinates.lat,
        closestCity.coordinates.lng
      )

      // If too far from any major city (>50km), provide generic coordinates
      if (distance > 50) {
        return {
          latitude,
          longitude,
          address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          city: 'Unknown City',
          district: undefined,
        }
      }

      // Return the closest city information
      return {
        latitude,
        longitude,
        address: `${closestCity.name}, ${closestCity.province}, Indonesia`,
        city: closestCity.name,
        district: undefined, // Would be determined by more precise geocoding
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error)

      // Fallback to coordinate-only location
      return {
        latitude,
        longitude,
        address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        city: 'Unknown City',
        district: undefined,
      }
    }
  }

  /**
   * Convert address to coordinates using forward geocoding
   * Note: In a real implementation, this would use Google Maps Geocoding API
   */
  async addressToCoordinates(address: string): Promise<Location | null> {
    const normalizedAddress = address.toLowerCase().trim()

    // Try to match against Indonesian cities
    const matchedCity = this.indonesianCities.find(
      city =>
        normalizedAddress.includes(city.name.toLowerCase()) ||
        city.commonDistricts.some(district =>
          normalizedAddress.includes(district.toLowerCase())
        )
    )

    if (matchedCity) {
      return {
        latitude: matchedCity.coordinates.lat,
        longitude: matchedCity.coordinates.lng,
        address: `${matchedCity.name}, ${matchedCity.province}, Indonesia`,
        city: matchedCity.name,
        district: undefined,
      }
    }

    throw new GeocodingError(`Address not found: ${address}`)
  }

  /**
   * Get list of supported Indonesian cities
   */
  getSupportedCities(): string[] {
    return this.indonesianCities.map(city => city.name).sort()
  }

  /**
   * Get districts for a specific city
   */
  getCityDistricts(cityName: string): string[] {
    const city = this.indonesianCities.find(
      c => c.name.toLowerCase() === cityName.toLowerCase()
    )
    return city?.commonDistricts || []
  }

  /**
   * Validate if coordinates are within Indonesia bounds
   */
  isWithinIndonesia(latitude: number, longitude: number): boolean {
    // Indonesia bounds: approximately 6°N to 11°S and 95°E to 141°E
    return (
      latitude >= -11 && latitude <= 6 && longitude >= 95 && longitude <= 141
    )
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1)
    const dLng = this.toRadians(lng2 - lng1)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  /**
   * Find the closest Indonesian city to given coordinates
   */
  private findClosestIndonesianCity(
    latitude: number,
    longitude: number
  ): IndonesianCity | null {
    let closestCity: IndonesianCity | null = null
    let minDistance = Infinity

    for (const city of this.indonesianCities) {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        city.coordinates.lat,
        city.coordinates.lng
      )

      if (distance < minDistance) {
        minDistance = distance
        closestCity = city
      }
    }

    return closestCity
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  /**
   * Get human-readable error message for geolocation errors
   */
  static getGeolocationErrorMessage(code: number): string {
    switch (code) {
      case 1:
        return 'Location access denied by user'
      case 2:
        return 'Location information unavailable'
      case 3:
        return 'Location request timed out'
      default:
        return 'Unknown location error occurred'
    }
  }

  /**
   * Create a Location object from current position
   */
  async getCurrentLocation(): Promise<Location> {
    const position = await this.getCurrentPosition()
    return this.coordinatesToAddress(
      position.coords.latitude,
      position.coords.longitude
    )
  }

  /**
   * Validate Location object
   */
  validateLocation(location: Partial<Location>): location is Location {
    return !!(
      location &&
      typeof location.latitude === 'number' &&
      typeof location.longitude === 'number' &&
      typeof location.address === 'string' &&
      typeof location.city === 'string' &&
      location.latitude >= -90 &&
      location.latitude <= 90 &&
      location.longitude >= -180 &&
      location.longitude <= 180
    )
  }
}

// Singleton instance for the application
export const locationService = new LocationService()
