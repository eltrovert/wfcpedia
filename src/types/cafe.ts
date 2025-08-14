export interface Location {
  latitude: number
  longitude: number
}

export interface WorkMetrics {
  wifiSpeed: 'slow' | 'medium' | 'fast' | 'fiber'
  powerOutlets: number
  noiseLevel: 'quiet' | 'moderate' | 'loud'
  comfortRating: number // 1-5
  crowdedness: 'low' | 'medium' | 'high'
  workFriendliness: number // 1-5
}

export interface OpeningHours {
  monday: { open: string; close: string } | null
  tuesday: { open: string; close: string } | null
  wednesday: { open: string; close: string } | null
  thursday: { open: string; close: string } | null
  friday: { open: string; close: string } | null
  saturday: { open: string; close: string } | null
  sunday: { open: string; close: string } | null
}

export interface Cafe {
  id: string
  name: string
  address: string
  city: string
  location: Location
  workMetrics: WorkMetrics
  amenities: string[]
  images: string[]
  openingHours: OpeningHours
  priceRange: 'budget' | 'moderate' | 'premium'
  rating: number
  reviewCount: number
  tags: string[]
  description: string
  createdAt: string
  updatedAt: string
}

export interface CafeFilter {
  city?: string
  wifiSpeed?: WorkMetrics['wifiSpeed']
  priceRange?: Cafe['priceRange']
  minRating?: number
  amenities?: string[]
  workFriendliness?: number
}

export interface CafeSearchParams {
  query?: string
  location?: Location
  radius?: number // in kilometers
  filters?: CafeFilter
}
