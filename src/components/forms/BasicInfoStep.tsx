import React, { useState, useEffect } from 'react'
import { TouchTarget } from '../ui/TouchTarget'
import { locationService } from '../../services/locationService'
import { useUIStore } from '../../stores/uiStore'
import type { NewCafeSubmission } from './AddCafeForm'

interface BasicInfoStepProps {
  data: NewCafeSubmission
  onChange: (data: Partial<NewCafeSubmission>) => void
  onValidate: () => Promise<boolean>
  errors: Record<string, string>
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
]

const COMMON_CITIES = [
  'Jakarta',
  'Bandung',
  'Surabaya',
  'Yogyakarta',
  'Bali (Denpasar)',
  'Medan',
  'Semarang',
  'Malang',
  'Solo',
  'Bekasi',
]

export function BasicInfoStep({
  data,
  onChange,
  errors,
}: BasicInfoStepProps): JSX.Element {
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [showCustomCity, setShowCustomCity] = useState(false)

  const { addNotification } = useUIStore()

  // Auto-detect if user entered a custom city
  useEffect(() => {
    if (data.location.city && !COMMON_CITIES.includes(data.location.city)) {
      setShowCustomCity(true)
    }
  }, [data.location.city])

  const handleNameChange = (name: string): void => {
    onChange({
      name,
    })
  }

  const handleAddressChange = (address: string): void => {
    onChange({
      location: {
        ...data.location,
        address,
      },
    })
  }

  const handleCityChange = (city: string): void => {
    onChange({
      location: {
        ...data.location,
        city,
      },
    })
  }

  const handleDistrictChange = (district: string): void => {
    onChange({
      location: {
        ...data.location,
        district,
      },
    })
  }

  const handleOperatingHoursChange = (
    day: string,
    field: 'open' | 'close' | 'is24Hours',
    value: string | boolean
  ): void => {
    const currentHours = data.operatingHours[day] || {
      open: '08:00',
      close: '22:00',
      is24Hours: false,
    }

    onChange({
      operatingHours: {
        ...data.operatingHours,
        [day]: {
          ...currentHours,
          [field]: value,
        },
      },
    })
  }

  const handleDayClosed = (day: string, isClosed: boolean): void => {
    onChange({
      operatingHours: {
        ...data.operatingHours,
        [day]: isClosed
          ? null
          : { open: '08:00', close: '22:00', is24Hours: false },
      },
    })
  }

  const handleGetCurrentLocation = async (): Promise<void> => {
    setIsGettingLocation(true)
    setLocationError(null)

    try {
      const position = await locationService.getCurrentPosition()
      const address = await locationService.reverseGeocode(position)

      onChange({
        location: {
          ...data.location,
          coordinates: {
            lat: position.latitude,
            lng: position.longitude,
          },
          address: address.formatted || '',
          city: address.city || '',
          district: address.district || '',
        },
      })

      addNotification({
        type: 'success',
        title: 'Location Found',
        message: 'Current location detected successfully',
        duration: 3000,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to get location'
      setLocationError(message)

      addNotification({
        type: 'error',
        title: 'Location Error',
        message,
        duration: 5000,
      })
    } finally {
      setIsGettingLocation(false)
    }
  }

  return (
    <div className='p-4 space-y-6'>
      {/* Café Name */}
      <div>
        <label
          htmlFor='cafe-name'
          className='block text-sm font-medium text-gray-700 mb-2'
        >
          Café Name *
        </label>
        <input
          id='cafe-name'
          type='text'
          value={data.name}
          onChange={e => handleNameChange(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder='Enter café name'
          maxLength={200}
          aria-describedby={errors.name ? 'cafe-name-error' : undefined}
        />
        {errors.name && (
          <p
            id='cafe-name-error'
            className='mt-1 text-sm text-red-600'
            role='alert'
          >
            {errors.name}
          </p>
        )}
      </div>

      {/* Location Section */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-sm font-medium text-gray-700'>Location *</h3>
          <TouchTarget
            variant='secondary'
            onClick={handleGetCurrentLocation}
            disabled={isGettingLocation}
            className='text-xs px-3 py-1'
            ariaLabel='Get current location'
          >
            {isGettingLocation ? 'Getting...' : '📍 Use Current'}
          </TouchTarget>
        </div>

        {locationError && (
          <div className='p-3 bg-red-50 border border-red-200 rounded-lg'>
            <p className='text-sm text-red-600'>{locationError}</p>
          </div>
        )}

        {/* Address */}
        <div>
          <label
            htmlFor='cafe-address'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Street Address *
          </label>
          <textarea
            id='cafe-address'
            value={data.location.address}
            onChange={e => handleAddressChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
              errors.address ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder='Enter full street address'
            rows={2}
            maxLength={500}
            aria-describedby={errors.address ? 'cafe-address-error' : undefined}
          />
          {errors.address && (
            <p
              id='cafe-address-error'
              className='mt-1 text-sm text-red-600'
              role='alert'
            >
              {errors.address}
            </p>
          )}
        </div>

        {/* City */}
        <div>
          <label
            htmlFor='cafe-city'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            City *
          </label>

          {!showCustomCity ? (
            <div className='space-y-2'>
              <select
                id='cafe-city'
                value={
                  COMMON_CITIES.includes(data.location.city)
                    ? data.location.city
                    : ''
                }
                onChange={e => {
                  if (e.target.value === 'other') {
                    setShowCustomCity(true)
                    handleCityChange('')
                  } else {
                    handleCityChange(e.target.value)
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value=''>Select city</option>
                {COMMON_CITIES.map(city => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
                <option value='other'>Other city...</option>
              </select>

              {data.location.city &&
                !COMMON_CITIES.includes(data.location.city) && (
                  <button
                    type='button'
                    onClick={() => setShowCustomCity(true)}
                    className='text-sm text-blue-600 hover:text-blue-800'
                  >
                    Edit "{data.location.city}"
                  </button>
                )}
            </div>
          ) : (
            <div className='space-y-2'>
              <input
                type='text'
                value={data.location.city}
                onChange={e => handleCityChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Enter city name'
                maxLength={100}
              />
              <button
                type='button'
                onClick={() => {
                  setShowCustomCity(false)
                  handleCityChange('')
                }}
                className='text-sm text-gray-600 hover:text-gray-800'
              >
                Choose from list instead
              </button>
            </div>
          )}

          {errors.city && (
            <p className='mt-1 text-sm text-red-600' role='alert'>
              {errors.city}
            </p>
          )}
        </div>

        {/* District (Optional) */}
        <div>
          <label
            htmlFor='cafe-district'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            District / Area <span className='text-gray-500'>(Optional)</span>
          </label>
          <input
            id='cafe-district'
            type='text'
            value={data.location.district || ''}
            onChange={e => handleDistrictChange(e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='e.g., Senayan, Kemang, Ubud'
            maxLength={100}
          />
        </div>
      </div>

      {/* Operating Hours */}
      <div>
        <h3 className='text-sm font-medium text-gray-700 mb-4'>
          Operating Hours
        </h3>
        <div className='space-y-3'>
          {DAYS_OF_WEEK.map(({ key, label }) => {
            const hours = data.operatingHours[key]
            const isClosed = hours === null

            return (
              <div
                key={key}
                className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'
              >
                <div className='w-20 text-sm font-medium text-gray-700'>
                  {label}
                </div>

                <label className='flex items-center'>
                  <input
                    type='checkbox'
                    checked={isClosed}
                    onChange={e => handleDayClosed(key, e.target.checked)}
                    className='mr-2'
                  />
                  <span className='text-sm text-gray-600'>Closed</span>
                </label>

                {!isClosed && hours && (
                  <>
                    <div className='flex items-center gap-2'>
                      <input
                        type='time'
                        value={hours.open}
                        onChange={e =>
                          handleOperatingHoursChange(
                            key,
                            'open',
                            e.target.value
                          )
                        }
                        className='px-2 py-1 border border-gray-300 rounded text-sm'
                        disabled={hours.is24Hours}
                      />
                      <span className='text-sm text-gray-500'>to</span>
                      <input
                        type='time'
                        value={hours.close}
                        onChange={e =>
                          handleOperatingHoursChange(
                            key,
                            'close',
                            e.target.value
                          )
                        }
                        className='px-2 py-1 border border-gray-300 rounded text-sm'
                        disabled={hours.is24Hours}
                      />
                    </div>

                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={hours.is24Hours}
                        onChange={e =>
                          handleOperatingHoursChange(
                            key,
                            'is24Hours',
                            e.target.checked
                          )
                        }
                        className='mr-2'
                      />
                      <span className='text-sm text-gray-600'>24 hours</span>
                    </label>
                  </>
                )}
              </div>
            )
          })}
        </div>

        <div className='mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
          <p className='text-sm text-blue-800'>
            💡 <strong>Tip:</strong> Check the café's website or call to confirm
            current hours. Hours can change due to holidays or special events.
          </p>
        </div>
      </div>
    </div>
  )
}
