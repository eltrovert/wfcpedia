# WFC-Pedia: Mobile-First Fullstack Architecture

## Table of Contents

1. [Introduction](#introduction)
2. [PO Feedback Implementation](#po-feedback-implementation)
3. [Implementation Readiness Checklist](#implementation-readiness-checklist)
4. [High Level Architecture](#high-level-architecture)
5. [Tech Stack](#tech-stack)
6. [Data Models](#data-models)
7. [API Specification](#api-specification)
8. [Components](#components)
9. [Core Workflows](#core-workflows)
10. [Database Schema](#database-schema)
11. [Frontend Architecture](#frontend-architecture)
12. [Backend Architecture](#backend-architecture)
13. [Project Structure](#project-structure)
14. [Development Workflow](#development-workflow)
15. [Deployment Architecture](#deployment-architecture)
16. [Security & Performance](#security--performance)
17. [Testing Strategy](#testing-strategy)
18. [Coding Standards](#coding-standards)
19. [Error Handling](#error-handling)
20. [Monitoring & Observability](#monitoring--observability)

---

## PO Feedback Implementation

### Critical Issues Addressed

This updated architecture addresses all **MUST-FIX** and **SHOULD-FIX** items identified in the
Product Owner validation:

#### ✅ MUST-FIX Issues Resolved:

1. **Google Sheets Setup Process Added**
   - Complete Google Sheets creation and configuration workflow added to Story 1.0
   - Schema setup and API key acquisition process documented
   - Service account authentication setup included

2. **External Service Setup Properly Sequenced**
   - Story 1.0 now includes all external service account creation steps
   - Google API, Cloudinary, and social media API setup properly ordered
   - Dependencies clearly marked before dependent features

3. **Technical Dependencies Properly Ordered**
   - New Story 1.0: Infrastructure & External Services Setup (precedes all development)
   - Service layer setup explicitly sequenced before UI implementation
   - Database/sheets configuration before any data operations

4. **User Documentation Added**
   - Story 1.8: User Documentation & Help System added to Epic 1
   - Help system, user guides, and onboarding documentation included
   - Error message documentation and troubleshooting guides planned

#### ✅ SHOULD-FIX Issues Resolved:

1. **CI/CD Pipeline Defined**
   - Story 1.9: CI/CD Pipeline & Quality Automation added
   - Automated testing, deployment, and code quality checks included
   - Netlify deployment automation and environment management

2. **Testing Infrastructure Properly Sequenced**
   - Testing framework setup moved to Story 1.1 (after infrastructure)
   - Test environment configuration before feature development
   - Automated testing integration with CI/CD pipeline

3. **Feature Dependencies Optimized**
   - Epic 1 story order completely revised for optimal dependency flow
   - Clear dependency markers and prerequisites for each story
   - Infrastructure → Testing → Core Features → Advanced Features flow

4. **Service Setup Clarified**
   - Image hosting, CDN, and external service timing clearly defined
   - Step-by-step setup procedures for all external dependencies
   - Fallback strategies for service setup failures

### Updated Epic 1 Structure

The Epic 1 stories have been completely reordered to address dependency issues:

```
Original Order (Dependencies Issues):
1.1 Project Setup & Google Sheets Integration
1.2 Platform Content Seeding
1.3 Basic Café Gallery Display
1.4 User Onboarding & Education
1.5 Community Café Addition System
1.6 Community Engagement Features
1.7 Basic Content Moderation

✅ NEW CORRECTED ORDER (Proper Dependencies):
1.0 Infrastructure & External Services Setup [NEW]
1.1 Development Environment & Testing Framework [UPDATED]
1.2 Google Sheets Backend & API Integration [UPDATED]
1.3 Core Service Layer Development [NEW]
1.4 Platform Content Seeding [REORDERED]
1.5 Basic Café Gallery Display [REORDERED]
1.6 User Onboarding & Education [REORDERED]
1.7 Community Café Addition System [REORDERED]
1.8 User Documentation & Help System [NEW]
1.9 CI/CD Pipeline & Quality Automation [NEW]
1.10 Community Engagement Features [REORDERED]
1.11 Basic Content Moderation [REORDERED]
```

---

## Implementation Readiness Checklist

### Pre-Development Requirements ✅ ALL RESOLVED

#### Infrastructure Prerequisites

- [ ] **Google Cloud Project Created** (Story 1.0)
- [ ] **Google Sheets API Enabled** (Story 1.0)
- [ ] **Service Account Created with Proper Permissions** (Story 1.0)
- [ ] **Google Sheets Database Created with Schema** (Story 1.0)
- [ ] **Cloudinary Account Setup for Image Hosting** (Story 1.0)
- [ ] **Netlify Account Prepared for Deployment** (Story 1.0)

#### Development Environment

- [ ] **Node.js 18+ Installed** (Story 1.1)
- [ ] **Testing Framework Configuration** (Story 1.1)
- [ ] **Development Tools Setup** (Story 1.1)
- [ ] **Environment Variables Template** (Story 1.1)
- [ ] **Repository Structure Established** (Story 1.1)

#### Service Layer Foundation

- [ ] **Google Sheets Service Implementation** (Story 1.2)
- [ ] **Caching Service Implementation** (Story 1.2)
- [ ] **Error Handling System** (Story 1.2)
- [ ] **Offline Sync Service** (Story 1.2)

#### Quality Assurance

- [ ] **Testing Infrastructure Ready** (Story 1.1)
- [ ] **Code Quality Standards Defined** (Story 1.9)
- [ ] **CI/CD Pipeline Configured** (Story 1.9)
- [ ] **Performance Monitoring Setup** (Story 1.9)

### Developer Handoff Package

When implementation begins, developers will receive:

1. **Complete Infrastructure Setup Guide** (from Story 1.0)
2. **Development Environment Checklist** (from Story 1.1)
3. **Service Implementation Specifications** (from Story 1.2-1.3)
4. **Testing and Quality Requirements** (from Story 1.1, 1.9)
5. **User Documentation Template** (from Story 1.8)

---

## Introduction

This document outlines the complete fullstack architecture for WFC-Pedia, a community-owned platform
specifically designed for Indonesian remote workers to discover and share work-friendly cafés. The
architecture prioritizes mobile-first responsive design, static hosting constraints, and Google
Sheets as the backend data source, reflecting the ultra-lean, constraint-driven authenticity that
defines this project.

### Key Architectural Philosophy

- **Mobile-First Progressive Web App**: Designed for Indonesian mobile users with network
  constraints
- **Constraint-Driven Authenticity**: Embracing limitations to create focused, community-centric
  solutions
- **Zero-Cost Operations**: Strategic use of free-tier services for sustainable community ownership
- **Wikipedia-Like Reliability**: Community-driven content with transparent, accessible
  infrastructure
- **Implementation-Ready Design**: Every component specified for immediate development handoff

### Critical Design Decisions (Post-PO Review)

- **Google Sheets Backend**: Enables community transparency and zero operational costs
- **Static Hosting Only**: Simplifies deployment while maintaining excellent performance
- **Offline-First Architecture**: Essential for Indonesian network conditions
- **Touch-Optimized Interface**: 44px minimum targets, one-thumb operation patterns
- **Infrastructure-First Development**: All external services configured before feature development
- **Quality-First Implementation**: Testing and CI/CD established before coding begins

---

## Critical Implementation Workflow

### ❗ MANDATORY DEVELOPMENT SEQUENCE

Based on PO feedback, these phases MUST be completed in exact order to avoid dependency blockers:

#### Phase 0: Infrastructure Setup (Story 1.0) – BLOCKING

```bash
# Administrative tasks that MUST be completed before coding begins

1. Google Cloud Setup
   ✓ Create Google Cloud project
   ✓ Enable Google Sheets API v4
   ✓ Create service account with proper permissions
   ✓ Download service account JSON key
   ✓ Create Google Sheets database with schema

2. External Services
   ✓ Cloudinary account + API keys
   ✓ Netlify account + repository connection
   ✓ Social media API setup (Twitter, etc.)
   ✓ Domain configuration (optional)

3. Validation Tests
   ✓ API connectivity test with service account
   ✓ Image upload test to Cloudinary
   ✓ Deployment test to Netlify
   ✓ All API keys documented and secured
```

#### Phase 1: Development Foundation (Story 1.1) – BLOCKING

```bash
# Technical environment setup before any feature coding

1. Repository Structure
   ✓ Initialize repository with architecture-defined structure
   ✓ Configure Node.js 18+ environment
   ✓ Install and configure all dependencies
   ✓ Setup environment variables template

2. Testing Infrastructure
   ✓ Vitest configuration for unit/integration tests
   ✓ Playwright setup for E2E testing
   ✓ React Testing Library for component tests
   ✓ Test coverage reporting configuration

3. Code Quality Standards
   ✓ ESLint + Prettier configuration
   ✓ TypeScript strict mode setup
   ✓ Pre-commit hooks configuration
   ✓ Accessibility testing integration
```

#### Phase 2: Service Layer (Stories 1.2-1.3) – BLOCKING

```bash
# Backend abstraction layer MUST exist before UI development

1. Core Data Services (Story 1.2)
   ✓ GoogleSheetsService implementation
   ✓ CacheService with IndexedDB
   ✓ SyncService for offline operations
   ✓ ErrorHandlingService integration

2. Business Logic Services (Story 1.3)
   ✓ CafeService with validation
   ✓ LocationService for geolocation
   ✓ ImageService for uploads
   ✓ UserSessionService for tracking

3. Service Integration Testing
   ✓ All services tested with real Google Sheets
   ✓ Performance benchmarking completed
   ✓ Error scenarios validated
   ✓ Mobile network optimization confirmed
```

#### Phase 3: Content & UI (Stories 1.4-1.7) – DEPENDS ON SERVICES

```bash
# UI development can only begin after service layer is complete

1. Data Preparation (Story 1.4)
   ✓ Seed content added via service layer
   ✓ Performance testing with real data
   ✓ Cache warming and optimization

2. Core UI Components (Story 1.5-1.6)
   ✓ Gallery display using service layer
   ✓ User onboarding integration
   ✓ Mobile responsiveness validation

3. Advanced Features (Story 1.7)
   ✓ Café addition system
   ✓ Community engagement features
   ✓ Full integration testing
```

#### Phase 4: Quality & Production (Stories 1.8-1.11) – FINAL PREPARATION

```bash
# Production readiness and quality assurance

1. Documentation & Help (Story 1.8)
   ✓ User documentation system
   ✓ Help center integration
   ✓ Error message improvements

2. Automation & CI/CD (Story 1.9)
   ✓ GitHub Actions pipeline
   ✓ Automated testing and deployment
   ✓ Quality gates and monitoring

3. Community Features (Stories 1.10-1.11)
   ✓ Engagement systems
   ✓ Content moderation
   ✓ Production monitoring
```

### 🚫 CRITICAL FAILURE POINTS TO AVOID

1. **DO NOT** start UI development without service layer completion
2. **DO NOT** begin feature development without external services setup
3. **DO NOT** skip testing infrastructure setup
4. **DO NOT** implement features without proper service abstractions
5. **DO NOT** deploy without CI/CD pipeline operational

### ✅ SUCCESS VALIDATION CHECKPOINTS

Each phase MUST pass these validations before proceeding:

- **Phase 0:** All API calls working with test data
- **Phase 1:** Complete test suite executable with mocks
- **Phase 2:** Service layer 90%+ test coverage with real integrations
- **Phase 3:** UI components functional with service layer
- **Phase 4:** Production deployment successful with monitoring

---

## High Level Architecture

### Mobile-First System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    WFC-Pedia Mobile-First Architecture      │
├─────────────────────────────────────────────────────────────┤
│  Progressive Web App (PWA) - Offline-First Design          │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │   App Shell     │ │  Service Worker │ │  IndexedDB      ││
│  │   (Instant)     │ │   (Offline)     │ │   (Storage)     ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                    Component Architecture                   │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │ Bottom Nav      │ │  Café Gallery   │ │  Filter System  ││
│  │ (5 Tabs, 60px)  │ │  (Masonry)      │ │  (GPS-First)    ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                     Data Layer                              │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │  Google Sheets  │ │   Cache Layer   │ │   Sync Queue    ││
│  │  (Source of     │ │   (1hr TTL)     │ │   (Offline)     ││
│  │   Truth)        │ │                 │ │                 ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Mobile Performance Targets (Post-PO Review)

- **First Contentful Paint**: < 1.5 seconds
- **Largest Contentful Paint**: < 2.5 seconds
- **Time to Interactive**: < 3.5 seconds
- **Cumulative Layout Shift**: < 0.1
- **Data Usage**: < 1MB initial load
- **Service Layer Response**: < 500ms for cached data
- **Offline Functionality**: 100% for core features

### Indonesian Network Optimizations

- **2G/3G Primary**: Assume slow, unreliable connections
- **Data-Conscious Loading**: Progressive image delivery, lazy loading
- **Offline-First**: Core functionality without network
- **Smart Caching**: Aggressive caching with intelligent invalidation

---

## Tech Stack

| Category               | Technology               | Rationale                                      | Mobile Optimization          |
| ---------------------- | ------------------------ | ---------------------------------------------- | ---------------------------- |
| **Frontend Framework** | React 18 + Vite          | Fast development, excellent mobile performance | Tree shaking, code splitting |
| **UI Components**      | Custom + Tailwind CSS    | Ultra-lean, mobile-first design system         | Touch-optimized components   |
| **State Management**   | Zustand + React Query    | Lightweight, excellent caching                 | Optimistic updates           |
| **Routing**            | React Router v6          | Client-side routing with deep linking          | Route-based code splitting   |
| **PWA Framework**      | Workbox                  | Offline-first, background sync                 | Service worker optimization  |
| **Maps**               | Leaflet + OpenStreetMap  | Free, lightweight alternative to Google Maps   | Mobile-optimized controls    |
| **Forms**              | React Hook Form + Zod    | Lightweight validation, great UX               | Touch-friendly validation    |
| **Image Processing**   | Browser APIs + Canvas    | Client-side compression                        | WebP conversion              |
| **Data Fetching**      | Google Sheets API v4     | Zero backend costs                             | Rate limit aware             |
| **Storage**            | IndexedDB + LocalStorage | Offline data persistence                       | Efficient mobile storage     |
| **Build Tool**         | Vite                     | Fast builds, excellent dev experience          | Optimized mobile bundles     |
| **Deployment**         | Netlify                  | Zero-cost static hosting                       | Global CDN                   |
| **Analytics**          | Plausible (optional)     | Privacy-focused, lightweight                   | Minimal performance impact   |

---

## Data Models

### Core Entities

```typescript
// Café Entity - Primary data model
interface Cafe {
  id: string // UUID generated client-side
  name: string // Required, min 2 chars
  location: {
    address: string // Human-readable address
    coordinates: {
      lat: number // GPS coordinates
      lng: number
    }
    city: string // Indonesian city
    district?: string // Optional district
  }
  workMetrics: {
    wifiSpeed: 'slow' | 'medium' | 'fast' | 'fiber'
    comfortRating: 1 | 2 | 3 | 4 | 5
    noiseLevel: 'quiet' | 'moderate' | 'lively'
    amenities: Array<'24/7' | 'power' | 'ac' | 'lighting' | 'food'>
  }
  operatingHours: {
    [key in DayOfWeek]: {
      open: string // HH:MM format
      close: string // HH:MM format
      is24Hours: boolean
    }
  }
  images: Array<{
    url: string // Compressed image URL
    thumbnailUrl: string // Low-res version
    uploadedBy: string // Anonymous or user ID
    uploadedAt: Date
  }>
  community: {
    loveCount: number // Community validation
    lastUpdated: Date // Content freshness
    contributorId: string // Anonymous hash
    verificationStatus: 'pending' | 'verified' | 'flagged'
  }
  createdAt: Date
  updatedAt: Date
}

// User Session - Minimal tracking for privacy
interface UserSession {
  sessionId: string // Generated client-side
  preferences: {
    location: {
      lat: number
      lng: number
      city: string
    } | null
    filters: FilterPreferences
  }
  visitHistory: Array<{
    cafeId: string
    visitedAt: Date
    duration?: number // Optional check-in/out
    rating?: CafeRating
  }>
  contributions: {
    cafesAdded: number
    ratingsGiven: number
    photosUploaded: number
  }
}

// Community Interaction
interface CafeRating {
  cafeId: string
  sessionId: string // Anonymous
  workMetrics: {
    wifiSpeed?: 'slow' | 'medium' | 'fast' | 'fiber'
    comfortRating?: 1 | 2 | 3 | 4 | 5
    noiseLevel?: 'quiet' | 'moderate' | 'lively'
  }
  comment?: string // Max 280 chars
  photos?: Array<string> // Image URLs
  loveGiven: boolean
  ratedAt: Date
}
```

---

## API Specification

### Google Sheets Integration

```typescript
// Google Sheets Service Layer
class GoogleSheetsService {
  private readonly SPREADSHEET_ID = process.env.VITE_SHEETS_ID
  private readonly API_KEY = process.env.VITE_GOOGLE_API_KEY
  private readonly BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets'

  // Rate limiting: 300 requests/minute
  private rateLimiter = new RateLimiter(300, 60000)

  // Café CRUD Operations
  async getCafes(filters?: FilterOptions): Promise<Cafe[]> {
    // Sheet: 'Cafes' - Range: A2:Z1000
    const response = await this.rateLimitedFetch(
      `${this.BASE_URL}/${this.SPREADSHEET_ID}/values/Cafes!A2:Z1000`
    )
    return this.transformRowsToCafes(response.values)
  }

  async addCafe(cafe: Cafe): Promise<void> {
    // Optimistic update with offline queue
    await this.cacheService.addOptimisticUpdate('cafe', cafe)

    const row = this.transformCafeToRow(cafe)
    await this.rateLimitedFetch(`${this.BASE_URL}/${this.SPREADSHEET_ID}/values/Cafes:append`, {
      method: 'POST',
      body: JSON.stringify({
        range: 'Cafes!A:Z',
        majorDimension: 'ROWS',
        values: [row],
      }),
    })
  }

  async addRating(rating: CafeRating): Promise<void> {
    // Sheet: 'Ratings' - Anonymous tracking
    const row = this.transformRatingToRow(rating)
    await this.backgroundSync.queue('rating', row)
  }

  // Cache-aware data fetching
  private async rateLimitedFetch(url: string, options?: RequestInit) {
    await this.rateLimiter.acquire()

    // Check cache first (1-hour TTL)
    const cacheKey = this.generateCacheKey(url, options)
    const cached = await this.cacheService.get(cacheKey)

    if (cached && !this.isCacheExpired(cached)) {
      return cached.data
    }

    try {
      const response = await fetch(`${url}?key=${this.API_KEY}`, options)

      if (!response.ok) {
        throw new APIError(response.status, response.statusText)
      }

      const data = await response.json()

      // Cache successful responses
      await this.cacheService.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl: 3600000, // 1 hour
      })

      return data
    } catch (error) {
      // Network failure - return stale cache if available
      if (cached) {
        return cached.data
      }
      throw error
    }
  }
}

// Cache Service for Offline Support
class CacheService {
  private db: IDBDatabase

  async get(key: string): Promise<CachedData | null> {
    // IndexedDB implementation
  }

  async set(key: string, data: CachedData): Promise<void> {
    // IndexedDB implementation with compression
  }

  async addOptimisticUpdate(type: string, data: any): Promise<void> {
    // Queue changes for background sync
  }
}
```

---

## Components

### Core Component Architecture

```typescript
// Bottom Navigation - 60px height, thumb-zone optimized
const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: HomeIcon, label: 'Discover', route: '/', key: 'discover' },
    { icon: FilterIcon, label: 'Filter', route: '/filter', key: 'filter' },
    { icon: PlusIcon, label: 'Add Café', route: '/add', key: 'add' },
    { icon: BookIcon, label: 'Journal', route: '/journal', key: 'journal' },
    { icon: UsersIcon, label: 'Community', route: '/community', key: 'community' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-15 bg-white border-t border-gray-200 z-50">
      <div className="flex h-full">
        {navItems.map(item => (
          <TouchTarget
            key={item.key}
            className="flex-1 flex flex-col items-center justify-center min-h-11 min-w-11"
            onClick={() => navigate(item.route)}
            aria-label={item.label}
          >
            <item.icon className={`w-6 h-6 ${
              location.pathname === item.route ? 'text-primary' : 'text-gray-500'
            }`} />
            <span className="text-xs mt-1">{item.label}</span>
          </TouchTarget>
        ))}
      </div>
    </nav>
  );
};

// Café Card - 16:9 aspect ratio, overlay info, touch actions
const CafeCard: React.FC<{ cafe: Cafe }> = ({ cafe }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loved, setLoved] = useState(false);

  const handleLove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoved(!loved);
    await cafeService.toggleLove(cafe.id);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      await navigator.share({
        title: cafe.name,
        text: `Check out ${cafe.name} on WFC-Pedia`,
        url: `/cafe/${cafe.id}`
      });
    }
  };

  return (
    <TouchTarget
      className="relative bg-white rounded-lg overflow-hidden shadow-sm mb-3"
      onClick={() => navigate(`/cafe/${cafe.id}`)}
      aria-label={`View details for ${cafe.name}`}
    >
      <div className="aspect-video relative">
        <ProgressiveImage
          src={cafe.images[0]?.url}
          thumbnailSrc={cafe.images[0]?.thumbnailUrl}
          alt={cafe.name}
          className="w-full h-full object-cover"
          onLoad={() => setImageLoaded(true)}
        />

        {/* Overlay Info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
          <div className="absolute bottom-4 left-4 right-16 text-white">
            <h3 className="font-semibold text-lg leading-tight drop-shadow">
              {cafe.name}
            </h3>
            <p className="text-sm opacity-90 drop-shadow">
              {cafe.location.district}, {cafe.location.city}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <WifiIcon className="w-4 h-4" />
              <span className="text-xs">{cafe.workMetrics.wifiSpeed}</span>
              <StarRating rating={cafe.workMetrics.comfortRating} size="sm" />
              <HeartIcon className="w-4 h-4 ml-1" />
              <span className="text-xs">{cafe.community.loveCount}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <TouchTarget
            className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center"
            onClick={handleLove}
            aria-label={loved ? 'Remove from favorites' : 'Add to favorites'}
          >
            <HeartIcon className={`w-5 h-5 ${loved ? 'text-red-500 fill-current' : 'text-white'}`} />
          </TouchTarget>

          <TouchTarget
            className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center"
            onClick={handleShare}
            aria-label="Share café"
          >
            <ShareIcon className="w-5 h-5 text-white" />
          </TouchTarget>
        </div>
      </div>
    </TouchTarget>
  );
};

// Café Gallery - Masonry grid, infinite scroll, pull-to-refresh
const CafeGallery: React.FC = () => {
  const {
    data: cafes,
    fetchNextPage,
    hasNextPage,
    isLoading,
    refetch
  } = useInfiniteQuery(['cafes'], fetchCafes, {
    getNextPageParam: (lastPage) => lastPage.nextCursor
  });

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <div className="px-4 pb-20">
      <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
        <InfiniteScroll
          hasMore={hasNextPage}
          loadMore={fetchNextPage}
          loader={<CafeCardSkeleton />}
        >
          <div className="grid grid-cols-1 gap-3">
            {cafes?.pages.flatMap(page => page.cafes).map(cafe => (
              <CafeCard key={cafe.id} cafe={cafe} />
            ))}
          </div>
        </InfiniteScroll>
      </PullToRefresh>

      {isLoading && (
        <div className="grid grid-cols-1 gap-3">
          {Array(6).fill(0).map((_, i) => (
            <CafeCardSkeleton key={i} />
          ))}
        </div>
      )}
    </div>
  );
};

// Touch-Optimized Base Component
const TouchTarget: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  'aria-label'?: string;
}> = ({ children, className = '', onClick, 'aria-label': ariaLabel }) => {
  return (
    <button
      className={`min-h-11 min-w-11 flex items-center justify-center touch-manipulation ${className}`}
      onClick={onClick}
      aria-label={ariaLabel}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {children}
    </button>
  );
};
```

---

## Core Workflows

### 1. Café Discovery Workflow

```
User Journey: Discover Work-Friendly Cafés
┌─────────────────────────────────────────────────────────────┐
│ 1. App Launch (PWA)                                         │
│    ├─ Load app shell from cache (instant)                  │
│    ├─ Request location permission (one-time)               │
│    └─ Load café data (cached or API)                       │
├─────────────────────────────────────────────────────────────┤
│ 2. Location-Based Discovery                                 │
│    ├─ GPS → Nearby cafés (5km radius)                     │
│    ├─ Manual → City search + filter                        │
│    └─ Filters → Work criteria preferences                  │
├─────────────────────────────────────────────────────────────┤
│ 3. Gallery Interaction                                      │
│    ├─ Scroll → Infinite load (10 cafés per page)          │
│    ├─ Pull-to-refresh → Update live data                   │
│    └─ Tap café → Navigate to details                       │
├─────────────────────────────────────────────────────────────┤
│ 4. Café Selection                                           │
│    ├─ Review work metrics                                   │
│    ├─ Check operating hours                                 │
│    ├─ View community photos                                 │
│    └─ Get directions (external maps app)                   │
└─────────────────────────────────────────────────────────────┘
```

### 2. Café Contribution Workflow

```
User Journey: Add New Café to Community
┌─────────────────────────────────────────────────────────────┐
│ 1. Add Café Trigger                                         │
│    ├─ Bottom nav "Add" button                               │
│    ├─ Empty state CTA                                       │
│    └─ Search "not found" fallback                          │
├─────────────────────────────────────────────────────────────┤
│ 2. Multi-Step Form (3 Steps)                               │
│    ├─ Step 1: Basic Info (name, location, hours)           │
│    │   ├─ GPS auto-detection                                │
│    │   ├─ Map pin adjustment                                │
│    │   └─ Operating hours grid                              │
│    ├─ Step 2: Work Criteria                                 │
│    │   ├─ WiFi speed (test or manual)                      │
│    │   ├─ Comfort rating (1-5 stars)                       │
│    │   ├─ Noise level (quiet/moderate/lively)              │
│    │   └─ Amenities checklist                              │
│    └─ Step 3: Photos & Submit                              │
│        ├─ Camera + gallery access                          │
│        ├─ Auto-compression (WebP)                          │
│        └─ Community guidelines acceptance                   │
├─────────────────────────────────────────────────────────────┤
│ 3. Data Processing                                          │
│    ├─ Client-side validation                                │
│    ├─ Optimistic UI update                                  │
│    ├─ Background sync queue                                 │
│    └─ Google Sheets append                                  │
├─────────────────────────────────────────────────────────────┤
│ 4. Community Integration                                    │
│    ├─ Success feedback                                      │
│    ├─ Navigate to new café detail                          │
│    └─ Update personal contribution stats                    │
└─────────────────────────────────────────────────────────────┘
```

### 3. Work Session Tracking

```
User Journey: Personal Work Productivity Tracking
┌─────────────────────────────────────────────────────────────┐
│ 1. Café Check-In                                            │
│    ├─ "Check In" button on café detail                     │
│    ├─ Confirm location accuracy                             │
│    └─ Start session timer                                   │
├─────────────────────────────────────────────────────────────┤
│ 2. Session Management                                       │
│    ├─ Background timer (local storage)                     │
│    ├─ Optional productivity notes                           │
│    └─ Ambient condition updates                            │
├─────────────────────────────────────────────────────────────┤
│ 3. Session Completion                                       │
│    ├─ Manual check-out or auto-detect                      │
│    ├─ Session summary (duration, productivity)             │
│    └─ Optional café rating update                          │
├─────────────────────────────────────────────────────────────┤
│ 4. Journal Entry                                            │
│    ├─ Personal stats update                                 │
│    ├─ Weekly/monthly analytics                              │
│    └─ Achievement progress                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Google Sheets Structure

#### Sheet 1: "Cafes" (Main café data)

```
A: id (UUID)
B: name (string)
C: address (string)
D: latitude (number)
E: longitude (number)
F: city (string)
G: district (string)
H: wifi_speed (enum)
I: comfort_rating (1-5)
J: noise_level (enum)
K: amenities (JSON array)
L: operating_hours (JSON object)
M: images (JSON array)
N: love_count (number)
O: contributor_id (anonymous hash)
P: verification_status (enum)
Q: created_at (ISO date)
R: updated_at (ISO date)
```

#### Sheet 2: "Ratings" (Community feedback)

```
A: rating_id (UUID)
B: cafe_id (reference)
C: session_id (anonymous)
D: wifi_speed (enum, optional)
E: comfort_rating (1-5, optional)
F: noise_level (enum, optional)
G: comment (string, max 280)
H: photos (JSON array)
I: love_given (boolean)
J: rated_at (ISO date)
```

#### Sheet 3: "Analytics" (Usage tracking)

```
A: session_id (anonymous)
B: event_type (enum)
C: cafe_id (reference, optional)
D: data (JSON object)
E: timestamp (ISO date)
F: user_agent (string)
G: city (string)
```

### IndexedDB Schema (Client-side)

```typescript
// Offline storage structure
interface IndexedDBSchema {
  cafes: {
    key: string // cafe.id
    value: Cafe
    indexes: {
      city: string
      updated_at: Date
      love_count: number
    }
  }

  user_sessions: {
    key: string // session.id
    value: UserSession
    indexes: {
      created_at: Date
    }
  }

  sync_queue: {
    key: string // operation.id
    value: {
      type: 'add_cafe' | 'add_rating' | 'update_cafe'
      data: any
      retries: number
      created_at: Date
    }
    indexes: {
      type: string
      created_at: Date
      retries: number
    }
  }

  cache: {
    key: string // cache key
    value: {
      data: any
      timestamp: number
      ttl: number
    }
    indexes: {
      timestamp: number
    }
  }
}
```

---

## Frontend Architecture

### Component Hierarchy

```
App (PWA Shell)
├── ServiceWorkerProvider
├── QueryProvider (React Query)
├── Router
│   ├── PublicRoutes
│   │   ├── Home (Café Gallery)
│   │   │   ├── Header (Location + Search)
│   │   │   ├── FilterBar (Quick filters)
│   │   │   ├── CafeGallery (Infinite scroll)
│   │   │   └── FloatingAddButton
│   │   ├── Filter (Advanced filtering)
│   │   │   ├── LocationSelector (GPS + Search)
│   │   │   ├── WorkCriteriaFilters
│   │   │   └── FilterActions (Clear/Apply)
│   │   ├── CafeDetail
│   │   │   ├── CafeHeroSection (Images + Actions)
│   │   │   ├── WorkMetricsDisplay
│   │   │   ├── LocationInfo (Address + Map)
│   │   │   ├── OperatingHours
│   │   │   ├── CommunityReviews
│   │   │   └── StickyActions (Check In/Favorite)
│   │   ├── AddCafe (Multi-step form)
│   │   │   ├── ProgressIndicator
│   │   │   ├── BasicInfoStep
│   │   │   ├── WorkCriteriaStep
│   │   │   └── MediaUploadStep
│   │   ├── Journal (Personal tracking)
│   │   │   ├── StatsHeader
│   │   │   ├── ActivityFeed
│   │   │   └── AnalyticsSection
│   │   └── Community (Social features)
│   └── BottomNavigation (Fixed, 5 tabs)
└── GlobalComponents
    ├── TouchTarget (44px minimum)
    ├── ProgressiveImage (Lazy loading)
    ├── PullToRefresh
    ├── InfiniteScroll
    ├── Modal (Bottom sheet style)
    └── Toast (Feedback notifications)
```

### State Management Strategy

```typescript
// Zustand stores for different concerns
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// User preferences and session
interface UserStore {
  sessionId: string
  preferences: {
    location: LocationPreference
    filters: FilterState
    theme: 'light' | 'dark'
  }
  visitHistory: VisitRecord[]
  contributions: ContributionStats

  // Actions
  updateLocation: (location: LocationPreference) => void
  updateFilters: (filters: FilterState) => void
  addVisit: (visit: VisitRecord) => void
  updateContributions: (stats: ContributionStats) => void
}

const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      sessionId: generateSessionId(),
      preferences: {
        location: null,
        filters: {},
        theme: 'light',
      },
      visitHistory: [],
      contributions: { cafesAdded: 0, ratingsGiven: 0, photosUploaded: 0 },

      updateLocation: location =>
        set(state => ({
          preferences: { ...state.preferences, location },
        })),

      updateFilters: filters =>
        set(state => ({
          preferences: { ...state.preferences, filters },
        })),

      addVisit: visit =>
        set(state => ({
          visitHistory: [...state.visitHistory, visit],
        })),

      updateContributions: contributions => set({ contributions }),
    }),
    { name: 'wfc-user-store' }
  )
)

// App UI state (non-persistent)
interface UIStore {
  currentLocation: GeolocationPosition | null
  networkStatus: 'online' | 'offline' | 'slow'
  activeFilters: FilterState
  bottomSheetOpen: boolean
  currentModal: string | null

  // Actions
  setLocation: (location: GeolocationPosition) => void
  setNetworkStatus: (status: 'online' | 'offline' | 'slow') => void
  setActiveFilters: (filters: FilterState) => void
  openBottomSheet: () => void
  closeBottomSheet: () => void
  openModal: (modalId: string) => void
  closeModal: () => void
}

const useUIStore = create<UIStore>(set => ({
  currentLocation: null,
  networkStatus: 'online',
  activeFilters: {},
  bottomSheetOpen: false,
  currentModal: null,

  setLocation: location => set({ currentLocation: location }),
  setNetworkStatus: status => set({ networkStatus: status }),
  setActiveFilters: filters => set({ activeFilters: filters }),
  openBottomSheet: () => set({ bottomSheetOpen: true }),
  closeBottomSheet: () => set({ bottomSheetOpen: false }),
  openModal: modalId => set({ currentModal: modalId }),
  closeModal: () => set({ currentModal: null }),
}))
```

### React Query Integration

```typescript
// Café data queries with caching
export const useCafes = (filters: FilterState) => {
  return useInfiniteQuery({
    queryKey: ['cafes', filters],
    queryFn: ({ pageParam = 0 }) => cafeService.getCafes(filters, pageParam),
    getNextPageParam: lastPage => lastPage.nextCursor,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
    networkMode: 'offlineFirst',
  })
}

export const useCafe = (cafeId: string) => {
  return useQuery({
    queryKey: ['cafe', cafeId],
    queryFn: () => cafeService.getCafe(cafeId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    networkMode: 'offlineFirst',
  })
}

// Mutations with optimistic updates
export const useAddCafe = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cafeService.addCafe,
    onMutate: async newCafe => {
      // Optimistic update
      await queryClient.cancelQueries(['cafes'])

      const previousCafes = queryClient.getQueryData(['cafes'])

      queryClient.setQueryData(['cafes'], (old: any) => ({
        ...old,
        pages: [
          {
            cafes: [newCafe, ...old.pages[0].cafes],
            nextCursor: old.pages[0].nextCursor,
          },
          ...old.pages.slice(1),
        ],
      }))

      return { previousCafes }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousCafes) {
        queryClient.setQueryData(['cafes'], context.previousCafes)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(['cafes'])
    },
  })
}
```

---

## Backend Architecture

### Google Sheets Service Layer

```typescript
// Service layer abstraction over Google Sheets API
class GoogleSheetsBackend {
  private readonly sheetsService: GoogleSheetsService
  private readonly cacheService: CacheService
  private readonly syncService: SyncService

  constructor() {
    this.sheetsService = new GoogleSheetsService()
    this.cacheService = new CacheService()
    this.syncService = new SyncService()
  }

  // Data access layer
  async getCafes(filters: FilterOptions = {}): Promise<PaginatedResponse<Cafe>> {
    const cacheKey = `cafes:${JSON.stringify(filters)}`

    // Try cache first
    const cached = await this.cacheService.get(cacheKey)
    if (cached && !this.isCacheStale(cached)) {
      return this.filterAndPaginate(cached.data, filters)
    }

    try {
      // Fetch from Google Sheets
      const rawData = await this.sheetsService.getRange('Cafes!A2:R1000')
      const cafes = this.transformRowsToCafes(rawData.values)

      // Cache for 1 hour
      await this.cacheService.set(cacheKey, {
        data: cafes,
        timestamp: Date.now(),
        ttl: 3600000,
      })

      return this.filterAndPaginate(cafes, filters)
    } catch (error) {
      // Fallback to stale cache if available
      if (cached) {
        console.warn('Using stale cache due to API error:', error)
        return this.filterAndPaginate(cached.data, filters)
      }
      throw new BackendError('Failed to fetch cafes', error)
    }
  }

  async addCafe(cafe: Cafe): Promise<void> {
    // Add to offline queue for reliability
    await this.syncService.queueOperation({
      type: 'add_cafe',
      data: cafe,
      retries: 0,
    })

    try {
      const row = this.transformCafeToSheetRow(cafe)
      await this.sheetsService.appendRow('Cafes', row)

      // Update cache optimistically
      await this.invalidateCafesCache()
    } catch (error) {
      console.error('Failed to add cafe immediately:', error)
      // Will be retried by sync service
    }
  }

  async addRating(rating: CafeRating): Promise<void> {
    await this.syncService.queueOperation({
      type: 'add_rating',
      data: rating,
      retries: 0,
    })

    try {
      const row = this.transformRatingToSheetRow(rating)
      await this.sheetsService.appendRow('Ratings', row)

      // Update cafe's love count in cache
      await this.updateCafeLoveCount(rating.cafeId, rating.loveGiven)
    } catch (error) {
      console.error('Failed to add rating immediately:', error)
    }
  }

  // Background sync processing
  async processSyncQueue(): Promise<void> {
    const operations = await this.syncService.getPendingOperations()

    for (const operation of operations) {
      try {
        switch (operation.type) {
          case 'add_cafe':
            await this.sheetsService.appendRow(
              'Cafes',
              this.transformCafeToSheetRow(operation.data)
            )
            break

          case 'add_rating':
            await this.sheetsService.appendRow(
              'Ratings',
              this.transformRatingToSheetRow(operation.data)
            )
            break

          default:
            console.warn('Unknown operation type:', operation.type)
        }

        await this.syncService.markCompleted(operation.id)
      } catch (error) {
        await this.syncService.incrementRetries(operation.id)

        if (operation.retries >= 3) {
          console.error('Operation failed after 3 retries:', operation)
          await this.syncService.markFailed(operation.id)
        }
      }
    }
  }

  // Data transformation utilities
  private transformRowsToCafes(rows: any[][]): Cafe[] {
    return rows
      .filter(row => row.length >= 18) // Ensure complete rows
      .map(row => ({
        id: row[0],
        name: row[1],
        location: {
          address: row[2],
          coordinates: { lat: parseFloat(row[3]), lng: parseFloat(row[4]) },
          city: row[5],
          district: row[6],
        },
        workMetrics: {
          wifiSpeed: row[7] as WifiSpeed,
          comfortRating: parseInt(row[8]) as ComfortRating,
          noiseLevel: row[9] as NoiseLevel,
          amenities: JSON.parse(row[10] || '[]'),
        },
        operatingHours: JSON.parse(row[11] || '{}'),
        images: JSON.parse(row[12] || '[]'),
        community: {
          loveCount: parseInt(row[13]) || 0,
          lastUpdated: new Date(row[14]),
          contributorId: row[15],
          verificationStatus: row[16] as VerificationStatus,
        },
        createdAt: new Date(row[17]),
        updatedAt: new Date(row[17]),
      }))
  }

  private transformCafeToSheetRow(cafe: Cafe): any[] {
    return [
      cafe.id,
      cafe.name,
      cafe.location.address,
      cafe.location.coordinates.lat,
      cafe.location.coordinates.lng,
      cafe.location.city,
      cafe.location.district || '',
      cafe.workMetrics.wifiSpeed,
      cafe.workMetrics.comfortRating,
      cafe.workMetrics.noiseLevel,
      JSON.stringify(cafe.workMetrics.amenities),
      JSON.stringify(cafe.operatingHours),
      JSON.stringify(cafe.images),
      cafe.community.loveCount,
      new Date().toISOString(),
      cafe.community.contributorId,
      cafe.community.verificationStatus,
      cafe.createdAt.toISOString(),
    ]
  }
}

// Background sync service
class SyncService {
  private db: IDBDatabase

  async queueOperation(operation: SyncOperation): Promise<void> {
    const transaction = this.db.transaction(['sync_queue'], 'readwrite')
    const store = transaction.objectStore('sync_queue')

    await store.add({
      id: generateId(),
      ...operation,
      createdAt: new Date(),
    })
  }

  async getPendingOperations(): Promise<SyncOperation[]> {
    const transaction = this.db.transaction(['sync_queue'], 'readonly')
    const store = transaction.objectStore('sync_queue')

    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async markCompleted(operationId: string): Promise<void> {
    const transaction = this.db.transaction(['sync_queue'], 'readwrite')
    const store = transaction.objectStore('sync_queue')
    await store.delete(operationId)
  }

  async incrementRetries(operationId: string): Promise<void> {
    const transaction = this.db.transaction(['sync_queue'], 'readwrite')
    const store = transaction.objectStore('sync_queue')

    const operation = await store.get(operationId)
    if (operation) {
      operation.retries += 1
      await store.put(operation)
    }
  }
}
```

---

## Setup Validation Scripts

```typescript
// scripts/validate-setup.js - Ensures all external services ready

const validateSetup = async () => {
  console.log('🔍 Validating WFC-Pedia Setup...')

  const validations = [
    {
      name: 'Google Sheets API',
      test: () => testGoogleSheetsConnection(),
      required: true,
    },
    {
      name: 'Cloudinary Image Service',
      test: () => testCloudinaryConnection(),
      required: true,
    },
    {
      name: 'Environment Variables',
      test: () => validateEnvironmentVariables(),
      required: true,
    },
    {
      name: 'Service Account Permissions',
      test: () => testServiceAccountPermissions(),
      required: true,
    },
  ]

  let allPassed = true

  for (const validation of validations) {
    try {
      console.log(`Testing ${validation.name}...`)
      await validation.test()
      console.log(`✅ ${validation.name} - PASSED`)
    } catch (error) {
      console.error(`❌ ${validation.name} - FAILED:`, error.message)
      if (validation.required) {
        allPassed = false
      }
    }
  }

  if (allPassed) {
    console.log('\n🎉 All validations passed! Ready for development.')
    process.exit(0)
  } else {
    console.error('\n😨 Setup validation failed. Please fix issues before development.')
    console.error('Refer to Story 1.0 documentation for setup instructions.')
    process.exit(1)
  }
}

const testGoogleSheetsConnection = async () => {
  const { GoogleAuth } = require('google-auth-library')
  const auth = new GoogleAuth({
    keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const authClient = await auth.getClient()
  const sheets = require('googleapis').sheets({ version: 'v4', auth: authClient })

  // Test read operation
  await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.VITE_SHEETS_ID,
    range: 'Cafes!A1:A1',
  })
}

const testCloudinaryConnection = async () => {
  const cloudinary = require('cloudinary').v2
  cloudinary.config({
    cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.VITE_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })

  // Test API connectivity
  await cloudinary.api.ping()
}

const validateEnvironmentVariables = () => {
  const required = [
    'VITE_GOOGLE_API_KEY',
    'VITE_SHEETS_ID',
    'VITE_CLOUDINARY_CLOUD_NAME',
    'VITE_CLOUDINARY_API_KEY',
    'GOOGLE_SERVICE_ACCOUNT_PATH',
  ]

  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

validateSetup()
```

---

## Project Structure

```
wfc-pedia/
├── public/                          # Static assets
│   ├── manifest.json               # PWA manifest
│   ├── sw.js                       # Service worker
│   ├── icons/                      # App icons (multiple sizes)
│   └── images/                     # Static images
├── src/
│   ├── components/                 # Reusable UI components
│   │   ├── ui/                     # Base components
│   │   │   ├── TouchTarget.tsx     # 44px minimum touch targets
│   │   │   ├── ProgressiveImage.tsx # Lazy loading images
│   │   │   ├── BottomSheet.tsx     # Mobile-first modals
│   │   │   ├── PullToRefresh.tsx   # Native-like interactions
│   │   │   └── InfiniteScroll.tsx  # Performance scrolling
│   │   ├── cafe/                   # Café-specific components
│   │   │   ├── CafeCard.tsx        # Gallery card component
│   │   │   ├── CafeGallery.tsx     # Masonry grid
│   │   │   ├── CafeDetail.tsx      # Detail view sections
│   │   │   └── WorkMetrics.tsx     # Work condition display
│   │   ├── forms/                  # Form components
│   │   │   ├── AddCafeForm.tsx     # Multi-step café form
│   │   │   ├── RatingWidget.tsx    # Community rating
│   │   │   └── LocationPicker.tsx  # GPS + manual location
│   │   └── navigation/             # Navigation components
│   │       ├── BottomNavigation.tsx # 5-tab navigation
│   │       └── FilterBar.tsx       # Quick filter chips
│   ├── pages/                      # Route components
│   │   ├── Home.tsx                # Café discovery gallery
│   │   ├── Filter.tsx              # Advanced filtering
│   │   ├── CafeDetail.tsx          # Individual café page
│   │   ├── AddCafe.tsx             # Add new café workflow
│   │   ├── Journal.tsx             # Personal work tracking
│   │   └── Community.tsx           # Social features
│   ├── hooks/                      # Custom React hooks
│   │   ├── useLocation.ts          # GPS and location services
│   │   ├── useOfflineSync.ts       # Background sync management
│   │   ├── useImageUpload.ts       # Camera and compression
│   │   └── usePWA.ts               # PWA installation
│   ├── services/                   # Business logic
│   │   ├── cafeService.ts          # Café CRUD operations
│   │   ├── googleSheets.ts         # Google Sheets integration
│   │   ├── cacheService.ts         # Client-side caching
│   │   ├── syncService.ts          # Offline synchronization
│   │   └── imageService.ts         # Image processing
│   ├── stores/                     # State management
│   │   ├── userStore.ts            # User preferences & session
│   │   ├── uiStore.ts              # UI state
│   │   └── cacheStore.ts           # Data caching
│   ├── utils/                      # Utilities
│   │   ├── performance.ts          # Mobile performance utils
│   │   ├── network.ts              # Network condition detection
│   │   ├── location.ts             # GPS and geolocation
│   │   └── validation.ts           # Form and data validation
│   ├── types/                      # TypeScript definitions
│   │   ├── cafe.ts                 # Café data models
│   │   ├── user.ts                 # User session models
│   │   └── api.ts                  # API response types
│   ├── styles/                     # Styling
│   │   ├── globals.css             # Global styles + Tailwind
│   │   ├── components.css          # Component-specific styles
│   │   └── mobile.css              # Mobile-specific overrides
│   ├── App.tsx                     # Root application
│   ├── main.tsx                    # Entry point
│   └── vite-env.d.ts               # Vite types
├── scripts/                        # Setup and validation scripts
│   ├── validate-setup.js           # External services connectivity check
│   ├── setup-google-sheets.js      # Google Sheets schema creation
│   ├── seed-data.js               # Initial content seeding
│   └── benchmark-services.js       # Service layer performance testing
├── docs/                           # Documentation
│   ├── architecture.md             # This document
│   ├── prd/                        # Product requirements
│   │   ├── epic-details.md         # Updated epic structure
│   │   └── *.md                    # Other PRD documents
│   ├── setup/                      # Setup documentation
│   │   ├── story-1.0-infrastructure.md # External services setup guide
│   │   ├── story-1.1-development.md    # Development environment setup
│   │   └── troubleshooting.md      # Common setup issues
│   └── api-documentation.md        # Google Sheets API usage
├── tests/                          # Testing
│   ├── __mocks__/                  # Test mocks
│   ├── setup/                      # Setup validation tests
│   ├── services/                   # Service layer tests (CRITICAL)
│   │   ├── integration/            # External service integration tests
│   │   ├── unit/                   # Service unit tests
│   │   ├── performance/            # Service performance benchmarks
│   │   └── offline/                # Offline functionality tests
│   ├── components/                 # Component tests
│   ├── accessibility/              # WCAG compliance tests
│   ├── mobile/                     # Mobile-specific tests
│   ├── utils/                      # Utility tests
│   └── e2e/                        # End-to-end tests
│       ├── mobile/                 # Mobile user journey tests
│       └── desktop/                # Desktop fallback tests
├── .env.example                    # Environment variables template
├── .gitignore                      # Git ignore patterns
├── package.json                    # Dependencies and scripts
├── vite.config.ts                  # Build configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # Project documentation
```

---

## Development Workflow

### Local Development Setup (Updated Post-PO Review)

#### Prerequisites Validation

```bash
# MANDATORY: Verify all external services are setup (Story 1.0)

1. Check Google Cloud Setup
   ✓ Service account JSON file available
   ✓ Google Sheets database created and accessible
   ✓ API connectivity test passed

2. Check External Services
   ✓ Cloudinary API keys available
   ✓ Netlify deployment target configured
   ✓ All service credentials documented
```

#### Development Environment Setup

```bash
# 1. Repository setup (after Story 1.1 completion)
git clone <repository>
cd wfc-pedia
npm install

# 2. Environment configuration (requires Story 1.0 completion)
cp .env.example .env
# Edit .env with credentials from Story 1.0:
# VITE_GOOGLE_API_KEY=your_service_account_key
# VITE_SHEETS_ID=your_spreadsheet_id
# VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
# VITE_CLOUDINARY_API_KEY=your_api_key

# 3. Validate setup
npm run test:setup
# Runs connectivity tests for all external services

# 4. Start development server (requires testing framework ready)
npm run dev
# Runs on https://localhost:5173 (HTTPS for PWA testing)

# 5. Mobile testing setup
npm run test:mobile
# Runs mobile-specific test suite

# 6. Real device testing
npm install -g ngrok
ngrok http 5173
# Share tunnel URL for device testing
```

#### Service Layer Development Workflow

```bash
# MANDATORY: Service layer development sequence (Stories 1.2-1.3)

1. Implement Core Services First
   npm run test:services:unit      # Unit tests for service layer
   npm run test:services:integration # Integration with Google Sheets
   npm run benchmark:services      # Performance testing

2. Validate Service Layer
   npm run test:services:coverage  # Ensure 90%+ coverage
   npm run test:services:mobile    # Mobile network simulation
   npm run validate:offline        # Offline functionality test

3. Only After Services Pass - Begin UI Development
   npm run test:ui:components      # Component tests with service mocks
   npm run test:ui:integration     # UI + Service integration
   npm run test:ui:accessibility   # WCAG compliance validation
```

### Development Scripts (Updated with PO Requirements)

```json
{
  "scripts": {
    "dev": "vite --host --https",
    "build": "tsc && vite build",
    "preview": "vite preview --https",

    "test": "vitest",
    "test:setup": "vitest run setup",
    "test:services:unit": "vitest run services",
    "test:services:integration": "vitest run services --integration",
    "test:services:coverage": "vitest run services --coverage",
    "test:ui:components": "vitest run components",
    "test:ui:integration": "vitest run integration",
    "test:ui:accessibility": "vitest run accessibility",
    "test:mobile": "vitest run mobile",
    "test:e2e": "playwright test",
    "test:e2e:mobile": "playwright test --grep mobile",

    "lint": "eslint src --ext ts,tsx",
    "lint:fix": "eslint src --ext ts,tsx --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write src/**/*.{ts,tsx}",

    "benchmark:services": "vitest run benchmark",
    "validate:offline": "vitest run offline",
    "validate:setup": "node scripts/validate-setup.js",

    "lighthouse": "lighthouse https://localhost:5173 --chrome-flags=\"--ignore-certificate-errors\"",
    "lighthouse:mobile": "lighthouse https://localhost:5173 --preset=perf --chrome-flags=\"--ignore-certificate-errors\" --emulated-form-factor=mobile",
    "analyze": "npm run build && npx vite-bundle-analyzer dist/stats.html",

    "ci:test": "npm run test:services:coverage && npm run test:ui:accessibility && npm run test:e2e:mobile",
    "ci:quality": "npm run lint && npm run type-check && npm run lighthouse:mobile",
    "ci:build": "npm run build && npm run validate:offline"
  }
}
```

### Git Workflow (Updated with Quality Gates)

```bash
# Feature development (after service layer complete)
git checkout -b feature/cafe-gallery-optimization

# MANDATORY: Service layer tests before UI changes
npm run test:services:integration  # Ensure services still work
npm run validate:setup              # Verify external service connectivity

# Make changes...
git add .
git commit -m "feat: optimize cafe gallery loading performance"

# Pre-commit validation (enforced by hooks)
npm run ci:test       # Comprehensive test suite
npm run ci:quality    # Code quality and performance
npm run ci:build      # Build validation

git push origin feature/cafe-gallery-optimization

# Pull request requirements (enforced by CI/CD)
# ✓ All service layer tests passing
# ✓ UI component tests passing
# ✓ Accessibility compliance verified
# ✓ Mobile performance benchmarks met
# ✓ Lighthouse score ≥ 90 for all categories

# Pre-deployment final checks
npm run validate:offline    # Offline functionality
npm run test:e2e:mobile     # Full mobile user journey
npm run benchmark:services  # Performance regression check
```

### Mobile Testing Protocol (Updated with Service Integration)

```typescript
// Mobile testing checklist (requires completed service layer)
const mobileTestingProtocol = {
  devices: [
    'Android Chrome (latest)',
    'Android Chrome (2 versions back)',
    'Samsung Internet',
    'iPhone Safari (latest)',
    'iPhone Safari (1 version back)',
  ],

  networkConditions: [
    'Fast 3G (750kb/s)',
    'Slow 3G (375kb/s)',
    '2G (56kb/s)',
    'Offline mode (service layer fallback)',
  ],

  testScenarios: [
    // Service Layer Integration
    'Google Sheets API performance on mobile networks',
    'Service layer caching effectiveness',
    'Offline sync queue reliability',
    'Error handling and recovery patterns',

    // UI Performance
    'Cold app launch performance (< 2.5s LCP)',
    'Gallery scrolling performance (60fps)',
    'Image loading and compression efficiency',
    'Touch interaction accuracy (44px targets)',

    // Accessibility & UX
    'Screen reader navigation completeness',
    'Keyboard navigation functionality',
    'Color contrast compliance (WCAG AA)',
    'Form submission with validation',

    // Network Resilience
    'Offline functionality coverage',
    'Background sync after reconnection',
    'Progressive loading strategies',
    'Battery usage optimization',
  ],

  // Service layer specific validations
  serviceValidations: [
    'Google Sheets rate limiting compliance',
    'Cache invalidation accuracy',
    'Data consistency between cache and source',
    'Service error recovery mechanisms',
  ],
}
```

---

## Deployment Architecture

### Netlify Deployment Configuration

```toml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/manifest.json"
  [headers.values]
    Content-Type = "application/manifest+json"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

# SPA fallback
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Security headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://sheets.googleapis.com"
```

### Environment Management

```typescript
// Environment configuration
interface EnvironmentConfig {
  development: {
    apiEndpoint: 'https://sheets.googleapis.com/v4'
    enableDevTools: true
    cacheTTL: 60000 // 1 minute for development
    enableMocking: true
  }

  staging: {
    apiEndpoint: 'https://sheets.googleapis.com/v4'
    enableDevTools: false
    cacheTTL: 300000 // 5 minutes for staging
    enableMocking: false
  }

  production: {
    apiEndpoint: 'https://sheets.googleapis.com/v4'
    enableDevTools: false
    cacheTTL: 3600000 // 1 hour for production
    enableMocking: false
    enableAnalytics: true
  }
}

// Build-time environment detection
const environment = import.meta.env.MODE
const config = environmentConfigs[environment]
```

### Progressive Web App Deployment

```javascript
// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration)

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available, show update prompt
              showUpdateAvailableNotification()
            }
          })
        })
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError)
      })
  })
}

// App update handling
function showUpdateAvailableNotification() {
  // Show toast/notification to user
  const updateToast = document.createElement('div')
  updateToast.innerHTML = `
    <div class="fixed bottom-20 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
      <p>New version available!</p>
      <button onclick="window.location.reload()" class="bg-white text-blue-600 px-4 py-2 rounded mt-2">
        Update Now
      </button>
    </div>
  `
  document.body.appendChild(updateToast)
}
```

---

## Security & Performance

### Security Implementation

```typescript
// Content Security Policy
const cspPolicy = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"], // Needed for Vite dev
  'style-src': ["'self'", "'unsafe-inline'"], // Needed for Tailwind
  'img-src': ["'self'", 'data:', 'https:'],
  'connect-src': ["'self'", 'https://sheets.googleapis.com'],
  'font-src': ["'self'"],
  'object-src': ["'none'"],
  'media-src': ["'self'"],
  'frame-src': ["'none'"],
}

// API Security
class SecureAPIClient {
  private readonly apiKey: string

  constructor() {
    // API key validation
    this.apiKey = import.meta.env.VITE_GOOGLE_API_KEY
    if (!this.apiKey) {
      throw new Error('Google API key not configured')
    }
  }

  async makeRequest(url: string, options: RequestInit = {}): Promise<Response> {
    // Rate limiting
    await this.rateLimiter.acquire()

    // Request validation
    const sanitizedUrl = this.sanitizeUrl(url)

    // Add API key securely
    const urlWithKey = `${sanitizedUrl}${sanitizedUrl.includes('?') ? '&' : '?'}key=${this.apiKey}`

    const response = await fetch(urlWithKey, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        ...options.headers,
      },
    })

    // Response validation
    if (!response.ok) {
      throw new APIError(response.status, response.statusText)
    }

    return response
  }

  private sanitizeUrl(url: string): string {
    // Prevent URL injection
    const allowedDomains = ['sheets.googleapis.com']
    const urlObj = new URL(url)

    if (!allowedDomains.includes(urlObj.hostname)) {
      throw new Error('Unauthorized domain')
    }

    return url
  }
}

// User Input Sanitization
class InputSanitizer {
  static sanitizeCafeName(name: string): string {
    return name
      .trim()
      .slice(0, 100) // Length limit
      .replace(/<[^>]*>/g, '') // Remove HTML
      .replace(/[^\w\s\-'.,]/g, '') // Allow only safe characters
  }

  static sanitizeComment(comment: string): string {
    return comment
      .trim()
      .slice(0, 280) // Twitter-like limit
      .replace(/<[^>]*>/g, '') // Remove HTML
      .replace(/javascript:/gi, '') // Remove JS injection
      .replace(/data:/gi, '') // Remove data URLs
  }

  static validateCoordinates(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && !isNaN(lat) && !isNaN(lng)
  }
}
```

### Performance Optimization

```typescript
// Image Optimization Service
class ImageOptimizationService {
  async compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calculate optimal dimensions
        const { width, height } = this.calculateOptimalSize(img.width, img.height)

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          blob => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/webp',
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              reject(new Error('Compression failed'))
            }
          },
          'image/webp',
          0.8 // Quality
        )
      }

      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  private calculateOptimalSize(originalWidth: number, originalHeight: number) {
    const maxWidth = 800
    const maxHeight = 600

    let { width, height } = { width: originalWidth, height: originalHeight }

    if (width > maxWidth) {
      height = (height * maxWidth) / width
      width = maxWidth
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height
      height = maxHeight
    }

    return { width: Math.round(width), height: Math.round(height) }
  }
}

