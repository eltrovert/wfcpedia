import type {
  ContributionStats,
  ContributionBadge,
  ContributionBadges,
} from '../types/user'
import { cacheService } from './cacheService'
import { userSessionService } from './userSessionService'

/**
 * Contribution tracking error classes
 */
export class ContributionError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ContributionError'
  }
}

export class ContributionValidationError extends ContributionError {
  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', { field })
  }
}

export class ContributionStorageError extends ContributionError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'STORAGE_ERROR', originalError)
  }
}

/**
 * Contribution event types
 */
export type ContributionEventType =
  | 'cafe_added'
  | 'rating_given'
  | 'photo_uploaded'
  | 'love_given'
  | 'comment_posted'

/**
 * Contribution event interface
 */
export interface ContributionEvent {
  eventId: string
  type: ContributionEventType
  timestamp: string
  points: number
  cafeId?: string
  details?: Record<string, unknown>
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  sessionId: string
  totalPoints: number
  level: ContributionStats['level']
  badges: number
  rank: number
  streakDays: number
}

/**
 * Service for community engagement metrics and gamification
 * Tracks contributions, awards badges, and provides community analytics
 */
export class ContributionTrackingService {
  private readonly CONTRIBUTION_STATS_CACHE_KEY = 'contribution-stats'
  private readonly CONTRIBUTION_EVENTS_CACHE_KEY = 'contribution-events'
  private readonly GLOBAL_LEADERBOARD_CACHE_KEY = 'global-leaderboard'
  private readonly MAX_EVENTS_HISTORY = 500

  // Performance optimization: memoization cache
  private readonly memoCache = new Map<
    string,
    { data: unknown; timestamp: number }
  >()
  private readonly MEMO_TTL = 30 * 1000 // 30 seconds

  // Point values for different contribution types
  private readonly POINT_VALUES: Record<ContributionEventType, number> = {
    cafe_added: 50,
    rating_given: 10,
    photo_uploaded: 15,
    love_given: 2,
    comment_posted: 5,
  }

  // Level thresholds
  private readonly LEVEL_THRESHOLDS = {
    newcomer: 0,
    regular: 100,
    enthusiast: 500,
    expert: 1500,
    legend: 5000,
  }

  /**
   * Record a contribution event
   */
  async recordContribution(
    type: ContributionEventType,
    cafeId?: string,
    details?: Record<string, unknown>
  ): Promise<ContributionEvent> {
    try {
      await userSessionService.getCurrentSessionId()

      const event: ContributionEvent = {
        eventId: crypto.randomUUID(),
        type,
        timestamp: new Date().toISOString(),
        points: this.POINT_VALUES[type],
        cafeId,
        details,
      }

      // Store the event
      await this.storeContributionEvent(event)

      // Update contribution stats
      await this.updateContributionStats(type, event.points)

      // Check for new badges
      await this.checkAndAwardBadges()

      // Update session contribution stats
      await this.updateSessionContributionStats()

      console.warn('Contribution recorded:', type, event.points, 'points')
      return event
    } catch (error) {
      console.error('Failed to record contribution:', error)
      throw new ContributionStorageError('Failed to record contribution', error)
    }
  }

  /**
   * Get current contribution statistics
   */
  async getContributionStats(): Promise<ContributionStats> {
    try {
      // Try to get from user session first
      const session = await userSessionService.getCurrentSession()
      return session.contributionStats
    } catch (error) {
      console.warn('Failed to get contribution stats from session:', error)

      // Fallback to cache
      const cached = await cacheService.get<ContributionStats>(
        this.CONTRIBUTION_STATS_CACHE_KEY
      )
      if (cached) {
        return cached
      }

      // Return empty stats
      return this.getEmptyContributionStats()
    }
  }

  /**
   * Get contribution event history
   */
  async getContributionHistory(): Promise<ContributionEvent[]> {
    try {
      const events = await cacheService.get<ContributionEvent[]>(
        this.CONTRIBUTION_EVENTS_CACHE_KEY
      )
      return events || []
    } catch (error) {
      console.warn('Failed to get contribution history:', error)
      return []
    }
  }

