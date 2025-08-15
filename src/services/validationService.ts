import { z } from 'zod'
import type {
  Cafe,
  CafeRating,
  FilterOptions,
  Location,
  WorkMetrics,
  OperatingHours,
  CafeImage,
  Community,
} from '../types/cafe'

/**
 * Validation error classes
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class SchemaValidationError extends ValidationError {
  constructor(
    message: string,
    public zodError: z.ZodError,
    field?: string
  ) {
    super(message, field, zodError.errors)
  }
}

/**
 * Zod validation schemas for all cafe-related data structures
 */

// Location validation schema
const LocationSchema = z.object({
  latitude: z
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  longitude: z
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  address: z
    .string()
    .min(1, 'Address is required')
    .max(500, 'Address must be less than 500 characters'),
  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City must be less than 100 characters'),
  district: z
    .string()
    .max(100, 'District must be less than 100 characters')
    .optional(),
})

// Work metrics validation schema
const WorkMetricsSchema = z.object({
  wifiSpeed: z.enum(['slow', 'medium', 'fast', 'fiber'], {
    errorMap: () => ({
      message: 'WiFi speed must be one of: slow, medium, fast, fiber',
    }),
  }),
  comfortRating: z
    .number()
    .int('Comfort rating must be an integer')
    .min(1, 'Comfort rating must be between 1 and 5')
    .max(5, 'Comfort rating must be between 1 and 5'),
  noiseLevel: z.enum(['quiet', 'moderate', 'lively'], {
    errorMap: () => ({
      message: 'Noise level must be one of: quiet, moderate, lively',
    }),
  }),
  amenities: z
    .array(z.string().min(1, 'Amenity name cannot be empty'))
    .max(20, 'Too many amenities (maximum 20)'),
})

// Operating hours validation schema
const OperatingHoursSchema = z.record(
  z.string(),
  z.union([
    z.object({
      open: z
        .string()
        .regex(
          /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
          'Open time must be in HH:MM format'
        ),
      close: z
        .string()
        .regex(
          /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
          'Close time must be in HH:MM format'
        ),
      is24Hours: z.boolean().optional(),
    }),
    z.null(),
  ])
)

// Cafe image validation schema
const CafeImageSchema = z.object({
  url: z.string().url('Image URL must be a valid URL'),
  thumbnailUrl: z.string().url('Thumbnail URL must be a valid URL'),
  uploadedBy: z
    .string()
    .min(1, 'Uploaded by is required')
    .max(100, 'Uploaded by must be less than 100 characters'),
  uploadedAt: z.string().datetime('Upload date must be in ISO format'),
})

// Community data validation schema
const CommunitySchema = z.object({
  loveCount: z
    .number()
    .int('Love count must be an integer')
    .min(0, 'Love count cannot be negative'),
  lastUpdated: z.string().datetime('Last updated must be in ISO format'),
  contributorId: z
    .string()
    .min(1, 'Contributor ID is required')
    .max(100, 'Contributor ID must be less than 100 characters'),
  verificationStatus: z.enum(['unverified', 'verified', 'premium'], {
    errorMap: () => ({
      message:
        'Verification status must be one of: unverified, verified, premium',
    }),
  }),
})

// Main cafe validation schema
const CafeSchema = z.object({
  id: z.string().uuid('Cafe ID must be a valid UUID'),
  name: z
    .string()
    .min(1, 'Cafe name is required')
    .max(200, 'Cafe name must be less than 200 characters')
    .trim(),
  location: LocationSchema,
  workMetrics: WorkMetricsSchema,
  operatingHours: OperatingHoursSchema,
  images: z
    .array(CafeImageSchema)
    .max(10, 'Maximum 10 images allowed per cafe'),
  community: CommunitySchema,
  createdAt: z.string().datetime('Created date must be in ISO format'),
  updatedAt: z.string().datetime('Updated date must be in ISO format'),
})

// Cafe rating validation schema
const CafeRatingSchema = z.object({
  ratingId: z.string().uuid('Rating ID must be a valid UUID'),
  cafeId: z.string().uuid('Cafe ID must be a valid UUID'),
  sessionId: z
    .string()
    .min(1, 'Session ID is required')
    .max(100, 'Session ID must be less than 100 characters'),
  workMetrics: WorkMetricsSchema.partial().optional(),
  comment: z
    .string()
    .max(280, 'Comment must be less than 280 characters')
    .optional(),
  photos: z
    .array(z.string().url('Photo URL must be valid'))
    .max(5, 'Maximum 5 photos allowed per rating')
    .optional(),
  loveGiven: z.boolean(),
  ratedAt: z.string().datetime('Rating date must be in ISO format'),
})

