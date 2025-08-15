import type { VisitHistoryEntry } from '../types/user'
import { cacheService } from './cacheService'
import { userSessionService } from './userSessionService'

/**
 * Visit history error classes
 */
export class VisitHistoryError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'VisitHistoryError'
  }
}

export class VisitValidationError extends VisitHistoryError {
  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', { field })
  }
}

export class VisitStorageError extends VisitHistoryError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'STORAGE_ERROR', originalError)
  }
}

/**
 * Visit analytics interface
 */
export interface VisitAnalytics {
  totalVisits: number
  totalTimeSpent: number // minutes
  averageVisitDuration: number
  favoriteTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  mostProductiveHour: number
  preferredWorkSessionType: string
  mostVisitedCafe?: string
  streakDays: number
  lastVisit?: string
  visitsByDay: Record<string, number>
  visitsByMonth: Record<string, number>
  productivityTrend: Array<{ date: string; rating: number }>
}

/**
 * Visit suggestions based on history
 */
export interface VisitSuggestion {
  cafeId: string
  reason: string
  confidence: number
  suggestedTime?: string
  expectedProductivity?: number
}

/**
 * Service for WFC Journal functionality - tracking cafe visits and work sessions
 * Provides analytics and insights about user's workspace habits
 */
export class VisitHistoryService {
  private readonly VISIT_HISTORY_CACHE_KEY = 'visit-history'
  private readonly VISIT_ANALYTICS_CACHE_KEY = 'visit-analytics'
  private readonly MAX_VISIT_HISTORY = 1000 // Keep last 1000 visits
  private readonly LOCATION_VERIFICATION_RADIUS = 100 // meters

  /**
   * Add a new visit to history
   */
  async addVisit(
    visit: Omit<VisitHistoryEntry, 'visitId'>
  ): Promise<VisitHistoryEntry> {
    try {
      // Validate visit data
      this.validateVisitData(visit)

      // Create full visit entry
      const fullVisit: VisitHistoryEntry = {
        visitId: crypto.randomUUID(),
        ...visit,
        visitedAt: visit.visitedAt || new Date().toISOString(),
        verified: false, // Will be verified separately
      }

      // Verify location if possible
      fullVisit.verified = await this.verifyVisitLocation(fullVisit)

      // Get current visit history
      const history = await this.getVisitHistory()

      // Add new visit and maintain limit
      const updatedHistory = [fullVisit, ...history].slice(
        0,
        this.MAX_VISIT_HISTORY
      )

      // Store updated history
      await this.storeVisitHistory(updatedHistory)

      // Update user session
      await this.updateSessionVisitHistory(updatedHistory)

      // Trigger analytics recalculation
      this.recalculateAnalytics().catch(console.warn)

      console.warn('Visit added successfully:', fullVisit.visitId)
      return fullVisit
    } catch (error) {
      console.error('Failed to add visit:', error)
      throw new VisitStorageError('Failed to add visit to history', error)
    }
  }

  /**
   * Get all visit history
   */
  async getVisitHistory(): Promise<VisitHistoryEntry[]> {
    try {
      // Try to get from user session first
      const session = await userSessionService.getCurrentSession()
      if (session.visitHistory && session.visitHistory.length > 0) {
        return session.visitHistory
      }

      // Fallback to cache
      const cached = await cacheService.get<VisitHistoryEntry[]>(
        this.VISIT_HISTORY_CACHE_KEY
      )
      return cached || []
    } catch (error) {
      console.warn('Failed to get visit history:', error)
      return []
    }
  }

  /**
   * Get visits for a specific cafe
   */
  async getVisitsForCafe(cafeId: string): Promise<VisitHistoryEntry[]> {
    const history = await this.getVisitHistory()
    return history
      .filter(visit => visit.cafeId === cafeId)
      .sort(
        (a, b) =>
          new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime()
      )
  }

  /**
   * Get recent visits (last N visits)
   */
  async getRecentVisits(limit: number = 10): Promise<VisitHistoryEntry[]> {
    const history = await this.getVisitHistory()
    return history.slice(0, limit)
  }

  /**
   * Get visits within date range
   */
  async getVisitsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<VisitHistoryEntry[]> {
    const history = await this.getVisitHistory()
    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime()

    return history.filter(visit => {
      const visitTime = new Date(visit.visitedAt).getTime()
      return visitTime >= start && visitTime <= end
    })
  }

