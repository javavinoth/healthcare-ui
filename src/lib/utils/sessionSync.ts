/**
 * Session Synchronization Utility
 *
 * Ensures only one user session is active across all browser tabs.
 * When a new user logs in, all other tabs are automatically logged out.
 *
 * SECURITY FEATURES:
 * - Single active session per browser
 * - Cross-tab communication via localStorage
 * - Real-time session invalidation
 * - HIPAA-compliant access control
 */

const SESSION_ID_KEY = 'active_session_id'

type SessionChangeListener = (sessionId: string | null) => void

let currentSessionId: string | null = null
let listeners: SessionChangeListener[] = []

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

/**
 * Get the current active session ID from localStorage
 */
export function getActiveSessionId(): string | null {
  try {
    return localStorage.getItem(SESSION_ID_KEY)
  } catch (error) {
    console.error('[SessionSync] Failed to get active session ID:', error)
    return null
  }
}

/**
 * Set the active session ID in localStorage
 * This will trigger storage events in other tabs
 */
export function setActiveSessionId(sessionId: string): void {
  try {
    currentSessionId = sessionId
    localStorage.setItem(SESSION_ID_KEY, sessionId)

    // Notify local listeners
    notifyListeners(sessionId)
  } catch (error) {
    console.error('[SessionSync] Failed to set active session ID:', error)
  }
}

/**
 * Clear the active session ID from localStorage
 * NOTE: Does not notify local listeners to prevent recursion.
 * Storage events will handle cross-tab communication.
 */
export function clearActiveSessionId(): void {
  try {
    currentSessionId = null
    localStorage.removeItem(SESSION_ID_KEY)

    // Don't notify local listeners - prevents infinite recursion
    // Storage events will automatically notify other tabs
  } catch (error) {
    console.error('[SessionSync] Failed to clear active session ID:', error)
  }
}

/**
 * Get the current tab's session ID
 */
export function getCurrentSessionId(): string | null {
  return currentSessionId
}

/**
 * Check if the current tab's session is still active
 */
export function isSessionActive(): boolean {
  const activeSessionId = getActiveSessionId()
  return activeSessionId !== null && activeSessionId === currentSessionId
}

/**
 * Start a new session for the current tab
 * This will invalidate all other tabs
 */
export function startNewSession(): string {
  const newSessionId = generateSessionId()
  setActiveSessionId(newSessionId)

  if (import.meta.env.DEV) {
    console.log('[SessionSync] Started new session:', newSessionId)
  }

  return newSessionId
}

/**
 * End the current session
 */
export function endSession(): void {
  if (currentSessionId && currentSessionId === getActiveSessionId()) {
    clearActiveSessionId()

    if (import.meta.env.DEV) {
      console.log('[SessionSync] Ended session:', currentSessionId)
    }
  }
  currentSessionId = null
}

/**
 * Add a listener for session changes
 * Listener will be called when session is invalidated
 */
export function addSessionChangeListener(listener: SessionChangeListener): void {
  listeners.push(listener)
}

/**
 * Remove a session change listener
 */
export function removeSessionChangeListener(listener: SessionChangeListener): void {
  listeners = listeners.filter((l) => l !== listener)
}

/**
 * Notify all listeners of a session change
 */
function notifyListeners(sessionId: string | null): void {
  listeners.forEach((listener) => {
    try {
      listener(sessionId)
    } catch (error) {
      console.error('[SessionSync] Listener error:', error)
    }
  })
}

/**
 * Initialize session synchronization
 * Sets up storage event listener for cross-tab communication
 */
export function initSessionSync(): void {
  // Listen for storage events from other tabs
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      // Only handle our session ID changes
      if (event.key === SESSION_ID_KEY) {
        const newSessionId = event.newValue

        if (import.meta.env.DEV) {
          console.log('[SessionSync] Storage event detected:', {
            oldValue: event.oldValue,
            newValue: newSessionId,
            currentSessionId,
          })
        }

        // If the active session changed and it's not our session, notify listeners
        if (newSessionId !== currentSessionId) {
          notifyListeners(newSessionId)
        }
      }
    })

    if (import.meta.env.DEV) {
      console.log('[SessionSync] Initialized')
    }
  }
}

/**
 * Check if there's an existing active session
 * Returns true if another tab has an active session
 */
export function hasExistingSession(): boolean {
  const activeSessionId = getActiveSessionId()
  return activeSessionId !== null && activeSessionId !== currentSessionId
}

/**
 * Restore session on page load
 * Call this when the app initializes to check if this tab's session is still valid
 */
export function restoreSession(storedSessionId: string | null): boolean {
  if (!storedSessionId) {
    return false
  }

  const activeSessionId = getActiveSessionId()

  // Check if this session is still the active one
  if (activeSessionId === storedSessionId) {
    currentSessionId = storedSessionId

    if (import.meta.env.DEV) {
      console.log('[SessionSync] Restored session:', storedSessionId)
    }

    return true
  }

  if (import.meta.env.DEV) {
    console.log('[SessionSync] Session invalid - active session is different')
  }

  return false
}
