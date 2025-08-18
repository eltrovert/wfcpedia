import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BasicInfoStep } from '../../../src/components/forms/BasicInfoStep'
import { TestProviders } from '../../utils/test-utils'
import type { NewCafeSubmission } from '../../../src/components/forms/AddCafeForm'

// Mock services
vi.mock('../../../src/services/locationService', () => ({
  locationService: {
    getCurrentPosition: vi.fn(),
    reverseGeocode: vi.fn(),
  },
}))

describe('BasicInfoStep', () => {
  const mockData: NewCafeSubmission = {
    name: '',
    location: {
      address: '',
      coordinates: { lat: 0, lng: 0 },
      city: '',
      district: '',
    },
    workMetrics: {
      wifiSpeed: 'medium',
      comfortRating: 3,
      noiseLevel: 'moderate',
      amenities: [],
    },
    operatingHours: {
      monday: { open: '08:00', close: '22:00', is24Hours: false },
      tuesday: { open: '08:00', close: '22:00', is24Hours: false },
      wednesday: { open: '08:00', close: '22:00', is24Hours: false },
      thursday: { open: '08:00', close: '22:00', is24Hours: false },
      friday: { open: '08:00', close: '22:00', is24Hours: false },
      saturday: { open: '08:00', close: '22:00', is24Hours: false },
      sunday: { open: '08:00', close: '22:00', is24Hours: false },
    },
    images: [],
  }

  const mockOnChange = vi.fn()
  const mockOnValidate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderBasicInfoStep = (data = mockData, errors = {}) => {
    return render(
      <TestProviders>
        <BasicInfoStep
          data={data}
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          errors={errors}
        />
      </TestProviders>
    )
  }

  describe('Café name input', () => {
    it('renders café name input with proper labels', () => {
      renderBasicInfoStep()

      expect(screen.getByLabelText('Café Name *')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter café name')).toBeInTheDocument()
    })

    it('calls onChange when café name is updated', async () => {
      const user = userEvent.setup()
      renderBasicInfoStep()

      const nameInput = screen.getByLabelText('Café Name *')
      await user.type(nameInput, 'New Café')

      expect(mockOnChange).toHaveBeenCalledWith({
        name: 'New Café',
      })
    })

    it('displays error message for invalid name', () => {
      renderBasicInfoStep(mockData, { name: 'Name is required' })

      expect(screen.getByText('Name is required')).toBeInTheDocument()
      expect(screen.getByLabelText('Café Name *')).toHaveClass('border-red-500')
    })
  })

  describe('Location inputs', () => {
    it('renders all location fields', () => {
      renderBasicInfoStep()

      expect(screen.getByLabelText('Street Address *')).toBeInTheDocument()
      expect(screen.getByLabelText('City *')).toBeInTheDocument()
      expect(
        screen.getByLabelText('District / Area (Optional)')
      ).toBeInTheDocument()
    })

    it('provides city dropdown with Indonesian cities', () => {
      renderBasicInfoStep()

      const citySelect = screen.getByLabelText('City *')
      expect(citySelect).toBeInTheDocument()

      const jakartaOption = screen.getByRole('option', { name: 'Jakarta' })
      const bandungOption = screen.getByRole('option', { name: 'Bandung' })

      expect(jakartaOption).toBeInTheDocument()
      expect(bandungOption).toBeInTheDocument()
    })

    it('allows custom city input', async () => {
      const user = userEvent.setup()
      renderBasicInfoStep()

      const citySelect = screen.getByLabelText('City *')
      await user.selectOptions(citySelect, 'other')

      await waitFor(() => {
        expect(screen.getByDisplayValue('')).toBeInTheDocument()
        expect(
          screen.getByPlaceholderText('Enter city name')
        ).toBeInTheDocument()
      })
    })

    it('calls onChange when address is updated', async () => {
      const user = userEvent.setup()
      renderBasicInfoStep()

      const addressInput = screen.getByLabelText('Street Address *')
      await user.type(addressInput, 'Jl. Test 123')

      expect(mockOnChange).toHaveBeenCalledWith({
        location: {
          ...mockData.location,
          address: 'Jl. Test 123',
        },
      })
    })
  })

  describe('Current location functionality', () => {
    it('renders get current location button', () => {
      renderBasicInfoStep()

      expect(screen.getByLabelText('Get current location')).toBeInTheDocument()
      expect(screen.getByText('📍 Use Current')).toBeInTheDocument()
    })

    it('shows loading state when getting location', async () => {
      const { locationService } = await import(
        '../../../src/services/locationService'
      )
      vi.mocked(locationService.getCurrentPosition).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      )

      const user = userEvent.setup()
      renderBasicInfoStep()

      const locationButton = screen.getByLabelText('Get current location')
      await user.click(locationButton)

      expect(screen.getByText('Getting...')).toBeInTheDocument()
      expect(locationButton).toBeDisabled()
    })

    it('updates location data when current position is retrieved', async () => {
      const { locationService } = await import(
        '../../../src/services/locationService'
      )

      vi.mocked(locationService.getCurrentPosition).mockResolvedValue({
        latitude: -6.2088,
        longitude: 106.8456,
      })

      vi.mocked(locationService.reverseGeocode).mockResolvedValue({
        formatted: 'Jl. Test, Jakarta',
        city: 'Jakarta',
        district: 'Central Jakarta',
      })

      const user = userEvent.setup()
      renderBasicInfoStep()

      const locationButton = screen.getByLabelText('Get current location')
      await user.click(locationButton)

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith({
          location: {
            ...mockData.location,
            coordinates: { lat: -6.2088, lng: 106.8456 },
            address: 'Jl. Test, Jakarta',
            city: 'Jakarta',
            district: 'Central Jakarta',
          },
        })
      })
    })
  })

  describe('Operating hours', () => {
    it('renders operating hours for all days', () => {
      renderBasicInfoStep()

      expect(screen.getByText('Monday')).toBeInTheDocument()
      expect(screen.getByText('Tuesday')).toBeInTheDocument()
      expect(screen.getByText('Wednesday')).toBeInTheDocument()
      expect(screen.getByText('Thursday')).toBeInTheDocument()
      expect(screen.getByText('Friday')).toBeInTheDocument()
      expect(screen.getByText('Saturday')).toBeInTheDocument()
      expect(screen.getByText('Sunday')).toBeInTheDocument()
    })

    it('allows marking a day as closed', async () => {
      const user = userEvent.setup()
      renderBasicInfoStep()

      const sundayClosedCheckbox = screen.getAllByRole('checkbox')[0] // First checkbox for Sunday
      await user.click(sundayClosedCheckbox)

      expect(mockOnChange).toHaveBeenCalledWith({
        operatingHours: {
          ...mockData.operatingHours,
          sunday: null,
        },
      })
    })

    it('supports 24-hour operation', async () => {
      const user = userEvent.setup()
      renderBasicInfoStep()

      const twentyFourHourCheckbox = screen
        .getAllByText('24 hours')[0]
        .parentElement?.querySelector('input')
      expect(twentyFourHourCheckbox).toBeInTheDocument()

      if (twentyFourHourCheckbox) {
        await user.click(twentyFourHourCheckbox)

        expect(mockOnChange).toHaveBeenCalledWith({
          operatingHours: {
            ...mockData.operatingHours,
            monday: { open: '08:00', close: '22:00', is24Hours: true },
          },
        })
      }
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels and descriptions', () => {
      renderBasicInfoStep(mockData, {
        name: 'Name error',
        address: 'Address error',
      })

      const nameInput = screen.getByLabelText('Café Name *')
      const addressInput = screen.getByLabelText('Street Address *')

      expect(nameInput).toHaveAttribute('aria-describedby', 'cafe-name-error')
      expect(addressInput).toHaveAttribute(
        'aria-describedby',
        'cafe-address-error'
      )

      expect(
        screen.getByRole('alert', { name: 'Name error' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('alert', { name: 'Address error' })
      ).toBeInTheDocument()
    })

    it('supports keyboard navigation', () => {
      renderBasicInfoStep()

      const inputs = screen.getAllByRole('textbox')
      const selects = screen.getAllByRole('combobox')
      const checkboxes = screen.getAllByRole('checkbox')

      // All interactive elements should be focusable
      inputs.forEach(input => {
        expect(input).not.toHaveAttribute('tabindex', '-1')
      })

      selects.forEach(select => {
        expect(select).not.toHaveAttribute('tabindex', '-1')
      })

      checkboxes.forEach(checkbox => {
        expect(checkbox).not.toHaveAttribute('tabindex', '-1')
      })
    })
  })
})
