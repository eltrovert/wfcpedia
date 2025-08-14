import { Cafe, WorkMetrics } from '@/types/cafe'

export const mockCafe: Cafe = {
  id: 'cafe-001',
  name: 'Kopi Kenangan Kemang',
  address: 'Jl. Kemang Raya No. 123, Jakarta Selatan',
  city: 'Jakarta',
  location: {
    latitude: -6.2608,
    longitude: 106.8171,
  },
  workMetrics: {
    wifiSpeed: 'fast',
    powerOutlets: 8,
    noiseLevel: 'moderate',
    comfortRating: 4,
    crowdedness: 'medium',
    workFriendliness: 5,
  },
  amenities: ['wifi', 'power', 'ac', 'toilet'],
  images: ['/images/kopi-kenangan-1.jpg', '/images/kopi-kenangan-2.jpg'],
  openingHours: {
    monday: { open: '07:00', close: '22:00' },
    tuesday: { open: '07:00', close: '22:00' },
    wednesday: { open: '07:00', close: '22:00' },
    thursday: { open: '07:00', close: '22:00' },
    friday: { open: '07:00', close: '23:00' },
    saturday: { open: '08:00', close: '23:00' },
    sunday: { open: '08:00', close: '21:00' },
  },
  priceRange: 'budget',
  rating: 4.2,
  reviewCount: 156,
  tags: ['coffee', 'coworking', 'instagram-worthy'],
  description:
    'Spacious café with reliable WiFi and plenty of power outlets, perfect for remote work.',
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-03-10T14:20:00Z',
}

export const mockCafeList: Cafe[] = [
  mockCafe,
  {
    ...mockCafe,
    id: 'cafe-002',
    name: 'Starbucks Plaza Indonesia',
    address: 'Plaza Indonesia, Jakarta Pusat',
    city: 'Jakarta',
    location: {
      latitude: -6.1944,
      longitude: 106.8229,
    },
    workMetrics: {
      ...mockCafe.workMetrics,
      wifiSpeed: 'fiber',
      comfortRating: 5,
      crowdedness: 'high',
    },
    priceRange: 'premium',
    rating: 4.5,
  },
  {
    ...mockCafe,
    id: 'cafe-003',
    name: 'Warung Kopi Imah',
    address: 'Jl. Braga No. 45, Bandung',
    city: 'Bandung',
    location: {
      latitude: -6.9175,
      longitude: 107.6191,
    },
    workMetrics: {
      ...mockCafe.workMetrics,
      wifiSpeed: 'medium',
      comfortRating: 3,
      crowdedness: 'low',
    },
    priceRange: 'budget',
    rating: 3.8,
  },
]

export const mockWorkMetrics: WorkMetrics = mockCafe.workMetrics

// Factory functions for generating test data
export const createMockCafe = (overrides: Partial<Cafe> = {}): Cafe => ({
  ...mockCafe,
  ...overrides,
  id: overrides.id || `cafe-${Math.random().toString(36).substr(2, 9)}`,
})

export const createMockCafeList = (count: number = 5): Cafe[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockCafe({
      id: `cafe-${index + 1}`,
      name: `Test Café ${index + 1}`,
      rating: 3 + Math.random() * 2, // 3-5 rating range
    })
  )
}

// Google Sheets API mock responses
export const mockSheetsApiResponse = {
  range: 'A1:Z100',
  majorDimension: 'ROWS',
  values: [
    // Headers
    [
      'id',
      'name',
      'address',
      'city',
      'latitude',
      'longitude',
      'wifi_speed',
      'power_outlets',
      'rating',
    ],
    // Data rows
    [
      mockCafe.id,
      mockCafe.name,
      mockCafe.address,
      mockCafe.city,
      mockCafe.location.latitude.toString(),
      mockCafe.location.longitude.toString(),
      mockCafe.workMetrics.wifiSpeed,
      mockCafe.workMetrics.powerOutlets.toString(),
      mockCafe.rating.toString(),
    ],
  ],
}
