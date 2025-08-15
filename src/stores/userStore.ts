import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  UserSession,
  UserPreferences,
  VisitHistoryEntry,
  ContributionStats,
} from '../types/user'
import { userSessionService } from '../services/userSessionService'
import { preferencesService } from '../services/preferencesService'
import { visitHistoryService } from '../services/visitHistoryService'
import { contributionTrackingService } from '../services/contributionTrackingService'

/**
 * User store state interface
 */
interface UserState {
  // Session data
  session: UserSession | null
  isSessionLoading: boolean
  sessionError: string | null

  // Preferences
  preferences: UserPreferences | null
  preferencesLoading: boolean

  // Visit history
  visitHistory: VisitHistoryEntry[]
  visitHistoryLoading: boolean

  // Contribution stats
  contributionStats: ContributionStats | null
  contributionLoading: boolean

  // UI state
  isOnline: boolean
  lastSyncAt: string | null
}

/**
 * User store actions interface
 */
interface UserActions {
  // Session actions
  initializeSession: () => Promise<void>
  resetSession: () => Promise<void>
  updateLastActiveTime: () => Promise<void>

  // Preferences actions
  loadPreferences: () => Promise<void>
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>
  resetPreferences: () => Promise<void>

  // Visit history actions
  loadVisitHistory: () => Promise<void>
  addVisit: (visit: Omit<VisitHistoryEntry, 'visitId'>) => Promise<void>
  updateVisit: (
    visitId: string,
    updates: Partial<VisitHistoryEntry>
  ) => Promise<void>
  deleteVisit: (visitId: string) => Promise<void>

  // Contribution actions
  loadContributionStats: () => Promise<void>
  recordContribution: (
    type:
      | 'cafe_added'
      | 'rating_given'
      | 'photo_uploaded'
      | 'love_given'
      | 'comment_posted',
    cafeId?: string
  ) => Promise<void>

  // Utility actions
  setOnlineStatus: (isOnline: boolean) => void
  clearAllData: () => Promise<void>
  refreshAllData: () => Promise<void>
}

/**
 * Combined user store type
 */
type UserStore = UserState & UserActions

/**
 * Initial state
 */
const initialState: UserState = {
  session: null,
  isSessionLoading: false,
  sessionError: null,
  preferences: null,
  preferencesLoading: false,
  visitHistory: [],
  visitHistoryLoading: false,
  contributionStats: null,
  contributionLoading: false,
  isOnline: navigator.onLine,
  lastSyncAt: null,
}

/**
 * User store for managing session, preferences, and user data
 * Uses Zustand with persistence for offline-first functionality
 */
