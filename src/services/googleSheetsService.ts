import type {
  Cafe,
  CafeRating,
  FilterOptions,
  WorkMetrics,
} from '../types/cafe'
import type { GoogleSheetsResponse } from '../types/api'
import {
  transformRowsToCafes,
  transformCafeToRow,
  transformRatingToRow,
} from './transformers'
import { rateLimiter } from './rateLimiter'
import { getNetworkStatus } from '../utils/network'

/**
 * Error classes for Google Sheets service
 */
export class GoogleSheetsError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'GoogleSheetsError'
  }
}

export class RateLimitError extends GoogleSheetsError {
  constructor(resetTime: number) {
    super('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', { resetTime })
  }
}

export class NetworkError extends GoogleSheetsError {
  constructor(originalError: unknown) {
    super('Network request failed', 'NETWORK_ERROR', originalError)
  }
}

/**
 * Core Google Sheets API service with rate limiting and error handling
 */
export class GoogleSheetsService {
  private readonly baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets'
  private readonly sheetsId: string
  private readonly apiKey: string

  constructor() {
    const sheetsId = import.meta.env['VITE_SHEETS_ID']
    const apiKey = import.meta.env['VITE_GOOGLE_API_KEY']

    if (!sheetsId || !apiKey) {
      throw new GoogleSheetsError(
        'Missing required environment variables: VITE_SHEETS_ID, VITE_GOOGLE_API_KEY',
        'MISSING_CONFIG'
      )
    }

    this.sheetsId = sheetsId
    this.apiKey = apiKey
  }

