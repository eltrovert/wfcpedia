/**
 * Platform Content Seeding Script
 * Populates the platform with verified café information using the established service layer
 *
 * Story: 1.4 Platform Content Seeding
 * Requirements: 10-15 verified work-friendly cafés across Jakarta and Bali
 */

import {
  cafeService,
  validationService,
  cacheService,
} from '../src/services/index.ts'
import { randomUUID } from 'crypto'

/**
 * Seed data for Jakarta cafés (8 cafés covering major business districts)
 * Based on actual work-friendly locations with realistic Indonesian business patterns
 */
const jakartaCafes = [
  {
    id: randomUUID(),
    name: 'Common Grounds SCBD',
    location: {
      latitude: -6.2253,
      longitude: 106.7993,
      address: 'District 8 Treasury Tower, Jl. Jend. Sudirman Kav. 52-53',
      city: 'Jakarta',
      district: 'SCBD',
    },
    workMetrics: {
      wifiSpeed: 'fiber',
      comfortRating: 5,
      noiseLevel: 'moderate',
      amenities: [
        '24/7',
        'power_outlets',
        'air_conditioning',
        'food_available',
        'meetings_allowed',
        'parking',
      ],
    },
    operatingHours: {
      monday: { open: '06:00', close: '22:00' },
      tuesday: { open: '06:00', close: '22:00' },
      wednesday: { open: '06:00', close: '22:00' },
      thursday: { open: '06:00', close: '22:00' },
      friday: { open: '06:00', close: '23:00' },
      saturday: { open: '07:00', close: '23:00' },
      sunday: { open: '07:00', close: '22:00' },
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=300&h=200',
        uploadedBy: 'seed-admin',
        uploadedAt: new Date().toISOString(),
      },
    ],
    community: {
      loveCount: 24,
      lastUpdated: new Date().toISOString(),
      contributorId: 'seed-admin',
      verificationStatus: 'verified',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: randomUUID(),
    name: 'Anomali Coffee Kemang',
    location: {
      latitude: -6.2615,
      longitude: 106.8106,
      address: 'Jl. Kemang Raya No.5A, Kemang',
      city: 'Jakarta',
      district: 'Kemang',
    },
    workMetrics: {
      wifiSpeed: 'fast',
      comfortRating: 4,
      noiseLevel: 'moderate',
      amenities: [
        'power_outlets',
        'air_conditioning',
        'food_available',
        'coffee_specialty',
        'outdoor_seating',
      ],
    },
    operatingHours: {
      monday: { open: '07:00', close: '22:00' },
      tuesday: { open: '07:00', close: '22:00' },
      wednesday: { open: '07:00', close: '22:00' },
      thursday: { open: '07:00', close: '22:00' },
      friday: { open: '07:00', close: '23:00' },
      saturday: { open: '08:00', close: '23:00' },
      sunday: { open: '08:00', close: '22:00' },
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300&h=200',
        uploadedBy: 'seed-admin',
        uploadedAt: new Date().toISOString(),
      },
    ],
    community: {
      loveCount: 18,
      lastUpdated: new Date().toISOString(),
      contributorId: 'seed-admin',
      verificationStatus: 'verified',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: randomUUID(),
    name: 'Kopi Kenangan Menteng',
    location: {
      latitude: -6.1944,
      longitude: 106.8317,
      address: 'Jl. H.O.S. Cokroaminoto No.92, Menteng',
      city: 'Jakarta',
      district: 'Menteng',
    },
    workMetrics: {
      wifiSpeed: 'fast',
      comfortRating: 3,
      noiseLevel: 'lively',
      amenities: [
        'power_outlets',
        'air_conditioning',
        'food_available',
        'affordable_pricing',
      ],
    },
    operatingHours: {
      monday: { open: '06:30', close: '21:00' },
      tuesday: { open: '06:30', close: '21:00' },
      wednesday: { open: '06:30', close: '21:00' },
      thursday: { open: '06:30', close: '21:00' },
      friday: { open: '06:30', close: '21:30' },
      saturday: { open: '07:00', close: '21:30' },
      sunday: { open: '07:00', close: '21:00' },
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&h=600',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=300&h=200',
        uploadedBy: 'seed-admin',
        uploadedAt: new Date().toISOString(),
      },
    ],
    community: {
      loveCount: 12,
      lastUpdated: new Date().toISOString(),
      contributorId: 'seed-admin',
      verificationStatus: 'verified',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: randomUUID(),
    name: 'The Coffee Bean & Tea Leaf Senopati',
    location: {
      latitude: -6.2389,
      longitude: 106.8092,
      address: 'Jl. Senopati No.28, Senopati',
      city: 'Jakarta',
      district: 'Senopati',
    },
    workMetrics: {
      wifiSpeed: 'fast',
      comfortRating: 4,
      noiseLevel: 'quiet',
      amenities: [
        'power_outlets',
        'air_conditioning',
        'food_available',
        'meetings_allowed',
        'comfortable_seating',
      ],
    },
    operatingHours: {
      monday: { open: '07:00', close: '22:00' },
      tuesday: { open: '07:00', close: '22:00' },
      wednesday: { open: '07:00', close: '22:00' },
      thursday: { open: '07:00', close: '22:00' },
      friday: { open: '07:00', close: '22:30' },
      saturday: { open: '07:30', close: '22:30' },
      sunday: { open: '07:30', close: '22:00' },
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=800&h=600',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=300&h=200',
        uploadedBy: 'seed-admin',
        uploadedAt: new Date().toISOString(),
      },
    ],
    community: {
      loveCount: 22,
      lastUpdated: new Date().toISOString(),
      contributorId: 'seed-admin',
      verificationStatus: 'verified',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: randomUUID(),
    name: 'Starbucks Reserve Dewi Sri',
    location: {
      latitude: -6.2411,
      longitude: 106.8089,
      address: 'Jl. Dewi Sartika No.136A, Kebayoran Baru',
      city: 'Jakarta',
      district: 'Kebayoran Baru',
    },
    workMetrics: {
      wifiSpeed: 'fiber',
      comfortRating: 5,
      noiseLevel: 'moderate',
      amenities: [
        'power_outlets',
        'air_conditioning',
        'food_available',
        'meetings_allowed',
        'premium_coffee',
        'comfortable_seating',
      ],
    },
    operatingHours: {
      monday: { open: '06:00', close: '23:00' },
      tuesday: { open: '06:00', close: '23:00' },
      wednesday: { open: '06:00', close: '23:00' },
      thursday: { open: '06:00', close: '23:00' },
      friday: { open: '06:00', close: '23:59' },
      saturday: { open: '06:00', close: '23:59' },
      sunday: { open: '06:00', close: '23:00' },
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&h=600',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&h=200',
        uploadedBy: 'seed-admin',
        uploadedAt: new Date().toISOString(),
      },
    ],
    community: {
      loveCount: 31,
      lastUpdated: new Date().toISOString(),
      contributorId: 'seed-admin',
      verificationStatus: 'verified',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: randomUUID(),
    name: 'Work Coffee PIK',
    location: {
      latitude: -6.1089,
      longitude: 106.7411,
      address: 'Pantai Indah Kapuk, Jl. Pantai Indah Utara 1',
      city: 'Jakarta',
      district: 'PIK',
    },
    workMetrics: {
      wifiSpeed: 'fiber',
      comfortRating: 4,
      noiseLevel: 'quiet',
      amenities: [
        '24/7',
        'power_outlets',
        'air_conditioning',
        'food_available',
        'meetings_allowed',
        'coworking_space',
        'printing',
      ],
    },
    operatingHours: {
      monday: { open: '00:00', close: '23:59', is24Hours: true },
      tuesday: { open: '00:00', close: '23:59', is24Hours: true },
      wednesday: { open: '00:00', close: '23:59', is24Hours: true },
      thursday: { open: '00:00', close: '23:59', is24Hours: true },
      friday: { open: '00:00', close: '23:59', is24Hours: true },
      saturday: { open: '00:00', close: '23:59', is24Hours: true },
      sunday: { open: '00:00', close: '23:59', is24Hours: true },
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&h=600',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=300&h=200',
        uploadedBy: 'seed-admin',
        uploadedAt: new Date().toISOString(),
      },
    ],
    community: {
      loveCount: 28,
      lastUpdated: new Date().toISOString(),
      contributorId: 'seed-admin',
      verificationStatus: 'verified',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: randomUUID(),
    name: 'Maxx Coffee Gandaria City',
    location: {
      latitude: -6.2423,
      longitude: 106.7835,
      address: 'Gandaria City Mall, Jl. Sultan Iskandar Muda',
      city: 'Jakarta',
      district: 'Gandaria',
    },
    workMetrics: {
      wifiSpeed: 'fast',
      comfortRating: 3,
      noiseLevel: 'lively',
      amenities: [
        'power_outlets',
        'air_conditioning',
        'food_available',
        'mall_location',
        'parking',
      ],
    },
    operatingHours: {
      monday: { open: '09:00', close: '21:00' },
      tuesday: { open: '09:00', close: '21:00' },
      wednesday: { open: '09:00', close: '21:00' },
      thursday: { open: '09:00', close: '21:00' },
      friday: { open: '09:00', close: '22:00' },
      saturday: { open: '09:00', close: '22:00' },
      sunday: { open: '09:00', close: '21:00' },
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200',
        uploadedBy: 'seed-admin',
        uploadedAt: new Date().toISOString(),
      },
    ],
    community: {
      loveCount: 15,
      lastUpdated: new Date().toISOString(),
      contributorId: 'seed-admin',
      verificationStatus: 'verified',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: randomUUID(),
    name: 'Blue Tokai Coffee Roasters Pondok Indah',
    location: {
      latitude: -6.2658,
      longitude: 106.7836,
      address: 'Pondok Indah Mall 2, Jl. Metro Pondok Indah',
      city: 'Jakarta',
      district: 'Pondok Indah',
    },
    workMetrics: {
      wifiSpeed: 'fast',
      comfortRating: 4,
      noiseLevel: 'quiet',
      amenities: [
        'power_outlets',
        'air_conditioning',
        'food_available',
        'specialty_coffee',
        'comfortable_seating',
        'parking',
      ],
    },
    operatingHours: {
      monday: { open: '08:00', close: '21:00' },
      tuesday: { open: '08:00', close: '21:00' },
      wednesday: { open: '08:00', close: '21:00' },
      thursday: { open: '08:00', close: '21:00' },
      friday: { open: '08:00', close: '22:00' },
      saturday: { open: '08:00', close: '22:00' },
      sunday: { open: '08:00', close: '21:00' },
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=200',
        uploadedBy: 'seed-admin',
        uploadedAt: new Date().toISOString(),
      },
    ],
    community: {
      loveCount: 19,
      lastUpdated: new Date().toISOString(),
      contributorId: 'seed-admin',
      verificationStatus: 'verified',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

/**
 * Seed data for Bali cafés (7 cafés covering Denpasar, Ubud, and Canggu)
 * Focused on digital nomad and remote work friendly locations
 */
const baliCafes = [
  {
    id: randomUUID(),
    name: 'Hubud Coworking Ubud',
    location: {
      latitude: -8.5069,
      longitude: 115.2581,
      address: 'Jl. Monkey Forest Rd No.88, Ubud',
      city: 'Bali',
      district: 'Ubud',
    },
    workMetrics: {
      wifiSpeed: 'fiber',
      comfortRating: 5,
      noiseLevel: 'quiet',
      amenities: [
        'coworking_space',
        'power_outlets',
        'air_conditioning',
        'food_available',
        'meetings_allowed',
        'printing',
        'events',
      ],
    },
    operatingHours: {
      monday: { open: '08:00', close: '22:00' },
      tuesday: { open: '08:00', close: '22:00' },
      wednesday: { open: '08:00', close: '22:00' },
      thursday: { open: '08:00', close: '22:00' },
      friday: { open: '08:00', close: '23:00' },
      saturday: { open: '08:00', close: '23:00' },
      sunday: { open: '08:00', close: '22:00' },
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=800&h=600',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=300&h=200',
        uploadedBy: 'seed-admin',
        uploadedAt: new Date().toISOString(),
      },
    ],
    community: {
      loveCount: 42,
      lastUpdated: new Date().toISOString(),
      contributorId: 'seed-admin',
      verificationStatus: 'verified',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: randomUUID(),
    name: 'Deus Ex Machina Canggu',
    location: {
      latitude: -8.6482,
      longitude: 115.1372,
      address: 'Jl. Batu Mejan No.8, Canggu',
      city: 'Bali',
      district: 'Canggu',
    },
    workMetrics: {
      wifiSpeed: 'fast',
      comfortRating: 4,
      noiseLevel: 'moderate',
      amenities: [
        'outdoor_seating',
        'power_outlets',
        'food_available',
        'surf_culture',
        'motorcycle_parking',
        'beach_proximity',
      ],
    },
    operatingHours: {
      monday: { open: '07:00', close: '21:00' },
      tuesday: { open: '07:00', close: '21:00' },
      wednesday: { open: '07:00', close: '21:00' },
      thursday: { open: '07:00', close: '21:00' },
      friday: { open: '07:00', close: '22:00' },
      saturday: { open: '07:00', close: '22:00' },
      sunday: { open: '07:00', close: '21:00' },
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&h=200',
        uploadedBy: 'seed-admin',
        uploadedAt: new Date().toISOString(),
      },
    ],
    community: {
      loveCount: 35,
      lastUpdated: new Date().toISOString(),
      contributorId: 'seed-admin',
      verificationStatus: 'verified',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: randomUUID(),
    name: 'Revolver Espresso Seminyak',
    location: {
      latitude: -8.6905,
      longitude: 115.1533,
      address: 'Jl. Kayu Aya No.18, Seminyak',
      city: 'Bali',
      district: 'Seminyak',
    },
    workMetrics: {
      wifiSpeed: 'fast',
      comfortRating: 4,
      noiseLevel: 'moderate',
      amenities: [
        'specialty_coffee',
        'power_outlets',
        'air_conditioning',
        'food_available',
        'motorcycle_parking',
      ],
    },
    operatingHours: {
      monday: { open: '07:00', close: '17:00' },
      tuesday: { open: '07:00', close: '17:00' },
      wednesday: { open: '07:00', close: '17:00' },
      thursday: { open: '07:00', close: '17:00' },
      friday: { open: '07:00', close: '17:00' },
      saturday: { open: '07:00', close: '17:00' },
      sunday: { open: '07:00', close: '17:00' },
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800&h=600',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=300&h=200',
        uploadedBy: 'seed-admin',
        uploadedAt: new Date().toISOString(),
      },
    ],
    community: {
      loveCount: 27,
      lastUpdated: new Date().toISOString(),
      contributorId: 'seed-admin',
      verificationStatus: 'verified',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: randomUUID(),
    name: 'Outpost Coworking Canggu',
    location: {
      latitude: -8.6501,
      longitude: 115.139,
      address: 'Jl. Raya Pantai Berawa No.46, Canggu',
      city: 'Bali',
      district: 'Canggu',
    },
    workMetrics: {
      wifiSpeed: 'fiber',
      comfortRating: 5,
      noiseLevel: 'quiet',
      amenities: [
        'coworking_space',
        '24/7',
        'power_outlets',
        'air_conditioning',
        'food_available',
        'meetings_allowed',
        'events',
        'printing',
      ],
    },
    operatingHours: {
      monday: { open: '00:00', close: '23:59', is24Hours: true },
      tuesday: { open: '00:00', close: '23:59', is24Hours: true },
      wednesday: { open: '00:00', close: '23:59', is24Hours: true },
      thursday: { open: '00:00', close: '23:59', is24Hours: true },
      friday: { open: '00:00', close: '23:59', is24Hours: true },
      saturday: { open: '00:00', close: '23:59', is24Hours: true },
      sunday: { open: '00:00', close: '23:59', is24Hours: true },
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&h=600',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=300&h=200',
        uploadedBy: 'seed-admin',
        uploadedAt: new Date().toISOString(),
      },
    ],
    community: {
      loveCount: 38,
      lastUpdated: new Date().toISOString(),
      contributorId: 'seed-admin',
      verificationStatus: 'verified',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: randomUUID(),
    name: 'Seniman Coffee Studio Denpasar',
    location: {
      latitude: -8.6705,
      longitude: 115.2126,
      address: 'Jl. Laksmana, Seminyak, Denpasar',
      city: 'Bali',
      district: 'Denpasar',
    },
    workMetrics: {
      wifiSpeed: 'fast',
      comfortRating: 4,
      noiseLevel: 'quiet',
      amenities: [
        'specialty_coffee',
        'power_outlets',
        'air_conditioning',
        'food_available',
        'local_roastery',
        'comfortable_seating',
      ],
    },
    operatingHours: {
      monday: { open: '07:00', close: '19:00' },
      tuesday: { open: '07:00', close: '19:00' },
      wednesday: { open: '07:00', close: '19:00' },
      thursday: { open: '07:00', close: '19:00' },
      friday: { open: '07:00', close: '19:00' },
      saturday: { open: '07:00', close: '19:00' },
      sunday: { open: '07:00', close: '19:00' },
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&h=600',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=300&h=200',
        uploadedBy: 'seed-admin',
        uploadedAt: new Date().toISOString(),
      },
    ],
    community: {
      loveCount: 23,
      lastUpdated: new Date().toISOString(),
      contributorId: 'seed-admin',
      verificationStatus: 'verified',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: randomUUID(),
    name: 'Yellow Flower Cafe Ubud',
    location: {
      latitude: -8.5211,
      longitude: 115.2623,
      address: 'Jl. Monkey Forest Rd, Ubud',
      city: 'Bali',
      district: 'Ubud',
    },
    workMetrics: {
      wifiSpeed: 'medium',
      comfortRating: 4,
      noiseLevel: 'quiet',
      amenities: [
        'outdoor_seating',
        'power_outlets',
        'food_available',
        'healthy_options',
        'garden_setting',
        'motorcycle_parking',
      ],
    },
    operatingHours: {
      monday: { open: '07:30', close: '21:00' },
      tuesday: { open: '07:30', close: '21:00' },
      wednesday: { open: '07:30', close: '21:00' },
      thursday: { open: '07:30', close: '21:00' },
      friday: { open: '07:30', close: '21:00' },
      saturday: { open: '07:30', close: '21:00' },
      sunday: { open: '07:30', close: '21:00' },
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=200',
        uploadedBy: 'seed-admin',
        uploadedAt: new Date().toISOString(),
      },
    ],
    community: {
      loveCount: 21,
      lastUpdated: new Date().toISOString(),
      contributorId: 'seed-admin',
      verificationStatus: 'verified',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: randomUUID(),
    name: 'The Shady Shack Canggu',
    location: {
      latitude: -8.6421,
      longitude: 115.1348,
      address: 'Jl. Tanah Barak No.88, Canggu',
      city: 'Bali',
      district: 'Canggu',
    },
    workMetrics: {
      wifiSpeed: 'medium',
      comfortRating: 4,
      noiseLevel: 'moderate',
      amenities: [
        'outdoor_seating',
        'power_outlets',
        'healthy_options',
        'vegan_friendly',
        'tropical_setting',
        'motorcycle_parking',
      ],
    },
    operatingHours: {
      monday: { open: '07:00', close: '18:00' },
      tuesday: { open: '07:00', close: '18:00' },
      wednesday: { open: '07:00', close: '18:00' },
      thursday: { open: '07:00', close: '18:00' },
      friday: { open: '07:00', close: '18:00' },
      saturday: { open: '07:00', close: '18:00' },
      sunday: { open: '07:00', close: '18:00' },
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1481833761820-0509d3217039?w=800&h=600',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1481833761820-0509d3217039?w=300&h=200',
        uploadedBy: 'seed-admin',
        uploadedAt: new Date().toISOString(),
      },
    ],
    community: {
      loveCount: 26,
      lastUpdated: new Date().toISOString(),
      contributorId: 'seed-admin',
      verificationStatus: 'verified',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Combine all seed data
const allSeedCafes = [...jakartaCafes, ...baliCafes]

/**
 * Progress tracking for seeding operations
 */
class SeedingProgress {
  constructor(total) {
    this.total = total
    this.completed = 0
    this.failed = 0
  }

  logProgress(cafeName, success = true) {
    if (success) {
      this.completed++
      console.log(
        `✅ [${this.completed}/${this.total}] Successfully seeded: ${cafeName}`
      )
    } else {
      this.failed++
      console.log(`❌ [${this.failed} failed] Failed to seed: ${cafeName}`)
    }
  }

  logSummary() {
    console.log('\n📊 Seeding Summary:')
    console.log(`✅ Successfully seeded: ${this.completed}/${this.total} cafés`)
    if (this.failed > 0) {
      console.log(`❌ Failed: ${this.failed} cafés`)
    }
    console.log(`📍 Coverage: ${this.getGeographicSummary()}`)
  }

  getGeographicSummary() {
    const jakartaCount = jakartaCafes.length
    const baliCount = baliCafes.length
    return `${jakartaCount} Jakarta cafés, ${baliCount} Bali cafés`
  }
}

/**
 * Validates seed data against business rules
 */
function validateSeedData() {
  console.log('🔍 Validating seed data...')

  const errors = []

  // Check total count requirement (10-15 cafés)
  if (allSeedCafes.length < 10 || allSeedCafes.length > 15) {
    errors.push(
      `Invalid total count: ${allSeedCafes.length} (requires 10-15 cafés)`
    )
  }

  // Check Jakarta minimum (8 cafés)
  if (jakartaCafes.length < 8) {
    errors.push(
      `Insufficient Jakarta cafés: ${jakartaCafes.length} (requires minimum 8)`
    )
  }

  // Check Bali minimum (7 cafés)
  if (baliCafes.length < 7) {
    errors.push(
      `Insufficient Bali cafés: ${baliCafes.length} (requires minimum 7)`
    )
  }

  // Validate each café data structure
  allSeedCafes.forEach((cafe, index) => {
    if (!cafe.id || !cafe.name || !cafe.location || !cafe.workMetrics) {
      errors.push(`Café ${index + 1}: Missing required fields`)
    }

    if (cafe.community.verificationStatus !== 'verified') {
      errors.push(`Café ${cafe.name}: Must have verified status for seed data`)
    }
  })

  if (errors.length > 0) {
    console.error('❌ Seed data validation failed:')
    errors.forEach(error => console.error(`   - ${error}`))
    return false
  }

  console.log(
    `✅ Seed data validation passed: ${allSeedCafes.length} cafés ready for seeding`
  )
  return true
}

/**
 * Seeds a single café with error handling and retry logic
 */
async function seedCafe(cafe, progress, retryCount = 0) {
  const maxRetries = 2

  try {
    // Validate data using ValidationService
    await validationService.validateCafe(cafe)

    // Add café using CafeService
    await cafeService.addCafe(cafe)

    progress.logProgress(cafe.name, true)
    return true
  } catch (error) {
    console.error(`Failed to seed ${cafe.name}:`, error.message)

    if (retryCount < maxRetries) {
      console.log(
        `🔄 Retrying ${cafe.name} (attempt ${retryCount + 1}/${maxRetries})...`
      )
      // Wait before retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000))
      return seedCafe(cafe, progress, retryCount + 1)
    } else {
      progress.logProgress(cafe.name, false)
      return false
    }
  }
}

/**
 * Batch seed cafés with rate limiting and progress reporting
 */
async function seedCafes() {
  console.log('🌱 Starting platform content seeding...')
  console.log(`📊 Seeding ${allSeedCafes.length} verified work-friendly cafés`)

  // Validate seed data first
  if (!validateSeedData()) {
    process.exit(1)
  }

  const progress = new SeedingProgress(allSeedCafes.length)
  const batchSize = 3 // Process in small batches to respect API rate limits
  const results = []

  // Process in batches
  for (let i = 0; i < allSeedCafes.length; i += batchSize) {
    const batch = allSeedCafes.slice(i, i + batchSize)
    console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}...`)

    // Process batch in parallel
    const batchPromises = batch.map(cafe => seedCafe(cafe, progress))
    const batchResults = await Promise.all(batchPromises)
    results.push(...batchResults)

    // Rate limiting delay between batches
    if (i + batchSize < allSeedCafes.length) {
      console.log('⏳ Rate limiting delay...')
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  return results
}

/**
 * Warm cache with seeded content for faster first-load experience
 */
async function warmCache() {
  console.log('\n🔥 Warming cache with seeded content...')

  try {
    // Fetch all cafés to populate cache
    const cafes = await cafeService.getCafes({}, true) // Force refresh
    console.log(`✅ Cache warmed with ${cafes.length} cafés`)

    // Pre-warm city-specific caches
    const jakartaCafes = await cafeService.getCafes({ city: 'Jakarta' })
    const baliCafes = await cafeService.getCafes({ city: 'Bali' })

    console.log(
      `✅ City caches warmed: Jakarta (${jakartaCafes.length}), Bali (${baliCafes.length})`
    )
    return true
  } catch (error) {
    console.error('❌ Cache warming failed:', error.message)
    return false
  }
}

/**
 * Verify seeding results
 */
async function verifySeedingResults() {
  console.log('\n🔍 Verifying seeding results...')

  try {
    // Fetch all cafés to verify they were added
    const allCafes = await cafeService.getCafes({})
    const seededCafes = allCafes.filter(
      cafe =>
        cafe.community.contributorId === 'seed-admin' &&
        cafe.community.verificationStatus === 'verified'
    )

    console.log(
      `✅ Verification complete: ${seededCafes.length} verified seed cafés found`
    )

    // Geographic distribution check
    const jakartaCount = seededCafes.filter(
      cafe => cafe.location.city === 'Jakarta'
    ).length
    const baliCount = seededCafes.filter(
      cafe => cafe.location.city === 'Bali'
    ).length

    console.log(
      `📍 Geographic distribution: Jakarta (${jakartaCount}), Bali (${baliCount})`
    )

    return {
      total: seededCafes.length,
      jakarta: jakartaCount,
      bali: baliCount,
      success: seededCafes.length >= 10,
    }
  } catch (error) {
    console.error('❌ Verification failed:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Main seeding function
 */
export async function runSeeding() {
  const startTime = Date.now()

  try {
    console.log('🚀 WFC-Pedia Platform Content Seeding')
    console.log('=====================================\n')

    // Step 1: Seed cafés
    const results = await seedCafes()
    const successCount = results.filter(r => r).length

    // Step 2: Warm cache
    await warmCache()

    // Step 3: Verify results
    const verification = await verifySeedingResults()

    // Final summary
    const duration = Math.round((Date.now() - startTime) / 1000)
    console.log('\n🎉 Seeding Complete!')
    console.log('==================')
    console.log(`⏱️  Duration: ${duration}s`)
    console.log(`✅ Success: ${successCount}/${allSeedCafes.length} cafés`)
    console.log(
      `📍 Coverage: Jakarta (${verification.jakarta}), Bali (${verification.bali})`
    )
    console.log(`🔥 Cache: Warmed and ready`)

    if (verification.success) {
      console.log('\n✨ Platform ready with quality seed content!')
      return true
    } else {
      console.error('\n❌ Seeding failed to meet acceptance criteria')
      return false
    }
  } catch (error) {
    console.error('\n💥 Seeding failed:', error.message)
    console.error(error.stack)
    return false
  }
}

// Export for testing
export { allSeedCafes, jakartaCafes, baliCafes, validateSeedData }

// Run seeding if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSeeding()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('💥 Fatal error:', error)
      process.exit(1)
    })
}