  /**
   * Update an existing visit
   */
  async updateVisit(
    visitId: string,
    updates: Partial<VisitHistoryEntry>
  ): Promise<VisitHistoryEntry | null> {
    try {
      const history = await this.getVisitHistory()
      const visitIndex = history.findIndex(visit => visit.visitId === visitId)

      if (visitIndex === -1) {
        throw new VisitHistoryError('Visit not found', 'NOT_FOUND')
      }

      // Update visit
      const updatedVisit = {
        ...history[visitIndex],
        ...updates,
        visitId, // Ensure ID doesn't change
      }

      // Validate updated data
      this.validateVisitData(updatedVisit)

      // Update history
      history[visitIndex] = updatedVisit
      await this.storeVisitHistory(history)
      await this.updateSessionVisitHistory(history)

      // Trigger analytics recalculation
      this.recalculateAnalytics().catch(console.warn)

      return updatedVisit
    } catch (error) {
      console.error('Failed to update visit:', error)
      throw new VisitStorageError('Failed to update visit', error)
    }
  }

  /**
   * Delete a visit
   */
  async deleteVisit(visitId: string): Promise<boolean> {
    try {
      const history = await this.getVisitHistory()
      const filteredHistory = history.filter(visit => visit.visitId !== visitId)

      if (filteredHistory.length === history.length) {
        return false // Visit not found
      }

      await this.storeVisitHistory(filteredHistory)
      await this.updateSessionVisitHistory(filteredHistory)

      // Trigger analytics recalculation
      this.recalculateAnalytics().catch(console.warn)

      return true
    } catch (error) {
      console.error('Failed to delete visit:', error)
      throw new VisitStorageError('Failed to delete visit', error)
    }
  }

  /**
   * Start a visit session (for real-time tracking)
   */
  async startVisitSession(cafeId: string): Promise<string> {
    const sessionKey = `active-visit-${cafeId}`
    const startTime = new Date().toISOString()

    try {
      await cacheService.set(
        sessionKey,
        {
          cafeId,
          startTime,
          sessionId: crypto.randomUUID(),
        },
        24 * 60 * 60 * 1000
      ) // 24 hours TTL

      return sessionKey
    } catch (error) {
      throw new VisitStorageError('Failed to start visit session', error)
    }
  }

  /**
   * End a visit session and create visit entry
   */
  async endVisitSession(
    sessionKey: string,
    additionalData?: Partial<VisitHistoryEntry>
  ): Promise<VisitHistoryEntry | null> {
    try {
      const sessionData = await cacheService.get<{
        cafeId: string
        startTime: string
        sessionId: string
      }>(sessionKey)

      if (!sessionData) {
        return null
      }

      const endTime = new Date()
      const startTime = new Date(sessionData.startTime)
      const duration = Math.round(
        (endTime.getTime() - startTime.getTime()) / (1000 * 60)
      ) // minutes

      const visit: Omit<VisitHistoryEntry, 'visitId'> = {
        cafeId: sessionData.cafeId,
        visitedAt: sessionData.startTime,
        duration,
        verified: false,
        ...additionalData,
      }

      // Clean up session
      await cacheService.remove(sessionKey)

      // Add visit to history
      return this.addVisit(visit)
    } catch (error) {
      console.error('Failed to end visit session:', error)
      throw new VisitStorageError('Failed to end visit session', error)
    }
  }

  /**
   * Get visit analytics
   */
  async getVisitAnalytics(): Promise<VisitAnalytics> {
    try {
      // Try cached analytics first
      const cached = await cacheService.get<VisitAnalytics>(
        this.VISIT_ANALYTICS_CACHE_KEY
      )
      if (cached) {
        return cached
      }

      // Calculate fresh analytics
      return this.calculateAnalytics()
    } catch (error) {
      console.warn('Failed to get visit analytics:', error)
      return this.getEmptyAnalytics()
    }
  }

  /**
   * Get visit suggestions based on history and patterns
   */
  async getVisitSuggestions(limit: number = 5): Promise<VisitSuggestion[]> {
    try {
      const history = await this.getVisitHistory()
      const analytics = await this.getVisitAnalytics()

      if (history.length === 0) {
        return []
      }

      const suggestions: VisitSuggestion[] = []

      // Suggest most visited cafe
      if (analytics.mostVisitedCafe) {
        suggestions.push({
          cafeId: analytics.mostVisitedCafe,
          reason: 'Your most visited workspace',
          confidence: 0.9,
        })
      }

      // Suggest based on time patterns
      const currentHour = new Date().getHours()
      const productiveCafes = history
        .filter(visit => {
          const visitHour = new Date(visit.visitedAt).getHours()
          return (
            Math.abs(visitHour - currentHour) <= 2 &&
            visit.productivityRating &&
            visit.productivityRating >= 4
          )
        })
        .slice(0, 3)

      for (const visit of productiveCafes) {
        if (!suggestions.find(s => s.cafeId === visit.cafeId)) {
          suggestions.push({
            cafeId: visit.cafeId,
            reason: 'High productivity at this time',
            confidence: 0.7,
            expectedProductivity: visit.productivityRating,
          })
        }
      }

      // Suggest cafes not visited recently
      const recentCafeIds = new Set(
        history.slice(0, 10).map(visit => visit.cafeId)
      )

      const olderVisits = history
        .filter(visit => !recentCafeIds.has(visit.cafeId))
        .slice(0, 2)

      for (const visit of olderVisits) {
        if (!suggestions.find(s => s.cafeId === visit.cafeId)) {
          suggestions.push({
            cafeId: visit.cafeId,
            reason: "Haven't visited recently",
            confidence: 0.5,
          })
        }
      }

      return suggestions.slice(0, limit)
    } catch (error) {
      console.warn('Failed to get visit suggestions:', error)
      return []
    }
  }

