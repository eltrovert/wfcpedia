import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddCafeForm } from '../../../src/components/forms/AddCafeForm'
import { TestProviders } from '../../utils/test-utils'

// Mock services
vi.mock('../../../src/services/cafeService', () => ({
  cafeService: {
    addCafe: vi.fn(),
    searchByLocation: vi.fn(),
  },
}))

vi.mock('../../../src/services/storageService', () => ({
  storageService: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}))

vi.mock('../../../src/services/locationService', () => ({
  locationService: {
    getCurrentPosition: vi.fn(),
    reverseGeocode: vi.fn(),
    calculateDistance: vi.fn(),
  },
}))

describe('AddCafeForm', () => {
  const mockOnComplete = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderAddCafeForm = () => {
    return render(
      <TestProviders>
        <AddCafeForm onComplete={mockOnComplete} onCancel={mockOnCancel} />
      </TestProviders>
    )
  }

  describe('Multi-step navigation', () => {
    it('displays the first step (Basic Information) by default', () => {
      renderAddCafeForm()

      expect(
        screen.getByText('Step 1 of 3: Basic Information')
      ).toBeInTheDocument()
      expect(screen.getByLabelText('Café Name *')).toBeInTheDocument()
    })

    it('shows progress bar with correct percentage', () => {
      renderAddCafeForm()

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-valuenow', '33.333333333333336') // Step 1 of 3
    })

    it('has proper accessibility attributes', () => {
      renderAddCafeForm()

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(
        screen.getByLabelText('Form progress: 33% complete')
      ).toBeInTheDocument()
      expect(screen.getByLabelText('Cancel adding café')).toBeInTheDocument()
    })
  })

  describe('Form validation', () => {
    it('prevents navigation to next step with empty required fields', async () => {
      const user = userEvent.setup()
      renderAddCafeForm()

      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)

      // Should show validation errors
      await waitFor(() => {
        expect(
          screen.getByText('Café name must be at least 2 characters')
        ).toBeInTheDocument()
        expect(
          screen.getByText('Address must be at least 5 characters')
        ).toBeInTheDocument()
      })

      // Should remain on first step
      expect(
        screen.getByText('Step 1 of 3: Basic Information')
      ).toBeInTheDocument()
    })

    it('validates minimum character requirements', async () => {
      const user = userEvent.setup()
      renderAddCafeForm()

      const nameInput = screen.getByLabelText('Café Name *')
      const addressInput = screen.getByLabelText('Street Address *')

      await user.type(nameInput, 'A') // Too short
      await user.type(addressInput, 'St') // Too short

      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)

      await waitFor(() => {
        expect(
          screen.getByText('Café name must be at least 2 characters')
        ).toBeInTheDocument()
        expect(
          screen.getByText('Address must be at least 5 characters')
        ).toBeInTheDocument()
      })
    })
  })

  describe('Form persistence', () => {
    it('calls storage service to save form data on changes', async () => {
      const { storageService } = await import(
        '../../../src/services/storageService'
      )
      const user = userEvent.setup()
      renderAddCafeForm()

      const nameInput = screen.getByLabelText('Café Name *')
      await user.type(nameInput, 'Test Café')

      await waitFor(() => {
        expect(storageService.setItem).toHaveBeenCalledWith(
          'add-cafe-draft',
          expect.stringContaining('"name":"Test Café"')
        )
      })
    })
  })

  describe('Cancel functionality', () => {
    it('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      renderAddCafeForm()

      const cancelButton = screen.getByLabelText('Cancel adding café')
      await user.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalledOnce()
    })
  })

  describe('Duplicate detection', () => {
    it('shows duplicate warning when nearby cafes found', async () => {
      const { cafeService } = await import('../../../src/services/cafeService')
      const { locationService } = await import(
        '../../../src/services/locationService'
      )

      vi.mocked(cafeService.searchByLocation).mockResolvedValue([
        {
          id: 'test-cafe-1',
          name: 'Nearby Café',
          location: {
            latitude: 0,
            longitude: 0,
            address: 'Test',
            city: 'Test',
          },
          workMetrics: {
            wifiSpeed: 'fast',
            comfortRating: 4,
            noiseLevel: 'moderate',
            amenities: [],
          },
          operatingHours: {},
          images: [],
          community: {
            loveCount: 0,
            lastUpdated: '',
            contributorId: '',
            verificationStatus: 'unverified',
          },
          createdAt: '',
          updatedAt: '',
        },
      ])

      vi.mocked(locationService.calculateDistance).mockReturnValue(0.05) // 50m away

      const user = userEvent.setup()
      renderAddCafeForm()

      // Fill required fields
      await user.type(screen.getByLabelText('Café Name *'), 'Test Café')
      await user.type(
        screen.getByLabelText('Street Address *'),
        'Test Address 123'
      )
      await user.selectOptions(screen.getByLabelText('City *'), 'Jakarta')

      // Set coordinates to trigger duplicate check
      fireEvent.change(screen.getByLabelText('Street Address *'), {
        target: { value: 'Test Address 123' },
      })

      await waitFor(() => {
        expect(screen.getByText('Similar Café Found')).toBeInTheDocument()
        expect(screen.getByText('Nearby Café')).toBeInTheDocument()
        expect(screen.getByText('50m away')).toBeInTheDocument()
      })
    })
  })
})
