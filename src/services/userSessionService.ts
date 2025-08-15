import type {
  UserSession,
  UserPreferences,
  DefaultUserPreferences,
} from '../types/user'
import { cacheService } from './cacheService'

/**
 * User session error classes
 */
export class UserSessionError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'UserSessionError'
  }
}

export class SessionStorageError extends UserSessionError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'STORAGE_ERROR', originalError)
  }
}

export class SessionValidationError extends UserSessionError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR')
  }
}

/**
 * Service for anonymous user session management with UUID generation
 * Handles user tracking, preferences, and session persistence
 */
export class UserSessionService {
  private currentSession: UserSession | null = null
  private readonly SESSION_STORE = 'user_sessions'
  private readonly SESSION_STORAGE_KEY = 'wfc-current-session-id'
  private readonly SESSION_TIMEOUT = 30 * 24 * 60 * 60 * 1000 // 30 days

  constructor() {
    this.initializeSession()
  }

  /**
   * Initialize or restore user session
   */
  private async initializeSession(): Promise<void> {
    try {
      // Try to restore existing session
      const existingSessionId = this.getStoredSessionId()

      if (existingSessionId) {
        const restoredSession = await this.restoreSession(existingSessionId)
        if (restoredSession && this.isSessionValid(restoredSession)) {
          this.currentSession = restoredSession
          await this.updateLastActiveTime()
          return
        }
      }

      // Create new session if no valid existing session
      await this.createNewSession()
    } catch (error) {
      console.error('Failed to initialize user session:', error)
      // Fallback to new session creation
      await this.createNewSession()
    }
  }

  /**
   * Create a new anonymous user session
   */
  async createNewSession(
    preferences?: Partial<UserPreferences>
  ): Promise<UserSession> {
    try {
      const sessionId = crypto.randomUUID()
      const now = new Date().toISOString()

      // Get user's approximate location if permission granted
      let location: UserSession['location'] | undefined
      try {
        // Dynamically import to avoid circular dependency
        const { locationService } = await import('./locationService')
        const currentLocation = await locationService.getCurrentLocation()
        location = {
          city: currentLocation.city,
          coordinates: {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
          },
          lastUpdated: now,
        }
      } catch {
        // Location access denied or failed - continue without location
      }

      const session: UserSession = {
        sessionId,
        createdAt: now,
        lastActiveAt: now,
        preferences: {
          ...DefaultUserPreferences,
          ...preferences,
        },
        visitHistory: [],
        contributionStats: {
          cafesAdded: 0,
          ratingsGiven: 0,
          photosUploaded: 0,
          lovesGiven: 0,
          commentsPosted: 0,
          streakDays: 0,
          totalPoints: 0,
          badges: [],
          level: 'newcomer',
        },
        location,
      }

      // Store session
      await this.storeSession(session)
      this.currentSession = session
      this.storeSessionId(sessionId)

      // Increment session count
      await this.incrementSessionCount()

      console.warn('New user session created:', sessionId)
      return session
    } catch (error) {
      console.error('Failed to create new session:', error)
      throw new UserSessionError(
        'Failed to create user session',
        'CREATION_ERROR',
        error
      )
    }
  }

  /**
   * Get current user session
   */
  async getCurrentSession(): Promise<UserSession> {
    if (!this.currentSession) {
      await this.initializeSession()
    }

    if (!this.currentSession) {
      throw new UserSessionError('No active session found', 'NO_SESSION')
    }

    return this.currentSession
  }

  /**
   * Get current session ID
   */
  async getCurrentSessionId(): Promise<string> {
    const session = await this.getCurrentSession()
    return session.sessionId
  }

  /**
   * Update user preferences
   */
  async updatePreferences(
    preferences: Partial<UserPreferences>
  ): Promise<void> {
    const session = await this.getCurrentSession()

    session.preferences = {
      ...session.preferences,
      ...preferences,
    }

    await this.updateSession(session)
  }

  /**
   * Get user preferences
   */
  async getPreferences(): Promise<UserPreferences> {
    const session = await this.getCurrentSession()
    return session.preferences
  }

  /**
   * Update user location
   */
  async updateLocation(): Promise<void> {
    try {
      const session = await this.getCurrentSession()
      // Dynamically import to avoid circular dependency
      const { locationService } = await import('./locationService')
      const currentLocation = await locationService.getCurrentLocation()

      session.location = {
        city: currentLocation.city,
        coordinates: {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        },
        lastUpdated: new Date().toISOString(),
      }

      await this.updateSession(session)
    } catch (error) {
      console.warn('Failed to update user location:', error)
      // Don't throw error - location update is optional
    }
  }

  /**
   * Get user location
   */
  async getUserLocation(): Promise<UserSession['location'] | null> {
    const session = await this.getCurrentSession()
    return session.location || null
  }

  /**
   * Check if user has granted location permission
   */
  async hasLocationPermission(): Promise<boolean> {
    const session = await this.getCurrentSession()
    return !!(session.location && session.preferences.privacy.shareLocation)
  }

  /**
   * Update last active time
   */
  async updateLastActiveTime(): Promise<void> {
    if (this.currentSession) {
      this.currentSession.lastActiveAt = new Date().toISOString()
      await this.updateSession(this.currentSession)
    }
  }

  /**
   * Reset session (create new one)
   */
  async resetSession(): Promise<UserSession> {
    if (this.currentSession) {
      // Clear old session data
      await this.removeSession(this.currentSession.sessionId)
    }

    this.currentSession = null
    this.clearStoredSessionId()

    return this.createNewSession()
  }