  /**
   * Export visit history for backup
   */
  async exportVisitHistory(): Promise<{
    visits: VisitHistoryEntry[]
    analytics: VisitAnalytics
    exportedAt: string
    version: string
  }> {
    const visits = await this.getVisitHistory()
    const analytics = await this.getVisitAnalytics()

    return {
      visits,
      analytics,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    }
  }

  /**
   * Import visit history from backup
   */
  async importVisitHistory(data: {
    visits: VisitHistoryEntry[]
    analytics?: VisitAnalytics
    exportedAt: string
    version: string
  }): Promise<void> {
    try {
      // Validate imported visits
      for (const visit of data.visits) {
        this.validateVisitData(visit)
      }

      // Store imported history
      await this.storeVisitHistory(data.visits)
      await this.updateSessionVisitHistory(data.visits)

      // Recalculate analytics
      await this.recalculateAnalytics()

      console.warn('Visit history imported successfully')
    } catch (error) {
      console.error('Failed to import visit history:', error)
      throw new VisitHistoryError(
        'Failed to import visit history',
        'IMPORT_ERROR',
        error
      )
    }
  }

  /**
   * Clear all visit history
   */
  async clearVisitHistory(): Promise<void> {
    try {
      await cacheService.remove(this.VISIT_HISTORY_CACHE_KEY)
      await cacheService.remove(this.VISIT_ANALYTICS_CACHE_KEY)

      // Update session
      const session = await userSessionService.getCurrentSession()
      session.visitHistory = []
      await userSessionService.updatePreferences(session.preferences)

      console.warn('Visit history cleared')
    } catch (error) {
      console.error('Failed to clear visit history:', error)
      throw new VisitStorageError('Failed to clear visit history', error)
    }
  }

  /**
   * Validate visit data
   */
  private validateVisitData(visit: Partial<VisitHistoryEntry>): void {
    if (!visit.cafeId) {
      throw new VisitValidationError('Cafe ID is required', 'cafeId')
    }

    if (!visit.visitedAt) {
      throw new VisitValidationError('Visit date is required', 'visitedAt')
    }

    if (
      visit.duration !== undefined &&
      (visit.duration < 0 || visit.duration > 24 * 60)
    ) {
      throw new VisitValidationError(
        'Duration must be between 0 and 1440 minutes',
        'duration'
      )
    }

    if (
      visit.productivityRating !== undefined &&
      (visit.productivityRating < 1 || visit.productivityRating > 5)
    ) {
      throw new VisitValidationError(
        'Productivity rating must be between 1 and 5',
        'productivityRating'
      )
    }

    if (visit.notes && visit.notes.length > 1000) {
      throw new VisitValidationError(
        'Notes must be less than 1000 characters',
        'notes'
      )
    }
  }

  /**
   * Verify visit location against cafe location
   */
  private async verifyVisitLocation(
    _visit: VisitHistoryEntry
  ): Promise<boolean> {
    try {
      // This would typically verify against GPS location
      // For now, we'll return true for all visits
      // In a real implementation, you'd:
      // 1. Get current GPS coordinates
      // 2. Compare with cafe coordinates
      // 3. Return true if within verification radius
      return true
    } catch (error) {
      console.warn('Failed to verify visit location:', error)
      return false
    }
  }

  /**
   * Store visit history in cache
   */
  private async storeVisitHistory(history: VisitHistoryEntry[]): Promise<void> {
    try {
      await cacheService.set(this.VISIT_HISTORY_CACHE_KEY, history)
    } catch (error) {
      throw new VisitStorageError('Failed to store visit history', error)
    }
  }

  /**
   * Update session with visit history
   */
  private async updateSessionVisitHistory(
    history: VisitHistoryEntry[]
  ): Promise<void> {
    try {
      const session = await userSessionService.getCurrentSession()
      session.visitHistory = history
      // Note: This is a simplified update - in practice you'd call a proper session update method
    } catch (error) {
      console.warn('Failed to update session visit history:', error)
    }
  }

