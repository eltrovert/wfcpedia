import { useState, useEffect, useCallback } from 'react'
import { useUserStore } from '../stores/userStore'
import { useUIStore } from '../stores/uiStore'
import type { UserPreferences } from '../types/user'

export interface OnboardingState {
  isOnboardingRequired: boolean
  isOnboardingOpen: boolean
  isFirstTimeVisitor: boolean
  hasSkippedOnboarding: boolean
  onboardingProgress: {
    completedSteps: string[]
    currentStep: string | null
    totalSteps: number
  }
}

export interface OnboardingActions {
  startOnboarding: () => void
  completeOnboarding: (preferences?: Partial<UserPreferences>) => Promise<void>
  skipOnboarding: () => Promise<void>
  closeOnboarding: () => void
  updateOnboardingProgress: (step: string) => void
  resetOnboarding: () => Promise<void>
}

export type UseOnboardingReturn = OnboardingState & OnboardingActions

/**
 * Custom hook for managing onboarding state and flow
 * Handles first-time visitor detection, onboarding progress, and integration with services
 */
export function useOnboarding(): UseOnboardingReturn {
  const { session, preferences, updatePreferences, initializeSession } =
    useUserStore()
  const { addNotification } = useUIStore()

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)
  const [onboardingProgress, setOnboardingProgress] = useState({
    completedSteps: [] as string[],
    currentStep: null as string | null,
    totalSteps: 4, // Welcome, Criteria, Examples, Community
  })

  // Check if user needs onboarding
  const isFirstTimeVisitor = !session || !preferences?.onboardingCompleted
  const hasSkippedOnboarding = preferences?.onboardingSkipped || false
  const isOnboardingRequired = isFirstTimeVisitor && !hasSkippedOnboarding

  // Initialize onboarding state on mount
  useEffect(() => {
    const initializeOnboarding = async (): Promise<void> => {
      if (!session) {
        await initializeSession()
      }

      // Auto-show onboarding for first-time visitors
      if (isOnboardingRequired && !isOnboardingOpen) {
        // Small delay to ensure proper app initialization
        setTimeout(() => {
          setIsOnboardingOpen(true)
        }, 500)
      }
    }

    initializeOnboarding()
  }, [session, isOnboardingRequired, isOnboardingOpen, initializeSession])

  // Detect returning users
  useEffect(() => {
    if (session && preferences?.onboardingCompleted) {
      // Show welcome back notification for returning users
      if (session.lastActiveAt) {
        const lastActive = new Date(session.lastActiveAt)
        const daysSinceLastVisit = Math.floor(
          (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (daysSinceLastVisit > 7) {
          addNotification({
            type: 'info',
            title: 'Welcome back!',
            message: `It's been ${daysSinceLastVisit} days since your last visit. Check out what's new!`,
            duration: 7000,
          })
        }
      }
    }
  }, [session, preferences, addNotification])

  const startOnboarding = useCallback(() => {
    setIsOnboardingOpen(true)
    setOnboardingProgress({
      completedSteps: [],
      currentStep: 'welcome',
      totalSteps: 4,
    })
  }, [])

  const completeOnboarding = useCallback(
    async (additionalPreferences?: Partial<UserPreferences>) => {
      try {
        // Mark onboarding as completed
        await updatePreferences({
          onboardingCompleted: true,
          onboardingCompletedAt: new Date().toISOString(),
          onboardingSkipped: false,
          ...additionalPreferences,
        })

        setIsOnboardingOpen(false)

        // Reset progress
        setOnboardingProgress({
          completedSteps: ['welcome', 'criteria', 'examples', 'community'],
          currentStep: null,
          totalSteps: 4,
        })

        // Show success notification
        addNotification({
          type: 'success',
          title: 'Welcome to WFC Pedia! 🎉',
          message: "You're all set to discover amazing work-friendly cafés.",
          duration: 6000,
        })

        // Track completion event
        console.warn('Onboarding completed successfully')
      } catch (error) {
        console.error('Failed to complete onboarding:', error)
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to save onboarding progress. Please try again.',
          duration: 5000,
        })
        throw error
      }
    },
    [updatePreferences, addNotification]
  )

  const skipOnboarding = useCallback(async () => {
    try {
      // Mark onboarding as skipped
      await updatePreferences({
        onboardingCompleted: false,
        onboardingSkipped: true,
        onboardingSkippedAt: new Date().toISOString(),
      })

      setIsOnboardingOpen(false)

      // Reset progress
      setOnboardingProgress({
        completedSteps: [],
        currentStep: null,
        totalSteps: 4,
      })

      // Show informative notification
      addNotification({
        type: 'info',
        title: 'Onboarding Skipped',
        message: 'You can always access the tutorial from the settings menu.',
        duration: 4000,
      })

      // Track skip event
      console.warn('Onboarding skipped by user')
    } catch (error) {
      console.error('Failed to skip onboarding:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to save preferences. Please try again.',
        duration: 5000,
      })
      throw error
    }
  }, [updatePreferences, addNotification])

  const closeOnboarding = useCallback(() => {
    setIsOnboardingOpen(false)
  }, [])

  const updateOnboardingProgress = useCallback((step: string) => {
    setOnboardingProgress(prev => ({
      ...prev,
      currentStep: step,
      completedSteps: prev.completedSteps.includes(step)
        ? prev.completedSteps
        : [...prev.completedSteps, step],
    }))
  }, [])

  const resetOnboarding = useCallback(async () => {
    try {
      // Reset onboarding preferences
      await updatePreferences({
        onboardingCompleted: false,
        onboardingSkipped: false,
        onboardingCompletedAt: undefined,
        onboardingSkippedAt: undefined,
      })

      // Reset state
      setIsOnboardingOpen(false)
      setOnboardingProgress({
        completedSteps: [],
        currentStep: null,
        totalSteps: 4,
      })

      addNotification({
        type: 'info',
        title: 'Onboarding Reset',
        message:
          'Onboarding has been reset. It will show again on your next visit.',
        duration: 4000,
      })

      console.warn('Onboarding reset successfully')
    } catch (error) {
      console.error('Failed to reset onboarding:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to reset onboarding. Please try again.',
        duration: 5000,
      })
      throw error
    }
  }, [updatePreferences, addNotification])

  return {
    // State
    isOnboardingRequired,
    isOnboardingOpen,
    isFirstTimeVisitor,
    hasSkippedOnboarding,
    onboardingProgress,

    // Actions
    startOnboarding,
    completeOnboarding,
    skipOnboarding,
    closeOnboarding,
    updateOnboardingProgress,
    resetOnboarding,
  }
}