  /**
   * Clear all session data
   */
  async clearAllData(): Promise<void> {
    if (this.currentSession) {
      await this.removeSession(this.currentSession.sessionId)
    }

    this.currentSession = null
    this.clearStoredSessionId()

    // Clear from cache as well
    await cacheService.remove(this.SESSION_STORAGE_KEY)
  }

  /**
   * Get session statistics
   */
  async getSessionStats(): Promise<{
    sessionAge: number // Days since creation
    totalSessions: number
    lastActiveAgo: number // Minutes since last activity
    hasLocation: boolean
  }> {
    const session = await this.getCurrentSession()
    const now = Date.now()
    const createdAt = new Date(session.createdAt).getTime()
    const lastActiveAt = new Date(session.lastActiveAt).getTime()

    return {
      sessionAge: Math.floor((now - createdAt) / (1000 * 60 * 60 * 24)),
      totalSessions: await this.getTotalSessionCount(),
      lastActiveAgo: Math.floor((now - lastActiveAt) / (1000 * 60)),
      hasLocation: !!session.location,
    }
  }

  /**
   * Export session data for backup/migration
   */
  async exportSessionData(): Promise<{
    session: UserSession
    exportedAt: string
    version: string
  }> {
    const session = await this.getCurrentSession()

    return {
      session,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    }
  }

  /**
   * Import session data from backup
   */
  async importSessionData(data: {
    session: UserSession
    exportedAt: string
    version: string
  }): Promise<void> {
    try {
      // Validate imported session
      if (!this.isValidSessionData(data.session)) {
        throw new SessionValidationError('Invalid session data format')
      }

      // Clear current session
      await this.clearAllData()

      // Import the session
      const importedSession = {
        ...data.session,
        lastActiveAt: new Date().toISOString(), // Update last active time
      }

      await this.storeSession(importedSession)
      this.currentSession = importedSession
      this.storeSessionId(importedSession.sessionId)

      console.warn('Session data imported successfully')
    } catch (error) {
      console.error('Failed to import session data:', error)
      throw new UserSessionError(
        'Failed to import session data',
        'IMPORT_ERROR',
        error
      )
    }
  }

  /**
   * Store session in IndexedDB
   */
  private async storeSession(session: UserSession): Promise<void> {
    try {
      await cacheService.set(
        `${this.SESSION_STORE}-${session.sessionId}`,
        session,
        this.SESSION_TIMEOUT
      )
    } catch (error) {
      throw new SessionStorageError('Failed to store session', error)
    }
  }

  /**
   * Restore session from IndexedDB
   */
  private async restoreSession(sessionId: string): Promise<UserSession | null> {
    try {
      const session = await cacheService.get<UserSession>(
        `${this.SESSION_STORE}-${sessionId}`
      )
      return session
    } catch (error) {
      console.warn('Failed to restore session:', error)
      return null
    }
  }

  /**
   * Update existing session
   */
  private async updateSession(session: UserSession): Promise<void> {
    try {
      session.lastActiveAt = new Date().toISOString()
      await this.storeSession(session)
      this.currentSession = session
    } catch (error) {
      throw new SessionStorageError('Failed to update session', error)
    }
  }

  /**
   * Remove session from storage
   */
  private async removeSession(sessionId: string): Promise<void> {
    try {
      await cacheService.remove(`${this.SESSION_STORE}-${sessionId}`)
    } catch (error) {
      console.warn('Failed to remove session:', error)
    }
  }

  /**
   * Store session ID in localStorage
   */
  private storeSessionId(sessionId: string): void {
    try {
      localStorage.setItem(this.SESSION_STORAGE_KEY, sessionId)
    } catch (error) {
      console.warn('Failed to store session ID in localStorage:', error)
    }
  }

  /**
   * Get stored session ID from localStorage
   */
  private getStoredSessionId(): string | null {
    try {
      return localStorage.getItem(this.SESSION_STORAGE_KEY)
    } catch (error) {
      console.warn('Failed to get session ID from localStorage:', error)
      return null
    }
  }

  /**
   * Clear stored session ID
   */
  private clearStoredSessionId(): void {
    try {
      localStorage.removeItem(this.SESSION_STORAGE_KEY)
    } catch (error) {
      console.warn('Failed to clear session ID from localStorage:', error)
    }
  }

  /**
   * Check if session is still valid (not expired)
   */
  private isSessionValid(session: UserSession): boolean {
    const now = Date.now()
    const lastActive = new Date(session.lastActiveAt).getTime()
    return now - lastActive < this.SESSION_TIMEOUT
  }

  /**
   * Validate session data structure
   */
  private isValidSessionData(session: unknown): session is UserSession {
    return !!(
      session &&
      typeof session.sessionId === 'string' &&
      typeof session.createdAt === 'string' &&
      typeof session.lastActiveAt === 'string' &&
      session.preferences &&
      Array.isArray(session.visitHistory) &&
      session.contributionStats
    )
  }

  /**
   * Get total number of sessions ever created
   */
  private async getTotalSessionCount(): Promise<number> {
    try {
      const count =
        (await cacheService.get<number>('total-sessions-count')) || 0
      return count
    } catch {
      return 1 // Current session
    }
  }

  /**
   * Increment total session count
   */
  private async incrementSessionCount(): Promise<void> {
    try {
      const currentCount = await this.getTotalSessionCount()
      await cacheService.set('total-sessions-count', currentCount + 1)
    } catch (error) {
      console.warn('Failed to increment session count:', error)
    }
  }
}

// Singleton instance for the application
export const userSessionService = new UserSessionService()