// Filter options validation schema
const FilterOptionsSchema = z.object({
  city: z.string().optional(),
  district: z.string().optional(),
  wifiSpeed: z.enum(['slow', 'medium', 'fast', 'fiber']).optional(),
  minComfortRating: z
    .number()
    .int('Minimum comfort rating must be an integer')
    .min(1, 'Minimum comfort rating must be between 1 and 5')
    .max(5, 'Minimum comfort rating must be between 1 and 5')
    .optional(),
  noiseLevel: z.enum(['quiet', 'moderate', 'lively']).optional(),
  amenities: z.array(z.string()).optional(),
  verificationStatus: z.enum(['unverified', 'verified', 'premium']).optional(),
})

// Partial schemas for updates
const CafeUpdateSchema = CafeSchema.partial().extend({
  id: z.string().uuid('Cafe ID must be a valid UUID'),
  updatedAt: z.string().datetime('Updated date must be in ISO format'),
})

/**
 * Service for data validation using Zod schemas
 * Provides comprehensive validation for all cafe-related data structures
 */
export class ValidationService {
  /**
   * Validate cafe data
   */
  validateCafe(data: unknown): Cafe {
    try {
      return CafeSchema.parse(data)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new SchemaValidationError(
          `Cafe validation failed: ${this.formatZodError(error)}`,
          error,
          'cafe'
        )
      }
      throw new ValidationError(
        'Unknown validation error occurred',
        'cafe',
        error
      )
    }
  }

  /**
   * Validate cafe update data (allows partial updates)
   */
  validateCafeUpdate(
    data: unknown
  ): Partial<Cafe> & { id: string; updatedAt: string } {
    try {
      return CafeUpdateSchema.parse(data)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new SchemaValidationError(
          `Cafe update validation failed: ${this.formatZodError(error)}`,
          error,
          'cafeUpdate'
        )
      }
      throw new ValidationError(
        'Unknown validation error occurred',
        'cafeUpdate',
        error
      )
    }
  }

  /**
   * Validate cafe rating data
   */
  validateCafeRating(data: unknown): CafeRating {
    try {
      return CafeRatingSchema.parse(data)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new SchemaValidationError(
          `Cafe rating validation failed: ${this.formatZodError(error)}`,
          error,
          'cafeRating'
        )
      }
      throw new ValidationError(
        'Unknown validation error occurred',
        'cafeRating',
        error
      )
    }
  }

  /**
   * Validate location data
   */
  validateLocation(data: unknown): Location {
    try {
      return LocationSchema.parse(data)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new SchemaValidationError(
          `Location validation failed: ${this.formatZodError(error)}`,
          error,
          'location'
        )
      }
      throw new ValidationError(
        'Unknown validation error occurred',
        'location',
        error
      )
    }
  }

  /**
   * Validate work metrics data
   */
  validateWorkMetrics(data: unknown): WorkMetrics {
    try {
      return WorkMetricsSchema.parse(data)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new SchemaValidationError(
          `Work metrics validation failed: ${this.formatZodError(error)}`,
          error,
          'workMetrics'
        )
      }
      throw new ValidationError(
        'Unknown validation error occurred',
        'workMetrics',
        error
      )
    }
  }

  /**
   * Validate operating hours data
   */
  validateOperatingHours(data: unknown): OperatingHours {
    try {
      return OperatingHoursSchema.parse(data)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new SchemaValidationError(
          `Operating hours validation failed: ${this.formatZodError(error)}`,
          error,
          'operatingHours'
        )
      }
      throw new ValidationError(
        'Unknown validation error occurred',
        'operatingHours',
        error
      )
    }
  }

  /**
   * Validate cafe image data
   */
  validateCafeImage(data: unknown): CafeImage {
    try {
      return CafeImageSchema.parse(data)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new SchemaValidationError(
          `Cafe image validation failed: ${this.formatZodError(error)}`,
          error,
          'cafeImage'
        )
      }
      throw new ValidationError(
        'Unknown validation error occurred',
        'cafeImage',
        error
      )
    }
  }

  /**
   * Validate community data
   */
  validateCommunity(data: unknown): Community {
    try {
      return CommunitySchema.parse(data)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new SchemaValidationError(
          `Community data validation failed: ${this.formatZodError(error)}`,
          error,
          'community'
        )
      }
      throw new ValidationError(
        'Unknown validation error occurred',
        'community',
        error
      )
    }
  }

  /**
   * Validate filter options
   */
  validateFilterOptions(data: unknown): FilterOptions {
    try {
      return FilterOptionsSchema.parse(data)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new SchemaValidationError(
          `Filter options validation failed: ${this.formatZodError(error)}`,
          error,
          'filterOptions'
        )
      }
      throw new ValidationError(
        'Unknown validation error occurred',
        'filterOptions',
        error
      )
    }
  }

  /**
   * Validate array of cafes
   */
  validateCafeArray(data: unknown): Cafe[] {
    if (!Array.isArray(data)) {
      throw new ValidationError('Expected an array of cafes', 'cafeArray')
    }

    const validatedCafes: Cafe[] = []
    const errors: string[] = []

    data.forEach((item, index) => {
      try {
        validatedCafes.push(this.validateCafe(item))
      } catch (error) {
        errors.push(
          `Index ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    })

    if (errors.length > 0) {
      throw new ValidationError(
        `Cafe array validation failed with ${errors.length} errors: ${errors.join('; ')}`,
        'cafeArray',
        errors
      )
    }

    return validatedCafes
  }

  /**
   * Safe validation that returns result with success flag
   */
  safeValidateCafe(
    data: unknown
  ):
    | { success: true; data: Cafe }
    | { success: false; error: ValidationError } {
    try {
      const validatedData = this.validateCafe(data)
      return { success: true, data: validatedData }
    } catch (error) {
      const validationError =
        error instanceof ValidationError
          ? error
          : new ValidationError('Validation failed', 'cafe', error)
      return { success: false, error: validationError }
    }
  }

  /**
   * Check if data is valid without throwing
   */
  isValidCafe(data: unknown): data is Cafe {
    return this.safeValidateCafe(data).success
  }

  /**
   * Sanitize and clean cafe data before validation
   */
  sanitizeCafeData(data: unknown): unknown {
    if (!data || typeof data !== 'object') {
      return data
    }

    const sanitized = { ...(data as Record<string, unknown>) }

    // Trim string fields
    if (typeof sanitized.name === 'string') {
      sanitized.name = sanitized.name.trim()
    }

    // Ensure arrays are actually arrays
    if (sanitized.images && !Array.isArray(sanitized.images)) {
      sanitized.images = []
    }

    // Clean amenities array
    if (
      Array.isArray(sanitized.workMetrics) &&
      Array.isArray(
        (sanitized.workMetrics as Record<string, unknown>).amenities
      )
    ) {
      ;(sanitized.workMetrics as Record<string, unknown>).amenities = (
        sanitized.workMetrics as Record<string, unknown>
      ).amenities
        .filter(
          (item: unknown) => typeof item === 'string' && item.trim().length > 0
        )
        .map((item: string) => item.trim())
    }

    return sanitized
  }

  /**
   * Format Zod error into readable message
   */
  private formatZodError(error: z.ZodError): string {
    return error.errors
      .map(err => `${err.path.join('.')}: ${err.message}`)
      .join(', ')
  }

  /**
   * Get validation schema for a specific type
   */
  getSchema(
    type:
      | 'cafe'
      | 'cafeRating'
      | 'location'
      | 'workMetrics'
      | 'operatingHours'
      | 'cafeImage'
      | 'community'
      | 'filterOptions'
  ): z.ZodSchema {
    const schemas = {
      cafe: CafeSchema,
      cafeRating: CafeRatingSchema,
      location: LocationSchema,
      workMetrics: WorkMetricsSchema,
      operatingHours: OperatingHoursSchema,
      cafeImage: CafeImageSchema,
      community: CommunitySchema,
      filterOptions: FilterOptionsSchema,
    }

    return schemas[type]
  }

  /**
   * Validate field-specific data for partial updates
   */
  validateField<T>(
    fieldName: string,
    value: unknown,
    schemaType: 'cafe' | 'cafeRating'
  ): T {
    const schema = this.getSchema(schemaType)

    if ('shape' in schema && fieldName in schema.shape) {
      try {
        return (schema.shape as Record<string, z.ZodSchema>)[fieldName].parse(
          value
        )
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new SchemaValidationError(
            `Field '${fieldName}' validation failed: ${this.formatZodError(error)}`,
            error,
            fieldName
          )
        }
        throw new ValidationError(
          `Field '${fieldName}' validation failed`,
          fieldName,
          error
        )
      }
    }

    throw new ValidationError(
      `Field '${fieldName}' not found in schema`,
      fieldName
    )
  }

  /**
   * Get all possible values for enum fields
   */
  getEnumValues(fieldPath: string): string[] | null {
    const enumMaps: Record<string, string[]> = {
      'workMetrics.wifiSpeed': ['slow', 'medium', 'fast', 'fiber'],
      'workMetrics.noiseLevel': ['quiet', 'moderate', 'lively'],
      'community.verificationStatus': ['unverified', 'verified', 'premium'],
    }

    return enumMaps[fieldPath] || null
  }
}

// Singleton instance for the application
export const validationService = new ValidationService()
