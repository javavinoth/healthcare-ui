import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { initSessionSync, addSessionChangeListener, removeSessionChangeListener } from '@/lib/utils/sessionSync'
import { useToast } from '@/components/ui/use-toast'

/**
 * Session Monitor Hook
 *
 * Monitors session validity across browser tabs.
 * Automatically logs out the user if another user logs in.
 *
 * SECURITY FEATURES:
 * - Real-time cross-tab session monitoring
 * - Automatic logout when session invalidated
 * - User notification about forced logout
 * - Prevents multi-user access
 */
export function useSessionMonitor() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { isAuthenticated, validateSession, logout } = useAuthStore()
  const isInitialized = useRef(false)
  const checkIntervalRef = useRef<number | null>(null)
  const hasShownInvalidationNotice = useRef(false)

  useEffect(() => {
    // Only initialize once
    if (isInitialized.current) {
      return
    }

    // Initialize session sync on mount
    initSessionSync()
    isInitialized.current = true

    if (import.meta.env.DEV) {
      console.log('[SessionMonitor] Initialized')
    }
  }, [])

  useEffect(() => {
    // Only monitor if user is authenticated
    if (!isAuthenticated) {
      // Clear interval if exists
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
        checkIntervalRef.current = null
      }
      // Reset notification flag when user logs out
      hasShownInvalidationNotice.current = false
      return
    }

    // Show invalidation notice (once per session)
    const showInvalidationNotice = () => {
      if (hasShownInvalidationNotice.current) {
        return // Already shown
      }

      hasShownInvalidationNotice.current = true

      toast({
        title: 'Session Ended',
        description: 'You have been logged out because another user signed in.',
        variant: 'destructive',
      })

      // Redirect to login page
      setTimeout(() => {
        navigate('/login?reason=session_invalidated', { replace: true })
      }, 1000)
    }

    // Handle session changes from other tabs
    const handleSessionChange = (newSessionId: string | null) => {
      if (import.meta.env.DEV) {
        console.log('[SessionMonitor] Session change detected:', newSessionId)
      }

      // Validate if this tab's session is still active
      // validateSession() will call logout() if invalid
      const isValid = validateSession()

      if (!isValid) {
        showInvalidationNotice()
      }
    }

    // Add listener for storage events
    addSessionChangeListener(handleSessionChange)

    // Periodically check session validity (every 5 seconds)
    checkIntervalRef.current = window.setInterval(() => {
      const isValid = validateSession()

      if (!isValid && isAuthenticated) {
        if (import.meta.env.DEV) {
          console.log('[SessionMonitor] Session invalid - logging out')
        }

        showInvalidationNotice()
      }
    }, 5000)

    // Cleanup
    return () => {
      removeSessionChangeListener(handleSessionChange)
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
        checkIntervalRef.current = null
      }
    }
  }, [isAuthenticated, validateSession, logout, navigate, toast])

  return {
    isMonitoring: isAuthenticated,
  }
}
