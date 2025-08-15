import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { FilterOptions } from '../types/cafe'

/**
 * UI notification types
 */
export interface UINotification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number // milliseconds, undefined = permanent
  actions?: Array<{
    label: string
    action: () => void
  }>
}

/**
 * Modal state interface
 */
export interface ModalState {
  isOpen: boolean
  title?: string
  content?: unknown // Use 'unknown' instead of React.ReactNode to avoid React dependency
  size?: 'sm' | 'md' | 'lg' | 'xl'
  onClose?: () => void
}

/**
 * Search and filter state
 */
export interface SearchState {
  query: string
  filters: FilterOptions
  isFilterMenuOpen: boolean
  sortBy: 'name' | 'distance' | 'rating' | 'recent'
  sortOrder: 'asc' | 'desc'
  viewMode: 'list' | 'grid' | 'map'
}

/**
 * UI state interface
 */
interface UIState {
  // Theme and layout
  isDarkMode: boolean
  sidebarOpen: boolean
  compactMode: boolean

  // Loading states
  isGlobalLoading: boolean
  loadingStates: Record<string, boolean>

  // Notifications
  notifications: UINotification[]

  // Modals and dialogs
  modal: ModalState
  confirmDialog: {
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    onCancel?: () => void
  }

  // Search and filters
  search: SearchState

  // Navigation
  currentPage: string
  navigationHistory: string[]

  // Performance and connectivity
  connectionQuality: 'slow' | 'fast' | 'offline'
  performanceMode: 'high' | 'medium' | 'low'

  // User interaction state
  lastInteraction: string | null
  isUserActive: boolean

  // Map state (if using map view)
  mapState: {
    center: { lat: number; lng: number } | null
    zoom: number
    selectedCafeId: string | null
    showUserLocation: boolean
  }
}

/**
 * UI actions interface
 */
interface UIActions {
  // Theme and layout
  toggleDarkMode: () => void
  setDarkMode: (isDark: boolean) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setCompactMode: (compact: boolean) => void

  // Loading states
  setGlobalLoading: (loading: boolean) => void
  setLoadingState: (key: string, loading: boolean) => void
  getLoadingState: (key: string) => boolean

  // Notifications
  addNotification: (notification: Omit<UINotification, 'id'>) => void
  removeNotification: (id: string) => void
  clearAllNotifications: () => void

  // Modals and dialogs
  openModal: (modal: Omit<ModalState, 'isOpen'>) => void
  closeModal: () => void
  openConfirmDialog: (dialog: Omit<UIState['confirmDialog'], 'isOpen'>) => void
  closeConfirmDialog: () => void

  // Search and filters
  setSearchQuery: (query: string) => void
  updateFilters: (filters: Partial<FilterOptions>) => void
  clearFilters: () => void
  setSortBy: (
    sortBy: SearchState['sortBy'],
    order?: SearchState['sortOrder']
  ) => void
  setViewMode: (mode: SearchState['viewMode']) => void
  toggleFilterMenu: () => void

  // Navigation
  setCurrentPage: (page: string) => void
  goBack: () => void

  // Performance and connectivity
  setConnectionQuality: (quality: UIState['connectionQuality']) => void
  setPerformanceMode: (mode: UIState['performanceMode']) => void

  // User interaction
  updateLastInteraction: () => void
  setUserActive: (active: boolean) => void

  // Map actions
  setMapCenter: (center: { lat: number; lng: number }) => void
  setMapZoom: (zoom: number) => void
  selectCafe: (cafeId: string | null) => void
  toggleUserLocation: () => void

  // Utility actions
  resetUIState: () => void
}

/**
 * Combined UI store type
 */
type UIStore = UIState & UIActions

/**
 * Initial state
 */
const initialState: UIState = {
  isDarkMode: false,
  sidebarOpen: false,
  compactMode: false,
  isGlobalLoading: false,
  loadingStates: {},
  notifications: [],
  modal: { isOpen: false },
  confirmDialog: {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  },
  search: {
    query: '',
    filters: {},
    isFilterMenuOpen: false,
    sortBy: 'name',
    sortOrder: 'asc',
    viewMode: 'list',
  },
  currentPage: '/',
  navigationHistory: ['/'],
  connectionQuality: 'fast',
  performanceMode: 'high',
  lastInteraction: null,
  isUserActive: true,
  mapState: {
    center: null,
    zoom: 13,
    selectedCafeId: null,
    showUserLocation: true,
  },
}

/**
 * UI store for managing application UI state
 * Persists user preferences and temporary UI state
 */
