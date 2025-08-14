# Frontend Architecture

## Component Hierarchy

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

## State Management Strategy

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

## React Query Integration

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
