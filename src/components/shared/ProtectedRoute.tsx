import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import type { UserRole, Permission } from '@/lib/constants/roles'

/**
 * Protected Route Component
 * Implements Role-Based Access Control (RBAC) for routes
 *
 * Features:
 * - Checks authentication status
 * - Validates user roles
 * - Validates user permissions
 * - Redirects unauthorized users
 * - Preserves intended destination for post-login redirect
 */

interface ProtectedRouteProps {
  children: React.ReactNode
  /**
   * Required roles to access this route
   * User must have at least one of these roles
   */
  allowedRoles?: UserRole[]
  /**
   * Required permissions to access this route
   * User must have at least one of these permissions
   */
  requiredPermissions?: Permission[]
  /**
   * If true, user must have ALL specified permissions
   * If false (default), user needs ANY of the specified permissions
   */
  requireAll?: boolean
  /**
   * Custom redirect path for unauthorized access
   * Default: '/login'
   */
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  allowedRoles,
  requiredPermissions,
  requireAll = false,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const location = useLocation()
  const { isAuthenticated, user, checkSession, hasAnyRole, hasAnyPermission, hasAllPermissions } =
    useAuthStore()

  // Check if session is still valid
  const sessionValid = checkSession()

  // Not authenticated - redirect to login
  if (!isAuthenticated || !sessionValid || !user) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location.pathname }}
        replace
      />
    )
  }

  // Check role-based access
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRequiredRole = hasAnyRole(allowedRoles)

    if (!hasRequiredRole) {
      // User doesn't have required role - show access denied
      return <Navigate to="/access-denied" replace />
    }
  }

  // Check permission-based access
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasRequiredPermission = requireAll
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions)

    if (!hasRequiredPermission) {
      // User doesn't have required permissions - show access denied
      return <Navigate to="/access-denied" replace />
    }
  }

  // User is authorized - render children
  return <>{children}</>
}

/**
 * Access Denied Page Component
 * Shown when user tries to access a route they don't have permissions for
 */
export function AccessDenied() {
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-light px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-error/10 rounded-full mb-4">
            <svg
              className="h-8 w-8 text-error"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h1 className="text-h2 mb-4">Access Denied</h1>

          <p className="text-body text-neutral-blue-gray mb-6">
            You don't have permission to access this page. Please contact your administrator if
            you believe this is an error.
          </p>

          {user && (
            <div className="bg-neutral-light rounded p-4 mb-6">
              <p className="text-sm text-neutral-blue-gray">
                <strong>Current Role:</strong> {user.role}
              </p>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-white hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Go to Dashboard
            </a>
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-md border border-primary bg-white px-6 py-2 text-primary hover:bg-primary hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Go Home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProtectedRoute
