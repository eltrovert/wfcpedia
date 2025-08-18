import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cafeService } from '../../../src/services/cafeService'
import { storageService } from '../../../src/services/storageService'
import { syncService } from '../../../src/services/syncService'
import type { Cafe } from '../../../src/types/cafe'

// Mock external dependencies
vi.mock('../../../src/services/googleSheetsService')
vi.mock('../../../src/utils/network')

describe('Add Café Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset storage
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Online submission flow', () => {
    it('successfully adds café with immediate sync', async () => {
      // Mock online status
      const { getNetworkStatus } = await import('../../../src/utils/network')
      vi.mocked(getNetworkStatus).mockReturnValue({ online: true })

      // Mock successful Google Sheets submission
      const { googleSheetsService } = await import(
        '../../../src/services/googleSheetsService'
      )
      const mockAddCafe = vi.fn().mockResolvedValue(undefined)
      vi.mocked(googleSheetsService).mockImplementation(
        () =>
          ({
            addCafe: mockAddCafe,
          }) as any
      )

      const cafeData = {
        name: 'Test Café',
        location: {
          latitude: -6.2088,
          longitude: 106.8456,
          address: 'Jl. Test 123',
          city: 'Jakarta',
          district: 'Central Jakarta',
        },
        workMetrics: {
          wifiSpeed: 'fast' as const,
          comfortRating: 4 as const,
          noiseLevel: 'moderate' as const,
          amenities: ['power', 'ac'] as const,
        },
        operatingHours: {
          monday: { open: '08:00', close: '22:00', is24Hours: false },
        },
        images: [],
      }

      const result = await cafeService.addCafe(cafeData, 'test-contributor')

      // Should return café with generated ID
      expect(result).toMatchObject({
        id: expect.any(String),
        name: 'Test Café',
        location: cafeData.location,
        workMetrics: cafeData.workMetrics,
        community: {
          loveCount: 0,
          contributorId: 'test-contributor',
          verificationStatus: 'unverified',
        },
      })

      // Should have called Google Sheets service
      expect(mockAddCafe).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Café',
          location: cafeData.location,
        })
      )
    })

    it('handles network failures gracefully with offline queue', async () => {
      // Mock online status but failing network
      const { getNetworkStatus } = await import('../../../src/utils/network')
      vi.mocked(getNetworkStatus).mockReturnValue({ online: true })

      // Mock network failure
      const { googleSheetsService } = await import(
        '../../../src/services/googleSheetsService'
      )
      const mockAddCafe = vi.fn().mockRejectedValue(new Error('Network error'))
      vi.mocked(googleSheetsService).mockImplementation(
        () =>
          ({
            addCafe: mockAddCafe,
          }) as any
      )

      // Mock sync service
      const mockQueueCafeCreation = vi.fn()
      vi.spyOn(syncService, 'queueCafeCreation').mockImplementation(
        mockQueueCafeCreation
      )

      const cafeData = {
        name: 'Test Café',
        location: {
          latitude: -6.2088,
          longitude: 106.8456,
          address: 'Jl. Test 123',
          city: 'Jakarta',
        },
        workMetrics: {
          wifiSpeed: 'fast' as const,
          comfortRating: 4 as const,
          noiseLevel: 'moderate' as const,
          amenities: [],
        },
        operatingHours: {},
        images: [],
      }

      await expect(cafeService.addCafe(cafeData)).rejects.toThrow(
        'Network error'
      )

      // Should have queued for offline sync
      expect(mockQueueCafeCreation).toHaveBeenCalled()
    })
  })

  describe('Offline submission flow', () => {
    it('queues café for sync when offline', async () => {
      // Mock offline status
      const { getNetworkStatus } = await import('../../../src/utils/network')
      vi.mocked(getNetworkStatus).mockReturnValue({ online: false })

      // Mock sync service
      const mockQueueCafeCreation = vi.fn()
      vi.spyOn(syncService, 'queueCafeCreation').mockImplementation(
        mockQueueCafeCreation
      )

      const cafeData = {
        name: 'Offline Café',
        location: {
          latitude: -6.2088,
          longitude: 106.8456,
          address: 'Jl. Offline 123',
          city: 'Jakarta',
        },
        workMetrics: {
          wifiSpeed: 'medium' as const,
          comfortRating: 3 as const,
          noiseLevel: 'quiet' as const,
          amenities: [],
        },
        operatingHours: {},
        images: [],
      }

      const result = await cafeService.addCafe(cafeData, 'offline-contributor')

      // Should return café with generated ID
      expect(result).toMatchObject({
        id: expect.any(String),
        name: 'Offline Café',
        community: {
          contributorId: 'offline-contributor',
          verificationStatus: 'unverified',
        },
      })

      // Should have queued for sync
      expect(mockQueueCafeCreation).toHaveBeenCalledWith(result)
    })

    it('adds café to local cache immediately (optimistic update)', async () => {
      // Mock offline status
      const { getNetworkStatus } = await import('../../../src/utils/network')
      vi.mocked(getNetworkStatus).mockReturnValue({ online: false })

      // Mock sync service
      vi.spyOn(syncService, 'queueCafeCreation').mockImplementation(vi.fn())

      const cafeData = {
        name: 'Cached Café',
        location: {
          latitude: -6.2088,
          longitude: 106.8456,
          address: 'Jl. Cache 123',
          city: 'Jakarta',
        },
        workMetrics: {
          wifiSpeed: 'fast' as const,
          comfortRating: 5 as const,
          noiseLevel: 'quiet' as const,
          amenities: ['power'],
        },
        operatingHours: {},
        images: [],
      }

      const result = await cafeService.addCafe(cafeData)

      // Should be retrievable from cache
      const cachedCafes = await cafeService.getCafes()
      expect(cachedCafes).toContainEqual(
        expect.objectContaining({
          id: result.id,
          name: 'Cached Café',
        })
      )
    })
  })

  describe('Duplicate detection', () => {
    it('finds nearby cafés within specified radius', async () => {
      // Add some test cafés to cache first
      const existingCafe: Cafe = {
        id: 'existing-cafe',
        name: 'Existing Café',
        location: {
          latitude: -6.2088,
          longitude: 106.8456,
          address: 'Jl. Existing 123',
          city: 'Jakarta',
        },
        workMetrics: {
          wifiSpeed: 'fast',
          comfortRating: 4,
          noiseLevel: 'moderate',
          amenities: [],
        },
        operatingHours: {},
        images: [],
        community: {
          loveCount: 0,
          lastUpdated: '2023-01-01',
          contributorId: 'test',
          verificationStatus: 'unverified',
        },
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
      }

      // Mock cached cafés
      const { cacheService } = await import(
        '../../../src/services/cacheService'
      )
      vi.spyOn(cacheService, 'getCachedCafes').mockResolvedValue([existingCafe])

      // Mock location service
      const { locationService } = await import(
        '../../../src/services/locationService'
      )
      vi.spyOn(locationService, 'calculateDistance').mockReturnValue(0.05) // 50m away

      const searchCoordinates = { lat: -6.2089, lng: 106.8457 } // Very close
      const nearbyCafes = await cafeService.searchByLocation(
        searchCoordinates,
        0.1
      )

      expect(nearbyCafes).toHaveLength(1)
      expect(nearbyCafes[0]).toEqual(existingCafe)
    })

    it('excludes cafés outside the search radius', async () => {
      const existingCafe: Cafe = {
        id: 'far-cafe',
        name: 'Far Café',
        location: {
          latitude: -6.3088, // Much further south
          longitude: 106.9456, // Much further east
          address: 'Jl. Far 123',
          city: 'Jakarta',
        },
        workMetrics: {
          wifiSpeed: 'fast',
          comfortRating: 4,
          noiseLevel: 'moderate',
          amenities: [],
        },
        operatingHours: {},
        images: [],
        community: {
          loveCount: 0,
          lastUpdated: '2023-01-01',
          contributorId: 'test',
          verificationStatus: 'unverified',
        },
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
      }

      // Mock cached cafés
      const { cacheService } = await import(
        '../../../src/services/cacheService'
      )
      vi.spyOn(cacheService, 'getCachedCafes').mockResolvedValue([existingCafe])

      // Mock location service to return large distance
      const { locationService } = await import(
        '../../../src/services/locationService'
      )
      vi.spyOn(locationService, 'calculateDistance').mockReturnValue(5.0) // 5km away

      const searchCoordinates = { lat: -6.2088, lng: 106.8456 }
      const nearbyCafes = await cafeService.searchByLocation(
        searchCoordinates,
        0.1
      ) // 100m radius

      expect(nearbyCafes).toHaveLength(0)
    })
  })

  describe('Form data persistence', () => {
    it('saves form data to localStorage', () => {
      const formData = {
        name: 'Draft Café',
        location: {
          address: 'Draft Address',
          coordinates: { lat: 0, lng: 0 },
          city: 'Jakarta',
        },
        workMetrics: {
          wifiSpeed: 'medium' as const,
          comfortRating: 3 as const,
          noiseLevel: 'moderate' as const,
          amenities: [],
        },
        operatingHours: {},
        images: [],
      }

      storageService.setItem('add-cafe-draft', JSON.stringify(formData))

      const retrieved = storageService.getItem('add-cafe-draft')
      expect(JSON.parse(retrieved || '{}')).toEqual(formData)
    })

    it('clears form data after successful submission', async () => {
      // Mock online status
      const { getNetworkStatus } = await import('../../../src/utils/network')
      vi.mocked(getNetworkStatus).mockReturnValue({ online: true })

      // Mock successful submission
      const { googleSheetsService } = await import(
        '../../../src/services/googleSheetsService'
      )
      vi.mocked(googleSheetsService).mockImplementation(
        () =>
          ({
            addCafe: vi.fn().mockResolvedValue(undefined),
          }) as any
      )

      // Set up draft data
      storageService.setItem('add-cafe-draft', JSON.stringify({ name: 'Test' }))
      expect(storageService.getItem('add-cafe-draft')).toBeTruthy()

      const cafeData = {
        name: 'Test Café',
        location: { latitude: 0, longitude: 0, address: 'Test', city: 'Test' },
        workMetrics: {
          wifiSpeed: 'medium' as const,
          comfortRating: 3 as const,
          noiseLevel: 'moderate' as const,
          amenities: [],
        },
        operatingHours: {},
        images: [],
      }

      await cafeService.addCafe(cafeData)

      // Draft should be cleared
      expect(storageService.getItem('add-cafe-draft')).toBeNull()
    })
  })
})