export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Theme and layout
      toggleDarkMode: () => {
        set(state => ({ isDarkMode: !state.isDarkMode }))
      },

      setDarkMode: (isDark: boolean) => {
        set({ isDarkMode: isDark })
      },

      toggleSidebar: () => {
        set(state => ({ sidebarOpen: !state.sidebarOpen }))
      },

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open })
      },

      setCompactMode: (compact: boolean) => {
        set({ compactMode: compact })
      },

      // Loading states
      setGlobalLoading: (loading: boolean) => {
        set({ isGlobalLoading: loading })
      },

      setLoadingState: (key: string, loading: boolean) => {
        set(state => ({
          loadingStates: {
            ...state.loadingStates,
            [key]: loading,
          },
        }))
      },

      getLoadingState: (key: string) => {
        return get().loadingStates[key] ?? false
      },

      // Notifications
      addNotification: (notification: Omit<UINotification, 'id'>) => {
        const id = crypto.randomUUID()
        const newNotification: UINotification = {
          id,
          duration: 5000, // Default 5 seconds
          ...notification,
        }

        set(state => ({
          notifications: [...state.notifications, newNotification],
        }))

        // Auto-remove if duration is set
        if (newNotification.duration) {
          setTimeout(() => {
            get().removeNotification(id)
          }, newNotification.duration)
        }
      },

      removeNotification: (id: string) => {
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id),
        }))
      },

      clearAllNotifications: () => {
        set({ notifications: [] })
      },

      // Modals and dialogs
      openModal: (modal: Omit<ModalState, 'isOpen'>) => {
        set({
          modal: {
            isOpen: true,
            ...modal,
          },
        })
      },

      closeModal: () => {
        const currentModal = get().modal
        if (currentModal.onClose) {
          currentModal.onClose()
        }
        set({
          modal: { isOpen: false },
        })
      },

      openConfirmDialog: (dialog: Omit<UIState['confirmDialog'], 'isOpen'>) => {
        set({
          confirmDialog: {
            isOpen: true,
            ...dialog,
          },
        })
      },

      closeConfirmDialog: () => {
        set({
          confirmDialog: {
            isOpen: false,
            title: '',
            message: '',
            onConfirm: () => {},
          },
        })
      },

      // Search and filters
      setSearchQuery: (query: string) => {
        set(state => ({
          search: {
            ...state.search,
            query,
          },
        }))
      },

      updateFilters: (filters: Partial<FilterOptions>) => {
        set(state => ({
          search: {
            ...state.search,
            filters: {
              ...state.search.filters,
              ...filters,
            },
          },
        }))
      },

      clearFilters: () => {
        set(state => ({
          search: {
            ...state.search,
            filters: {},
            query: '',
          },
        }))
      },

      setSortBy: (
        sortBy: SearchState['sortBy'],
        order?: SearchState['sortOrder']
      ) => {
        set(state => ({
          search: {
            ...state.search,
            sortBy,
            sortOrder: order || state.search.sortOrder,
          },
        }))
      },

      setViewMode: (mode: SearchState['viewMode']) => {
        set(state => ({
          search: {
            ...state.search,
            viewMode: mode,
          },
        }))
      },

      toggleFilterMenu: () => {
        set(state => ({
          search: {
            ...state.search,
            isFilterMenuOpen: !state.search.isFilterMenuOpen,
          },
        }))
      },

      // Navigation
      setCurrentPage: (page: string) => {
        set(state => ({
          currentPage: page,
          navigationHistory: [...state.navigationHistory.slice(-10), page], // Keep last 10 pages
        }))
      },

      goBack: () => {
        const history = get().navigationHistory
        if (history.length > 1) {
          const newHistory = history.slice(0, -1)
          const previousPage = newHistory[newHistory.length - 1]
          set({
            currentPage: previousPage,
            navigationHistory: newHistory,
          })
        }
      },

      // Performance and connectivity
      setConnectionQuality: (quality: UIState['connectionQuality']) => {
        set({ connectionQuality: quality })

        // Auto-adjust performance mode based on connection
        if (quality === 'slow' || quality === 'offline') {
          set({ performanceMode: 'low' })
        } else if (quality === 'fast') {
          set({ performanceMode: 'high' })
        }
      },

      setPerformanceMode: (mode: UIState['performanceMode']) => {
        set({ performanceMode: mode })
      },

      // User interaction
      updateLastInteraction: () => {
        set({
          lastInteraction: new Date().toISOString(),
          isUserActive: true,
        })
      },

      setUserActive: (active: boolean) => {
        set({ isUserActive: active })
      },

      // Map actions
      setMapCenter: (center: { lat: number; lng: number }) => {
        set(state => ({
          mapState: {
            ...state.mapState,
            center,
          },
        }))
      },

      setMapZoom: (zoom: number) => {
        set(state => ({
          mapState: {
            ...state.mapState,
            zoom,
          },
        }))
      },

      selectCafe: (cafeId: string | null) => {
        set(state => ({
          mapState: {
            ...state.mapState,
            selectedCafeId: cafeId,
          },
        }))
      },

      toggleUserLocation: () => {
        set(state => ({
          mapState: {
            ...state.mapState,
            showUserLocation: !state.mapState.showUserLocation,
          },
        }))
      },

      // Utility actions
      resetUIState: () => {
        set(initialState)
      },
    }),
    {
      name: 'ui-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist user preferences, not temporary UI state
      partialize: state => ({
        isDarkMode: state.isDarkMode,
        compactMode: state.compactMode,
        search: {
          sortBy: state.search.sortBy,
          sortOrder: state.search.sortOrder,
          viewMode: state.search.viewMode,
        },
        mapState: {
          zoom: state.mapState.zoom,
          showUserLocation: state.mapState.showUserLocation,
        },
        performanceMode: state.performanceMode,
      }),
    }
  )
)

// Auto-track user activity
let activityTimeout: NodeJS.Timeout

const trackActivity = (): void => {
  const store = useUIStore.getState()

  clearTimeout(activityTimeout)
  store.updateLastInteraction()

  // Mark user as inactive after 5 minutes of no activity
  activityTimeout = setTimeout(
    () => {
      store.setUserActive(false)
    },
    5 * 60 * 1000
  )
}

// Listen for user activity events
if (typeof window !== 'undefined') {
  const events = [
    'mousedown',
    'mousemove',
    'keypress',
    'scroll',
    'touchstart',
    'click',
  ]
  events.forEach(event => {
    document.addEventListener(event, trackActivity, { passive: true })
  })

  // Handle visibility changes
  document.addEventListener('visibilitychange', () => {
    useUIStore.getState().setUserActive(document.visibilityState === 'visible')
  })
}
