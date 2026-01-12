/**
 * User Store
 *
 * Zustand store for user preferences, profile, and settings management.
 * Handles user data, preferences sync, and authentication state.
 *
 * @features
 * - User profile management
 * - Preferences synchronization
 * - Settings persistence
 * - Currency and locale preferences
 * - Data refresh intervals
 *
 * @example
 * ```ts
 * const { user, preferences, updatePreferences, updateProfile } = useUserStore()
 * ```
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { UserPreferences } from '@/types/database.types'

// ============================================================================
// STATE INTERFACE
// ============================================================================

/**
 * User Profile
 *
 * Basic user profile information
 */
export interface UserProfile {
  /** User ID */
  id: string
  /** User email */
  email: string
  /** Display username */
  username?: string
  /** Profile avatar URL */
  avatar?: string
  /** Account creation timestamp */
  createdAt: string
  /** Last login timestamp */
  lastLogin?: string
}

/**
 * User Settings
 *
 * Extended user settings beyond database preferences
 */
export interface UserSettings {
  /** Preferred currency for displaying values */
  currency: string
  /** Locale for formatting (dates, numbers) */
  locale: string
  /** Timezone for displaying timestamps */
  timezone: string
  /** Data refresh interval in milliseconds */
  dataRefreshInterval: number
  /** Enable real-time updates */
  realtimeEnabled: boolean
  /** Enable sounds for notifications */
  soundsEnabled: boolean
  /** Enable haptic feedback (mobile) */
  hapticEnabled: boolean
  /** Enable analytics tracking */
  analyticsEnabled: boolean
  /** Enable beta features */
  betaFeatures: boolean
}

/**
 * User Store State
 *
 * Complete state for user management
 */
export interface UserState {
  // Authentication
  /** Current user (null if not authenticated) */
  user: UserProfile | null
  /** Authentication state */
  isAuthenticated: boolean
  /** Authentication loading state */
  authLoading: boolean

  // Preferences (from database)
  /** User preferences from database */
  preferences: UserPreferences | null

  // Extended Settings
  /** Extended user settings */
  settings: UserSettings

  // UI State
  /** Loading state for user data */
  loading: boolean
  /** Error message */
  error: string | null
  /** Last sync timestamp */
  lastSync: number | null
}

// ============================================================================
// INITIAL STATE
// ============================================================================

/**
 * Default user settings
 */
const defaultSettings: UserSettings = {
  currency: 'USD',
  locale: 'en-US',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  dataRefreshInterval: 60000, // 1 minute
  realtimeEnabled: true,
  soundsEnabled: true,
  hapticEnabled: false,
  analyticsEnabled: true,
  betaFeatures: false
}

/**
 * Initial user store state
 */
const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  authLoading: true,

  preferences: null,

  settings: defaultSettings,

  loading: false,
  error: null,
  lastSync: null
}

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * User Store Actions
 *
 * All actions available in the user store
 */
export interface UserActions {
  // Authentication Actions

  /**
   * Set current user
   * @param user - User profile or null to logout
   */
  setUser: (user: UserProfile | null) => void

  /**
   * Set authentication loading state
   * @param loading - Loading status
   */
  setAuthLoading: (loading: boolean) => void

  /**
   * Logout user
   */
  logout: () => void

  // Preferences Actions

  /**
   * Set user preferences
   * @param preferences - User preferences
   */
  setPreferences: (preferences: UserPreferences) => void

  /**
   * Update user preferences
   * @param updates - Partial preferences to update
   */
  updatePreferences: (updates: Partial<UserPreferences>) => void

  /**
   * Sync preferences to database
   * @param userId - User ID to sync preferences for
   */
  syncPreferences: (userId: string) => Promise<void>

  // Settings Actions

  /**
   * Update user settings
   * @param updates - Partial settings to update
   */
  updateSettings: (updates: Partial<UserSettings>) => void

  /**
   * Set currency
   * @param currency - Currency code (e.g., 'USD', 'EUR')
   */
  setCurrency: (currency: string) => void

  /**
   * Set locale
   * @param locale - Locale code (e.g., 'en-US', 'pt-BR')
   */
  setLocale: (locale: string) => void

  /**
   * Set data refresh interval
   * @param interval - Interval in milliseconds
   */
  setDataRefreshInterval: (interval: number) => void

  /**
   * Toggle real-time updates
   */
  toggleRealtime: () => void

  /**
   * Toggle sounds
   */
  toggleSounds: () => void

  /**
   * Toggle analytics
   */
  toggleAnalytics: () => void

  // Profile Actions

  /**
   * Update user profile
   * @param updates - Partial profile to update
   */
  updateProfile: (updates: Partial<UserProfile>) => void

  /**
   * Update username
   * @param username - New username
   */
  setUsername: (username: string) => void

  /**
   * Update avatar
   * @param avatar - New avatar URL
   */
  setAvatar: (avatar: string) => void

  // Data Actions

  /**
   * Load user data
   * @param userId - User ID to load data for
   */
  loadUserData: (userId: string) => Promise<void>

  /**
   * Sync all user data to database
   */
  syncSettings: () => Promise<void>

  // Loading State Actions

  /**
   * Set loading state
   * @param loading - Loading status
   */
  setLoading: (loading: boolean) => void

