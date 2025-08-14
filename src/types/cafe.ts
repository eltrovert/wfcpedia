export interface Location {
  latitude: number
  longitude: number
  address: string
  city: string
  district?: string | undefined
}

export interface WorkMetrics {
  wifiSpeed: 'slow' | 'medium' | 'fast' | 'fiber'
  comfortRating: number // 1-5
  noiseLevel: 'quiet' | 'moderate' | 'lively'
  amenities: string[]
}

export interface OperatingHours {
  [day: string]: {
    open: string
    close: string
    is24Hours?: boolean
  } | null
}

export interface CafeImage {
  url: string
  thumbnailUrl: string
  uploadedBy: string
  uploadedAt: string
}

export interface Community {
  loveCount: number
  lastUpdated: string
  contributorId: string
  verificationStatus: 'unverified' | 'verified' | 'premium'
}

export interface Cafe {
  id: string // UUID
  name: string
  location: Location
  workMetrics: WorkMetrics
  operatingHours: OperatingHours
  images: CafeImage[]
  community: Community
  createdAt: string // ISO date
  updatedAt: string // ISO date
}

export interface CafeRating {
  ratingId: string // UUID
  cafeId: string // Reference to Cafe
  sessionId: string // Anonymous session identifier
  workMetrics?: Partial<WorkMetrics> | undefined // Optional partial updates
  comment?: string | undefined // Max 280 chars
  photos?: string[] | undefined // Array of photo URLs
  loveGiven: boolean
  ratedAt: string // ISO date
}

export interface FilterOptions {
  city?: string
  district?: string
  wifiSpeed?: WorkMetrics['wifiSpeed']
  minComfortRating?: number
  noiseLevel?: WorkMetrics['noiseLevel']
  amenities?: string[]
  verificationStatus?: Community['verificationStatus']
}

export interface CafeSearchParams {
  query?: string
  location?: Pick<Location, 'latitude' | 'longitude'>
  radius?: number // in kilometers
  filters?: FilterOptions
}