export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Session actions
      initializeSession: async () => {
        if (get().isSessionLoading) return

        set({ isSessionLoading: true, sessionError: null })

        try {
          const session = await userSessionService.getCurrentSession()
          set({
            session,
            preferences: session.preferences,
            visitHistory: session.visitHistory,
            contributionStats: session.contributionStats,
            isSessionLoading: false,
          })
        } catch (error) {
          console.error('Failed to initialize session:', error)
          set({
            sessionError:
              error instanceof Error
                ? error.message
                : 'Failed to initialize session',
            isSessionLoading: false,
          })
        }
      },

      resetSession: async () => {
        set({ isSessionLoading: true })

        try {
          const newSession = await userSessionService.resetSession()
          set({
            session: newSession,
            preferences: newSession.preferences,
            visitHistory: newSession.visitHistory,
            contributionStats: newSession.contributionStats,
            sessionError: null,
            isSessionLoading: false,
          })
        } catch (error) {
          console.error('Failed to reset session:', error)
          set({
            sessionError:
              error instanceof Error
                ? error.message
                : 'Failed to reset session',
            isSessionLoading: false,
          })
        }
      },

      updateLastActiveTime: async () => {
        try {
          await userSessionService.updateLastActiveTime()
          const session = get().session
          if (session) {
            set({
              session: {
                ...session,
                lastActiveAt: new Date().toISOString(),
              },
            })
          }
        } catch (error) {
          console.warn('Failed to update last active time:', error)
        }
      },

      // Preferences actions
      loadPreferences: async () => {
        if (get().preferencesLoading) return

        set({ preferencesLoading: true })

        try {
          const preferences = await preferencesService.getPreferences()
          set({ preferences, preferencesLoading: false })
        } catch (error) {
          console.error('Failed to load preferences:', error)
          set({ preferencesLoading: false })
        }
      },

      updatePreferences: async (updates: Partial<UserPreferences>) => {
        set({ preferencesLoading: true })

        try {
          const updatedPreferences =
            await preferencesService.updatePreferences(updates)

          // Update session as well
          const session = get().session
          if (session) {
            set({
              session: {
                ...session,
                preferences: updatedPreferences,
              },
            })
          }

          set({
            preferences: updatedPreferences,
            preferencesLoading: false,
          })
        } catch (error) {
          console.error('Failed to update preferences:', error)
          set({ preferencesLoading: false })
          throw error
        }
      },

      resetPreferences: async () => {
        set({ preferencesLoading: true })

        try {
          const defaultPreferences = await preferencesService.resetToDefaults()

          // Update session as well
          const session = get().session
          if (session) {
            set({
              session: {
                ...session,
                preferences: defaultPreferences,
              },
            })
          }

          set({
            preferences: defaultPreferences,
            preferencesLoading: false,
          })
        } catch (error) {
          console.error('Failed to reset preferences:', error)
          set({ preferencesLoading: false })
          throw error
        }
      },

      // Visit history actions
      loadVisitHistory: async () => {
        if (get().visitHistoryLoading) return

        set({ visitHistoryLoading: true })

        try {
          const visitHistory = await visitHistoryService.getVisitHistory()
          set({ visitHistory, visitHistoryLoading: false })
        } catch (error) {
          console.error('Failed to load visit history:', error)
          set({ visitHistoryLoading: false })
        }
      },

      addVisit: async (visit: Omit<VisitHistoryEntry, 'visitId'>) => {
        try {
          const newVisit = await visitHistoryService.addVisit(visit)

          // Update local state
          const currentHistory = get().visitHistory
          set({
            visitHistory: [newVisit, ...currentHistory],
          })

          // Update session
          const session = get().session
          if (session) {
            set({
              session: {
                ...session,
                visitHistory: [newVisit, ...session.visitHistory],
              },
            })
          }
        } catch (error) {
          console.error('Failed to add visit:', error)
          throw error
        }
      },

      updateVisit: async (
        visitId: string,
        updates: Partial<VisitHistoryEntry>
      ) => {
        try {
          const updatedVisit = await visitHistoryService.updateVisit(
            visitId,
            updates
          )

          if (updatedVisit) {
            // Update local state
            const currentHistory = get().visitHistory
            const updatedHistory = currentHistory.map(visit =>
              visit.visitId === visitId ? updatedVisit : visit
            )
            set({ visitHistory: updatedHistory })

            // Update session
            const session = get().session
            if (session) {
              set({
                session: {
                  ...session,
                  visitHistory: updatedHistory,
                },
              })
            }
          }
        } catch (error) {
          console.error('Failed to update visit:', error)
          throw error
        }
      },

      deleteVisit: async (visitId: string) => {
        try {
          const success = await visitHistoryService.deleteVisit(visitId)

          if (success) {
            // Update local state
            const currentHistory = get().visitHistory
            const filteredHistory = currentHistory.filter(
              visit => visit.visitId !== visitId
            )
            set({ visitHistory: filteredHistory })

            // Update session
            const session = get().session
            if (session) {
              set({
                session: {
                  ...session,
                  visitHistory: filteredHistory,
                },
              })
            }
          }
        } catch (error) {
          console.error('Failed to delete visit:', error)
          throw error
        }
      },

      // Contribution actions
      loadContributionStats: async () => {
        if (get().contributionLoading) return

        set({ contributionLoading: true })

        try {
          const contributionStats =
            await contributionTrackingService.getContributionStats()
          set({ contributionStats, contributionLoading: false })
        } catch (error) {
          console.error('Failed to load contribution stats:', error)
          set({ contributionLoading: false })
        }
      },

      recordContribution: async (type, cafeId?) => {
        try {
          await contributionTrackingService.recordContribution(type, cafeId)

          // Reload contribution stats
          const contributionStats =
            await contributionTrackingService.getContributionStats()
          set({ contributionStats })

          // Update session
          const session = get().session
          if (session) {
            set({
              session: {
                ...session,
                contributionStats,
              },
            })
          }
        } catch (error) {
          console.error('Failed to record contribution:', error)
          throw error
        }
      },

      // Utility actions
      setOnlineStatus: (isOnline: boolean) => {
        set({ isOnline })

        if (isOnline) {
          // Trigger data refresh when coming back online
          get().refreshAllData().catch(console.warn)
        }
      },

      clearAllData: async () => {
        try {
          await userSessionService.clearAllData()
          await preferencesService.clearPreferenceHistory()
          await visitHistoryService.clearVisitHistory()

          // Reset store to initial state
          set(initialState)
        } catch (error) {
          console.error('Failed to clear all data:', error)
          throw error
        }
      },

      refreshAllData: async () => {
        const actions = get()

        try {
          // Refresh all data in parallel
          await Promise.all([
            actions.initializeSession(),
            actions.loadPreferences(),
            actions.loadVisitHistory(),
            actions.loadContributionStats(),
          ])

          set({ lastSyncAt: new Date().toISOString() })
        } catch (error) {
          console.error('Failed to refresh all data:', error)
        }
      },
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist essential data that should survive app restarts
      partialize: state => ({
        session: state.session,
        preferences: state.preferences,
        visitHistory: state.visitHistory.slice(0, 50), // Limit persisted history
        contributionStats: state.contributionStats,
        lastSyncAt: state.lastSyncAt,
      }),
      // Merge persisted state with fresh state
      merge: (persistedState, currentState) => {
        // Ensure we always have the latest loading states and online status
        return {
          ...currentState,
          ...persistedState,
          isSessionLoading: false,
          preferencesLoading: false,
          visitHistoryLoading: false,
          contributionLoading: false,
          isOnline: navigator.onLine,
          sessionError: null,
        }
      },
    }
  )
)

// Auto-sync online status
window.addEventListener('online', () =>
  useUserStore.getState().setOnlineStatus(true)
)
window.addEventListener('offline', () =>
  useUserStore.getState().setOnlineStatus(false)
)

// Auto-update last active time periodically
setInterval(
  () => {
    if (document.visibilityState === 'visible') {
      useUserStore.getState().updateLastActiveTime().catch(console.warn)
    }
  },
  5 * 60 * 1000
) // Every 5 minutes
