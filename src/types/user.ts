/**
 * User session interface for anonymous tracking
 */
export interface UserSession {
  sessionId: string // UUID
  createdAt: string // ISO date
  lastActiveAt: string // ISO date
  preferences: UserPreferences
  visitHistory: VisitHistoryEntry[]
  contributionStats: ContributionStats
  location?: {
    city?: string
    coordinates?: { latitude: number; longitude: number }
    lastUpdated: string
  }
}

/**
 * User preferences for app settings and filters
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: 'en' | 'id'
  defaultFilters: {
    city?: string
    wifiSpeed?: 'slow' | 'medium' | 'fast' | 'fiber'
    minComfortRating?: number
    noiseLevel?: 'quiet' | 'moderate' | 'lively'
    verificationStatus?: 'unverified' | 'verified' | 'premium'
  }
  notifications: {
    newCafesInArea: boolean
    communityUpdates: boolean
    weeklyDigest: boolean
  }
  privacy: {
    shareLocation: boolean
    trackVisits: boolean
    allowAnalytics: boolean
  }
  mapSettings: {
    defaultZoom: number
    showAllCafes: boolean
    clusterMarkers: boolean
  }
}

/**
 * Visit history entry for WFC Journal functionality
 */
export interface VisitHistoryEntry {
  visitId: string // UUID
  cafeId: string // Reference to Cafe
  visitedAt: string // ISO date
  duration?: number // Minutes spent at cafe
  workSessionType?: 'short' | 'medium' | 'long' | 'all-day'
  productivityRating?: number // 1-5 scale
  notes?: string // Personal notes about the visit
  photos?: string[] // Personal photo URLs
  mood?: 'productive' | 'relaxed' | 'social' | 'focused'
  companionType?: 'solo' | 'friend' | 'colleague' | 'team'
  weatherCondition?: 'sunny' | 'rainy' | 'cloudy' | 'windy'
  verified: boolean // Whether this visit was verified (e.g., by location)
}

/**
 * Contribution tracking for community engagement
 */
export interface ContributionStats {
  cafesAdded: number
  ratingsGiven: number
  photosUploaded: number
  lovesGiven: number
  commentsPosted: number
  lastContribution?: string // ISO date
  streakDays: number // Consecutive days with contributions
  totalPoints: number // Gamification points
  badges: ContributionBadge[]
  level: 'newcomer' | 'regular' | 'enthusiast' | 'expert' | 'legend'
}

/**
 * Contribution badges for gamification
 */
export interface ContributionBadge {
  id: string
  name: string
  description: string
  icon: string
  earnedAt: string // ISO date
  category: 'contributor' | 'explorer' | 'social' | 'quality' | 'consistency'
}

/**
 * User analytics and engagement metrics
 */
export interface UserAnalytics {
  sessionId: string
  totalSessions: number
  totalTimeSpent: number // Minutes
  averageSessionDuration: number // Minutes
  favoriteTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  mostVisitedCities: string[]
  preferredCafeTypes: string[]
  searchPatterns: {
    commonFilters: Record<string, number>
    averageSearchRadius: number
    mostSearchedTerms: string[]
  }
  engagementMetrics: {
    cafesViewed: number
    ratingsRead: number
    photosViewed: number
    directionsRequested: number
    sharesCompleted: number
  }
}

/**
 * Session storage keys for data persistence
 */
export const SessionStorageKeys = {
  USER_SESSION: 'wfc-user-session',
  PREFERENCES: 'wfc-user-preferences',
  VISIT_HISTORY: 'wfc-visit-history',
  CONTRIBUTION_STATS: 'wfc-contribution-stats',
  ANALYTICS: 'wfc-user-analytics',
} as const

/**
 * Default user preferences
 */
export const DefaultUserPreferences: UserPreferences = {
  theme: 'system',
  language: 'en',
  defaultFilters: {},
  notifications: {
    newCafesInArea: true,
    communityUpdates: false,
    weeklyDigest: true,
  },
  privacy: {
    shareLocation: true,
    trackVisits: true,
    allowAnalytics: true,
  },
  mapSettings: {
    defaultZoom: 13,
    showAllCafes: true,
    clusterMarkers: true,
  },
}

/**
 * Badge definitions for the contribution system
 */
export const ContributionBadges: Record<
  string,
  Omit<ContributionBadge, 'earnedAt'>
> = {
  FIRST_CAFE: {
    id: 'first-cafe',
    name: 'First Contributor',
    description: 'Added your first cafe to the community',
    icon: '🏪',
    category: 'contributor',
  },
  FIRST_RATING: {
    id: 'first-rating',
    name: 'First Reviewer',
    description: 'Gave your first rating to a cafe',
    icon: '⭐',
    category: 'contributor',
  },
  PHOTO_ENTHUSIAST: {
    id: 'photo-enthusiast',
    name: 'Photo Enthusiast',
    description: 'Uploaded 10 photos',
    icon: '📸',
    category: 'contributor',
  },
  CITY_EXPLORER: {
    id: 'city-explorer',
    name: 'City Explorer',
    description: 'Visited cafes in 5 different cities',
    icon: '🗺️',
    category: 'explorer',
  },
  SOCIAL_BUTTERFLY: {
    id: 'social-butterfly',
    name: 'Social Butterfly',
    description: 'Gave 50 loves to community cafes',
    icon: '💝',
    category: 'social',
  },
  QUALITY_CURATOR: {
    id: 'quality-curator',
    name: 'Quality Curator',
    description: 'All your contributions have high quality scores',
    icon: '💎',
    category: 'quality',
  },
  STREAK_MASTER: {
    id: 'streak-master',
    name: 'Streak Master',
    description: 'Contributed for 7 consecutive days',
    icon: '🔥',
    category: 'consistency',
  },
}
