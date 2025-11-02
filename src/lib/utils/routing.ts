/**
 * Routing Utilities
 * Centralized routing logic for role-based navigation
 */

import { ROLES, type UserRole } from '@/lib/constants/roles'

/**
 * Get the default dashboard path for a given user role
 *
 * @param role - The user's role
 * @returns The dashboard path for the role
 *
 * @example
 * getRoleDashboardPath('patient') // returns '/patient/dashboard'
 * getRoleDashboardPath('doctor') // returns '/provider/dashboard'
 */
export function getRoleDashboardPath(role: UserRole): string {
  switch (role) {
    case ROLES.PATIENT:
      return '/patient/dashboard'

    case ROLES.DOCTOR:
    case ROLES.NURSE:
      return '/provider/dashboard'

    case ROLES.ADMIN:
      return '/admin/dashboard'

    case ROLES.RECEPTIONIST:
      return '/receptionist/dashboard'

    case ROLES.BILLING_STAFF:
      return '/billing/dashboard'

    default:
      // Fallback for any unexpected role
      console.warn(`Unknown role: ${role}. Redirecting to generic dashboard.`)
      return '/dashboard'
  }
}

/**
 * Check if a path is a public route (no authentication required)
 *
 * @param path - The path to check
 * @returns True if the path is public, false otherwise
 */
export function isPublicRoute(path: string): boolean {
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/verify-2fa',
    '/forgot-password',
    '/reset-password',
    '/access-denied',
  ]

  return publicRoutes.includes(path)
}

/**
 * Check if a path matches a role's dashboard
 *
 * @param path - The path to check
 * @param role - The user's role
 * @returns True if the path is the user's role dashboard
 */
export function isRoleDashboard(path: string, role: UserRole): boolean {
  return path === getRoleDashboardPath(role)
}