  /**
   * Get contribution stats by type with memoization
   */
  async getContributionsByType(): Promise<
    Record<ContributionEventType, number>
  > {
    return this.memoize('contributionsByType', async () => {
      const events = await this.getContributionHistory()
      const byType: Record<ContributionEventType, number> = {
        cafe_added: 0,
        rating_given: 0,
        photo_uploaded: 0,
        love_given: 0,
        comment_posted: 0,
      }

      for (const event of events) {
        byType[event.type]++
      }

      return byType
    })
  }

  /**
   * Memoization helper for expensive operations
   */
  private async memoize<T>(key: string, factory: () => Promise<T>): Promise<T> {
    const cached = this.memoCache.get(key)
    const now = Date.now()

    if (cached && now - cached.timestamp < this.MEMO_TTL) {
      return cached.data as T
    }

    const data = await factory()
    this.memoCache.set(key, { data, timestamp: now })

    // Cleanup old entries
    if (this.memoCache.size > 50) {
      const entries = Array.from(this.memoCache.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      entries.slice(0, 10).forEach(([k]) => this.memoCache.delete(k))
    }

    return data
  }

  /**
   * Get available badges that can be earned
   */
  getAvailableBadges(): Array<Omit<ContributionBadge, 'earnedAt'>> {
    return Object.values(ContributionBadges)
  }

  /**
   * Get earned badges
   */
  async getEarnedBadges(): Promise<ContributionBadge[]> {
    const stats = await this.getContributionStats()
    return stats.badges
  }

  /**
   * Get progress towards next level
   */
  async getLevelProgress(): Promise<{
    currentLevel: ContributionStats['level']
    currentPoints: number
    nextLevel: ContributionStats['level'] | null
    pointsToNext: number
    progressPercentage: number
  }> {
    const stats = await this.getContributionStats()
    const levels = Object.entries(this.LEVEL_THRESHOLDS) as Array<
      [ContributionStats['level'], number]
    >

    // Find current level index
    const currentLevelIndex = levels.findIndex(
      ([level]) => level === stats.level
    )
    const nextLevelIndex = currentLevelIndex + 1

    if (nextLevelIndex >= levels.length) {
      // Already at max level
      return {
        currentLevel: stats.level,
        currentPoints: stats.totalPoints,
        nextLevel: null,
        pointsToNext: 0,
        progressPercentage: 100,
      }
    }

    const [currentLevel, currentThreshold] = levels[currentLevelIndex]
    const [nextLevel, nextThreshold] = levels[nextLevelIndex]

    const pointsToNext = nextThreshold - stats.totalPoints
    const progressRange = nextThreshold - currentThreshold
    const currentProgress = stats.totalPoints - currentThreshold
    const progressPercentage = Math.min(
      100,
      (currentProgress / progressRange) * 100
    )

    return {
      currentLevel,
      currentPoints: stats.totalPoints,
      nextLevel,
      pointsToNext,
      progressPercentage: Math.round(progressPercentage),
    }
  }

  /**
   * Get streak information
   */
  async getStreakInfo(): Promise<{
    currentStreak: number
    longestStreak: number
    lastContribution?: string
    streakBreaksIn?: number // days until streak breaks
  }> {
    const stats = await this.getContributionStats()
    const events = await this.getContributionHistory()

    if (events.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
      }
    }

    // Calculate longest streak from events
    const longestStreak = this.calculateLongestStreak(events)

    // Calculate days until streak breaks (streak breaks if no contribution for 24+ hours)
    let streakBreaksIn: number | undefined
    if (stats.lastContribution) {
      const lastContrib = new Date(stats.lastContribution)
      const now = new Date()
      const hoursSinceLastContrib =
        (now.getTime() - lastContrib.getTime()) / (1000 * 60 * 60)

      if (hoursSinceLastContrib < 24) {
        streakBreaksIn = Math.ceil((24 - hoursSinceLastContrib) / 24)
      }
    }

    return {
      currentStreak: stats.streakDays,
      longestStreak,
      lastContribution: stats.lastContribution,
      streakBreaksIn,
    }
  }

