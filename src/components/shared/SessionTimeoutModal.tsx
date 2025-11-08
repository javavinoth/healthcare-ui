import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Clock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'

/**
 * Session Timeout Warning Modal
 * HIPAA Compliance: Warns users before automatic logout
 *
 * Features:
 * - Countdown timer (2 minutes warning before logout)
 * - Extend session option
 * - Auto-logout on timeout
 * - Keyboard accessible
 * - Screen reader announcements
 */

interface SessionTimeoutModalProps {
  /**
   * Warning time before logout (in milliseconds)
   * Default: 2 minutes (120000ms)
   */
  warningTime?: number
}

export function SessionTimeoutModal({ warningTime = 120000 }: SessionTimeoutModalProps) {
  const navigate = useNavigate()
  const { isAuthenticated, sessionExpiry, updateLastActivity, logout } = useAuthStore()

  const [showModal, setShowModal] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (!isAuthenticated || !sessionExpiry) {
      setShowModal(false)
      return
    }

    // Check session status every second
    const checkInterval = setInterval(() => {
      const now = Date.now()
      const timeRemaining = sessionExpiry - now

      // Session expired - logout immediately
      if (timeRemaining <= 0) {
        setShowModal(false)
        logout()
        navigate('/login?sessionExpired=true')
        clearInterval(checkInterval)
        return
      }

      // Show warning modal
      if (timeRemaining <= warningTime && !showModal) {
        setShowModal(true)
      }

      // Update countdown
      if (showModal) {
        setCountdown(Math.ceil(timeRemaining / 1000))
      }
    }, 1000)

    return () => clearInterval(checkInterval)
  }, [isAuthenticated, sessionExpiry, warningTime, showModal, logout, navigate])

  const handleExtendSession = () => {
    updateLastActivity()
    setShowModal(false)
  }

  const handleLogout = () => {
    setShowModal(false)
    logout()
    navigate('/login')
  }

  // Format countdown as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-md" aria-describedby="session-timeout-description">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-warning/10">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <DialogTitle>Session Expiring Soon</DialogTitle>
          </div>
          <DialogDescription id="session-timeout-description">
            Your session will expire due to inactivity for security reasons.
          </DialogDescription>
        </DialogHeader>

        {/* Warning Content */}
        <div className="py-6 space-y-4">
          {/* Countdown Timer */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-warning/10 mb-4">
              <span
                className="text-h1 font-bold text-warning"
                aria-live="polite"
                aria-atomic="true"
              >
                {formatTime(countdown)}
              </span>
            </div>
            <p className="text-body text-neutral-blue-gray">
              You will be logged out automatically in{' '}
              <strong className="text-warning">{formatTime(countdown)}</strong>
            </p>
          </div>

          {/* Security Notice */}
          <div className="alert alert-warning" role="alert">
            <AlertCircle className="h-5 w-5 inline mr-2" />
            <span className="text-sm">
              This is a security measure to protect your health information (HIPAA compliance).
            </span>
          </div>

          {/* Action Instructions */}
          <div className="text-sm text-neutral-blue-gray space-y-2">
            <p className="font-medium">What would you like to do?</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Click "Stay Logged In" to extend your session</li>
              <li>Click "Logout" to sign out now</li>
              <li>Do nothing to be logged out automatically</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <DialogFooter className="flex gap-3 sm:gap-3">
          <Button variant="outline" onClick={handleLogout} className="flex-1">
            Logout
          </Button>
          <Button onClick={handleExtendSession} className="flex-1" autoFocus>
            Stay Logged In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default SessionTimeoutModal