// Performance Monitoring
class PerformanceMonitor {
  static measureCoreWebVitals() {
    // First Contentful Paint
    new PerformanceObserver(entryList => {
      const entries = entryList.getEntries()
      const fcp = entries.find(entry => entry.name === 'first-contentful-paint')
      if (fcp) {
        this.reportMetric('FCP', fcp.startTime)
      }
    }).observe({ entryTypes: ['paint'] })

    // Largest Contentful Paint
    new PerformanceObserver(entryList => {
      const entries = entryList.getEntries()
      const lcp = entries[entries.length - 1]
      this.reportMetric('LCP', lcp.startTime)
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // Cumulative Layout Shift
    let clsValue = 0
    new PerformanceObserver(entryList => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      }
      this.reportMetric('CLS', clsValue)
    }).observe({ entryTypes: ['layout-shift'] })
  }

  static reportMetric(name: string, value: number) {
    // Send to analytics if enabled
    if (import.meta.env.PROD) {
      console.log(`Performance metric: ${name} = ${value}`)
      // Optional: Send to external monitoring service
    }
  }
}

// Network-Aware Loading
class NetworkAwareLoader {
  private connection: any

  constructor() {
    this.connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection
  }

  getOptimalImageQuality(): number {
    if (!this.connection) return 0.8 // Default quality

    const effectiveType = this.connection.effectiveType

    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        return 0.3 // Very low quality
      case '3g':
        return 0.6 // Medium quality
      case '4g':
      default:
        return 0.8 // High quality
    }
  }

  shouldLazyLoad(): boolean {
    if (!this.connection) return true // Default to lazy loading

    return this.connection.saveData || ['slow-2g', '2g'].includes(this.connection.effectiveType)
  }

  getOptimalPageSize(): number {
    if (!this.connection) return 10 // Default page size

    const effectiveType = this.connection.effectiveType

    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        return 5 // Fewer items per page
      case '3g':
        return 10 // Standard page size
      case '4g':
      default:
        return 20 // More items per page
    }
  }
}
```

---

## Testing Strategy

### Testing Pyramid

```typescript
// Unit Tests (70% of tests)
describe('CafeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGoogleSheetsAPI.reset();
  });

  it('should fetch cafes with caching', async () => {
    const mockCafes = [createMockCafe()];
    mockGoogleSheetsAPI.getCafes.mockResolvedValue(mockCafes);

    const result = await cafeService.getCafes();

    expect(result).toEqual(mockCafes);
    expect(mockGoogleSheetsAPI.getCafes).toHaveBeenCalledOnce();
  });

  it('should handle API failures gracefully', async () => {
    mockGoogleSheetsAPI.getCafes.mockRejectedValue(new Error('API Error'));

    const result = await cafeService.getCafes();

    expect(result).toEqual([]);
    expect(mockErrorHandler.logError).toHaveBeenCalled();
  });

  it('should validate cafe data before submission', () => {
    const invalidCafe = createMockCafe({ name: '' });

    expect(() => cafeService.validateCafe(invalidCafe))
      .toThrow('Cafe name is required');
  });
});

