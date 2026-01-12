/**
 * UI Store
 *
 * Zustand store for global UI state management including theme,
 * toasts, modals, and loading states.
 *
 * @features
 * - Theme management (light/dark/system)
 * - Toast notifications with queue management
 * - Modal stack for nested modals
 * - Global loading states
 * - Responsive breakpoint tracking
 *
 * @example
 * ```ts
 * const { theme, addToast, openModal, setLoading } = useUiStore()
 * const toasts = useUiStore(selectToasts)
 * ```
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type {
  Theme,
  ThemeConfig,
  Toast,
  ToastVariant,
  ToastOptions,
  ModalState,
  ModalConfig,
  LoadingState
} from '@/types/ui.types'
import { ToastPosition } from '@/types/ui.types'

// ============================================================================
// STATE INTERFACE
// ============================================================================

/**
 * UI Store State
 *
 * Complete state for UI management
 */
export interface UIState {
  // Theme
  /** Current theme configuration */
  themeConfig: ThemeConfig
  /** Active theme ('light' | 'dark') */
  theme: 'light' | 'dark'

  // Toasts
  /** Toast notification queue */
  toasts: Toast[]
  /** Toast configuration options */
  toastOptions: ToastOptions

  // Modals
  /** Modal stack (for nested modals) */
  modalStack: ModalState[]
  /** Currently active modal (top of stack) */
  activeModal: ModalState | null

  // Loading States
  /** Global loading state */
  globalLoading: boolean
  /** Named loading states */
  loadingStates: Record<string, LoadingState<unknown>>

  // Responsive
  /** Current viewport width */
  viewportWidth: number
  /** Current viewport height */
  viewportHeight: number
  /** Whether device is mobile */
  isMobile: boolean
  /** Whether device is tablet */
  isTablet: boolean
  /** Whether device is desktop */
  isDesktop: boolean

  // Misc
  /** Sidebar open state */
  sidebarOpen: boolean
  /** Whether panels are collapsed */
  panelsCollapsed: boolean
}

// ============================================================================
// INITIAL STATE
// ============================================================================

/**
 * Default theme configuration
 */
const defaultThemeConfig: ThemeConfig = {
  theme: 'dark',
  particleEffects: true,
  reducedMotion: false,
  compactMode: false,
  highContrast: false
}

/**
 * Default toast options
 */
const defaultToastOptions: ToastOptions = {
  position: ToastPosition.BOTTOM_RIGHT,
  maxToasts: 5,
  defaultDuration: 5000,
  sound: false
}

/**
 * Initial UI store state
 */
const initialState: UIState = {
  themeConfig: defaultThemeConfig,
  theme: 'dark',

  toasts: [],
  toastOptions: defaultToastOptions,

  modalStack: [],
  activeModal: null,

  globalLoading: false,
  loadingStates: {},

  viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 1024,
  viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 768,
  isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  isTablet: typeof window !== 'undefined' ? window.innerWidth >= 768 && window.innerWidth < 1024 : false,
  isDesktop: typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,

  sidebarOpen: true,
  panelsCollapsed: false
}

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * UI Store Actions
 *
 * All actions available in the UI store
 */
export interface UIActions {
  // Theme Actions

  /**
   * Set theme
   * @param theme - Theme to set
   */
  setTheme: (theme: 'light' | 'dark') => void

  /**
   * Toggle between light and dark theme
   */
  toggleTheme: () => void

  /**
   * Update theme configuration
   * @param config - Partial theme configuration
   */
  updateThemeConfig: (config: Partial<ThemeConfig>) => void

  // Toast Actions

  /**
   * Add a toast notification
   * @param message - Toast message
   * @param variant - Toast variant (success, error, warning, info, default)
   * @param options - Optional toast configuration
   * @returns Toast ID
   */
  addToast: (message: string, variant?: ToastVariant, options?: Partial<Toast>) => string

  /**
   * Remove a toast by ID
   * @param toastId - Toast ID to remove
   */
  removeToast: (toastId: string) => void

  /**
   * Clear all toasts
   */
  clearToasts: () => void

  /**
   * Update toast options
   * @param options - New toast options
   */
  setToastOptions: (options: Partial<ToastOptions>) => void

  // Modal Actions

  /**
   * Open a modal
   * @param type - Modal type identifier
   * @param data - Optional data to pass to modal
   * @param config - Optional modal configuration
   */
  openModal: (type: string, data?: unknown, config?: Partial<ModalConfig>) => void

