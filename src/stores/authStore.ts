import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { User } from '@/types'
import type { Permission, UserRole } from '@/lib/constants/roles'
import { hasPermission, hasAnyPermission, hasAllPermissions } from '@/lib/constants/roles'
import { startNewSession, endSession, getCurrentSessionId, restoreSession } from '@/lib/utils/sessionSync'
import { clearTokens } from '@/lib/api/client'

/**
 * Authentication Store State
 */
interface AuthState {
  // User data
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean

  // Session management
  sessionId: string | null
  sessionExpiry: number | null
  lastActivity: number
  isLoggingOut: boolean // Guard to prevent recursive logout calls

  // 2FA state
  requires2FA: boolean
  pending2FA: boolean
  tempToken: string | null

  // Actions
  setUser: (user: User | null) => void
  setRequires2FA: (requires: boolean) => void
  setPending2FA: (pending: boolean) => void
  setTempToken: (token: string | null) => void
  login: (user: User) => void
  logout: () => void
  updateLastActivity: () => void
  checkSession: () => boolean
  validateSession: () => boolean

  // RBAC helpers
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  hasAllPermissions: (permissions: Permission[]) => boolean
  hasRole: (role: UserRole) => boolean
  hasAnyRole: (roles: UserRole[]) => boolean
}

/**
 * Session timeout duration (from environment variable)
 * Default: 15 minutes (900000 milliseconds)
 */
const SESSION_TIMEOUT = parseInt(import.meta.env.VITE_SESSION_TIMEOUT || '900000', 10)

