import type { Cafe, CafeRating, WorkMetrics, Community } from '../types/cafe'
import { validateCafe, validateCafeRating } from '../utils/validation'

/**
 * Transform Google Sheets row data to Cafe object
 * Google Sheets Schema: A-R columns as defined in story
 */
export const transformRowToCafe = (row: string[]): Cafe => {
  if (row.length < 18) {
    throw new Error(
      `Invalid row data: expected at least 18 columns, got ${row.length}`
    )
  }

  const [
    id,
    name,
    address,
    latitude,
    longitude,
    city,
    district,
    wifiSpeed,
    comfortRating,
    noiseLevel,
    amenities,
    operatingHours,
    images,
    loveCount,
    contributorId,
    verificationStatus,
    createdAt,
    updatedAt,
  ] = row

  const cafe: Cafe = {
    id,
    name,
    location: {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      address,
      city,
      district: district || undefined,
    },
    workMetrics: {
      wifiSpeed: wifiSpeed as WorkMetrics['wifiSpeed'],
      comfortRating: parseInt(comfortRating),
      noiseLevel: noiseLevel as WorkMetrics['noiseLevel'],
      amenities: amenities ? JSON.parse(amenities) : [],
    },
    operatingHours: operatingHours ? JSON.parse(operatingHours) : {},
    images: images ? JSON.parse(images) : [],
    community: {
      loveCount: parseInt(loveCount) || 0,
      lastUpdated: updatedAt,
      contributorId,
      verificationStatus: verificationStatus as Community['verificationStatus'],
    },
    createdAt,
    updatedAt,
  }

  try {
    return validateCafe(cafe)
  } catch (error) {
    console.error(`Validation failed for cafe data:`, { cafe, error })
    throw new Error(
      `Invalid cafe data: ${error instanceof Error ? error.message : 'Unknown validation error'}`
    )
  }
}

/**
 * Transform Cafe object to Google Sheets row format
 */
export const transformCafeToRow = (cafe: Cafe): string[] => {
  const validatedCafe = validateCafe(cafe)

  return [
    validatedCafe.id,
    validatedCafe.name,
    validatedCafe.location.address,
    validatedCafe.location.latitude.toString(),
    validatedCafe.location.longitude.toString(),
    validatedCafe.location.city,
    validatedCafe.location.district || '',
    validatedCafe.workMetrics.wifiSpeed,
    validatedCafe.workMetrics.comfortRating.toString(),
    validatedCafe.workMetrics.noiseLevel,
    JSON.stringify(validatedCafe.workMetrics.amenities),
    JSON.stringify(validatedCafe.operatingHours),
    JSON.stringify(validatedCafe.images),
    validatedCafe.community.loveCount.toString(),
    validatedCafe.community.contributorId,
    validatedCafe.community.verificationStatus,
    validatedCafe.createdAt,
    validatedCafe.updatedAt,
  ]
}

/**
 * Transform Google Sheets row data to CafeRating object
 * Ratings Sheet Schema: A-J columns as defined in story
 */
export const transformRowToRating = (row: string[]): CafeRating => {
  if (row.length < 10) {
    throw new Error(
      `Invalid rating row data: expected at least 10 columns, got ${row.length}`
    )
  }

  const [
    ratingId,
    cafeId,
    sessionId,
    wifiSpeed,
    comfortRating,
    noiseLevel,
    comment,
    photos,
    loveGiven,
    ratedAt,
  ] = row

  const rating: CafeRating = {
    ratingId,
    cafeId,
    sessionId,
    workMetrics:
      wifiSpeed || comfortRating || noiseLevel
        ? {
            ...(wifiSpeed && {
              wifiSpeed: wifiSpeed as WorkMetrics['wifiSpeed'],
            }),
            ...(comfortRating && { comfortRating: parseInt(comfortRating) }),
            ...(noiseLevel && {
              noiseLevel: noiseLevel as WorkMetrics['noiseLevel'],
            }),
            amenities: [], // Not included in ratings
          }
        : undefined,
    comment: comment || undefined,
    photos: photos ? JSON.parse(photos) : undefined,
    loveGiven: loveGiven === 'TRUE' || loveGiven === 'true',
    ratedAt,
  }

  try {
    return validateCafeRating(rating)
  } catch (error) {
    console.error(`Validation failed for rating data:`, { rating, error })
    throw new Error(
      `Invalid rating data: ${error instanceof Error ? error.message : 'Unknown validation error'}`
    )
  }
}

/**
 * Transform CafeRating object to Google Sheets row format
 */
export const transformRatingToRow = (rating: CafeRating): string[] => {
  const validatedRating = validateCafeRating(rating)

  return [
    validatedRating.ratingId,
    validatedRating.cafeId,
    validatedRating.sessionId,
    validatedRating.workMetrics?.wifiSpeed || '',
    validatedRating.workMetrics?.comfortRating?.toString() || '',
    validatedRating.workMetrics?.noiseLevel || '',
    validatedRating.comment || '',
    validatedRating.photos ? JSON.stringify(validatedRating.photos) : '',
    validatedRating.loveGiven.toString(),
    validatedRating.ratedAt,
  ]
}

/**
 * Transform multiple rows to cafes with error handling
 */
export const transformRowsToCafes = (rows: string[][]): Cafe[] => {
  const cafes: Cafe[] = []
  const errors: { row: number; error: string }[] = []

  rows.forEach((row, index) => {
    try {
      if (row.length > 0 && row[0]) {
        // Skip empty rows
        cafes.push(transformRowToCafe(row))
      }
    } catch (error) {
      errors.push({
        row: index + 1,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  })

  if (errors.length > 0) {
    console.warn('Transformation errors:', errors)
  }

  return cafes
}

/**
 * Transform multiple rows to ratings with error handling
 */
export const transformRowsToRatings = (rows: string[][]): CafeRating[] => {
  const ratings: CafeRating[] = []
  const errors: { row: number; error: string }[] = []

  rows.forEach((row, index) => {
    try {
      if (row.length > 0 && row[0]) {
        // Skip empty rows
        ratings.push(transformRowToRating(row))
      }
    } catch (error) {
      errors.push({
        row: index + 1,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  })

  if (errors.length > 0) {
    console.warn('Rating transformation errors:', errors)
  }

  return ratings
}