// Component Tests (20% of tests)
describe('CafeCard', () => {
  const mockCafe = createMockCafe();

  it('should render cafe information correctly', () => {
    render(<CafeCard cafe={mockCafe} />);

    expect(screen.getByText(mockCafe.name)).toBeInTheDocument();
    expect(screen.getByText(mockCafe.location.city)).toBeInTheDocument();
    expect(screen.getByLabelText(/wifi speed/i)).toBeInTheDocument();
  });

  it('should handle love button interaction', async () => {
    const user = userEvent.setup();
    const mockOnLove = vi.fn();

    render(<CafeCard cafe={mockCafe} onLove={mockOnLove} />);

    await user.click(screen.getByLabelText(/add to favorites/i));

    expect(mockOnLove).toHaveBeenCalledWith(mockCafe.id, true);
  });

  it('should be accessible with keyboard navigation', async () => {
    render(<CafeCard cafe={mockCafe} />);

    const card = screen.getByLabelText(`View details for ${mockCafe.name}`);

    expect(card).toHaveAttribute('tabindex', '0');
    expect(card).toHaveAttribute('role', 'button');
  });
});

// Integration Tests (10% of tests)
describe('Add Cafe Flow', () => {
  beforeEach(() => {
    setupMockGeolocation();
    setupMockGoogleSheetsAPI();
  });

  it('should complete full cafe addition workflow', async () => {
    const user = userEvent.setup();

    render(<App />);

    // Navigate to add cafe
    await user.click(screen.getByText('Add Café'));

    // Fill basic information
    await user.type(screen.getByLabelText(/cafe name/i), 'Test Café');
    await user.click(screen.getByText('Use Current Location'));

    // Continue to work criteria
    await user.click(screen.getByText('Next'));

    // Select work criteria
    await user.click(screen.getByLabelText(/fast wifi/i));
    await user.click(screen.getByLabelText(/4 stars/i));

    // Continue to submission
    await user.click(screen.getByText('Next'));

    // Submit
    await user.click(screen.getByText('Add to Community'));

    // Verify success
    expect(await screen.findByText(/successfully added/i)).toBeInTheDocument();
    expect(mockGoogleSheetsAPI.addCafe).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Test Café' })
    );
  });
});
```

### E2E Testing

```typescript
// Playwright E2E Tests
import { test, expect } from '@playwright/test'

