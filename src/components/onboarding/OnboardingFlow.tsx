import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useUserStore } from '../../stores/userStore'
import { useUIStore } from '../../stores/uiStore'
import { OnboardingWelcome } from './OnboardingWelcome'
import { OnboardingCriteria } from './OnboardingCriteria'
import { OnboardingExamples } from './OnboardingExamples'
import { OnboardingCommunity } from './OnboardingCommunity'
import { TouchTarget } from '../ui/TouchTarget'
import {
  preloadOnboardingAssets,
  createPerformanceObserver,
  getOnboardingDataUsage,
  isLikelyMobileData,
} from '../../utils/networkOptimization'
import {
  TouchGestureHandler,
  triggerHaptic,
  getOptimalTouchConfig,
  detectTouchCapabilities,
} from '../../utils/touchOptimization'

export interface OnboardingStep {
  id: string
  title: string
  component: React.ComponentType
  canSkip: boolean
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to WFC Pedia',
    component: OnboardingWelcome,
    canSkip: false,
  },
  {
    id: 'criteria',
    title: 'Work-Specific Ratings',
    component: OnboardingCriteria,
    canSkip: true,
  },
  {
    id: 'examples',
    title: 'Interactive Examples',
    component: OnboardingExamples,
    canSkip: true,
  },
  {
    id: 'community',
    title: 'Community Benefits',
    component: OnboardingCommunity,
    canSkip: true,
  },
]

interface OnboardingFlowProps {
  onComplete: () => void
  onSkip?: () => void
}

