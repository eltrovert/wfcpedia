// Core Café Services
export { cafeService } from './cafeService'
export { locationService } from './locationService'
export { imageService } from './imageService'
export { validationService } from './validationService'

// User Management Services
export { userSessionService } from './userSessionService'
export { preferencesService } from './preferencesService'
export { visitHistoryService } from './visitHistoryService'
export { contributionTrackingService } from './contributionTrackingService'

// Infrastructure Services
export { cacheService } from './cacheService'
export { syncService } from './syncService'
export { networkService } from './networkService'
export { storageService } from './storageService'

// External Services
export { googleSheetsService } from './googleSheetsService'

// Service Registry and Utilities
export { serviceRegistry } from './serviceRegistry'
export { rateLimiter } from './rateLimiter'
export * from './transformers'

// Error classes
export {
  GoogleSheetsError,
  RateLimitError,
  NetworkError,
} from './googleSheetsService'

// Additional error classes from new services
export {
  LocationError,
  GeolocationError,
  GeocodingError,
} from './locationService'
export {
  ImageError,
  CompressionError,
  UploadError,
  ValidationError as ImageValidationError,
} from './imageService'
export { ValidationError, SchemaValidationError } from './validationService'

// Type exports for service interfaces
export type { CafeService } from './cafeService'
export type { LocationService } from './locationService'
export type { ImageService } from './imageService'
export type { ValidationService } from './validationService'
export type { UserSessionService } from './userSessionService'
export type { PreferencesService } from './preferencesService'
export type { VisitHistoryService } from './visitHistoryService'
export type { ContributionTrackingService } from './contributionTrackingService'
export type { NetworkService } from './networkService'
export type { StorageService } from './storageService'