test.describe('Mobile User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Mock geolocation
    await page.context().grantPermissions(['geolocation'])
    await page.setGeolocation({ latitude: -6.2088, longitude: 106.8456 }) // Jakarta

    // Mock Google Sheets API
    await page.route('**/sheets.googleapis.com/**', route => {
      route.fulfill({ json: mockSheetsResponse })
    })
  })

  test('should discover cafes on mobile device', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/')

    // Wait for location permission and data load
    await expect(page.locator('[data-testid="cafe-card"]')).toBeVisible()

    // Verify mobile-first design
    const bottomNav = page.locator('[data-testid="bottom-navigation"]')
    await expect(bottomNav).toBeVisible()
    await expect(bottomNav).toHaveCSS('position', 'fixed')

    // Test infinite scroll
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.locator('[data-testid="cafe-card"]')).toHaveCount(20)
  })

  test('should work offline', async ({ page, context }) => {
    // Load app online first
    await page.goto('/')
    await expect(page.locator('[data-testid="cafe-card"]')).toBeVisible()

    // Go offline
    await context.setOffline(true)
    await page.reload()

    // Verify offline functionality
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible()
    await expect(page.locator('[data-testid="cafe-card"]')).toBeVisible() // From cache

    // Test offline cafe addition
    await page.click('[data-testid="add-cafe-button"]')
    await page.fill('[data-testid="cafe-name"]', 'Offline Test Café')
    await page.click('[data-testid="submit-button"]')

    await expect(page.locator('[data-testid="offline-queue-indicator"]')).toBeVisible()
  })

  test('should meet performance benchmarks', async ({ page }) => {
    const start = Date.now()

    await page.goto('/')

    // Wait for first contentful paint
    await page.waitForSelector('[data-testid="cafe-card"]')

    const loadTime = Date.now() - start
    expect(loadTime).toBeLessThan(2500) // 2.5s target

    // Check Lighthouse performance (if configured)
    const lighthouse = await page.evaluate(
      () => window.performance.getEntriesByType('navigation')[0]
    )
    expect(lighthouse.domContentLoadedEventEnd).toBeLessThan(1500) // 1.5s FCP target
  })
})
```

### Performance Testing

```bash
# Lighthouse CI configuration
# lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['https://localhost:5173'],
      startServerCommand: 'npm run preview',
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:pwa': ['error', { minScore: 0.9 }]
      }
    }
  }
};

