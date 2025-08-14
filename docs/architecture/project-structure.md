# Project Structure

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
