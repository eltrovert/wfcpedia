# Data Models

## Core Entities

```typescript
// Café Entity - Primary data model
interface Cafe {
  id: string // UUID generated client-side
  name: string // Required, min 2 chars
  location: {
    address: string // Human-readable address
    coordinates: {
      lat: number // GPS coordinates
      lng: number
    }
    city: string // Indonesian city
    district?: string // Optional district
  }
  workMetrics: {
    wifiSpeed: 'slow' | 'medium' | 'fast' | 'fiber'
    comfortRating: 1 | 2 | 3 | 4 | 5
    noiseLevel: 'quiet' | 'moderate' | 'lively'
    amenities: Array<'24/7' | 'power' | 'ac' | 'lighting' | 'food'>
  }
  operatingHours: {
    [key in DayOfWeek]: {
      open: string // HH:MM format
      close: string // HH:MM format
      is24Hours: boolean
    }
  }
  images: Array<{
    url: string // Compressed image URL
    thumbnailUrl: string // Low-res version
    uploadedBy: string // Anonymous or user ID
    uploadedAt: Date
  }>
  community: {
    loveCount: number // Community validation
    lastUpdated: Date // Content freshness
    contributorId: string // Anonymous hash
    verificationStatus: 'pending' | 'verified' | 'flagged'
  }
  createdAt: Date
  updatedAt: Date
}

// User Session - Minimal tracking for privacy
interface UserSession {
  sessionId: string // Generated client-side
  preferences: {
    location: {
      lat: number
      lng: number
      city: string
    } | null
    filters: FilterPreferences
  }
  visitHistory: Array<{
    cafeId: string
    visitedAt: Date
    duration?: number // Optional check-in/out
    rating?: CafeRating
  }>
  contributions: {
    cafesAdded: number
    ratingsGiven: number
    photosUploaded: number
  }
}

// Community Interaction
interface CafeRating {
  cafeId: string
  sessionId: string // Anonymous
  workMetrics: {
    wifiSpeed?: 'slow' | 'medium' | 'fast' | 'fiber'
    comfortRating?: 1 | 2 | 3 | 4 | 5
    noiseLevel?: 'quiet' | 'moderate' | 'lively'
  }
  comment?: string // Max 280 chars
  photos?: Array<string> // Image URLs
  loveGiven: boolean
  ratedAt: Date
}
```

---