# Bundle size monitoring
npm run build && npx bundlemon
# Fails if bundle size increases by more than 10%
```

---

## Coding Standards

### Critical AI Development Rules

```typescript
/**
 * CRITICAL: These coding standards are mandatory for AI agents
 * Violation of these rules will result in system instability
 */

// 1. ALWAYS validate user input before processing
function addCafe(cafeData: unknown): Promise<void> {
  // ❌ NEVER do this
  // return cafeService.add(cafeData);

  // ✅ ALWAYS do this
  const validatedCafe = CafeSchema.parse(cafeData);
  return cafeService.add(validatedCafe);
}

// 2. ALWAYS handle errors gracefully
async function fetchCafes(): Promise<Cafe[]> {
  try {
    return await cafeService.getCafes();
  } catch (error) {
    // ❌ NEVER let errors bubble uncaught
    // throw error;

    // ✅ ALWAYS provide fallbacks
    console.error('Failed to fetch cafes:', error);
    return await cafeService.getCachedCafes(); // Fallback to cache
  }
}

// 3. ALWAYS use TypeScript strictly
// ❌ NEVER use 'any' type
function processData(data: any): any {
  return data.something;
}

// ✅ ALWAYS define proper types
interface ProcessableData {
  id: string;
  value: number;
}

function processData(data: ProcessableData): ProcessedResult {
  return { processedValue: data.value * 2 };
}

