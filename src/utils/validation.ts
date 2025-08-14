import { z } from 'zod'
import type { Cafe, CafeRating, FilterOptions } from '../types/cafe'

// Location validation schema
export const LocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().min(1),
  city: z.string().min(1),
  district: z.string().optional(),
})

// Work metrics validation schema
export const WorkMetricsSchema = z.object({
  wifiSpeed: z.enum(['slow', 'medium', 'fast', 'fiber']),
  comfortRating: z.number().min(1).max(5),
  noiseLevel: z.enum(['quiet', 'moderate', 'lively']),
  amenities: z.array(z.string()),
})

// Operating hours validation schema
export const OperatingHoursSchema = z.record(
  z.string(),
  z.union([
    z.object({
      open: z.string().regex(/^\d{2}:\d{2}$/),
      close: z.string().regex(/^\d{2}:\d{2}$/),
      is24Hours: z.boolean().optional(),
    }),
    z.null(),
  ])
)

// Cafe image validation schema
export const CafeImageSchema = z.object({
  url: z.string().url(),
  thumbnailUrl: z.string().url(),
  uploadedBy: z.string().min(1),
  uploadedAt: z.string().datetime(),
})

// Community validation schema
export const CommunitySchema = z.object({
  loveCount: z.number().min(0),
  lastUpdated: z.string().datetime(),
  contributorId: z.string().min(1),
  verificationStatus: z.enum(['unverified', 'verified', 'premium']),
})

// Main Cafe validation schema
export const CafeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  location: LocationSchema,
  workMetrics: WorkMetricsSchema,
  operatingHours: OperatingHoursSchema,
  images: z.array(CafeImageSchema),
  community: CommunitySchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

// Cafe rating validation schema
export const CafeRatingSchema = z.object({
  ratingId: z.string().uuid(),
  cafeId: z.string().uuid(),
  sessionId: z.string().min(1),
  workMetrics: WorkMetricsSchema.partial().optional(),
  comment: z.string().max(280).optional(),
  photos: z.array(z.string().url()).optional(),
  loveGiven: z.boolean(),
  ratedAt: z.string().datetime(),
})

// Filter options validation schema
export const FilterOptionsSchema = z.object({
  city: z.string().optional(),
  district: z.string().optional(),
  wifiSpeed: WorkMetricsSchema.shape.wifiSpeed.optional(),
  minComfortRating: z.number().min(1).max(5).optional(),
  noiseLevel: WorkMetricsSchema.shape.noiseLevel.optional(),
  amenities: z.array(z.string()).optional(),
  verificationStatus: CommunitySchema.shape.verificationStatus.optional(),
})

// Google Sheets row validation (for data transformation)
export const SheetsRowSchema = z.array(z.string())

// Validation helper functions
export const validateCafe = (data: unknown): Cafe => CafeSchema.parse(data)
export const validateCafeRating = (data: unknown): CafeRating =>
  CafeRatingSchema.parse(data)
export const validateFilterOptions = (data: unknown): FilterOptions =>
  FilterOptionsSchema.parse(data)

// Safe validation functions (return Result-like object)
export const safeValidateCafe = (
  data: unknown
): { success: boolean; data: Cafe | null; error: z.ZodError | null } => {
  const result = CafeSchema.safeParse(data)
  return {
    success: result.success,
    data: result.success ? result.data : null,
    error: result.success ? null : result.error,
  }
}

export const safeValidateCafeRating = (
  data: unknown
): { success: boolean; data: CafeRating | null; error: z.ZodError | null } => {
  const result = CafeRatingSchema.safeParse(data)
  return {
    success: result.success,
    data: result.success ? result.data : null,
    error: result.success ? null : result.error,
  }
}