/**
 * Auth Store
 * Manages authentication state and RBAC
 *
 * SECURITY NOTES:
 * - User data is stored in sessionStorage (not localStorage) for security
 * - Session expires after inactivity timeout
 * - All sensitive operations require fresh authentication
 * - No PHI should be stored in this store
 */
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        isLoading: false,
        sessionId: null,
        sessionExpiry: null,
        lastActivity: Date.now(),
        isLoggingOut: false,
        requires2FA: false,
        pending2FA: false,
        tempToken: null,

        /**
         * Set user data
         * Normalizes role to lowercase for consistent role checking
         */
        setUser: (user) =>
          set({
            user: user
              ? {
                  ...user,
                  role: user.role.toLowerCase() as UserRole,
                }
              : null,
            isAuthenticated: !!user,
            sessionExpiry: user ? Date.now() + SESSION_TIMEOUT : null,
            lastActivity: Date.now(),
          }),

        /**
         * Set 2FA requirement
         */
        setRequires2FA: (requires) =>
          set({
            requires2FA: requires,
          }),

        /**
         * Set 2FA pending state
         */
        setPending2FA: (pending) =>
          set({
            pending2FA: pending,
          }),

        /**
         * Set temporary 2FA token
         */
        setTempToken: (token) =>
          set({
            tempToken: token,
          }),

        /**
         * Login user
         * Starts a new session and invalidates all other tabs
         */
        login: (user) => {
          const sessionId = startNewSession()
          set({
            user: {
              ...user,
              role: user.role.toLowerCase() as UserRole,
            },
            isAuthenticated: true,
            sessionId,
            sessionExpiry: Date.now() + SESSION_TIMEOUT,
            lastActivity: Date.now(),
            requires2FA: false,
            pending2FA: false,
            tempToken: null,
          })
        },

        /**
         * Logout user and clear all state
         * Ends the current session and clears all tokens
         */
        logout: () => {
          const state = get()

          // Guard: Prevent recursive logout calls
          if (state.isLoggingOut) {
            if (import.meta.env.DEV) {
              console.warn('[Auth] Logout already in progress, skipping')
            }
            return
          }

          // Set logout flag
          set({ isLoggingOut: true })

          // Clear tokens from sessionStorage (access token, refresh token, CSRF token)
          clearTokens()
          // End the session (clear session ID from localStorage)
          endSession()
          // Clear auth state
          set({
            user: null,
            isAuthenticated: false,
            sessionId: null,
            sessionExpiry: null,
            isLoggingOut: false,
            requires2FA: false,
            pending2FA: false,
            tempToken: null,
          })
        },

        /**
         * Update last activity timestamp
         * Call this on user interactions to extend session
         */
        updateLastActivity: () => {
          const state = get()
          if (state.isAuthenticated) {
            set({
              lastActivity: Date.now(),
              sessionExpiry: Date.now() + SESSION_TIMEOUT,
            })
          }
        },

        /**
         * Check if session is still valid
         * Returns true if valid, false if expired
         */
        checkSession: () => {
          const state = get()
          if (!state.isAuthenticated || !state.sessionExpiry) {
            return false
          }

          const now = Date.now()
          const isValid = now < state.sessionExpiry

          if (!isValid) {
            // Session expired - logout
            get().logout()
            return false
          }

          return true
        },

        /**
         * Validate that this tab's session is still the active session
         * Returns true if valid, false if another user logged in
         */
        validateSession: () => {
          const state = get()

          // Don't validate if already logging out
          if (state.isLoggingOut) {
            return false
          }

          if (!state.isAuthenticated || !state.sessionId) {
            return false
          }

          const currentSessionId = getCurrentSessionId()
          const isValid = currentSessionId === state.sessionId

          if (!isValid) {
            // Session invalidated by another tab - logout
            console.warn('[Auth] Session invalidated - another user logged in')
            get().logout()
            return false
          }

          return true
        },

        /**
         * RBAC Helper: Check if user has a specific permission
         */
        hasPermission: (permission) => {
          const state = get()
          if (!state.user) return false
          return hasPermission(state.user.role, permission)
        },

        /**
         * RBAC Helper: Check if user has any of the specified permissions
         */
        hasAnyPermission: (permissions) => {
          const state = get()
          if (!state.user) return false
          return hasAnyPermission(state.user.role, permissions)
        },

        /**
         * RBAC Helper: Check if user has all of the specified permissions
         */
        hasAllPermissions: (permissions) => {
          const state = get()
          if (!state.user) return false
          return hasAllPermissions(state.user.role, permissions)
        },

        /**
         * RBAC Helper: Check if user has a specific role
         * Case-insensitive comparison for backend compatibility
         */
        hasRole: (role) => {
          const state = get()
          return state.user?.role?.toLowerCase() === role.toLowerCase()
        },

        /**
         * RBAC Helper: Check if user has any of the specified roles
         * Case-insensitive comparison for backend compatibility
         */
        hasAnyRole: (roles) => {
          const state = get()
          if (!state.user) return false
          const userRole = state.user.role.toLowerCase()
          return roles.some((role) => role.toLowerCase() === userRole)
        },
      }),
      {
        name: 'auth-storage',
        // Use sessionStorage instead of localStorage for better security
        storage: {
          getItem: (name) => {
            const str = sessionStorage.getItem(name)
            return str ? JSON.parse(str) : null
          },
          setItem: (name, value) => {
            sessionStorage.setItem(name, JSON.stringify(value))
          },
          removeItem: (name) => {
            sessionStorage.removeItem(name)
          },
        },
        // Only persist non-sensitive data
        // Note: isLoggingOut is intentionally excluded as it's transient state
        partialize: (state) => ({
          ...state,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          sessionId: state.sessionId,
          sessionExpiry: state.sessionExpiry,
          lastActivity: state.lastActivity,
        }),
        // Restore session sync state when store rehydrates
        onRehydrateStorage: () => {
          return (state, error) => {
            if (error) {
              console.error('[Auth] Failed to rehydrate store:', error)
              return
            }

            // Restore session ID to sessionSync module
            if (state?.sessionId) {
              const isValid = restoreSession(state.sessionId)

              if (!isValid) {
                // Session is no longer valid (another user logged in)
                console.warn('[Auth] Session no longer valid after rehydration')
                // The periodic validation check will handle logout
              } else if (import.meta.env.DEV) {
                console.log('[Auth] Session restored successfully:', state.sessionId)
              }
            }
          }
        },
      }
    ),
    {
      name: 'AuthStore',
      enabled: import.meta.env.DEV, // Only enable devtools in development
    }
  )
)

/**
 * Session activity tracker
 * Updates last activity on user interactions
 */
if (typeof window !== 'undefined') {
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']

  events.forEach((event) => {
    window.addEventListener(event, () => {
      const state = useAuthStore.getState()
      if (state.isAuthenticated) {
        state.updateLastActivity()
      }
    })
  })

  // Check session validity every minute
  setInterval(() => {
    const state = useAuthStore.getState()
    if (state.isAuthenticated) {
      const isValid = state.checkSession()
      if (!isValid) {
        console.warn('[Auth] Session expired due to inactivity')
        // Optionally show a modal or toast notification
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login?sessionExpired=true'
        }
      }
    }
  }, 60000) // Check every 60 seconds
}

export default useAuthStore