// 4. ALWAYS implement offline-first patterns
class DataService {
  async getData(): Promise<Data[]> {
    try {
      // Try network first
      const networkData = await this.fetchFromNetwork();
      await this.cacheData(networkData);
      return networkData;
    } catch (error) {
      // ✅ ALWAYS fallback to cache
      const cachedData = await this.getCachedData();
      if (cachedData.length > 0) {
        return cachedData;
      }
      throw new Error('No data available offline');
    }
  }
}

// 5. ALWAYS optimize for mobile performance
// ❌ NEVER load all data at once
function loadAllCafes(): Promise<Cafe[]> {
  return api.getCafes({ limit: 10000 }); // Will crash on mobile
}

// ✅ ALWAYS implement pagination
function loadCafes(page = 0, limit = 10): Promise<PaginatedResponse<Cafe>> {
  return api.getCafes({ page, limit });
}

// 6. ALWAYS implement proper loading states
function CafeList() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ ALWAYS show loading states
  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState error={error} retry={loadCafes} />;
  if (cafes.length === 0) return <EmptyState />;

  return <CafeGallery cafes={cafes} />;
}

// 7. ALWAYS implement accessibility
function TouchButton({ children, onClick, ariaLabel }: TouchButtonProps) {
  return (
    <button
      className="min-h-11 min-w-11" // ✅ 44px minimum
      onClick={onClick}
      aria-label={ariaLabel} // ✅ ALWAYS provide ARIA labels
      role="button"
      tabIndex={0}
    >
      {children}
    </button>
  );
}
```

### Code Quality Rules

```typescript
// Naming Conventions
interface CafeWorkMetrics { // PascalCase for types
  wifiSpeed: WifiSpeed;     // camelCase for properties
  comfortRating: number;
}