  /**
   * Calculate analytics from visit history
   */
  private async calculateAnalytics(): Promise<VisitAnalytics> {
    const history = await this.getVisitHistory()

    if (history.length === 0) {
      return this.getEmptyAnalytics()
    }

    const analytics: VisitAnalytics = {
      totalVisits: history.length,
      totalTimeSpent: history.reduce(
        (sum, visit) => sum + (visit.duration || 0),
        0
      ),
      averageVisitDuration: 0,
      favoriteTimeOfDay: 'morning',
      mostProductiveHour: 9,
      preferredWorkSessionType: 'medium',
      streakDays: 0,
      visitsByDay: {},
      visitsByMonth: {},
      productivityTrend: [],
    }

    // Calculate averages
    analytics.averageVisitDuration =
      analytics.totalTimeSpent / analytics.totalVisits

    // Analyze time patterns
    const hourCounts: Record<number, number> = {}
    const timeOfDayCounts = { morning: 0, afternoon: 0, evening: 0, night: 0 }
    const sessionTypeCounts: Record<string, number> = {}

    for (const visit of history) {
      const date = new Date(visit.visitedAt)
      const hour = date.getHours()

      // Hour analysis
      hourCounts[hour] = (hourCounts[hour] || 0) + 1

      // Time of day analysis
      if (hour >= 6 && hour < 12) timeOfDayCounts.morning++
      else if (hour >= 12 && hour < 18) timeOfDayCounts.afternoon++
      else if (hour >= 18 && hour < 22) timeOfDayCounts.evening++
      else timeOfDayCounts.night++

      // Session type analysis
      if (visit.workSessionType) {
        sessionTypeCounts[visit.workSessionType] =
          (sessionTypeCounts[visit.workSessionType] || 0) + 1
      }

      // Visits by day/month
      const dayKey = date.toISOString().split('T')[0]
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      analytics.visitsByDay[dayKey] = (analytics.visitsByDay[dayKey] || 0) + 1
      analytics.visitsByMonth[monthKey] =
        (analytics.visitsByMonth[monthKey] || 0) + 1

      // Productivity trend
      if (visit.productivityRating) {
        analytics.productivityTrend.push({
          date: dayKey,
          rating: visit.productivityRating,
        })
      }
    }

    // Find favorites
    analytics.mostProductiveHour = parseInt(
      Object.entries(hourCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || '9'
    )

    analytics.favoriteTimeOfDay =
      (Object.entries(timeOfDayCounts).sort(
        ([, a], [, b]) => b - a
      )[0]?.[0] as string) || 'morning'

    analytics.preferredWorkSessionType =
      Object.entries(sessionTypeCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      'medium'

    // Find most visited cafe
    const cafeCounts: Record<string, number> = {}
    for (const visit of history) {
      cafeCounts[visit.cafeId] = (cafeCounts[visit.cafeId] || 0) + 1
    }
    analytics.mostVisitedCafe = Object.entries(cafeCounts).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0]

    // Calculate streak
    analytics.streakDays = this.calculateStreakDays(history)

    // Cache the calculated analytics
    await cacheService.set(
      this.VISIT_ANALYTICS_CACHE_KEY,
      analytics,
      60 * 60 * 1000
    ) // 1 hour TTL

    return analytics
  }

  /**
   * Recalculate and cache analytics
   */
  private async recalculateAnalytics(): Promise<void> {
    try {
      await this.calculateAnalytics()
    } catch (error) {
      console.warn('Failed to recalculate analytics:', error)
    }
  }

  /**
   * Calculate consecutive days with visits
   */
  private calculateStreakDays(history: VisitHistoryEntry[]): number {
    if (history.length === 0) return 0

    const visitDates = new Set(
      history.map(
        visit => new Date(visit.visitedAt).toISOString().split('T')[0]
      )
    )

    const sortedDates = Array.from(visitDates).sort().reverse()
    let streak = 0
    let currentDate = new Date()

    for (let i = 0; i < sortedDates.length; i++) {
      const visitDate = new Date(sortedDates[i])
      const daysDiff = Math.floor(
        (currentDate.getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysDiff === streak || (streak === 0 && daysDiff <= 1)) {
        streak++
        currentDate = visitDate
      } else {
        break
      }
    }

    return streak
  }

  /**
   * Get empty analytics object
   */
  private getEmptyAnalytics(): VisitAnalytics {
    return {
      totalVisits: 0,
      totalTimeSpent: 0,
      averageVisitDuration: 0,
      favoriteTimeOfDay: 'morning',
      mostProductiveHour: 9,
      preferredWorkSessionType: 'medium',
      streakDays: 0,
      visitsByDay: {},
      visitsByMonth: {},
      productivityTrend: [],
    }
  }
}

// Singleton instance for the application
export const visitHistoryService = new VisitHistoryService()