  /**
   * Get leaderboard (anonymous)
   */
  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      const leaderboard = await cacheService.get<LeaderboardEntry[]>(
        this.GLOBAL_LEADERBOARD_CACHE_KEY
      )
      return (leaderboard || []).slice(0, limit)
    } catch (error) {
      console.warn('Failed to get leaderboard:', error)
      return []
    }
  }

  /**
   * Get user's rank on leaderboard
   */
  async getUserRank(): Promise<number | null> {
    try {
      const sessionId = await userSessionService.getCurrentSessionId()
      const leaderboard = await this.getLeaderboard(1000) // Get more entries for rank calculation

      const userEntry = leaderboard.find(entry => entry.sessionId === sessionId)
      return userEntry?.rank || null
    } catch (error) {
      console.warn('Failed to get user rank:', error)
      return null
    }
  }

  /**
   * Export contribution data
   */
  async exportContributionData(): Promise<{
    stats: ContributionStats
    events: ContributionEvent[]
    exportedAt: string
    version: string
  }> {
    const stats = await this.getContributionStats()
    const events = await this.getContributionHistory()

    return {
      stats,
      events,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    }
  }

  /**
   * Import contribution data
   */
  async importContributionData(data: {
    stats: ContributionStats
    events: ContributionEvent[]
    exportedAt: string
    version: string
  }): Promise<void> {
    try {
      // Validate imported data
      this.validateContributionStats(data.stats)

      // Store imported data
      await cacheService.set(this.CONTRIBUTION_STATS_CACHE_KEY, data.stats)
      await cacheService.set(this.CONTRIBUTION_EVENTS_CACHE_KEY, data.events)

      // Update session
      await this.updateSessionContributionStats()

      console.warn('Contribution data imported successfully')
    } catch (error) {
      console.error('Failed to import contribution data:', error)
      throw new ContributionError(
        'Failed to import contribution data',
        'IMPORT_ERROR',
        error
      )
    }
  }

  /**
   * Store contribution event
   */
  private async storeContributionEvent(
    event: ContributionEvent
  ): Promise<void> {
    try {
      const events = await this.getContributionHistory()
      const updatedEvents = [event, ...events].slice(0, this.MAX_EVENTS_HISTORY)

      await cacheService.set(this.CONTRIBUTION_EVENTS_CACHE_KEY, updatedEvents)
    } catch (error) {
      throw new ContributionStorageError(
        'Failed to store contribution event',
        error
      )
    }
  }

  /**
   * Update contribution statistics
   */
  private async updateContributionStats(
    type: ContributionEventType,
    points: number
  ): Promise<void> {
    try {
      const stats = await this.getContributionStats()

      // Update specific counters
      switch (type) {
        case 'cafe_added':
          stats.cafesAdded++
          break
        case 'rating_given':
          stats.ratingsGiven++
          break
        case 'photo_uploaded':
          stats.photosUploaded++
          break
        case 'love_given':
          stats.lovesGiven++
          break
        case 'comment_posted':
          stats.commentsPosted++
          break
      }

      // Update points and level
      stats.totalPoints += points
      stats.level = this.calculateLevel(stats.totalPoints)
      stats.lastContribution = new Date().toISOString()

      // Update streak
      stats.streakDays = await this.calculateCurrentStreak()

      // Store updated stats
      await cacheService.set(this.CONTRIBUTION_STATS_CACHE_KEY, stats)
    } catch (error) {
      throw new ContributionStorageError(
        'Failed to update contribution stats',
        error
      )
    }
  }

  /**
   * Check and award new badges based on current stats
   */
  private async checkAndAwardBadges(): Promise<void> {
    try {
      const stats = await this.getContributionStats()
      const events = await this.getContributionHistory()
      const newBadges: ContributionBadge[] = []

      // Check each badge condition
      for (const badgeTemplate of Object.values(ContributionBadges)) {
        // Skip if already earned
        if (stats.badges.some(badge => badge.id === badgeTemplate.id)) {
          continue
        }

        let shouldAward = false

        switch (badgeTemplate.id) {
          case 'first-cafe':
            shouldAward = stats.cafesAdded >= 1
            break
          case 'first-rating':
            shouldAward = stats.ratingsGiven >= 1
            break
          case 'photo-enthusiast':
            shouldAward = stats.photosUploaded >= 10
            break
          case 'social-butterfly':
            shouldAward = stats.lovesGiven >= 50
            break
          case 'quality-curator':
            // Check if all contributions are high quality (simplified)
            shouldAward = stats.totalPoints > 200 && events.length > 10
            break
          case 'streak-master':
            shouldAward = stats.streakDays >= 7
            break
          case 'city-explorer':
            // This would require checking visits to different cities
            // For now, skip this badge
            break
        }

        if (shouldAward) {
          newBadges.push({
            ...badgeTemplate,
            earnedAt: new Date().toISOString(),
          })
        }
      }

      // Award new badges
      if (newBadges.length > 0) {
        stats.badges.push(...newBadges)
        await cacheService.set(this.CONTRIBUTION_STATS_CACHE_KEY, stats)

        console.warn(
          'New badges awarded:',
          newBadges.map(b => b.name)
        )
      }
    } catch (error) {
      console.warn('Failed to check and award badges:', error)
    }
  }

  /**
   * Update session contribution stats
   */
  private async updateSessionContributionStats(): Promise<void> {
    try {
      const stats = await this.getContributionStats()
      const session = await userSessionService.getCurrentSession()
      session.contributionStats = stats
      // Note: In practice, you'd call a proper session update method
    } catch (error) {
      console.warn('Failed to update session contribution stats:', error)
    }
  }

  /**
   * Calculate level based on total points
   */
  private calculateLevel(totalPoints: number): ContributionStats['level'] {
    const levels = Object.entries(this.LEVEL_THRESHOLDS) as Array<
      [ContributionStats['level'], number]
    >

    for (let i = levels.length - 1; i >= 0; i--) {
      const [level, threshold] = levels[i]
      if (totalPoints >= threshold) {
        return level
      }
    }

    return 'newcomer'
  }

  /**
   * Calculate current contribution streak
   */
  private async calculateCurrentStreak(): Promise<number> {
    const events = await this.getContributionHistory()

    if (events.length === 0) return 0

    // Group events by day
    const eventsByDay = new Map<string, ContributionEvent[]>()
    for (const event of events) {
      const day = event.timestamp.split('T')[0]
      if (!eventsByDay.has(day)) {
        eventsByDay.set(day, [])
      }
      const dayEvents = eventsByDay.get(day)
      if (dayEvents) {
        dayEvents.push(event)
      }
    }

    // Calculate streak from most recent day backwards
    const sortedDays = Array.from(eventsByDay.keys()).sort().reverse()
    let streak = 0
    let expectedDate = new Date()

    for (const day of sortedDays) {
      const dayDate = new Date(day)
      const daysDiff = Math.floor(
        (expectedDate.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysDiff === streak || (streak === 0 && daysDiff <= 1)) {
        streak++
        expectedDate = dayDate
      } else {
        break
      }
    }

    return streak
  }

  /**
   * Calculate longest streak from events
   */
  private calculateLongestStreak(events: ContributionEvent[]): number {
    if (events.length === 0) return 0

    // Group events by day
    const eventDays = new Set(
      events.map(event => event.timestamp.split('T')[0])
    )
    const sortedDays = Array.from(eventDays).sort()

    let longestStreak = 1
    let currentStreak = 1

    for (let i = 1; i < sortedDays.length; i++) {
      const prevDay = new Date(sortedDays[i - 1])
      const currDay = new Date(sortedDays[i])
      const daysDiff = Math.floor(
        (currDay.getTime() - prevDay.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysDiff === 1) {
        currentStreak++
        longestStreak = Math.max(longestStreak, currentStreak)
      } else {
        currentStreak = 1
      }
    }

    return longestStreak
  }

  /**
   * Validate contribution stats
   */
  private validateContributionStats(stats: ContributionStats): void {
    if (typeof stats.cafesAdded !== 'number' || stats.cafesAdded < 0) {
      throw new ContributionValidationError('Invalid cafesAdded value')
    }

    if (typeof stats.ratingsGiven !== 'number' || stats.ratingsGiven < 0) {
      throw new ContributionValidationError('Invalid ratingsGiven value')
    }

    if (typeof stats.totalPoints !== 'number' || stats.totalPoints < 0) {
      throw new ContributionValidationError('Invalid totalPoints value')
    }

    if (!Array.isArray(stats.badges)) {
      throw new ContributionValidationError('Badges must be an array')
    }
  }

  /**
   * Get empty contribution stats
   */
  private getEmptyContributionStats(): ContributionStats {
    return {
      cafesAdded: 0,
      ratingsGiven: 0,
      photosUploaded: 0,
      lovesGiven: 0,
      commentsPosted: 0,
      streakDays: 0,
      totalPoints: 0,
      badges: [],
      level: 'newcomer',
    }
  }
}

// Singleton instance for the application
export const contributionTrackingService = new ContributionTrackingService()