  /**
   * Close the active modal
   * @param result - Optional result to return
   */
  closeModal: (result?: unknown) => void

  /**
   * Close all modals
   */
  closeAllModals: () => void

  /**
   * Update active modal data
   * @param data - New modal data
   */
  updateModalData: (data: unknown) => void

  // Loading Actions

  /**
   * Set global loading state
   * @param loading - Loading status
   */
  setGlobalLoading: (loading: boolean) => void

  /**
   * Set named loading state
   * @param key - Loading state key
   * @param loading - Loading status
   * @param data - Optional data to attach
   */
  setLoading: (key: string, loading: boolean, data?: unknown) => void

  /**
   * Set loading state error
   * @param key - Loading state key
   * @param error - Error message
   */
  setLoadingError: (key: string, error: string) => void

  /**
   * Clear a loading state
   * @param key - Loading state key to clear
   */
  clearLoading: (key: string) => void

  /**
   * Clear all loading states
   */
  clearAllLoading: () => void

  // Responsive Actions

  /**
   * Update viewport dimensions
   * @param width - Viewport width
   * @param height - Viewport height
   */
  updateViewport: (width: number, height: number) => void

  // Sidebar Actions

  /**
   * Toggle sidebar open state
   */
  toggleSidebar: () => void

  /**
   * Set sidebar open state
   * @param open - Open state
   */
  setSidebarOpen: (open: boolean) => void

  /**
   * Toggle panels collapsed state
   */
  togglePanels: () => void

  /**
   * Reset UI state to initial values
   */
  reset: () => void
}

// ============================================================================
// STORE CREATION
// ============================================================================

/**
 * UI Store
 *
 * Main UI state management store with:
 * - DevTools integration for debugging
 * - Persistence for theme and preferences
 * - Immer middleware for immutable updates
 */
export const useUiStore = create<UIState & UIActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        // Theme Actions
        setTheme: (theme) =>
          set((state) => {
            state.theme = theme
            state.themeConfig.theme = theme
          }),

        toggleTheme: () =>
          set((state) => {
            state.theme = state.theme === 'light' ? 'dark' : 'light'
            state.themeConfig.theme = state.theme
          }),

        updateThemeConfig: (config) =>
          set((state) => {
            state.themeConfig = { ...state.themeConfig, ...config }
          }),

        // Toast Actions
        addToast: (message, variant = 'default', options = {}) => {
          const toastId = `toast-${Date.now()}-${Math.random()}`

          const toast: Toast = {
            id: toastId,
            message,
            variant,
            duration: get().toastOptions.defaultDuration,
            dismissible: true,
            ...options
          }

          set((state) => {
            // Remove oldest toast if at max capacity
            if (state.toastOptions.maxToasts && state.toasts.length >= state.toastOptions.maxToasts) {
              state.toasts.shift()
            }
            state.toasts.push(toast)
          })

          // Auto-dismiss after duration
          if (toast.duration && toast.duration > 0) {
            setTimeout(() => {
              get().removeToast(toastId)
            }, toast.duration)
          }

          return toastId
        },

        removeToast: (toastId) =>
          set((state) => {
            state.toasts = state.toasts.filter((t) => t.id !== toastId)
          }),

        clearToasts: () =>
          set((state) => {
            state.toasts = []
          }),

        setToastOptions: (options) =>
          set((state) => {
            state.toastOptions = { ...state.toastOptions, ...options }
          }),

        // Modal Actions
        openModal: (type, data, config) =>
          set((state) => {
            const modal: ModalState = {
              open: true,
              type,
              data,
              config
            }
            state.modalStack.push(modal)
            state.activeModal = modal
          }),

        closeModal: (result) =>
          set((state) => {
            // Remove the top modal
            state.modalStack.pop()
            // Update active modal to new top
            state.activeModal =
              state.modalStack.length > 0 ? state.modalStack[state.modalStack.length - 1] : null
          }),

        closeAllModals: () =>
          set((state) => {
            state.modalStack = []
            state.activeModal = null
          }),

        updateModalData: (data) =>
          set((state) => {
            if (state.activeModal) {
              state.activeModal.data = data
              // Also update in stack
              if (state.modalStack.length > 0) {
                state.modalStack[state.modalStack.length - 1].data = data
              }
            }
          }),

        // Loading Actions
        setGlobalLoading: (loading) =>
          set((state) => {
            state.globalLoading = loading
          }),

        setLoading: (key, loading, data) =>
          set((state) => {
            if (loading) {
              state.loadingStates[key] = {
                loading: true,
                error: null,
                data: data || null
              }
            } else {
              state.loadingStates[key] = {
                loading: false,
                error: null,
                data: data || state.loadingStates[key]?.data || null
              }
            }
          }),

        setLoadingError: (key, error) =>
          set((state) => {
            state.loadingStates[key] = {
              loading: false,
              error,
              data: null
            }
          }),

        clearLoading: (key) =>
          set((state) => {
            delete state.loadingStates[key]
          }),

        clearAllLoading: () =>
          set((state) => {
            state.loadingStates = {}
            state.globalLoading = false
          }),

        // Responsive Actions
        updateViewport: (width, height) =>
          set((state) => {
            state.viewportWidth = width
            state.viewportHeight = height
            state.isMobile = width < 768
            state.isTablet = width >= 768 && width < 1024
            state.isDesktop = width >= 1024

            // Auto-close sidebar on mobile
            if (width < 768 && state.sidebarOpen) {
              state.sidebarOpen = false
            }
          }),

        // Sidebar Actions
        toggleSidebar: () =>
          set((state) => {
            state.sidebarOpen = !state.sidebarOpen
          }),

        setSidebarOpen: (open) =>
          set((state) => {
            state.sidebarOpen = open
          }),

        togglePanels: () =>
          set((state) => {
            state.panelsCollapsed = !state.panelsCollapsed
          }),

        reset: () =>
          set((state) => {
            Object.assign(state, initialState)
          })
      })),
      {
        name: 'ui-store',
        // Only persist theme and preferences (not transient UI state)
        partialize: (state) => ({
          themeConfig: state.themeConfig,
          theme: state.theme,
          toastOptions: state.toastOptions,
          panelsCollapsed: state.panelsCollapsed
        })
      }
    ),
    { name: 'UIStore' }
  )
)