const WIFI_SPEED_OPTIONS = [ // SCREAMING_SNAKE_CASE for constants
  'slow', 'medium', 'fast', 'fiber'
] as const;

function calculateDistance() {} // camelCase for functions
const CafeCard = () => {};    // PascalCase for components

// File Organization Rules
// ✅ One component per file
// ✅ Co-locate related files
// ✅ Index files for clean imports
// ✅ Separate concerns (hooks, utils, types)

// Performance Rules
// ✅ Always use React.memo for expensive components
const CafeCard = React.memo(({ cafe }: CafeCardProps) => {
  // Component implementation
});

// ✅ Always implement proper dependency arrays
useEffect(() => {
  fetchCafes(filters);
}, [filters]); // Include all dependencies

// ✅ Always debounce user input
const debouncedSearch = useDebounce(searchTerm, 300);

// Error Handling Patterns
class CafeError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'CafeError';
  }
}

// ✅ Use error boundaries
function App() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Router />
    </ErrorBoundary>
  );
}
```

---

## Error Handling Strategy

### Unified Error System

```typescript
// Error Types
export enum ErrorCode {
  // Network Errors
  NETWORK_UNAVAILABLE = 'NETWORK_UNAVAILABLE',
  API_RATE_LIMIT = 'API_RATE_LIMIT',
  API_UNAUTHORIZED = 'API_UNAUTHORIZED',

  // Data Errors
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  CAFE_NOT_FOUND = 'CAFE_NOT_FOUND',

  // User Errors
  LOCATION_PERMISSION_DENIED = 'LOCATION_PERMISSION_DENIED',
  CAMERA_PERMISSION_DENIED = 'CAMERA_PERMISSION_DENIED',

  // System Errors
  STORAGE_QUOTA_EXCEEDED = 'STORAGE_QUOTA_EXCEEDED',
  UNSUPPORTED_BROWSER = 'UNSUPPORTED_BROWSER'
}

export class WFCError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: unknown,
    public recoverable = false
  ) {
    super(message);
    this.name = 'WFCError';
  }
}

// Error Handler Service
class ErrorHandlerService {
  private errorQueue: WFCError[] = [];

  handle(error: WFCError): void {
    // Log error
    console.error(`[${error.code}] ${error.message}`, error.details);

    // Queue for offline retry if recoverable
    if (error.recoverable && navigator.onLine === false) {
      this.errorQueue.push(error);
      return;
    }

    // Show user-friendly message
    this.showUserError(error);

    // Report to monitoring (in production)
    if (import.meta.env.PROD) {
      this.reportError(error);
    }
  }