  /**
   * Make rate-limited request to Google Sheets API
   */
  private async rateLimitedFetch(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    // Check network status
    const networkStatus = getNetworkStatus()
    if (!networkStatus.online) {
      throw new NetworkError('Device is offline')
    }

    // Rate limiting
    if (!rateLimiter.canMakeRequest()) {
      const rateLimitInfo = rateLimiter.getRateLimitInfo()
      throw new RateLimitError(rateLimitInfo.resetTime)
    }

    try {
      rateLimiter.recordRequest()

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new GoogleSheetsError(
          errorData.error?.message || `HTTP ${response.status}`,
          errorData.error?.status || 'HTTP_ERROR',
          { status: response.status, statusText: response.statusText }
        )
      }

      return response
    } catch (error) {
      if (error instanceof GoogleSheetsError) {
        throw error
      }
      throw new NetworkError(error)
    }
  }

  /**
   * Get all cafes from the Google Sheets with optional filtering
   */
  async getCafes(filters?: FilterOptions): Promise<Cafe[]> {
    const range = 'Cafes!A2:R1000' // Skip header row, get up to 1000 cafes
    const url = `${this.baseUrl}/${this.sheetsId}/values/${range}?key=${this.apiKey}`

    try {
      const response = await this.rateLimitedFetch(url)
      const data: GoogleSheetsResponse = await response.json()

      if (!data.values || data.values.length === 0) {
        return []
      }

      const cafes = transformRowsToCafes(data.values as string[][])

      // Apply filters if provided
      if (filters) {
        return this.applyCafeFilters(cafes, filters)
      }

      return cafes
    } catch (error) {
      console.error('Failed to fetch cafes:', error)
      throw error
    }
  }

  /**
   * Add a new cafe to the Google Sheets
   */
  async addCafe(cafe: Cafe): Promise<void> {
    const range = 'Cafes!A:R'
    const url = `${this.baseUrl}/${this.sheetsId}/values/${range}:append?valueInputOption=RAW&key=${this.apiKey}`

    const row = transformCafeToRow(cafe)

    const body = {
      values: [row],
    }

    try {
      await this.rateLimitedFetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    } catch (error) {
      console.error('Failed to add cafe:', error)
      throw error
    }
  }

  /**
   * Add a new rating to the Google Sheets
   */
  async addRating(rating: CafeRating): Promise<void> {
    const range = 'Ratings!A:J'
    const url = `${this.baseUrl}/${this.sheetsId}/values/${range}:append?valueInputOption=RAW&key=${this.apiKey}`

    const row = transformRatingToRow(rating)

    const body = {
      values: [row],
    }

    try {
      await this.rateLimitedFetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    } catch (error) {
      console.error('Failed to add rating:', error)
      throw error
    }
  }

  /**
   * Update an existing cafe in the Google Sheets
   * Note: This requires finding the row first, which is a limitation of Google Sheets API
   */
  async updateCafe(cafe: Cafe): Promise<void> {
    // First, get all cafes to find the row index
    const allCafes = await this.getCafes()
    const cafeIndex = allCafes.findIndex(c => c.id === cafe.id)

    if (cafeIndex === -1) {
      throw new GoogleSheetsError('Cafe not found', 'CAFE_NOT_FOUND')
    }

    // Row index in sheets (accounting for header row)
    const rowNumber = cafeIndex + 2
    const range = `Cafes!A${rowNumber}:R${rowNumber}`
    const url = `${this.baseUrl}/${this.sheetsId}/values/${range}?valueInputOption=RAW&key=${this.apiKey}`

    const row = transformCafeToRow(cafe)

    const body = {
      values: [row],
    }

    try {
      await this.rateLimitedFetch(url, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
    } catch (error) {
      console.error('Failed to update cafe:', error)
      throw error
    }
  }

  /**
   * Get ratings for a specific cafe
   */
  async getCafeRatings(cafeId: string): Promise<CafeRating[]> {
    const range = 'Ratings!A2:J1000'
    const url = `${this.baseUrl}/${this.sheetsId}/values/${range}?key=${this.apiKey}`

    try {
      const response = await this.rateLimitedFetch(url)
      const data: GoogleSheetsResponse = await response.json()

      if (!data.values || data.values.length === 0) {
        return []
      }

      const allRatings = data.values
        .filter(row => row[1] === cafeId) // Filter by cafeId (column B)
        .map(row => {
          try {
            return {
              ratingId: row[0],
              cafeId: row[1],
              sessionId: row[2],
              workMetrics:
                row[3] || row[4] || row[5]
                  ? {
                      ...(row[3] && {
                        wifiSpeed: row[3] as WorkMetrics['wifiSpeed'],
                      }),
                      ...(row[4] && { comfortRating: parseInt(row[4]) }),
                      ...(row[5] && {
                        noiseLevel: row[5] as WorkMetrics['noiseLevel'],
                      }),
                      amenities: [],
                    }
                  : undefined,
              comment: row[6] || undefined,
              photos: row[7] ? JSON.parse(row[7]) : undefined,
              loveGiven: row[8] === 'true' || row[8] === 'TRUE',
              ratedAt: row[9],
            }
          } catch (error) {
            console.warn('Failed to parse rating row:', error)
            return null
          }
        })
        .filter((rating): rating is CafeRating => rating !== null)

      return allRatings
    } catch (error) {
      console.error('Failed to fetch cafe ratings:', error)
      throw error
    }
  }

  /**
   * Batch operations for efficient data handling
   */
  async batchAddCafes(cafes: Cafe[]): Promise<void> {
    if (cafes.length === 0) return

    const range = 'Cafes!A:R'
    const url = `${this.baseUrl}/${this.sheetsId}/values/${range}:append?valueInputOption=RAW&key=${this.apiKey}`

    const rows = cafes.map(transformCafeToRow)

    const body = {
      values: rows,
    }

    try {
      await this.rateLimitedFetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    } catch (error) {
      console.error('Failed to batch add cafes:', error)
      throw error
    }
  }

  /**
   * Apply filters to cafe list
   */
  private applyCafeFilters(cafes: Cafe[], filters: FilterOptions): Cafe[] {
    return cafes.filter(cafe => {
      if (filters.city && cafe.location.city !== filters.city) return false
      if (filters.district && cafe.location.district !== filters.district)
        return false
      if (filters.wifiSpeed && cafe.workMetrics.wifiSpeed !== filters.wifiSpeed)
        return false
      if (
        filters.noiseLevel &&
        cafe.workMetrics.noiseLevel !== filters.noiseLevel
      )
        return false
      if (
        filters.minComfortRating &&
        cafe.workMetrics.comfortRating < filters.minComfortRating
      )
        return false
      if (
        filters.verificationStatus &&
        cafe.community.verificationStatus !== filters.verificationStatus
      )
        return false

      if (filters.amenities && filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every(amenity =>
          cafe.workMetrics.amenities.includes(amenity)
        )
        if (!hasAllAmenities) return false
      }

      return true
    })
  }

  /**
   * Get rate limit information
   */
  getRateLimitInfo(): {
    requestsPerMinute: number
    currentRequests: number
    resetTime: number
  } {
    return rateLimiter.getRateLimitInfo()
  }
}

// Lazy singleton instance for the application
let _instance: GoogleSheetsService | null = null
export const googleSheetsService = {
  getInstance(): GoogleSheetsService {
    if (!_instance) {
      _instance = new GoogleSheetsService()
    }
    return _instance
  },
  resetInstance(): void {
    _instance = null
  },
}
