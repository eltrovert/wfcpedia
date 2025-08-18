import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../../stores/userStore'
import { useUIStore } from '../../stores/uiStore'
import { TouchTarget } from '../ui/TouchTarget'
import { BasicInfoStep } from './BasicInfoStep'
import { WorkCriteriaStep } from './WorkCriteriaStep'
import { PhotoUploadStep } from './PhotoUploadStep'
import { cafeService } from '../../services/cafeService'
import { storageService } from '../../services/storageService'
import { locationService } from '../../services/locationService'
import type { Location, WorkMetrics, OperatingHours } from '../../types/cafe'

export interface NewCafeSubmission {
  name: string
  location: {
    address: string
    coordinates: { lat: number; lng: number }
    city: string
    district?: string
  }
  workMetrics: {
    wifiSpeed: 'slow' | 'medium' | 'fast' | 'fiber'
    comfortRating: 1 | 2 | 3 | 4 | 5
    noiseLevel: 'quiet' | 'moderate' | 'lively'
    amenities: Array<'24/7' | 'power' | 'ac' | 'lighting' | 'food'>
  }
  operatingHours: {
    [key: string]: {
      open: string
      close: string
      is24Hours: boolean
    } | null
  }
  images: Array<{
    file: File
    preview: string
  }>
}

export interface AddCafeStep {
  id: string
  title: string
  component: React.ComponentType<{
    data: NewCafeSubmission
    onChange: (data: Partial<NewCafeSubmission>) => void
    onValidate: () => Promise<boolean>
    errors: Record<string, string>
  }>
  canSkip: boolean
  validation: (data: NewCafeSubmission) => Promise<Record<string, string>>
}

const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

const FORM_STEPS: AddCafeStep[] = [
  {
    id: 'basic',
    title: 'Basic Information',
    component: BasicInfoStep,
    canSkip: false,
    validation: async data => {
      const errors: Record<string, string> = {}

      if (!data.name || data.name.trim().length < 2) {
        errors.name = 'Café name must be at least 2 characters'
      }

      if (!data.location.address || data.location.address.trim().length < 5) {
        errors.address = 'Address must be at least 5 characters'
      }

      if (!data.location.city || data.location.city.trim().length < 2) {
        errors.city = 'City is required'
      }

      if (!data.location.coordinates.lat || !data.location.coordinates.lng) {
        errors.location = 'Location coordinates are required'
      }

      return errors
    },
  },
  {
    id: 'work-criteria',
    title: 'Work Environment',
    component: WorkCriteriaStep,
    canSkip: false,
    validation: async data => {
      const errors: Record<string, string> = {}

      if (!data.workMetrics.wifiSpeed) {
        errors.wifiSpeed = 'WiFi speed rating is required'
      }

      if (
        !data.workMetrics.comfortRating ||
        data.workMetrics.comfortRating < 1 ||
        data.workMetrics.comfortRating > 5
      ) {
        errors.comfortRating = 'Comfort rating must be between 1 and 5'
      }

      if (!data.workMetrics.noiseLevel) {
        errors.noiseLevel = 'Noise level rating is required'
      }

      return errors
    },
  },
  {
    id: 'photos',
    title: 'Photos & Submit',
    component: PhotoUploadStep,
    canSkip: true,
    validation: async () => {
      // Photos are optional, no validation errors
      return {}
    },
  },
]

const STORAGE_KEY = 'add-cafe-draft'

interface AddCafeFormProps {
  onComplete: (cafeId: string) => void
  onCancel: () => void
}