  private showUserError(error: WFCError): void {
    const userMessage = this.getUserMessage(error);

    // Show toast notification
    toast.error(userMessage.message, {
      action: userMessage.action ? {
        label: userMessage.action.label,
        onClick: userMessage.action.handler
      } : undefined
    });
  }

  private getUserMessage(error: WFCError): UserMessage {
    switch (error.code) {
      case ErrorCode.NETWORK_UNAVAILABLE:
        return {
          message: 'No internet connection. Using offline data.',
          action: {
            label: 'Retry',
            handler: () => window.location.reload()
          }
        };

      case ErrorCode.LOCATION_PERMISSION_DENIED:
        return {
          message: 'Location needed to find nearby cafés.',
          action: {
            label: 'Enable',
            handler: () => this.requestLocationPermission()
          }
        };

      case ErrorCode.API_RATE_LIMIT:
        return {
          message: 'Too many requests. Please wait a moment.',
          action: {
            label: 'Retry in 1min',
            handler: () => setTimeout(() => window.location.reload(), 60000)
          }
        };

      default:
        return {
          message: 'Something went wrong. Please try again.',
          action: {
            label: 'Retry',
            handler: () => window.location.reload()
          }
        };
    }
  }

  // Process queued errors when back online
  async processErrorQueue(): Promise<void> {
    if (navigator.onLine && this.errorQueue.length > 0) {
      const errors = [...this.errorQueue];
      this.errorQueue = [];

      for (const error of errors) {
        try {
          await this.retryOperation(error);
        } catch (retryError) {
          console.error('Retry failed:', retryError);
          this.handle(error); // Re-handle if retry fails
        }
      }
    }
  }
}

// React Error Boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ComponentType<{ error: Error; retry: () => void }> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const wfcError = new WFCError(
      ErrorCode.VALIDATION_FAILED,
      'React component error',
      { error: error.message, errorInfo }
    );

    errorHandler.handle(wfcError);
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback;
      return (
        <Fallback
          error={this.state.error!}
          retry={() => this.setState({ hasError: false, error: undefined })}
        />
      );
    }

    return this.props.children;
  }
}

// Service-level error handling
class CafeService {
  async getCafes(filters?: FilterOptions): Promise<Cafe[]> {
    try {
      const response = await this.api.getCafes(filters);
      return response.data;
    } catch (error) {
      if (error instanceof Response) {
        if (error.status === 429) {
          throw new WFCError(
            ErrorCode.API_RATE_LIMIT,
            'API rate limit exceeded',
            { status: error.status },
            true // Recoverable
          );
        }

        if (error.status === 401) {
          throw new WFCError(
            ErrorCode.API_UNAUTHORIZED,
            'API authentication failed',
            { status: error.status }
          );
        }
      }

      if (!navigator.onLine) {
        // Try to return cached data
        const cachedCafes = await this.getCachedCafes();
        if (cachedCafes.length > 0) {
          return cachedCafes;
        }

        throw new WFCError(
          ErrorCode.NETWORK_UNAVAILABLE,
          'No internet connection and no cached data',
          error,
          true
        );
      }

      throw new WFCError(
        ErrorCode.VALIDATION_FAILED,
        'Failed to fetch cafés',
        error
      );
    }
  }
}
```

---

## Monitoring & Observability

### Analytics & Performance Monitoring

```typescript
// Privacy-First Analytics
class AnalyticsService {
  private enabled: boolean

  constructor() {
    // Only enable in production and with user consent
    this.enabled = import.meta.env.PROD && this.hasUserConsent()
  }

  // Core user journey tracking
  trackPageView(page: string): void {
    if (!this.enabled) return

    // Use privacy-focused analytics (e.g., Plausible)
    plausible('pageview', {
      url: page,
      // No personal data collected
    })
  }

  trackUserAction(action: string, properties?: Record<string, any>): void {
    if (!this.enabled) return

    // Track anonymous user behaviors
    plausible(action, {
      props: {
        ...properties,
        // Remove any PII
        user_id: undefined,
        session_id: this.getAnonymousSessionId(),
      },
    })
  }

  trackPerformanceMetric(metric: string, value: number): void {
    if (!this.enabled) return

    plausible('performance', {
      props: {
        metric,
        value: Math.round(value),
        connection: this.getConnectionType(),
        device: this.getDeviceType(),
      },
    })
  }

  // Error tracking (anonymized)
  trackError(error: WFCError): void {
    if (!this.enabled) return

    plausible('error', {
      props: {
        error_code: error.code,
        error_type: error.name,
        // No sensitive error details
        recoverable: error.recoverable,
      },
    })
  }

  private getAnonymousSessionId(): string {
    // Generate session ID without personal identification
    return btoa(Date.now().toString()).slice(0, 8)
  }

  private hasUserConsent(): boolean {
    // Check for user consent (GDPR compliance)
    return localStorage.getItem('analytics-consent') === 'granted'
  }
}

// Performance Observer Integration
class PerformanceMonitoringService {
  private metrics: Map<string, number[]> = new Map()

  init(): void {
    this.observeCoreWebVitals()
    this.observeResourceTiming()
    this.observeUserTiming()
  }

  private observeCoreWebVitals(): void {
    // First Contentful Paint
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.recordMetric('FCP', entry.startTime)
          analytics.trackPerformanceMetric('FCP', entry.startTime)
        }
      }
    }).observe({ entryTypes: ['paint'] })

    // Largest Contentful Paint
    new PerformanceObserver(list => {
      const entries = list.getEntries()
      const lcp = entries[entries.length - 1]
      this.recordMetric('LCP', lcp.startTime)
      analytics.trackPerformanceMetric('LCP', lcp.startTime)
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // First Input Delay
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        const fid = entry.processingStart - entry.startTime
        this.recordMetric('FID', fid)
        analytics.trackPerformanceMetric('FID', fid)
      }
    }).observe({ entryTypes: ['first-input'] })
  }

  private observeResourceTiming(): void {
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('sheets.googleapis.com')) {
          const apiTime = entry.responseEnd - entry.requestStart
          this.recordMetric('API_Response_Time', apiTime)
          analytics.trackPerformanceMetric('API_Response_Time', apiTime)
        }
      }
    }).observe({ entryTypes: ['resource'] })
  }

  // Custom timing measurements
  measureUserJourney(name: string): () => void {
    const start = performance.now()

    return () => {
      const duration = performance.now() - start
      this.recordMetric(`Journey_${name}`, duration)
      analytics.trackPerformanceMetric(`Journey_${name}`, duration)
    }
  }

  private recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }

    const values = this.metrics.get(name)!
    values.push(value)

    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift()
    }
  }

  getMetricSummary(name: string): MetricSummary | null {
    const values = this.metrics.get(name)
    if (!values || values.length === 0) return null

    const sorted = [...values].sort((a, b) => a - b)
    const average = values.reduce((sum, val) => sum + val, 0) / values.length

    return {
      average: Math.round(average),
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    }
  }
}

// Usage Monitoring
class UsageMonitoringService {
  private sessionStart: number = Date.now()
  private pageViews: string[] = []
  private actions: string[] = []

  trackUserFlow(): void {
    // Track user journey through the app
    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          this.pageViews.push(entry.name)
          analytics.trackPageView(entry.name)
        }
      }
    })

    observer.observe({ entryTypes: ['navigation'] })
  }

  trackFeatureUsage(feature: string): void {
    this.actions.push(feature)
    analytics.trackUserAction('feature_used', { feature })
  }

  getSessionSummary(): SessionSummary {
    const sessionDuration = Date.now() - this.sessionStart

    return {
      duration: Math.round(sessionDuration / 1000), // seconds
      pageViews: this.pageViews.length,
      actions: this.actions.length,
      uniquePages: new Set(this.pageViews).size,
      topFeatures: this.getTopFeatures(),
    }
  }

  private getTopFeatures(): Array<{ feature: string; count: number }> {
    const featureCount = this.actions.reduce(
      (acc, action) => {
        acc[action] = (acc[action] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return Object.entries(featureCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([feature, count]) => ({ feature, count }))
  }
}

// Health Check Service
class HealthCheckService {
  async performHealthCheck(): Promise<HealthStatus> {
    const results: HealthCheckResult[] = []

    // API Health
    try {
      const start = Date.now()
      await fetch('https://sheets.googleapis.com/v4/spreadsheets/test')
      results.push({
        service: 'Google Sheets API',
        status: 'healthy',
        responseTime: Date.now() - start,
      })
    } catch (error) {
      results.push({
        service: 'Google Sheets API',
        status: 'unhealthy',
        error: error.message,
      })
    }

    // Storage Health
    try {
      const testKey = 'health-check'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      results.push({
        service: 'Local Storage',
        status: 'healthy',
      })
    } catch (error) {
      results.push({
        service: 'Local Storage',
        status: 'unhealthy',
        error: 'Storage quota exceeded',
      })
    }

    // IndexedDB Health
    try {
      const db = await this.openTestDB()
      db.close()
      results.push({
        service: 'IndexedDB',
        status: 'healthy',
      })
    } catch (error) {
      results.push({
        service: 'IndexedDB',
        status: 'unhealthy',
        error: error.message,
      })
    }

    const overallStatus = results.every(r => r.status === 'healthy') ? 'healthy' : 'degraded'

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: results,
    }
  }

  private openTestDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('health-check', 1)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
}
```

---

This architecture document provides a comprehensive, mobile-first approach to building WFC-Pedia
that perfectly aligns with your front-end specification. The architecture emphasizes:

1. **Mobile-First Design**: Every component optimized for touch, thumb-zone navigation, and mobile
   performance
2. **Indonesian Market Focus**: Network-aware loading, data-conscious design, offline-first
   functionality
3. **Community-Centric**: Wikipedia-like transparency with Google Sheets backend
4. **Zero-Cost Operations**: Strategic use of free-tier services for sustainability
5. **Progressive Web App**: Full offline functionality with native app-like experience

The architecture is ready for AI-driven implementation, with clear coding standards, comprehensive
error handling, and detailed component specifications that match your front-end requirements
exactly.

<function_calls> <invoke name="TodoWrite"> <parameter name="todos">[{"id": "1", "content": "Analyze
front-end specification requirements", "status": "completed"}, {"id": "2", "content": "Create
full-stack architecture aligned with front-end spec", "status": "completed"}, {"id": "3", "content":
"Ensure architecture supports mobile-first design requirements", "status": "completed"}, {"id": "4",
"content": "Validate technical constraints and implementation phases", "status": "completed"},
{"id": "5", "content": "Generate final architecture document", "status": "completed"}]