export function OnboardingFlow({
  onComplete,
  onSkip,
}: OnboardingFlowProps): JSX.Element {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [startTime] = useState(Date.now())
  const [stepStartTime, setStepStartTime] = useState(Date.now())
  const [isOptimizedForMobile, setIsOptimizedForMobile] = useState(false)
  const [dataUsage] = useState(getOnboardingDataUsage())
  const [touchCapabilities] = useState(detectTouchCapabilities())
  const titleRef = useRef<HTMLHeadingElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const performanceObserverRef = useRef<PerformanceObserver | null>(null)
  const gestureHandlerRef = useRef<TouchGestureHandler | null>(null)

  const { updatePreferences } = useUserStore()
  const { addNotification } = useUIStore()

  const currentStep = ONBOARDING_STEPS[currentStepIndex]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === ONBOARDING_STEPS.length - 1
  const progress = ((currentStepIndex + 1) / ONBOARDING_STEPS.length) * 100

  // Initialize performance monitoring and network optimization
  useEffect(() => {
    const initializeOptimization = async () => {
      // Set up performance monitoring
      performanceObserverRef.current = createPerformanceObserver()

      // Check if we should optimize for mobile data
      const mobileDataOptimization = isLikelyMobileData()
      setIsOptimizedForMobile(mobileDataOptimization)

      if (mobileDataOptimization) {
        addNotification({
          type: 'info',
          title: 'Data Saver Mode',
          message: `Onboarding optimized for mobile data (~${dataUsage.estimated}KB)`,
          duration: 4000,
        })
      }

      // Preload assets for better performance
      try {
        await preloadOnboardingAssets()
      } catch (error) {
        console.warn('Failed to preload onboarding assets:', error)
      }
    }

    initializeOptimization()

    // Cleanup performance observer on unmount
    return () => {
      if (performanceObserverRef.current) {
        performanceObserverRef.current.disconnect()
      }
    }
  }, [addNotification, dataUsage.estimated])

  // Define handlers first before using them in useEffect
  const trackStepCompletion = useCallback(
    async (stepId: string, timeSpent: number) => {
      try {
        // Basic analytics tracking through UserSessionService
        // This will be compatible with future Analytics service
        console.warn(
          `Onboarding step completed: ${stepId}, time: ${timeSpent}ms`
        )
      } catch (error) {
        console.warn('Failed to track onboarding step completion:', error)
      }
    },
    []
  )

  const handleComplete = useCallback(async () => {
    try {
      const totalTime = Date.now() - startTime

      // Update user preferences to mark onboarding as completed
      await updatePreferences({
        onboardingCompleted: true,
        onboardingCompletedAt: new Date().toISOString(),
      })

      // Track completion
      await trackStepCompletion('onboarding-complete', totalTime)

      addNotification({
        type: 'success',
        title: 'Welcome to WFC Pedia!',
        message: "You're all set to discover amazing work-friendly cafés.",
        duration: 5000,
      })

      onComplete()
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to save onboarding progress.',
        duration: 5000,
      })
    }
  }, [
    startTime,
    updatePreferences,
    addNotification,
    onComplete,
    trackStepCompletion,
  ])

  const handleNext = useCallback(async () => {
    const timeSpent = Date.now() - stepStartTime
    await trackStepCompletion(currentStep.id, timeSpent)

    if (touchCapabilities.supportsHaptics) {
      triggerHaptic(isLastStep ? 'success' : 'navigation')
    }

    if (isLastStep) {
      await handleComplete()
    } else {
      setCurrentStepIndex(prev => prev + 1)
    }
  }, [
    currentStep.id,
    stepStartTime,
    touchCapabilities.supportsHaptics,
    isLastStep,
    handleComplete,
    trackStepCompletion,
  ])

  const handleBack = useCallback(() => {
    if (!isFirstStep) {
      if (touchCapabilities.supportsHaptics) {
        triggerHaptic('navigation')
      }
      setCurrentStepIndex(prev => prev - 1)
    }
  }, [isFirstStep, touchCapabilities.supportsHaptics])

  const handleSkipAll = useCallback(async () => {
    if (onSkip) {
      const totalTime = Date.now() - startTime
      await trackStepCompletion('onboarding-skipped-all', totalTime)
      onSkip()
    }
  }, [onSkip, startTime, trackStepCompletion])

  // Set up touch gestures separately to avoid dependency issues
  useEffect(() => {
    if (touchCapabilities.hasTouch && containerRef.current) {
      const touchConfig = getOptimalTouchConfig()
      gestureHandlerRef.current = new TouchGestureHandler(
        containerRef.current,
        {
          onSwipeLeft: () => {
            if (!isLastStep) {
              handleNext()
              triggerHaptic('navigation')
            }
          },
          onSwipeRight: () => {
            if (!isFirstStep) {
              handleBack()
              triggerHaptic('navigation')
            }
          },
        },
        touchConfig
      )
    }

    return () => {
      if (gestureHandlerRef.current) {
        gestureHandlerRef.current.destroy()
      }
    }
  }, [
    touchCapabilities.hasTouch,
    isFirstStep,
    isLastStep,
    handleNext,
    handleBack,
  ])

  useEffect(() => {
    setStepStartTime(Date.now())

    // Focus the title when step changes for screen readers
    if (titleRef.current) {
      titleRef.current.focus()
    }
  }, [currentStepIndex])

  const handleSkipStep = useCallback(async () => {
    if (currentStep.canSkip) {
      const timeSpent = Date.now() - stepStartTime
      await trackStepCompletion(`${currentStep.id}-skipped`, timeSpent)

      if (isLastStep) {
        await handleComplete()
      } else {
        setCurrentStepIndex(prev => prev + 1)
      }
    }
  }, [
    currentStep.canSkip,
    currentStep.id,
    stepStartTime,
    trackStepCompletion,
    isLastStep,
    handleComplete,
  ])

  const CurrentStepComponent = currentStep.component

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && !isLastStep) {
        handleNext()
      } else if (e.key === 'ArrowLeft' && !isFirstStep) {
        handleBack()
      } else if (e.key === 'Enter') {
        handleNext()
      } else if (e.key === 'Escape') {
        handleSkipAll()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    currentStepIndex,
    isFirstStep,
    isLastStep,
    handleNext,
    handleBack,
    handleSkipAll,
  ])

  return (
    <div
      ref={containerRef}
      className='fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col'
      role='main'
      aria-labelledby='onboarding-title'
    >
      {/* Progress bar */}
      <div className='w-full bg-gray-200 dark:bg-gray-700 h-1'>
        <div
          className='bg-blue-500 h-1 transition-all duration-300 ease-out'
          style={{ width: `${progress}%` }}
          role='progressbar'
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-label={`Onboarding progress: ${Math.round(progress)}%`}
        />
      </div>

      {/* Header */}
      <header className='flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700'>
        <div>
          <h1
            ref={titleRef}
            id='onboarding-title'
            className='text-lg font-semibold text-gray-900 dark:text-white'
            tabIndex={-1}
          >
            {currentStep.title}
          </h1>
          <div className='text-sm text-gray-500 dark:text-gray-400'>
            <p>
              Step {currentStepIndex + 1} of {ONBOARDING_STEPS.length}
            </p>
            {isOptimizedForMobile && (
              <p className='text-xs'>
                📱 Mobile optimized · ~{dataUsage.estimated}KB
              </p>
            )}
            {touchCapabilities.hasTouch && (
              <p className='text-xs'>
                👆 Swipe to navigate ·{' '}
                {touchCapabilities.supportsHaptics
                  ? 'Haptic feedback enabled'
                  : 'Touch gestures enabled'}
              </p>
            )}
          </div>
        </div>

        <TouchTarget
          onClick={handleSkipAll}
          variant='ghost'
          ariaLabel='Skip onboarding tutorial'
          className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        >
          Skip All
        </TouchTarget>
      </header>

      {/* Step content */}
      <main className='flex-1 overflow-y-auto'>
        <CurrentStepComponent />
      </main>

      {/* Navigation footer */}
      <footer className='p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'>
        <div className='flex items-center justify-between max-w-md mx-auto'>
          <TouchTarget
            onClick={handleBack}
            disabled={isFirstStep}
            variant='secondary'
            ariaLabel='Go to previous step'
            className='flex items-center gap-2'
          >
            <span aria-hidden='true'>←</span>
            Back
          </TouchTarget>

          <div className='flex items-center gap-2'>
            {/* Step indicators */}
            {ONBOARDING_STEPS.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index <= currentStepIndex
                    ? 'bg-blue-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
                aria-hidden='true'
              />
            ))}
          </div>

          <div className='flex items-center gap-2'>
            {currentStep.canSkip && !isLastStep && (
              <TouchTarget
                onClick={handleSkipStep}
                variant='ghost'
                ariaLabel='Skip this step'
                className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              >
                Skip
              </TouchTarget>
            )}

            <TouchTarget
              onClick={handleNext}
              variant='primary'
              ariaLabel={isLastStep ? 'Complete onboarding' : 'Go to next step'}
              className='flex items-center gap-2'
            >
              {isLastStep ? 'Get Started' : 'Next'}
              {!isLastStep && <span aria-hidden='true'>→</span>}
            </TouchTarget>
          </div>
        </div>

        {/* Accessibility instructions and live region for announcements */}
        <div className='sr-only'>
          <p>
            Use arrow keys or swipe to navigate between steps. Press Enter to
            continue or Escape to skip all.
          </p>
          <div role='status' aria-live='polite' aria-atomic='true'>
            Step {currentStepIndex + 1} of {ONBOARDING_STEPS.length}:{' '}
            {currentStep.title}
          </div>
        </div>
      </footer>
    </div>
  )
}
