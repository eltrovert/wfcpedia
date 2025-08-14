import { describe, it, expect } from 'vitest'
import {
  transformRowToCafe,
  transformCafeToRow,
  transformRowToRating,
  transformRatingToRow,
  transformRowsToCafes,
  transformRowsToRatings,
} from '../../../src/services/transformers'
import {
  mockCafe,
  mockCafeRating,
  mockSheetsApiResponse,
} from '../../__mocks__/cafe-data'

describe('Data Transformers', () => {
  describe('transformRowToCafe', () => {
    it('should transform Google Sheets row to Cafe object', () => {
      const row = mockSheetsApiResponse.values[0]
      const result = transformRowToCafe(row)

      expect(result).toMatchObject({
        id: mockCafe.id,
        name: mockCafe.name,
        location: {
          address: mockCafe.location.address,
          city: mockCafe.location.city,
          latitude: mockCafe.location.latitude,
          longitude: mockCafe.location.longitude,
        },
      })
      expect(result.workMetrics.wifiSpeed).toBe(mockCafe.workMetrics.wifiSpeed)
      expect(result.workMetrics.comfortRating).toBe(
        mockCafe.workMetrics.comfortRating
      )
    })

    it('should handle empty district field', () => {
      const row = [...mockSheetsApiResponse.values[0]]
      row[6] = '' // Empty district
      const result = transformRowToCafe(row)

      expect(result.location.district).toBeUndefined()
    })

    it('should parse JSON fields correctly', () => {
      const row = mockSheetsApiResponse.values[0]
      const result = transformRowToCafe(row)

      expect(result.workMetrics.amenities).toEqual(
        mockCafe.workMetrics.amenities
      )
      expect(result.operatingHours).toEqual(mockCafe.operatingHours)
      expect(result.images).toEqual(mockCafe.images)
    })

    it('should throw error for invalid row length', () => {
      const shortRow = ['id', 'name', 'address']

      expect(() => transformRowToCafe(shortRow)).toThrow(
        'Invalid row data: expected at least 18 columns'
      )
    })

    it('should validate data using Zod schema', () => {
      const invalidRow = [...mockSheetsApiResponse.values[0]]
      invalidRow[8] = 'invalid-rating' // Invalid comfort rating

      expect(() => transformRowToCafe(invalidRow)).toThrow()
    })
  })

  describe('transformCafeToRow', () => {
    it('should transform Cafe object to Google Sheets row', () => {
      const result = transformCafeToRow(mockCafe)

      expect(result).toHaveLength(18)
      expect(result[0]).toBe(mockCafe.id)
      expect(result[1]).toBe(mockCafe.name)
      expect(result[2]).toBe(mockCafe.location.address)
      expect(result[3]).toBe(mockCafe.location.latitude.toString())
      expect(result[4]).toBe(mockCafe.location.longitude.toString())
      expect(result[5]).toBe(mockCafe.location.city)
    })

    it('should serialize JSON fields correctly', () => {
      const result = transformCafeToRow(mockCafe)

      expect(JSON.parse(result[10])).toEqual(mockCafe.workMetrics.amenities)
      expect(JSON.parse(result[11])).toEqual(mockCafe.operatingHours)
      expect(JSON.parse(result[12])).toEqual(mockCafe.images)
    })

    it('should handle empty district', () => {
      const cafeWithoutDistrict = {
        ...mockCafe,
        location: { ...mockCafe.location, district: undefined },
      }
      const result = transformCafeToRow(cafeWithoutDistrict)

      expect(result[6]).toBe('')
    })
  })

  describe('transformRowToRating', () => {
    const ratingRow = [
      '123e4567-e89b-12d3-a456-426614174100', // Valid UUID
      '123e4567-e89b-12d3-a456-426614174000', // Valid UUID
      'session-123',
      'fast',
      '4',
      'moderate',
      'Great place for working!',
      '["https://example.com/photo1.jpg"]', // Valid URL
      'true',
      '2024-03-15T10:30:00Z',
    ]

    it('should transform rating row to CafeRating object', () => {
      const result = transformRowToRating(ratingRow)

      expect(result).toMatchObject({
        ratingId: '123e4567-e89b-12d3-a456-426614174100',
        cafeId: '123e4567-e89b-12d3-a456-426614174000',
        sessionId: 'session-123',
        comment: 'Great place for working!',
        loveGiven: true,
        ratedAt: '2024-03-15T10:30:00Z',
      })
      expect(result.workMetrics?.wifiSpeed).toBe('fast')
      expect(result.workMetrics?.comfortRating).toBe(4)
    })

    it('should handle optional workMetrics', () => {
      const rowWithoutMetrics = [
        '123e4567-e89b-12d3-a456-426614174101', // Valid UUID
        '123e4567-e89b-12d3-a456-426614174000', // Valid UUID
        'session-456',
        '',
        '',
        '',
        'Just a comment',
        '[]',
        'false',
        '2024-03-15T11:30:00Z',
      ]
      const result = transformRowToRating(rowWithoutMetrics)

      expect(result.workMetrics).toBeUndefined()
      expect(result.comment).toBe('Just a comment')
      expect(result.loveGiven).toBe(false)
    })

    it('should throw error for invalid row length', () => {
      const shortRow = ['rating-001', 'cafe-001']

      expect(() => transformRowToRating(shortRow)).toThrow(
        'Invalid rating row data: expected at least 10 columns'
      )
    })
  })

  describe('transformRatingToRow', () => {
    it('should transform CafeRating object to row', () => {
      const result = transformRatingToRow(mockCafeRating)

      expect(result).toHaveLength(10)
      expect(result[0]).toBe(mockCafeRating.ratingId)
      expect(result[1]).toBe(mockCafeRating.cafeId)
      expect(result[2]).toBe(mockCafeRating.sessionId)
      expect(result[8]).toBe('true') // loveGiven as string
    })

    it('should handle optional fields', () => {
      const ratingWithoutOptionals = {
        ...mockCafeRating,
        workMetrics: undefined,
        comment: undefined,
        photos: undefined,
      }
      const result = transformRatingToRow(ratingWithoutOptionals)

      expect(result[3]).toBe('') // wifiSpeed
      expect(result[4]).toBe('') // comfortRating
      expect(result[5]).toBe('') // noiseLevel
      expect(result[6]).toBe('') // comment
      expect(result[7]).toBe('') // photos
    })
  })

  describe('transformRowsToCafes', () => {
    it('should transform multiple rows with error handling', () => {
      const validRow = mockSheetsApiResponse.values[0]
      const invalidRow = ['incomplete-row']
      const rows = [validRow, invalidRow, validRow]

      // Should not throw but log warnings
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const result = transformRowsToCafes(rows)

      expect(result).toHaveLength(2) // Only valid rows transformed
      expect(consoleWarn).toHaveBeenCalledWith(
        'Transformation errors:',
        expect.any(Array)
      )

      consoleWarn.mockRestore()
    })

    it('should skip empty rows', () => {
      const rows = [
        mockSheetsApiResponse.values[0],
        [], // empty row
        [''], // row with empty string
        mockSheetsApiResponse.values[0],
      ]

      const result = transformRowsToCafes(rows)
      expect(result).toHaveLength(2)
    })
  })

  describe('transformRowsToRatings', () => {
    it('should transform multiple rating rows with error handling', () => {
      const validRow = [
        '123e4567-e89b-12d3-a456-426614174100',
        '123e4567-e89b-12d3-a456-426614174000',
        'session-123',
        'fast',
        '4',
        'moderate',
        'Good cafe',
        '[]',
        'true',
        '2024-03-15T10:30:00Z',
      ]
      const invalidRow = ['incomplete-rating-row']
      const rows = [validRow, invalidRow, validRow]

      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const result = transformRowsToRatings(rows)

      expect(result).toHaveLength(2) // Only valid rows transformed
      expect(consoleWarn).toHaveBeenCalledWith(
        'Rating transformation errors:',
        expect.any(Array)
      )

      consoleWarn.mockRestore()
    })
  })
})
