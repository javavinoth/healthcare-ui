import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { getRoleDashboardPath } from '@/lib/utils/routing'
import { Loader2 } from 'lucide-react'

interface SmartRedirectProps {
  /**
   * What to render for unauthenticated users
   * - 'children': Render the children (useful for home page)
   * - string path: Redirect to this path
   */
  unauthenticatedBehavior?: 'children' | string

  /**
   * Children to render if unauthenticatedBehavior is 'children'
   */
  children?: React.ReactNode
}

/**
 * SmartRedirect Component
 *
 * Intelligently redirects users based on their authentication status:
 * - Loading: Shows loading spinner
 * - Authenticated: Redirects to role-specific dashboard
 * - Unauthenticated: Either renders children or redirects to specified path
 *
 * @example
 * // For home page (/) - show page to unauthenticated, redirect authenticated
 * <SmartRedirect unauthenticatedBehavior="children">
 *   <HomePage />
 * </SmartRedirect>
 *
 * @example
 * // For /dashboard - redirect to role-specific dashboard if authenticated, home if not
 * <SmartRedirect unauthenticatedBehavior="/" />
 *
 * @example
 * // For 404 - redirect to role-specific dashboard if authenticated, home if not
 * <SmartRedirect unauthenticatedBehavior="/" />
 */
export default function SmartRedirect({
  unauthenticatedBehavior = '/',
  children,
}: SmartRedirectProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-neutral-light">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-body text-neutral-blue-gray/70">Loading...</p>
        </div>
      </div>
    )
  }

  // If authenticated, redirect to role-specific dashboard
  if (isAuthenticated && user) {
    const dashboardPath = getRoleDashboardPath(user.role)
    return <Navigate to={dashboardPath} replace />
  }

  // If not authenticated, either render children or redirect
  if (unauthenticatedBehavior === 'children') {
    return <>{children}</>
  }

  return <Navigate to={unauthenticatedBehavior} replace />
}