// ============================================================================
// SELECTORS (Derived State)
// ============================================================================

/**
 * Select visible toasts (respect max limit)
 * @returns Array of visible toasts
 */
export const selectToasts = (state: UIState & UIActions): Toast[] => {
  const maxToasts = state.toastOptions.maxToasts ?? 5
  return state.toasts.slice(-maxToasts)
}

/**
 * Select loading state for a specific key
 * @param key - Loading state key
 * @returns Loading state or null if not found
 */
export const selectLoadingState = (key: string) => (state: UIState & UIActions) => {
  return state.loadingStates[key] || null
}

/**
 * Select whether any loading state is active
 * @returns Whether any loading is in progress
 */
export const selectHasLoading = (state: UIState & UIActions): boolean => {
  return state.globalLoading || Object.values(state.loadingStates).some((s) => s.loading)
}

/**
 * Select whether a modal is currently open
 * @returns Whether a modal is open
 */
export const selectIsModalOpen = (state: UIState & UIActions): boolean => {
  return state.activeModal !== null
}

/**
 * Select current breakpoint
 * @returns Current breakpoint string
 */
export const selectBreakpoint = (state: UIState & UIActions): string => {
  if (state.viewportWidth < 640) return 'xs'
  if (state.viewportWidth < 768) return 'sm'
  if (state.viewportWidth < 1024) return 'md'
  if (state.viewportWidth < 1280) return 'lg'
  if (state.viewportWidth < 1536) return 'xl'
  return '2xl'
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize viewport tracking on client side
 */
if (typeof window !== 'undefined') {
  // Initial viewport setup
  const updateViewport = () => {
    useUiStore.getState().updateViewport(window.innerWidth, window.innerHeight)
  }

  // Set initial viewport
  updateViewport()

  // Listen for resize events
  window.addEventListener('resize', updateViewport)

  // Listen for system theme changes
  if (window.matchMedia) {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleThemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const store = useUiStore.getState()
      // Only update if theme is set to 'system'
      if (store.themeConfig.theme === 'system') {
        store.setTheme(e.matches ? 'dark' : 'light')
      }
    }

    darkModeQuery.addEventListener('change', handleThemeChange)
    // Initial system theme detection
    handleThemeChange(darkModeQuery)
  }
}
