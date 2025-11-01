/**
 * Healthcare Application Role Definitions
 * Used for Role-Based Access Control (RBAC)
 */

export const ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  NURSE: 'nurse',
  ADMIN: 'admin',
  BILLING_STAFF: 'billing_staff',
  RECEPTIONIST: 'receptionist',
} as const

export type UserRole = (typeof ROLES)[keyof typeof ROLES]

/**
 * Permission system for fine-grained access control
 */
export const PERMISSIONS = {
  // Patient permissions
  VIEW_OWN_RECORDS: 'view_own_records',
  BOOK_APPOINTMENTS: 'book_appointments',
  MESSAGE_PROVIDER: 'message_provider',

  // Provider permissions
  VIEW_PATIENT_RECORDS: 'view_patient_records',
  EDIT_PATIENT_RECORDS: 'edit_patient_records',
  PRESCRIBE_MEDICATION: 'prescribe_medication',
  ORDER_LABS: 'order_labs',

  // Admin permissions
  MANAGE_USERS: 'manage_users',
  VIEW_REPORTS: 'view_reports',
  MANAGE_FACILITY: 'manage_facility',

  // Billing permissions
  VIEW_BILLING: 'view_billing',
  PROCESS_PAYMENTS: 'process_payments',
  SUBMIT_CLAIMS: 'submit_claims',

  // Messaging permissions
  USE_MESSAGING: 'use_messaging',
  MESSAGE_PATIENTS: 'message_patients',
  MESSAGE_PROVIDERS: 'message_providers',
  MESSAGE_STAFF: 'message_staff',

  // Shared permissions
  VIEW_APPOINTMENTS: 'view_appointments',
  MANAGE_APPOINTMENTS: 'manage_appointments',
  MANAGE_SCHEDULE: 'manage_schedule',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

/**
 * Role-to-Permission mapping
 * Defines what each role can do
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [ROLES.PATIENT]: [
    PERMISSIONS.VIEW_OWN_RECORDS,
    PERMISSIONS.BOOK_APPOINTMENTS,
    PERMISSIONS.MESSAGE_PROVIDER,
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.USE_MESSAGING,
  ],
  [ROLES.DOCTOR]: [
    PERMISSIONS.VIEW_PATIENT_RECORDS,
    PERMISSIONS.EDIT_PATIENT_RECORDS,
    PERMISSIONS.PRESCRIBE_MEDICATION,
    PERMISSIONS.ORDER_LABS,
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.MANAGE_APPOINTMENTS,
    PERMISSIONS.MANAGE_SCHEDULE,
    PERMISSIONS.USE_MESSAGING,
    PERMISSIONS.MESSAGE_PATIENTS,
    PERMISSIONS.MESSAGE_PROVIDERS,
    PERMISSIONS.MESSAGE_STAFF,
  ],
  [ROLES.NURSE]: [
    PERMISSIONS.VIEW_PATIENT_RECORDS,
    PERMISSIONS.EDIT_PATIENT_RECORDS,
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.MANAGE_SCHEDULE,
    PERMISSIONS.USE_MESSAGING,
    PERMISSIONS.MESSAGE_PATIENTS,
    PERMISSIONS.MESSAGE_PROVIDERS,
    PERMISSIONS.MESSAGE_STAFF,
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_FACILITY,
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.MANAGE_APPOINTMENTS,
    PERMISSIONS.VIEW_PATIENT_RECORDS,
    PERMISSIONS.USE_MESSAGING,
    PERMISSIONS.MESSAGE_PATIENTS,
    PERMISSIONS.MESSAGE_PROVIDERS,
    PERMISSIONS.MESSAGE_STAFF,
  ],
  [ROLES.BILLING_STAFF]: [
    PERMISSIONS.VIEW_BILLING,
    PERMISSIONS.PROCESS_PAYMENTS,
    PERMISSIONS.SUBMIT_CLAIMS,
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.USE_MESSAGING,
    PERMISSIONS.MESSAGE_PATIENTS,
  ],
  [ROLES.RECEPTIONIST]: [
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.MANAGE_APPOINTMENTS,
    PERMISSIONS.BOOK_APPOINTMENTS,
    PERMISSIONS.USE_MESSAGING,
    PERMISSIONS.MESSAGE_PATIENTS,
    PERMISSIONS.MESSAGE_PROVIDERS,
    PERMISSIONS.MESSAGE_STAFF,
  ],
}

/**
 * Helper function to check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

/**
 * Helper function to check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission))
}

/**
 * Helper function to check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission))
}
