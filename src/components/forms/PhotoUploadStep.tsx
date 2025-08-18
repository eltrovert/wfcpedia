import React, { useState, useRef } from 'react'
import { TouchTarget } from '../ui/TouchTarget'
import { imageService } from '../../services/imageService'
import { useUIStore } from '../../stores/uiStore'
import type { NewCafeSubmission } from './AddCafeForm'

interface PhotoUploadStepProps {
  data: NewCafeSubmission
  onChange: (data: Partial<NewCafeSubmission>) => void
  onValidate: () => Promise<boolean>
  errors: Record<string, string>
}

const PHOTO_GUIDELINES = [
  {
    title: 'Interior Shots',
    description: 'Show seating areas, workspace setup, and ambiance',
    icon: '🏢',
  },
  {
    title: 'Work Stations',
    description: 'Highlight power outlets, tables, and WiFi signal areas',
    icon: '💻',
  },
  {
    title: 'Entrance',
    description: 'Help people find and recognize the café',
    icon: '🚪',
  },
  {
    title: 'Menu/Prices',
    description: 'Show drink prices and food options (optional)',
    icon: '📋',
  },
]

const MAX_PHOTOS = 5
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export function PhotoUploadStep({
  data,
  onChange,
}: PhotoUploadStepProps): JSX.Element {
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { addNotification } = useUIStore()

  const handleFileSelect = async (files: FileList): Promise<void> => {
    setUploadError(null)

    // Validate file count
    const remainingSlots = MAX_PHOTOS - data.images.length
    if (files.length > remainingSlots) {
      setUploadError(
        `You can only add ${remainingSlots} more photo(s). Maximum is ${MAX_PHOTOS} photos total.`
      )
      return
    }

    const newImages: Array<{ file: File; preview: string }> = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Validate file type
      if (!ACCEPTED_FORMATS.includes(file.type)) {
        setUploadError(
          `${file.name}: Only JPG, PNG, and WebP images are allowed`
        )
        continue
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setUploadError(`${file.name}: File too large. Maximum size is 5MB`)
        continue
      }

      try {
        // Create compressed version and preview
        const compressedFile = await imageService.compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.8,
          format: 'webp',
        })

        const preview = URL.createObjectURL(compressedFile)

        newImages.push({
          file: compressedFile,
          preview,
        })
      } catch (error) {
        console.error('Failed to process image:', error)
        setUploadError(`${file.name}: Failed to process image`)
      }
    }

    if (newImages.length > 0) {
      onChange({
        images: [...data.images, ...newImages],
      })

      addNotification({
        type: 'success',
        title: 'Photos Added',
        message: `${newImages.length} photo(s) added successfully`,
        duration: 3000,
      })
    }
  }

  const handleCameraCapture = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleGallerySelect = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleRemoveImage = (index: number): void => {
    const imageToRemove = data.images[index]

    // Clean up preview URL
    if (imageToRemove.preview.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.preview)
    }

    const updatedImages = data.images.filter((_, i) => i !== index)
    onChange({ images: updatedImages })

    addNotification({
      type: 'info',
      title: 'Photo Removed',
      message: 'Photo removed from upload queue',
      duration: 2000,
    })
  }

  const handleReorderImages = (fromIndex: number, toIndex: number): void => {
    if (fromIndex === toIndex) return

    const updatedImages = [...data.images]
    const [movedImage] = updatedImages.splice(fromIndex, 1)
    updatedImages.splice(toIndex, 0, movedImage)

    onChange({ images: updatedImages })
  }

  const canAddMorePhotos = data.images.length < MAX_PHOTOS

  return (
    <div className='p-4 space-y-6'>
      {/* Photo Guidelines */}
      <div>
        <h3 className='text-sm font-medium text-gray-700 mb-4'>
          Photo Guidelines
        </h3>
        <div className='grid grid-cols-1 gap-3'>
          {PHOTO_GUIDELINES.map((guideline, index) => (
            <div
              key={index}
              className='flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg'
            >
              <div className='text-2xl'>{guideline.icon}</div>
              <div>
                <div className='font-medium text-blue-900'>
                  {guideline.title}
                </div>
                <div className='text-sm text-blue-700'>
                  {guideline.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className='mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg'>
          <p className='text-sm text-gray-600'>
            <strong>Note:</strong> Photos help remote workers understand the
            workspace before visiting. Quality matters more than quantity -{' '}
            {MAX_PHOTOS} good photos are better than many average ones.
          </p>
        </div>
      </div>

      {/* Upload Section */}
      {canAddMorePhotos && (
        <div>
          <h3 className='text-sm font-medium text-gray-700 mb-4'>
            Add Photos ({data.images.length}/{MAX_PHOTOS})
          </h3>

          <div className='grid grid-cols-2 gap-4'>
            <TouchTarget
              variant='secondary'
              onClick={handleCameraCapture}
              className='p-6 flex flex-col items-center gap-2 border-2 border-dashed border-gray-300 hover:border-blue-400'
              ariaLabel='Take photo with camera'
            >
              <div className='text-3xl'>📷</div>
              <div className='font-medium'>Take Photo</div>
              <div className='text-xs text-gray-600'>Camera</div>
            </TouchTarget>

            <TouchTarget
              variant='secondary'
              onClick={handleGallerySelect}
              className='p-6 flex flex-col items-center gap-2 border-2 border-dashed border-gray-300 hover:border-blue-400'
              ariaLabel='Select photos from gallery'
            >
              <div className='text-3xl'>🖼️</div>
              <div className='font-medium'>Choose Photos</div>
              <div className='text-xs text-gray-600'>Gallery</div>
            </TouchTarget>
          </div>

          <input
            ref={fileInputRef}
            type='file'
            accept={ACCEPTED_FORMATS.join(',')}
            multiple
            capture='environment'
            onChange={e => {
              if (e.target.files) {
                handleFileSelect(e.target.files)
              }
            }}
            className='hidden'
          />

          {uploadError && (
            <div className='mt-3 p-3 bg-red-50 border border-red-200 rounded-lg'>
              <p className='text-sm text-red-600'>{uploadError}</p>
            </div>
          )}
        </div>
      )}

      {/* Photo Preview Grid */}
      {data.images.length > 0 && (
        <div>
          <h3 className='text-sm font-medium text-gray-700 mb-4'>
            Your Photos ({data.images.length})
          </h3>

          <div className='grid grid-cols-2 gap-4'>
            {data.images.map((image, index) => (
              <div
                key={index}
                className='relative bg-gray-100 rounded-lg overflow-hidden aspect-square'
              >
                <img
                  src={image.preview}
                  alt={`Café ${index + 1}`}
                  className='w-full h-full object-cover'
                />

                {/* Remove button */}
                <TouchTarget
                  variant='ghost'
                  onClick={() => handleRemoveImage(index)}
                  className='absolute top-2 right-2 w-8 h-8 p-1 bg-red-500 text-white rounded-full hover:bg-red-600'
                  ariaLabel={`Remove photo ${index + 1}`}
                >
                  ×
                </TouchTarget>

                {/* Position indicator */}
                <div className='absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded'>
                  {index + 1} of {data.images.length}
                  {index === 0 && <span className='ml-1'>📌</span>}
                </div>

                {/* Reorder buttons */}
                {data.images.length > 1 && (
                  <div className='absolute bottom-2 right-2 flex gap-1'>
                    {index > 0 && (
                      <TouchTarget
                        variant='ghost'
                        onClick={() => handleReorderImages(index, index - 1)}
                        className='w-6 h-6 p-1 bg-black/70 text-white rounded text-xs'
                        ariaLabel='Move photo left'
                      >
                        ←
                      </TouchTarget>
                    )}
                    {index < data.images.length - 1 && (
                      <TouchTarget
                        variant='ghost'
                        onClick={() => handleReorderImages(index, index + 1)}
                        className='w-6 h-6 p-1 bg-black/70 text-white rounded text-xs'
                        ariaLabel='Move photo right'
                      >
                        →
                      </TouchTarget>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className='mt-3 p-3 bg-green-50 border border-green-200 rounded-lg'>
            <p className='text-sm text-green-800'>
              <strong>Great!</strong> Your first photo will be used as the main
              café image. You can reorder photos using the arrow buttons.
            </p>
          </div>
        </div>
      )}

      {/* No photos state */}
      {data.images.length === 0 && (
        <div className='text-center py-8'>
          <div className='text-4xl mb-3'>📸</div>
          <h4 className='font-medium text-gray-900 mb-2'>No photos yet</h4>
          <p className='text-sm text-gray-600'>
            Photos are optional but highly recommended. They help remote workers
            understand the workspace and make your listing more attractive.
          </p>
        </div>
      )}

      {/* Technical Info */}
      <div className='p-3 bg-gray-50 border border-gray-200 rounded-lg'>
        <h4 className='font-medium text-gray-900 mb-2'>
          Technical Requirements
        </h4>
        <div className='text-sm text-gray-600 space-y-1'>
          <p>
            • <strong>Formats:</strong> JPG, PNG, WebP
          </p>
          <p>
            • <strong>Size:</strong> Maximum 5MB per photo
          </p>
          <p>
            • <strong>Limit:</strong> Up to {MAX_PHOTOS} photos
          </p>
          <p>
            • <strong>Quality:</strong> Photos will be optimized automatically
          </p>
        </div>
      </div>

      {/* Ready to submit info */}
      {data.images.length >= 0 && (
        <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
          <h4 className='font-medium text-blue-900 mb-2'>Ready to Submit</h4>
          <div className='text-sm text-blue-800 space-y-2'>
            <p>Your café information is complete! Here's what happens next:</p>
            <div className='space-y-1 ml-4'>
              <p>
                • 📋 Your submission will be reviewed by our community
                moderators
              </p>
              <p>• ⏱️ Reviews typically take 1-2 business days</p>
              <p>• 📧 You'll be notified when your café is approved and live</p>
              <p>• 🎉 Help other remote workers discover great workspaces!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
