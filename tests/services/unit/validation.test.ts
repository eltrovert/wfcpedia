import { describe, it, expect } from 'vitest'
import {
  validateCafe,
  validateCafeRating,
  validateFilterOptions,
  safeValidateCafe,
  safeValidateCafeRating,
  CafeSchema,
  CafeRatingSchema,
  FilterOptionsSchema,
} from '../../../src/utils/validation'
import { mockCafe, mockCafeRating } from '../../__mocks__/cafe-data'

describe('Validation Utilities', () => {
  describe('CafeSchema', () => {
    it('should validate valid cafe data', () => {
      expect(() => CafeSchema.parse(mockCafe)).not.toThrow()
    })

    it('should reject invalid UUID', () => {
      const invalidCafe = { ...mockCafe, id: 'invalid-uuid' }
      expect(() => CafeSchema.parse(invalidCafe)).toThrow()
    })

    it('should reject invalid location coordinates', () => {
      const invalidCafe = {
        ...mockCafe,
        location: { ...mockCafe.location, latitude: 100 }, // Invalid latitude
      }
      expect(() => CafeSchema.parse(invalidCafe)).toThrow()
    })

    it('should reject invalid comfort rating', () => {
      const invalidCafe = {
        ...mockCafe,
        workMetrics: { ...mockCafe.workMetrics, comfortRating: 6 }, // > 5
      }
      expect(() => CafeSchema.parse(invalidCafe)).toThrow()
    })

    it('should reject invalid wifi speed', () => {
      const invalidCafe = {
        ...mockCafe,
        workMetrics: {
          ...mockCafe.workMetrics,
          wifiSpeed: 'super-fast' as any,
        },
      }
      expect(() => CafeSchema.parse(invalidCafe)).toThrow()
    })

    it('should reject invalid noise level', () => {
      const invalidCafe = {
        ...mockCafe,
        workMetrics: {
          ...mockCafe.workMetrics,
          noiseLevel: 'deafening' as any,
        },
      }
      expect(() => CafeSchema.parse(invalidCafe)).toThrow()
    })

    it('should reject invalid operating hours format', () => {
      const invalidCafe = {
        ...mockCafe,
        operatingHours: {
          monday: { open: '8:00', close: '22:00' }, // Invalid format - should be HH:MM
        },
      }
      expect(() => CafeSchema.parse(invalidCafe)).toThrow()
    })

    it('should reject invalid image URLs', () => {
      const invalidCafe = {
        ...mockCafe,
        images: [
          {
            url: 'not-a-url',
            thumbnailUrl: 'also-not-a-url',
            uploadedBy: 'user123',
            uploadedAt: '2024-01-15T10:30:00Z',
          },
        ],
      }
      expect(() => CafeSchema.parse(invalidCafe)).toThrow()
    })

    it('should reject invalid verification status', () => {
      const invalidCafe = {
        ...mockCafe,
        community: {
          ...mockCafe.community,
          verificationStatus: 'super-verified' as any,
        },
      }
      expect(() => CafeSchema.parse(invalidCafe)).toThrow()
    })

    it('should reject invalid date formats', () => {
      const invalidCafe = {
        ...mockCafe,
        createdAt: 'not-a-date',
      }
      expect(() => CafeSchema.parse(invalidCafe)).toThrow()
    })
  })

  describe('CafeRatingSchema', () => {
    it('should validate valid rating data', () => {
      expect(() => CafeRatingSchema.parse(mockCafeRating)).not.toThrow()
    })

    it('should reject invalid UUID', () => {
      const invalidRating = { ...mockCafeRating, ratingId: 'invalid-uuid' }
      expect(() => CafeRatingSchema.parse(invalidRating)).toThrow()
    })

    it('should reject comment longer than 280 characters', () => {
      const longComment = 'a'.repeat(281)
      const invalidRating = { ...mockCafeRating, comment: longComment }
      expect(() => CafeRatingSchema.parse(invalidRating)).toThrow()
    })

    it('should allow optional fields to be undefined', () => {
      const ratingWithoutOptionals = {
        ratingId: mockCafeRating.ratingId,
        cafeId: mockCafeRating.cafeId,
        sessionId: mockCafeRating.sessionId,
        loveGiven: false,
        ratedAt: mockCafeRating.ratedAt,
      }
      expect(() => CafeRatingSchema.parse(ratingWithoutOptionals)).not.toThrow()
    })

    it('should validate partial work metrics', () => {
      const ratingWithPartialMetrics = {
        ...mockCafeRating,
        workMetrics: {
          wifiSpeed: 'fast' as const,
          // comfortRating and noiseLevel omitted
          amenities: ['wifi'],
        },
      }
      expect(() =>
        CafeRatingSchema.parse(ratingWithPartialMetrics)
      ).not.toThrow()
    })

    it('should reject invalid photo URLs', () => {
      const invalidRating = {
        ...mockCafeRating,
        photos: ['not-a-url'],
      }
      expect(() => CafeRatingSchema.parse(invalidRating)).toThrow()
    })
  })

  describe('FilterOptionsSchema', () => {
    it('should validate empty filter options', () => {
      expect(() => FilterOptionsSchema.parse({})).not.toThrow()
    })

    it('should validate all filter options', () => {
      const filters = {
        city: 'Jakarta',
        district: 'Kemang',
        wifiSpeed: 'fast' as const,
        minComfortRating: 4,
        noiseLevel: 'moderate' as const,
        amenities: ['wifi', 'power'],
        verificationStatus: 'verified' as const,
      }
      expect(() => FilterOptionsSchema.parse(filters)).not.toThrow()
    })

    it('should reject invalid comfort rating range', () => {
      const invalidFilters = { minComfortRating: 6 }
      expect(() => FilterOptionsSchema.parse(invalidFilters)).toThrow()
    })

    it('should reject invalid wifi speed', () => {
      const invalidFilters = { wifiSpeed: 'super-fast' as any }
      expect(() => FilterOptionsSchema.parse(invalidFilters)).toThrow()
    })
  })

  describe('validateCafe', () => {
    it('should return valid cafe data', () => {
      const result = validateCafe(mockCafe)
      expect(result).toEqual(mockCafe)
    })

    it('should throw on invalid data', () => {
      const invalidCafe = { ...mockCafe, id: 'invalid-uuid' }
      expect(() => validateCafe(invalidCafe)).toThrow()
    })
  })

  describe('validateCafeRating', () => {
    it('should return valid rating data', () => {
      const result = validateCafeRating(mockCafeRating)
      expect(result).toEqual(mockCafeRating)
    })

    it('should throw on invalid data', () => {
      const invalidRating = { ...mockCafeRating, ratingId: 'invalid-uuid' }
      expect(() => validateCafeRating(invalidRating)).toThrow()
    })
  })

  describe('safeValidateCafe', () => {
    it('should return success result for valid data', () => {
      const result = safeValidateCafe(mockCafe)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockCafe)
      expect(result.error).toBeNull()
    })

    it('should return error result for invalid data', () => {
      const invalidCafe = { ...mockCafe, id: 'invalid-uuid' }
      const result = safeValidateCafe(invalidCafe)

      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
      expect(result.error).toBeTruthy()
    })
  })

  describe('safeValidateCafeRating', () => {
    it('should return success result for valid data', () => {
      const result = safeValidateCafeRating(mockCafeRating)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockCafeRating)
      expect(result.error).toBeNull()
    })

    it('should return error result for invalid data', () => {
      const invalidRating = { ...mockCafeRating, ratingId: 'invalid-uuid' }
      const result = safeValidateCafeRating(invalidRating)

      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
      expect(result.error).toBeTruthy()
    })
  })

  describe('edge cases', () => {
    it('should handle null values correctly', () => {
      expect(() => CafeSchema.parse(null)).toThrow()
    })

    it('should handle undefined values correctly', () => {
      expect(() => CafeSchema.parse(undefined)).toThrow()
    })

    it('should handle empty objects', () => {
      expect(() => CafeSchema.parse({})).toThrow()
    })

    it('should handle missing required fields', () => {
      const incomplete = { id: 'valid-uuid', name: 'Test Cafe' }
      expect(() => CafeSchema.parse(incomplete)).toThrow()
    })
  })
})
