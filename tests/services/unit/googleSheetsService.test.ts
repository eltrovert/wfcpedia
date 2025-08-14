import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  GoogleSheetsService,
  GoogleSheetsError,
  RateLimitError,
  NetworkError,
} from '../../../src/services/googleSheetsService'
import {
  mockCafe,
  mockCafeRating,
  mockSheetsApiResponse,
  mockRatingsApiResponse,
} from '../../__mocks__/cafe-data'

// Mock the rate limiter
vi.mock('../../../src/services/rateLimiter', () => ({
  rateLimiter: {
    canMakeRequest: vi.fn(() => true),
    recordRequest: vi.fn(),
    getRateLimitInfo: vi.fn(() => ({
      requestsPerMinute: 300,
      currentRequests: 1,
      resetTime: Date.now() + 60000,
    })),
  },
}))

// Mock network utils
vi.mock('../../../src/utils/network', () => ({
  getNetworkStatus: vi.fn(() => ({ online: true })),
}))

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('GoogleSheetsService', () => {
  let service: GoogleSheetsService

  beforeEach(async () => {
    vi.clearAllMocks()

    // Mock environment variables before creating service
    vi.stubEnv('VITE_SHEETS_ID', 'test-sheet-id')
    vi.stubEnv('VITE_GOOGLE_API_KEY', 'test-api-key')

    // Reset network mock to online by default
    const { getNetworkStatus } = await import('../../../src/utils/network')
    vi.mocked(getNetworkStatus).mockReturnValue({ online: true })

    // Reset rate limiter mock
    const { rateLimiter } = await import('../../../src/services/rateLimiter')
    vi.mocked(rateLimiter.canMakeRequest).mockReturnValue(true)
    vi.mocked(rateLimiter.recordRequest).mockImplementation(() => {})
    vi.mocked(rateLimiter.getRateLimitInfo).mockReturnValue({
      requestsPerMinute: 300,
      currentRequests: 1,
      resetTime: Date.now() + 60000,
    })

    service = new GoogleSheetsService()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('constructor', () => {
    it('should throw error if environment variables are missing', () => {
      // Temporarily clear env vars
      vi.stubEnv('VITE_SHEETS_ID', '')
      vi.stubEnv('VITE_GOOGLE_API_KEY', '')

      expect(() => new GoogleSheetsService()).toThrow(GoogleSheetsError)
      expect(() => new GoogleSheetsService()).toThrow(
        'Missing required environment variables'
      )

      // Restore env vars for other tests
      vi.stubEnv('VITE_SHEETS_ID', 'test-sheet-id')
      vi.stubEnv('VITE_GOOGLE_API_KEY', 'test-api-key')
    })

    it('should create service with valid environment variables', () => {
      expect(service).toBeDefined()
    })
  })

  describe('getCafes', () => {
    it('should fetch and transform cafes successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSheetsApiResponse),
      })

      const result = await service.getCafes()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('Cafes!A2:R1000'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: mockCafe.id,
        name: mockCafe.name,
      })
    })

    it('should return empty array when no data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ values: [] }),
      })

      const result = await service.getCafes()
      expect(result).toEqual([])
    })

    it('should apply filters correctly', async () => {
      const multipleCafesResponse = {
        ...mockSheetsApiResponse,
        values: [
          mockSheetsApiResponse.values[0], // Jakarta cafe
          [
            '123e4567-e89b-12d3-a456-426614174002',
            'Bandung Cafe',
            'Jl. Braga No. 45, Bandung',
            '-6.9175',
            '107.6191',
            'Bandung', // Different city
            'Braga',
            'medium',
            '3',
            'quiet',
            '["wifi"]',
            '{}',
            '[]',
            '50',
            'contrib456',
            'unverified',
            '2024-01-15T10:30:00Z',
            '2024-03-10T14:20:00Z',
          ],
        ],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(multipleCafesResponse),
      })

      const result = await service.getCafes({ city: 'Jakarta' })
      expect(result).toHaveLength(1)
      expect(result[0].location.city).toBe('Jakarta')
    })

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () =>
          Promise.resolve({
            error: { message: 'Sheet not found', status: 'NOT_FOUND' },
          }),
      })

      await expect(service.getCafes()).rejects.toThrow(GoogleSheetsError)
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(service.getCafes()).rejects.toThrow(NetworkError)
    })
  })

  describe('addCafe', () => {
    it('should add cafe successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      })

      await service.addCafe(mockCafe)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('Cafes!A:R:append'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining(mockCafe.id),
        })
      )
    })

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () =>
          Promise.resolve({
            error: { message: 'Invalid data', status: 'INVALID_ARGUMENT' },
          }),
      })

      await expect(service.addCafe(mockCafe)).rejects.toThrow(GoogleSheetsError)
    })
  })

  describe('addRating', () => {
    it('should add rating successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      })

      await service.addRating(mockCafeRating)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('Ratings!A:J:append'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining(mockCafeRating.ratingId),
        })
      )
    })
  })

  describe('updateCafe', () => {
    it('should update existing cafe', async () => {
      // Mock getCafes call first
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSheetsApiResponse),
      })

      // Mock update call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      })

      await service.updateCafe(mockCafe)

      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(mockFetch).toHaveBeenLastCalledWith(
        expect.stringContaining('Cafes!A2:R2'), // Row 2 (first data row)
        expect.objectContaining({
          method: 'PUT',
        })
      )
    })

    it('should throw error for non-existent cafe', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ values: [] }),
      })

      await expect(service.updateCafe(mockCafe)).rejects.toThrow(
        'Cafe not found'
      )
    })
  })

  describe('getCafeRatings', () => {
    it('should fetch ratings for specific cafe', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRatingsApiResponse),
      })

      const result = await service.getCafeRatings(
        '123e4567-e89b-12d3-a456-426614174000'
      )

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        ratingId: mockCafeRating.ratingId,
        cafeId: '123e4567-e89b-12d3-a456-426614174000',
      })
    })

    it('should filter ratings by cafe ID', async () => {
      const multipleRatingsResponse = {
        ...mockRatingsApiResponse,
        values: [
          mockRatingsApiResponse.values[0], // cafe-001 rating
          [
            '123e4567-e89b-12d3-a456-426614174102',
            '123e4567-e89b-12d3-a456-426614174002', // Different cafe
            'session-456',
            '',
            '',
            '',
            'Another comment',
            '[]',
            'false',
            '2024-03-15T12:30:00Z',
          ],
        ],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(multipleRatingsResponse),
      })

      const result = await service.getCafeRatings(
        '123e4567-e89b-12d3-a456-426614174000'
      )
      expect(result).toHaveLength(1)
      expect(result[0].cafeId).toBe('123e4567-e89b-12d3-a456-426614174000')
    })

    it('should handle malformed rating data', async () => {
      const invalidRatingsResponse = {
        ...mockRatingsApiResponse,
        values: [
          [
            'invalid-rating-id', // This will fail UUID validation in transformers
            '123e4567-e89b-12d3-a456-426614174000',
            'session-123',
            '',
            '',
            '',
            'Test comment',
            'invalid-json', // This will fail JSON parsing
            'true',
            '2024-03-15T10:30:00Z',
          ],
        ],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(invalidRatingsResponse),
      })

      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const result = await service.getCafeRatings(
        '123e4567-e89b-12d3-a456-426614174000'
      )
      expect(result).toHaveLength(0)
      expect(consoleWarn).toHaveBeenCalled()

      consoleWarn.mockRestore()
    })
  })

  describe('batchAddCafes', () => {
    it('should batch add multiple cafes', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      })

      const cafes = [
        mockCafe,
        {
          ...mockCafe,
          id: '123e4567-e89b-12d3-a456-426614174003',
          name: 'Another Cafe',
        },
      ]
      await service.batchAddCafes(cafes)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('Cafes!A:R:append'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('123e4567-e89b-12d3-a456-426614174003'),
        })
      )
    })

    it('should handle empty cafe list', async () => {
      await service.batchAddCafes([])
      expect(mockFetch).not.toHaveBeenCalled()
    })
  })

  describe('rate limiting', () => {
    it('should throw rate limit error when limit exceeded', async () => {
      const { rateLimiter } = await import('../../../src/services/rateLimiter')
      vi.mocked(rateLimiter.canMakeRequest).mockReturnValue(false)
      vi.mocked(rateLimiter.getRateLimitInfo).mockReturnValue({
        requestsPerMinute: 300,
        currentRequests: 300,
        resetTime: Date.now() + 60000,
      })

      await expect(service.getCafes()).rejects.toThrow(RateLimitError)
    })
  })

  describe('network conditions', () => {
    it('should throw network error when offline', async () => {
      const { getNetworkStatus } = await import('../../../src/utils/network')
      vi.mocked(getNetworkStatus).mockReturnValue({ online: false })

      await expect(service.getCafes()).rejects.toThrow(NetworkError)
    })
  })

  describe('applyCafeFilters (private method testing via public interface)', () => {
    beforeEach(() => {
      const multipleCafesResponse = {
        range: 'Cafes!A2:R1000',
        majorDimension: 'ROWS' as const,
        values: [
          // Jakarta cafe, fast wifi, verified
          [
            '123e4567-e89b-12d3-a456-426614174010',
            'Jakarta Cafe',
            'Address 1',
            '-6.2',
            '106.8',
            'Jakarta',
            'District 1',
            'fast',
            '4',
            'moderate',
            '["wifi","power"]',
            '{}',
            '[]',
            '100',
            'contrib1',
            'verified',
            '2024-01-15T10:30:00Z',
            '2024-03-10T14:20:00Z',
          ],
          // Bandung cafe, medium wifi, unverified
          [
            '123e4567-e89b-12d3-a456-426614174011',
            'Bandung Cafe',
            'Address 2',
            '-6.9',
            '107.6',
            'Bandung',
            'District 2',
            'medium',
            '3',
            'quiet',
            '["wifi"]',
            '{}',
            '[]',
            '50',
            'contrib2',
            'unverified',
            '2024-01-15T10:30:00Z',
            '2024-03-10T14:20:00Z',
          ],
          // Jakarta cafe, fiber wifi, premium
          [
            '123e4567-e89b-12d3-a456-426614174012',
            'Jakarta Premium',
            'Address 3',
            '-6.1',
            '106.8',
            'Jakarta',
            'District 3',
            'fiber',
            '5',
            'lively',
            '["wifi","power","meeting-room"]',
            '{}',
            '[]',
            '200',
            'contrib3',
            'premium',
            '2024-01-15T10:30:00Z',
            '2024-03-10T14:20:00Z',
          ],
        ],
      }

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(multipleCafesResponse),
      })
    })

    it('should filter by city', async () => {
      const result = await service.getCafes({ city: 'Jakarta' })
      expect(result).toHaveLength(2)
      expect(result.every(cafe => cafe.location.city === 'Jakarta')).toBe(true)
    })

    it('should filter by wifi speed', async () => {
      const result = await service.getCafes({ wifiSpeed: 'fast' })
      expect(result).toHaveLength(1)
      expect(result[0].workMetrics.wifiSpeed).toBe('fast')
    })

    it('should filter by comfort rating', async () => {
      const result = await service.getCafes({ minComfortRating: 4 })
      expect(result).toHaveLength(2)
      expect(result.every(cafe => cafe.workMetrics.comfortRating >= 4)).toBe(
        true
      )
    })

    it('should filter by amenities', async () => {
      const result = await service.getCafes({ amenities: ['power'] })
      expect(result).toHaveLength(2)
      expect(
        result.every(cafe => cafe.workMetrics.amenities.includes('power'))
      ).toBe(true)
    })

    it('should apply multiple filters', async () => {
      const result = await service.getCafes({
        city: 'Jakarta',
        wifiSpeed: 'fiber',
        verificationStatus: 'premium',
      })
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Jakarta Premium')
    })
  })
})
