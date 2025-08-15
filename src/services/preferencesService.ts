import type { UserPreferences, DefaultUserPreferences } from '../types/user'
import { cacheService } from './cacheService'

/**
 * Preferences error classes
 */
export class PreferencesError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'PreferencesError'
  }
}

export class PreferencesValidationError extends PreferencesError {
  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', { field })
  }
}

export class PreferencesStorageError extends PreferencesError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'STORAGE_ERROR', originalError)
  }
}

/**
 * Preference change event
 */
export interface PreferenceChangeEvent {
  type: 'preference-changed'
  key: keyof UserPreferences
  oldValue: unknown
  newValue: unknown
  timestamp: string
}

/**
 * Service for user preferences persistence with IndexedDB
 * Handles app settings, filters, and user customizations
 */
export class PreferencesService {
  private readonly PREFERENCES_CACHE_KEY = 'user-preferences'
  private readonly PREFERENCES_HISTORY_KEY = 'preferences-history'
  private readonly MAX_HISTORY_ENTRIES = 50
  private eventListeners: ((event: PreferenceChangeEvent) => void)[] = []

  /**
   * Get all user preferences
   */
  async getPreferences(): Promise<UserPreferences> {
    try {
      // Try to get from user session first (most up-to-date)
      const { userSessionService } = await import('./userSessionService')
      const session = await userSessionService.getCurrentSession()
      return session.preferences
    } catch (error) {
      console.warn(
        'Failed to get preferences from session, falling back to cache:',
        error
      )

      // Fallback to cache
      const cached = await cacheService.get<UserPreferences>(
        this.PREFERENCES_CACHE_KEY
      )
      if (cached) {
        return cached
      }

      // Final fallback to defaults
      return { ...DefaultUserPreferences }
    }
  }

  /**
   * Update user preferences (partial update)
   */
  async updatePreferences(
    updates: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    try {
      const currentPreferences = await this.getPreferences()
      const updatedPreferences: UserPreferences = {
        ...currentPreferences,
        ...updates,
      }

      // Validate the updates
      this.validatePreferences(updatedPreferences)

      // Store in user session
      const { userSessionService } = await import('./userSessionService')
      await userSessionService.updatePreferences(updatedPreferences)

      // Store in cache as backup
      await cacheService.set(this.PREFERENCES_CACHE_KEY, updatedPreferences)

      // Track preference changes for analytics
      await this.trackPreferenceChanges(currentPreferences, updatedPreferences)

      // Notify listeners
      this.notifyPreferenceChanges(currentPreferences, updatedPreferences)

      console.warn('Preferences updated successfully')
      return updatedPreferences
    } catch (error) {
      console.error('Failed to update preferences:', error)
      throw new PreferencesStorageError('Failed to update preferences', error)
    }
  }