export function AddCafeForm({
  onComplete,
  onCancel,
}: AddCafeFormProps): JSX.Element {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [formData, setFormData] = useState<NewCafeSubmission>(() => {
    // Try to restore from localStorage
    const saved = storageService.getItem(STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // Fall through to default
      }
    }

    return {
      name: '',
      location: {
        address: '',
        coordinates: { lat: 0, lng: 0 },
        city: '',
        district: '',
      },
      workMetrics: {
        wifiSpeed: 'medium' as const,
        comfortRating: 3 as const,
        noiseLevel: 'moderate' as const,
        amenities: [],
      },
      operatingHours: Object.fromEntries(
        DAYS_OF_WEEK.map(day => [
          day,
          { open: '08:00', close: '22:00', is24Hours: false },
        ])
      ),
      images: [],
    }
  })

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [duplicateWarning, setDuplicateWarning] = useState<{
    nearbyCafes: Array<{ name: string; distance: number; id: string }>
  } | null>(null)

  const navigate = useNavigate()
  const { sessionId } = useUserStore()
  const { addNotification } = useUIStore()

  const currentStep = FORM_STEPS[currentStepIndex]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === FORM_STEPS.length - 1
  const progress = ((currentStepIndex + 1) / FORM_STEPS.length) * 100

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    storageService.setItem(STORAGE_KEY, JSON.stringify(formData))
  }, [formData])

  const checkForDuplicates = useCallback(async () => {
    try {
      const nearbyCafes = await cafeService.searchByLocation(
        formData.location.coordinates,
        0.1 // 100m radius
      )

      if (nearbyCafes.length > 0) {
        const cafesWithDistance = nearbyCafes.map(cafe => ({
          name: cafe.name,
          id: cafe.id,
          distance: locationService.calculateDistance(
            formData.location.coordinates,
            {
              latitude: cafe.location.latitude,
              longitude: cafe.location.longitude,
            }
          ),
        }))

        setDuplicateWarning({ nearbyCafes: cafesWithDistance })
      } else {
        setDuplicateWarning(null)
      }
    } catch (error) {
      // Silently fail - not critical
      console.warn('Failed to check for duplicates:', error)
    }
  }, [formData.location.coordinates])

  // Check for duplicates when location changes
  useEffect(() => {
    if (
      formData.location.coordinates.lat &&
      formData.location.coordinates.lng
    ) {
      checkForDuplicates()
    }
  }, [formData.location.coordinates, checkForDuplicates])

  const handleDataChange = useCallback(
    (changes: Partial<NewCafeSubmission>) => {
      setFormData(prev => ({ ...prev, ...changes }))

      // Clear validation errors for changed fields
      const changedFields = Object.keys(changes)
      setValidationErrors(prev => {
        const updated = { ...prev }
        changedFields.forEach(field => delete updated[field])
        return updated
      })
    },
    []
  )

  const validateCurrentStep = async (): Promise<boolean> => {
    const errors = await currentStep.validation(formData)
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = async (): Promise<void> => {
    const isValid = await validateCurrentStep()
    if (!isValid) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the errors before continuing',
        duration: 3000,
      })
      return
    }

    if (isLastStep) {
      await handleSubmit()
    } else {
      setCurrentStepIndex(prev => prev + 1)
    }
  }

  const handleBack = (): void => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1)
    }
  }

  const handleSubmit = async (): Promise<void> => {
    setIsSubmitting(true)

    try {
      // Final validation
      let hasErrors = false
      for (const step of FORM_STEPS) {
        const errors = await step.validation(formData)
        if (Object.keys(errors).length > 0) {
          setValidationErrors(prev => ({ ...prev, ...errors }))
          hasErrors = true
        }
      }

      if (hasErrors) {
        addNotification({
          type: 'error',
          title: 'Validation Error',
          message: 'Please fix all errors before submitting',
          duration: 5000,
        })
        return
      }

      // Transform form data to Cafe format
      const cafeData = {
        name: formData.name.trim(),
        location: {
          latitude: formData.location.coordinates.lat,
          longitude: formData.location.coordinates.lng,
          address: formData.location.address.trim(),
          city: formData.location.city.trim(),
          district: formData.location.district?.trim() || undefined,
        } as Location,
        workMetrics: formData.workMetrics as WorkMetrics,
        operatingHours: formData.operatingHours as OperatingHours,
        images: [], // Will be populated after image upload
      }

      // Submit through service layer
      const newCafe = await cafeService.addCafe(
        cafeData,
        sessionId || 'anonymous'
      )

      // Clear form data from storage
      storageService.removeItem(STORAGE_KEY)

      addNotification({
        type: 'success',
        title: 'Café Added Successfully!',
        message: 'Your contribution is being reviewed and will be live soon.',
        duration: 5000,
      })

      onComplete(newCafe.id)
    } catch (error) {
      console.error('Failed to submit café:', error)

      addNotification({
        type: 'error',
        title: 'Submission Failed',
        message:
          error instanceof Error ? error.message : 'Please try again later',
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDuplicateContinue = (): void => {
    setDuplicateWarning(null)
  }

  const handleDuplicateMerge = (existingCafeId: string): void => {
    // Navigate to existing café for editing
    navigate(`/cafe/${existingCafeId}/edit`)
  }

  const CurrentStepComponent = currentStep.component

  return (
    <div
      className='fixed inset-0 bg-white z-50 flex flex-col'
      role='dialog'
      aria-labelledby='add-cafe-title'
      aria-describedby='add-cafe-description'
    >
      {/* Header */}
      <div className='flex-shrink-0 bg-white border-b border-gray-200 p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <TouchTarget
              variant='ghost'
              onClick={onCancel}
              ariaLabel='Cancel adding café'
              className='p-2'
            >
              <span className='text-xl'>←</span>
            </TouchTarget>
            <div>
              <h1
                id='add-cafe-title'
                className='text-lg font-semibold text-gray-900'
              >
                Add New Café
              </h1>
              <p id='add-cafe-description' className='text-sm text-gray-600'>
                Step {currentStepIndex + 1} of {FORM_STEPS.length}:{' '}
                {currentStep.title}
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className='mt-4'>
          <div className='w-full bg-gray-200 rounded-full h-2'>
            <div
              className='bg-blue-500 h-2 rounded-full transition-all duration-300'
              style={{ width: `${progress}%` }}
              role='progressbar'
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Form progress: ${Math.round(progress)}% complete`}
            />
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className='flex-1 overflow-y-auto'>
        <CurrentStepComponent
          data={formData}
          onChange={handleDataChange}
          onValidate={validateCurrentStep}
          errors={validationErrors}
        />
      </div>

      {/* Duplicate warning modal */}
      {duplicateWarning && (
        <div className='absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-10'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full'>
            <h3 className='text-lg font-semibold text-gray-900 mb-3'>
              Similar Café Found
            </h3>
            <p className='text-gray-600 mb-4'>
              We found {duplicateWarning.nearbyCafes.length} nearby café(s):
            </p>
            <div className='space-y-2 mb-6'>
              {duplicateWarning.nearbyCafes.map(cafe => (
                <div
                  key={cafe.id}
                  className='flex justify-between items-center p-2 bg-gray-50 rounded'
                >
                  <span className='font-medium'>{cafe.name}</span>
                  <span className='text-sm text-gray-500'>
                    {Math.round(cafe.distance * 1000)}m away
                  </span>
                </div>
              ))}
            </div>
            <div className='flex gap-3'>
              <TouchTarget
                variant='secondary'
                onClick={handleDuplicateContinue}
                className='flex-1'
              >
                Continue Anyway
              </TouchTarget>
              <TouchTarget
                variant='primary'
                onClick={() =>
                  handleDuplicateMerge(duplicateWarning.nearbyCafes[0].id)
                }
                className='flex-1'
              >
                View Existing
              </TouchTarget>
            </div>
          </div>
        </div>
      )}

      {/* Bottom actions */}
      <div className='flex-shrink-0 bg-white border-t border-gray-200 p-4'>
        <div className='flex gap-3'>
          {!isFirstStep && (
            <TouchTarget
              variant='secondary'
              onClick={handleBack}
              className='px-6 py-3'
              disabled={isSubmitting}
            >
              Back
            </TouchTarget>
          )}

          <TouchTarget
            variant='primary'
            onClick={handleNext}
            className='flex-1 px-6 py-3'
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Submitting...'
              : isLastStep
                ? 'Submit Café'
                : 'Next'}
          </TouchTarget>

          {currentStep.canSkip && !isLastStep && (
            <TouchTarget
              variant='ghost'
              onClick={() => setCurrentStepIndex(prev => prev + 1)}
              className='px-4 py-3'
              disabled={isSubmitting}
            >
              Skip
            </TouchTarget>
          )}
        </div>
      </div>
    </div>
  )
}
