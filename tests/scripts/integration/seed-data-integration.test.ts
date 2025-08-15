/**
 * Integration tests for the seeding script
 *
 * Story: 1.4 Platform Content Seeding
 * Tests: Service layer integration, data validation, and seeding process
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { validationService } from '../../../src/services/index'

// Mock the services to avoid actual Google Sheets calls during testing
vi.mock('../../../src/services/cafeService', () => ({
  cafeService: {
    addCafe: vi.fn().mockResolvedValue(undefined),
    getCafes: vi.fn().mockResolvedValue([]),
  },
}))

vi.mock('../../../src/services/cacheService', () => ({
  cacheService: {
    cacheCafes: vi.fn().mockResolvedValue(undefined),
    set: vi.fn().mockResolvedValue(undefined),
  },
}))

describe('Seed Data Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Service Layer Integration', () => {
    it('should import seed data successfully', async () => {
      // Dynamic import to test the actual seed data structure
      try {
        const { allSeedCafes, jakartaCafes, baliCafes, validateSeedData } =
          await import('../../../scripts/seed-data.js')

        expect(Array.isArray(allSeedCafes)).toBe(true)
        expect(Array.isArray(jakartaCafes)).toBe(true)
        expect(Array.isArray(baliCafes)).toBe(true)
        expect(typeof validateSeedData).toBe('function')

        // Verify counts meet requirements
        expect(jakartaCafes.length).toBeGreaterThanOrEqual(8)
        expect(baliCafes.length).toBeGreaterThanOrEqual(7)
        expect(allSeedCafes.length).toBeGreaterThanOrEqual(10)
        expect(allSeedCafes.length).toBeLessThanOrEqual(15)
      } catch (error) {
        throw new Error(`Failed to import seed data: ${error.message}`)
      }
    })

    it('should validate all seed cafés against ValidationService', async () => {
      const { allSeedCafes } = await import('../../../scripts/seed-data.js')

      // Test each café individually to identify specific validation issues
      const validationErrors = []

      for (let i = 0; i < allSeedCafes.length; i++) {
        const cafe = allSeedCafes[i]
        try {
          validationService.validateCafe(cafe)
        } catch (error) {
          validationErrors.push({
            index: i,
            name: cafe.name || 'Unknown',
            error: error.message,
          })
        }
      }

      if (validationErrors.length > 0) {
        console.error('Validation errors found:')
        validationErrors.forEach(({ index, name, error }) => {
          console.error(`  Café ${index} (${name}): ${error}`)
        })
      }

      expect(validationErrors).toHaveLength(0)
    })

    it('should have proper geographic distribution', async () => {
      const { jakartaCafes, baliCafes } = await import(
        '../../../scripts/seed-data.js'
      )

      // Jakarta district coverage
      const jakartaDistricts = jakartaCafes.map(cafe => cafe.location.district)
      const uniqueJakartaDistricts = [...new Set(jakartaDistricts)]
      expect(uniqueJakartaDistricts.length).toBeGreaterThanOrEqual(4) // Should cover major districts

      // Bali district coverage
      const baliDistricts = baliCafes.map(cafe => cafe.location.district)
      const uniqueBaliDistricts = [...new Set(baliDistricts)]
      expect(uniqueBaliDistricts.length).toBeGreaterThanOrEqual(3) // Should cover major areas

      // Verify major Jakarta business districts
      expect(jakartaDistricts).toContain('SCBD')
      expect(jakartaDistricts).toContain('Kemang')
      expect(jakartaDistricts).toContain('Menteng')
      expect(jakartaDistricts).toContain('Senopati')

      // Verify major Bali remote work areas
      expect(baliDistricts).toContain('Ubud')
      expect(baliDistricts).toContain('Canggu')
      expect(baliDistricts).toContain('Seminyak')
    })

    it('should have all cafés with verified status', async () => {
      const { allSeedCafes } = await import('../../../scripts/seed-data.js')

      allSeedCafes.forEach((cafe, index) => {
        expect(
          cafe.community.verificationStatus,
          `Café ${index} (${cafe.name}) should be verified`
        ).toBe('verified')
        expect(
          cafe.community.contributorId,
          `Café ${index} should be created by seed-admin`
        ).toBe('seed-admin')
      })
    })

    it('should have diverse work metrics demonstrating quality standards', async () => {
      const { allSeedCafes } = await import('../../../scripts/seed-data.js')

      // Check WiFi speed distribution
      const wifiSpeeds = allSeedCafes.map(cafe => cafe.workMetrics.wifiSpeed)
      expect(wifiSpeeds).toContain('fiber') // Should have some high-speed options
      expect(wifiSpeeds).toContain('fast') // Should have good options

      // Check comfort rating distribution (should be mostly 3-5)
      const comfortRatings = allSeedCafes.map(
        cafe => cafe.workMetrics.comfortRating
      )
      const averageComfort =
        comfortRatings.reduce((a, b) => a + b, 0) / comfortRatings.length
      expect(averageComfort).toBeGreaterThanOrEqual(3.5) // Quality venues average

      // Check noise level variety
      const noiseLevels = allSeedCafes.map(cafe => cafe.workMetrics.noiseLevel)
      const uniqueNoiseLevels = [...new Set(noiseLevels)]
      expect(uniqueNoiseLevels.length).toBeGreaterThanOrEqual(2) // Should have variety

      // Check work-friendly amenities
      const allAmenities = allSeedCafes.flatMap(
        cafe => cafe.workMetrics.amenities
      )
      expect(allAmenities).toContain('power_outlets') // Essential for remote work
      expect(allAmenities).toContain('air_conditioning') // Important in tropical climate
      expect(allAmenities).toContain('food_available') // Important for extended stays
    })

    it('should validate seed data using built-in validation', async () => {
      const { validateSeedData } = await import('../../../scripts/seed-data.js')

      expect(() => validateSeedData()).not.toThrow()
      expect(validateSeedData()).toBe(true)
    })

    it('should have realistic Indonesian operating hours', async () => {
      const { allSeedCafes } = await import('../../../scripts/seed-data.js')

      allSeedCafes.forEach((cafe, index) => {
        // Check that weekdays have operating hours
        expect(
          cafe.operatingHours.monday,
          `Café ${index} should have Monday hours`
        ).toBeDefined()
        expect(
          cafe.operatingHours.tuesday,
          `Café ${index} should have Tuesday hours`
        ).toBeDefined()

        // Check time format if not 24-hour
        if (
          cafe.operatingHours.monday &&
          !cafe.operatingHours.monday.is24Hours
        ) {
          expect(cafe.operatingHours.monday.open).toMatch(/^\d{2}:\d{2}$/)
          expect(cafe.operatingHours.monday.close).toMatch(/^\d{2}:\d{2}$/)
        }

        // 24-hour places should have proper format too
        if (
          cafe.operatingHours.monday &&
          cafe.operatingHours.monday.is24Hours
        ) {
          expect(cafe.operatingHours.monday.open).toBeDefined()
          expect(cafe.operatingHours.monday.close).toBeDefined()
        }
      })
    })

    it('should have valid image URLs and metadata', async () => {
      const { allSeedCafes } = await import('../../../scripts/seed-data.js')

      allSeedCafes.forEach((cafe, index) => {
        expect(
          cafe.images.length,
          `Café ${index} should have at least one image`
        ).toBeGreaterThan(0)

        cafe.images.forEach((image, imgIndex) => {
          expect(
            image.url,
            `Café ${index} image ${imgIndex} should have valid URL`
          ).toMatch(/^https:\/\//)
          expect(
            image.thumbnailUrl,
            `Café ${index} image ${imgIndex} should have valid thumbnail URL`
          ).toMatch(/^https:\/\//)
          expect(
            image.uploadedBy,
            `Café ${index} image ${imgIndex} should be uploaded by seed-admin`
          ).toBe('seed-admin')

          // Should be valid ISO date
          expect(() => new Date(image.uploadedAt).toISOString()).not.toThrow()
        })
      })
    })
  })

  describe('Data Quality and Business Requirements', () => {
    it('should have realistic love counts for community engagement', async () => {
      const { allSeedCafes } = await import('../../../scripts/seed-data.js')

      allSeedCafes.forEach((cafe, index) => {
        expect(
          cafe.community.loveCount,
          `Café ${index} should have realistic love count`
        ).toBeGreaterThanOrEqual(5)
        expect(
          cafe.community.loveCount,
          `Café ${index} should have realistic love count`
        ).toBeLessThanOrEqual(50)
      })

      // Should have variety in love counts to appear realistic
      const loveCounts = allSeedCafes.map(cafe => cafe.community.loveCount)
      const uniqueCounts = [...new Set(loveCounts)]
      expect(
        uniqueCounts.length,
        'Should have variety in love counts'
      ).toBeGreaterThan(5)
    })

    it('should demonstrate proper content quality standards', async () => {
      const { allSeedCafes } = await import('../../../scripts/seed-data.js')

      allSeedCafes.forEach((cafe, index) => {
        // Name quality
        expect(
          cafe.name.length,
          `Café ${index} should have meaningful name`
        ).toBeGreaterThan(5)
        expect(
          cafe.name,
          `Café ${index} name should not be just "Cafe"`
        ).not.toBe('Cafe')

        // Address quality
        expect(
          cafe.location.address.length,
          `Café ${index} should have detailed address`
        ).toBeGreaterThan(10)
        expect(cafe.location.city, `Café ${index} should have city`).toMatch(
          /^(Jakarta|Bali)$/
        )

        // Amenities quality
        expect(
          cafe.workMetrics.amenities.length,
          `Café ${index} should have multiple amenities`
        ).toBeGreaterThan(2)
      })
    })
  })
})
