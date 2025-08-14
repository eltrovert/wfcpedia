import { Cafe, WorkMetrics, CafeRating } from '@/types/cafe'

export const mockCafe: Cafe = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Kopi Kenangan Kemang',
  location: {
    latitude: -6.2608,
    longitude: 106.8171,
    address: 'Jl. Kemang Raya No. 123, Jakarta Selatan',
    city: 'Jakarta',
    district: 'Kemang',
  },
  workMetrics: {
    wifiSpeed: 'fast',
    comfortRating: 4,
    noiseLevel: 'moderate',
    amenities: ['wifi', 'power', 'ac', 'toilet'],
  },
  operatingHours: {
    monday: { open: '07:00', close: '22:00' },
    tuesday: { open: '07:00', close: '22:00' },
    wednesday: { open: '07:00', close: '22:00' },
    thursday: { open: '07:00', close: '22:00' },
    friday: { open: '07:00', close: '23:00' },
    saturday: { open: '08:00', close: '23:00' },
    sunday: { open: '08:00', close: '21:00' },
  },
  images: [
    {
      url: 'https://example.com/images/kopi-kenangan-1.jpg',
      thumbnailUrl: 'https://example.com/images/kopi-kenangan-1-thumb.jpg',
      uploadedBy: 'user123',
      uploadedAt: '2024-01-15T10:30:00Z',
    },
  ],
  community: {
    loveCount: 156,
    lastUpdated: '2024-03-10T14:20:00Z',
    contributorId: 'contrib123',
    verificationStatus: 'verified',
  },
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-03-10T14:20:00Z',
}

export const mockCafeList: Cafe[] = [
  mockCafe,
  {
    ...mockCafe,
    id: '123e4567-e89b-12d3-a456-426614174001',
    name: 'Starbucks Plaza Indonesia',
    location: {
      latitude: -6.1944,
      longitude: 106.8229,
      address: 'Plaza Indonesia, Jakarta Pusat',
      city: 'Jakarta',
      district: 'Thamrin',
    },
    workMetrics: {
      wifiSpeed: 'fiber',
      comfortRating: 5,
      noiseLevel: 'lively',
      amenities: ['wifi', 'power', 'ac', 'toilet', 'meeting-room'],
    },
    community: {
      ...mockCafe.community,
      loveCount: 243,
      verificationStatus: 'premium',
    },
  },
  {
    ...mockCafe,
    id: '123e4567-e89b-12d3-a456-426614174002',
    name: 'Warung Kopi Imah',
    location: {
      latitude: -6.9175,
      longitude: 107.6191,
      address: 'Jl. Braga No. 45, Bandung',
      city: 'Bandung',
      district: 'Braga',
    },
    workMetrics: {
      wifiSpeed: 'medium',
      comfortRating: 3,
      noiseLevel: 'quiet',
      amenities: ['wifi', 'power', 'outdoor-seating'],
    },
    community: {
      ...mockCafe.community,
      loveCount: 89,
      verificationStatus: 'unverified',
    },
  },
]

export const mockWorkMetrics: WorkMetrics = mockCafe.workMetrics

// Mock rating data
export const mockCafeRating: CafeRating = {
  ratingId: '123e4567-e89b-12d3-a456-426614174100',
  cafeId: '123e4567-e89b-12d3-a456-426614174000',
  sessionId: 'session-123',
  workMetrics: {
    wifiSpeed: 'fast',
    comfortRating: 4,
    noiseLevel: 'moderate',
    amenities: ['wifi', 'power'],
  },
  comment: 'Great place for working! Fast wifi and comfortable seating.',
  photos: ['https://example.com/images/rating-1.jpg'],
  loveGiven: true,
  ratedAt: '2024-03-15T10:30:00Z',
}

// Factory functions for generating test data
export const createMockCafe = (overrides: Partial<Cafe> = {}): Cafe => ({
  ...mockCafe,
  ...overrides,
  id:
    overrides.id ||
    `123e4567-e89b-12d3-a456-42661417${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')}`,
})

export const createMockCafeList = (count: number = 5): Cafe[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockCafe({
      id: `123e4567-e89b-12d3-a456-42661417${(4000 + index).toString().padStart(4, '0')}`,
      name: `Test Café ${index + 1}`,
      community: {
        ...mockCafe.community,
        loveCount: Math.floor(Math.random() * 200),
      },
    })
  )
}

export const createMockRating = (
  overrides: Partial<CafeRating> = {}
): CafeRating => ({
  ...mockCafeRating,
  ...overrides,
  ratingId:
    overrides.ratingId ||
    `123e4567-e89b-12d3-a456-42661418${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')}`,
})

// Google Sheets API mock responses
export const mockSheetsApiResponse = {
  range: 'Cafes!A2:R1000',
  majorDimension: 'ROWS',
  values: [
    [
      mockCafe.id,
      mockCafe.name,
      mockCafe.location.address,
      mockCafe.location.latitude.toString(),
      mockCafe.location.longitude.toString(),
      mockCafe.location.city,
      mockCafe.location.district || '',
      mockCafe.workMetrics.wifiSpeed,
      mockCafe.workMetrics.comfortRating.toString(),
      mockCafe.workMetrics.noiseLevel,
      JSON.stringify(mockCafe.workMetrics.amenities),
      JSON.stringify(mockCafe.operatingHours),
      JSON.stringify(mockCafe.images),
      mockCafe.community.loveCount.toString(),
      mockCafe.community.contributorId,
      mockCafe.community.verificationStatus,
      mockCafe.createdAt,
      mockCafe.updatedAt,
    ],
  ],
}

export const mockRatingsApiResponse = {
  range: 'Ratings!A2:J1000',
  majorDimension: 'ROWS',
  values: [
    [
      mockCafeRating.ratingId,
      mockCafeRating.cafeId,
      mockCafeRating.sessionId,
      mockCafeRating.workMetrics?.wifiSpeed || '',
      mockCafeRating.workMetrics?.comfortRating?.toString() || '',
      mockCafeRating.workMetrics?.noiseLevel || '',
      mockCafeRating.comment || '',
      JSON.stringify(mockCafeRating.photos || []),
      mockCafeRating.loveGiven.toString(),
      mockCafeRating.ratedAt,
    ],
  ],
}
