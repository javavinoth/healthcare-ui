import { ROLES, type UserRole } from './roles'

/**
 * Messaging Permission Matrix
 * Defines which roles can send messages to which other roles
 */

export type MessagingPermissionMatrix = Record<UserRole, UserRole[]>

/**
 * Matrix defining who can message whom
 * Key = Sender role, Value = Array of roles they can message
 */
export const MESSAGING_PERMISSIONS: MessagingPermissionMatrix = {
  // Patients can message healthcare providers and support staff
  [ROLES.PATIENT]: [ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST, ROLES.BILLING_STAFF],

  // Doctors can message patients, other providers, support staff, and admins
  [ROLES.DOCTOR]: [
    ROLES.PATIENT,
    ROLES.DOCTOR, // Consultations
    ROLES.NURSE, // Care coordination
    ROLES.RECEPTIONIST, // Scheduling
    ROLES.HOSPITAL_ADMIN, // Escalations
  ],

  // Nurses can message patients, doctors, other nurses, receptionists, and admins
  [ROLES.NURSE]: [
    ROLES.PATIENT,
    ROLES.DOCTOR, // Care coordination
    ROLES.NURSE, // Handoffs
    ROLES.RECEPTIONIST, // Scheduling
    ROLES.HOSPITAL_ADMIN, // Escalations
  ],

  // Receptionists can message patients, providers, other receptionists, and admins
  [ROLES.RECEPTIONIST]: [
    ROLES.PATIENT, // Appointments
    ROLES.DOCTOR, // Scheduling
    ROLES.NURSE, // Scheduling
    ROLES.RECEPTIONIST, // Coordination
    ROLES.HOSPITAL_ADMIN, // Escalations
  ],

  // Billing staff can message patients, other billing staff, and admins
  [ROLES.BILLING_STAFF]: [
    ROLES.PATIENT, // Billing questions
    ROLES.BILLING_STAFF, // Internal coordination
    ROLES.HOSPITAL_ADMIN, // Escalations
  ],

  // Hospital Admins can message everyone in their facility
  [ROLES.HOSPITAL_ADMIN]: [
    ROLES.PATIENT,
    ROLES.DOCTOR,
    ROLES.NURSE,
    ROLES.RECEPTIONIST,
    ROLES.BILLING_STAFF,
    ROLES.HOSPITAL_ADMIN,
  ],

  // System Admins typically don't use messaging, but can message hospital admins
  [ROLES.SYSTEM_ADMIN]: [ROLES.HOSPITAL_ADMIN, ROLES.SYSTEM_ADMIN],
}

/**
 * Check if a role can message another role
 * @param senderRole The role of the sender
 * @param recipientRole The role of the intended recipient
 * @returns true if the sender can message the recipient
 */
export function canMessageRole(senderRole: UserRole, recipientRole: UserRole): boolean {
  const allowedRecipients = MESSAGING_PERMISSIONS[senderRole]
  return allowedRecipients?.includes(recipientRole) ?? false
}

/**
 * Get all roles that a given role can message
 * @param senderRole The role of the sender
 * @returns Array of roles the sender can message
 */
export function getAllowedRecipientRoles(senderRole: UserRole): UserRole[] {
  return MESSAGING_PERMISSIONS[senderRole] || []
}

/**
 * Filter a list of users to only those the sender can message
 * @param senderRole The role of the sender
 * @param users Array of users with role property
 * @returns Filtered array of users the sender can message
 */
export function filterMessagableUsers<T extends { role: string }>(
  senderRole: UserRole,
  users: T[]
): T[] {
  const allowedRoles = getAllowedRecipientRoles(senderRole)
  return users.filter((user) => allowedRoles.includes(user.role as UserRole))
}