  /**
   * Update a specific preference
   */
  async updatePreference<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ): Promise<void> {
    const updates = { [key]: value } as Partial<UserPreferences>
    await this.updatePreferences(updates)
  }

  /**
   * Get a specific preference value
   */
  async getPreference<K extends keyof UserPreferences>(
    key: K
  ): Promise<UserPreferences[K]> {
    const preferences = await this.getPreferences()
    return preferences[key]
  }

  /**
   * Reset preferences to defaults
   */
  async resetToDefaults(): Promise<UserPreferences> {
    const defaultPreferences = { ...DefaultUserPreferences }
    return this.updatePreferences(defaultPreferences)
  }

  /**
   * Reset specific preference to default
   */
  async resetPreference<K extends keyof UserPreferences>(
    key: K
  ): Promise<void> {
    const defaultValue = DefaultUserPreferences[key]
    await this.updatePreference(key, defaultValue)
  }

  /**
   * Get preference change history
   */
  async getPreferenceHistory(): Promise<PreferenceChangeEvent[]> {
    try {
      const history = await cacheService.get<PreferenceChangeEvent[]>(
        this.PREFERENCES_HISTORY_KEY
      )
      return history || []
    } catch (error) {
      console.warn('Failed to get preference history:', error)
      return []
    }
  }

  /**
   * Clear preference change history
   */
  async clearPreferenceHistory(): Promise<void> {
    try {
      await cacheService.remove(this.PREFERENCES_HISTORY_KEY)
    } catch (error) {
      console.warn('Failed to clear preference history:', error)
    }
  }

  /**
   * Export preferences for backup
   */
  async exportPreferences(): Promise<{
    preferences: UserPreferences
    history: PreferenceChangeEvent[]
    exportedAt: string
    version: string
  }> {
    const preferences = await this.getPreferences()
    const history = await this.getPreferenceHistory()

    return {
      preferences,
      history,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    }
  }

  /**
   * Import preferences from backup
   */
  async importPreferences(data: {
    preferences: UserPreferences
    history?: PreferenceChangeEvent[]
    exportedAt: string
    version: string
  }): Promise<void> {
    try {
      // Validate imported preferences
      this.validatePreferences(data.preferences)

      // Update preferences
      await this.updatePreferences(data.preferences)

      // Import history if provided
      if (data.history) {
        await cacheService.set(this.PREFERENCES_HISTORY_KEY, data.history)
      }

      console.warn('Preferences imported successfully')
    } catch (error) {
      console.error('Failed to import preferences:', error)
      throw new PreferencesError(
        'Failed to import preferences',
        'IMPORT_ERROR',
        error
      )
    }
  }

  /**
   * Check if preference has been modified from default
   */
  async isPreferenceModified<K extends keyof UserPreferences>(
    key: K
  ): Promise<boolean> {
    const currentValue = await this.getPreference(key)
    const defaultValue = DefaultUserPreferences[key]

    return JSON.stringify(currentValue) !== JSON.stringify(defaultValue)
  }

  /**
   * Get all modified preferences
   */
  async getModifiedPreferences(): Promise<Partial<UserPreferences>> {
    const current = await this.getPreferences()
    const modified: Partial<UserPreferences> = {}

    for (const [key, value] of Object.entries(current)) {
      const typedKey = key as keyof UserPreferences
      const defaultValue = DefaultUserPreferences[typedKey]

      if (JSON.stringify(value) !== JSON.stringify(defaultValue)) {
        ;(modified as Record<string, unknown>)[key] = value
      }
    }

    return modified
  }

  /**
   * Add event listener for preference changes
   */
  addPreferenceChangeListener(
    listener: (event: PreferenceChangeEvent) => void
  ): () => void {
    this.eventListeners.push(listener)

    // Return cleanup function
    return () => {
      const index = this.eventListeners.indexOf(listener)
      if (index > -1) {
        this.eventListeners.splice(index, 1)
      }
    }
  }

  /**
   * Get preference statistics
   */
  async getPreferenceStats(): Promise<{
    totalChanges: number
    modifiedPreferences: number
    lastModified?: string
    mostChangedPreference?: keyof UserPreferences
  }> {
    const history = await this.getPreferenceHistory()
    const modified = await this.getModifiedPreferences()

    const changesByKey: Record<string, number> = {}
    let lastModified: string | undefined

    for (const event of history) {
      changesByKey[event.key] = (changesByKey[event.key] || 0) + 1
      if (!lastModified || event.timestamp > lastModified) {
        lastModified = event.timestamp
      }
    }

    const mostChangedPreference = Object.entries(changesByKey).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0] as keyof UserPreferences | undefined

    return {
      totalChanges: history.length,
      modifiedPreferences: Object.keys(modified).length,
      lastModified,
      mostChangedPreference,
    }
  }

  /**
   * Validate preferences object
   */
  private validatePreferences(preferences: UserPreferences): void {
    // Theme validation
    if (!['light', 'dark', 'system'].includes(preferences.theme)) {
      throw new PreferencesValidationError(
        'Invalid theme value. Must be light, dark, or system',
        'theme'
      )
    }

    // Language validation
    if (!['en', 'id'].includes(preferences.language)) {
      throw new PreferencesValidationError(
        'Invalid language value. Must be en or id',
        'language'
      )
    }

    // Default filters validation
    if (preferences.defaultFilters.minComfortRating !== undefined) {
      const rating = preferences.defaultFilters.minComfortRating
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new PreferencesValidationError(
          'Minimum comfort rating must be an integer between 1 and 5',
          'defaultFilters.minComfortRating'
        )
      }
    }

    // Map settings validation
    if (
      preferences.mapSettings.defaultZoom < 1 ||
      preferences.mapSettings.defaultZoom > 20
    ) {
      throw new PreferencesValidationError(
        'Default zoom must be between 1 and 20',
        'mapSettings.defaultZoom'
      )
    }

    // Notifications validation
    const notifications = preferences.notifications
    if (typeof notifications !== 'object' || notifications === null) {
      throw new PreferencesValidationError(
        'Notifications must be an object',
        'notifications'
      )
    }

    // Privacy validation
    const privacy = preferences.privacy
    if (typeof privacy !== 'object' || privacy === null) {
      throw new PreferencesValidationError(
        'Privacy settings must be an object',
        'privacy'
      )
    }
  }

  /**
   * Track preference changes for analytics
   */
  private async trackPreferenceChanges(
    oldPreferences: UserPreferences,
    newPreferences: UserPreferences
  ): Promise<void> {
    try {
      const history = await this.getPreferenceHistory()
      const timestamp = new Date().toISOString()
      const newEvents: PreferenceChangeEvent[] = []

      // Find changes
      for (const [key, newValue] of Object.entries(newPreferences)) {
        const typedKey = key as keyof UserPreferences
        const oldValue = oldPreferences[typedKey]

        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          newEvents.push({
            type: 'preference-changed',
            key: typedKey,
            oldValue,
            newValue,
            timestamp,
          })
        }
      }

      if (newEvents.length > 0) {
        // Add to history
        const updatedHistory = [...history, ...newEvents].slice(
          -this.MAX_HISTORY_ENTRIES
        ) // Keep only recent entries

        await cacheService.set(this.PREFERENCES_HISTORY_KEY, updatedHistory)
      }
    } catch (error) {
      console.warn('Failed to track preference changes:', error)
    }
  }

  /**
   * Notify listeners of preference changes
   */
  private notifyPreferenceChanges(
    oldPreferences: UserPreferences,
    newPreferences: UserPreferences
  ): void {
    for (const [key, newValue] of Object.entries(newPreferences)) {
      const typedKey = key as keyof UserPreferences
      const oldValue = oldPreferences[typedKey]

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        const event: PreferenceChangeEvent = {
          type: 'preference-changed',
          key: typedKey,
          oldValue,
          newValue,
          timestamp: new Date().toISOString(),
        }

        // Notify all listeners
        this.eventListeners.forEach(listener => {
          try {
            listener(event)
          } catch (error) {
            console.warn('Preference change listener error:', error)
          }
        })
      }
    }
  }
}

// Singleton instance for the application
export const preferencesService = new PreferencesService()