  /**
   * Set error state
   * @param error - Error message or null
   */
  setError: (error: string | null) => void

  /**
   * Reset state to initial values
   */
  reset: () => void
}

// ============================================================================
// STORE CREATION
// ============================================================================

/**
 * User Store
 *
 * Main user state management store with:
 * - DevTools integration for debugging
 * - Persistence for settings and preferences
 * - Immer middleware for immutable updates
 * - Automatic sync to database
 */
export const useUserStore = create<UserState & UserActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        // Authentication Actions
        setUser: (user) =>
          set((state) => {
            state.user = user
            state.isAuthenticated = user !== null
            state.authLoading = false
          }),

        setAuthLoading: (loading) =>
          set((state) => {
            state.authLoading = loading
          }),

        logout: () =>
          set((state) => {
            state.user = null
            state.isAuthenticated = false
            state.preferences = null
            state.lastSync = null
          }),

        // Preferences Actions
        setPreferences: (preferences) =>
          set((state) => {
            state.preferences = preferences
            state.lastSync = Date.now()
          }),

        updatePreferences: (updates) =>
          set((state) => {
            if (state.preferences) {
              state.preferences = { ...state.preferences, ...updates }
            }
          }),

        syncPreferences: async (userId) => {
          const { preferences } = get()
          if (!preferences) return

          set((state) => {
            state.loading = true
            state.error = null
          })

          try {
            // TODO: Implement actual sync to Supabase
            // await updateUserPreferences(userId, preferences)

            set((state) => {
              state.loading = false
              state.lastSync = Date.now()
            })
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to sync preferences'
              state.loading = false
            })
          }
        },

        // Settings Actions
        updateSettings: (updates) =>
          set((state) => {
            state.settings = { ...state.settings, ...updates }
          }),

        setCurrency: (currency) =>
          set((state) => {
            state.settings.currency = currency
          }),

        setLocale: (locale) =>
          set((state) => {
            state.settings.locale = locale
          }),

        setDataRefreshInterval: (interval) =>
          set((state) => {
            state.settings.dataRefreshInterval = interval
          }),

        toggleRealtime: () =>
          set((state) => {
            state.settings.realtimeEnabled = !state.settings.realtimeEnabled
          }),

        toggleSounds: () =>
          set((state) => {
            state.settings.soundsEnabled = !state.settings.soundsEnabled
          }),

        toggleAnalytics: () =>
          set((state) => {
            state.settings.analyticsEnabled = !state.settings.analyticsEnabled
          }),

        // Profile Actions
        updateProfile: (updates) =>
          set((state) => {
            if (state.user) {
              state.user = { ...state.user, ...updates }
            }
          }),

        setUsername: (username) =>
          set((state) => {
            if (state.user) {
              state.user.username = username
            }
          }),

        setAvatar: (avatar) =>
          set((state) => {
            if (state.user) {
              state.user.avatar = avatar
            }
          }),

        // Data Actions
        loadUserData: async (userId) => {
          set((state) => {
            state.loading = true
            state.error = null
          })

          try {
            // TODO: Implement actual data loading from Supabase
            // const preferences = await getUserPreferences(userId)
            // set((state) => {
            //   state.preferences = preferences
            //   state.loading = false
            //   state.lastSync = Date.now()
            // })

            set((state) => {
              state.loading = false
              state.lastSync = Date.now()
            })
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to load user data'
              state.loading = false
            })
          }
        },

        syncSettings: async () => {
          const { user, preferences, settings } = get()
          if (!user) return

          set((state) => {
            state.loading = true
            state.error = null
          })

          try {
            // TODO: Implement actual sync to Supabase
            // Merge settings with preferences and sync
            // await updateUserPreferences(user.id, {
            //   ...preferences,
            //   ...settings
            // })

            set((state) => {
              state.loading = false
              state.lastSync = Date.now()
            })
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to sync settings'
              state.loading = false
            })
          }
        },

        // Loading State Actions
        setLoading: (loading) =>
          set((state) => {
            state.loading = loading
          }),

        setError: (error) =>
          set((state) => {
            state.error = error
            state.loading = false
          }),

        reset: () =>
          set((state) => {
            Object.assign(state, initialState)
          })
      })),
      {
        name: 'user-store',
        // Persist settings and auth state (not transient loading states)
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          settings: state.settings,
          preferences: state.preferences
        })
      }
    ),
    { name: 'UserStore' }
  )
)

// ============================================================================
// SELECTORS (Derived State)
// ============================================================================

/**
 * Select combined preferences and settings
 * @returns Merged preferences object
 */
export const selectCombinedPreferences = (state: UserState & UserActions) => {
  return {
    ...state.settings,
    ...state.preferences
  }
}

/**
 * Select whether user has premium features
 * @returns Whether user has premium access
 */
export const selectHasPremium = (state: UserState & UserActions): boolean => {
  // TODO: Implement actual premium check
  return state.settings.betaFeatures
}

/**
 * Select user display name
 * @returns Display name (username or email)
 */
export const selectDisplayName = (state: UserState & UserActions): string => {
  return state.user?.username || state.user?.email || 'Guest'
}

/**
 * Select user initials for avatar
 * @returns User initials (up to 2 characters)
 */
export const selectUserInitials = (state: UserState & UserActions): string => {
  const name = state.user?.username || state.user?.email || ''
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}
