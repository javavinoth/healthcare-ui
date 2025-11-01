/**
 * API Endpoint Constants
 *
 * Centralized endpoint definitions for the healthcare application.
 * All endpoints are relative to the base URL configured in VITE_API_URL.
 *
 * IMPORTANT: Backend uses /api as servlet context path (server.servlet.context-path: /api)
 * The /api prefix is already included in VITE_API_URL, so these paths are relative.
 *
 * Example:
 *   VITE_API_URL = http://localhost:8080/api
 *   ENDPOINTS.AUTH.LOGIN = '/auth/login'
 *   Final URL = http://localhost:8080/api/auth/login
 */

/**
 * Authentication & Authorization Endpoints
 * Public endpoints (no authentication required):
 * - login, register, register/provider, verify-2fa, forgot-password, reset-password
 */
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  VERIFY_2FA: '/auth/verify-2fa',
  REGISTER: '/auth/register',
  REGISTER_PROVIDER: '/auth/register/provider',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  CHANGE_PASSWORD: '/auth/change-password',
  ENABLE_2FA: '/auth/enable-2fa',
  VERIFY_2FA_SETUP: '/auth/verify-2fa-setup',
  DISABLE_2FA: '/auth/disable-2fa',
} as const

/**
 * CSRF Token Endpoint
 * Public endpoint to fetch CSRF token
 */
export const CSRF_ENDPOINTS = {
  GET_TOKEN: '/csrf-token',
} as const

/**
 * User Profile Endpoints
 * Protected endpoints (authentication required)
 */
export const USER_ENDPOINTS = {
  CURRENT_USER: '/users/me',
  UPDATE_PROFILE: '/users/me',
} as const

/**
 * Appointment Endpoints
 * Protected endpoints for appointment management
 */
export const APPOINTMENT_ENDPOINTS = {
  LIST: '/appointments',
  GET_BY_ID: (id: number | string) => `/appointments/${id}`,
  CREATE: '/appointments',
  UPDATE: (id: number | string) => `/appointments/${id}`,
  CANCEL: (id: number | string) => `/appointments/${id}/cancel`,
  RESCHEDULE: (id: number | string) => `/appointments/${id}/reschedule`,
  AVAILABLE_SLOTS: (providerId: number | string) => `/appointments/providers/${providerId}/available-slots`,
  SEARCH_PROVIDERS: '/appointments/search-providers',
} as const

/**
 * Medical Record Endpoints
 * Protected endpoints for medical record access
 */
export const MEDICAL_RECORD_ENDPOINTS = {
  LIST: '/medical-records',
  GET_BY_ID: (id: number | string) => `/medical-records/${id}`,
  MARK_READ: (id: number | string) => `/medical-records/${id}/mark-read`,
  DOWNLOAD: (id: number | string) => `/medical-records/${id}/download`,
} as const

/**
 * Messaging Endpoints
 * Protected endpoints for secure messaging
 */
export const MESSAGE_ENDPOINTS = {
  SEND: '/messages',
  CONVERSATIONS: '/messages/conversations',
  CONVERSATION_BY_ID: (id: number | string) => `/messages/conversations/${id}`,
  MARK_READ: (messageId: number | string) => `/messages/${messageId}/mark-read`,
  UPLOAD_ATTACHMENT: '/messages/attachments',
  SEARCH: '/messages/search',
} as const

/**
 * Patient Endpoints
 * Protected endpoints for patient data access
 */
export const PATIENT_ENDPOINTS = {
  LIST: '/patients',
  GET_BY_ID: (id: number | string) => `/patients/${id}`,
  MEDICAL_HISTORY: (id: number | string) => `/patients/${id}/medical-history`,
} as const

/**
 * Provider Portal Endpoints
 * Protected endpoints for healthcare providers (doctors/nurses)
 */
export const PROVIDER_ENDPOINTS = {
  // Dashboard
  DASHBOARD: '/provider/dashboard',
  STATS: '/provider/stats',
  TODAY_APPOINTMENTS: '/provider/appointments/today',

  // Patient Management
  PATIENTS: '/provider/patients',
  PATIENT_DETAIL: (patientId: number | string) => `/provider/patients/${patientId}`,
  PATIENT_TIMELINE: (patientId: number | string) => `/provider/patients/${patientId}/timeline`,
  UPDATE_PATIENT: (patientId: number | string) => `/provider/patients/${patientId}`,

  // Appointments
  APPOINTMENTS: '/provider/appointments',
  CALENDAR: '/provider/calendar',
  CHECK_IN: (appointmentId: number | string) => `/provider/appointments/${appointmentId}/check-in`,
  COMPLETE_APPOINTMENT: (appointmentId: number | string) => `/provider/appointments/${appointmentId}/complete`,
  MARK_NO_SHOW: (appointmentId: number | string) => `/provider/appointments/${appointmentId}/no-show`,

  // Schedule Management
  CREATE_TIME_BLOCK: '/provider/schedule/block',
  LIST_TIME_BLOCKS: '/provider/schedule/blocks',
  DELETE_TIME_BLOCK: (timeBlockId: number | string) => `/provider/schedule/blocks/${timeBlockId}`,

  // Settings & Availability
  GET_SETTINGS: '/provider/settings',
  UPDATE_SETTINGS: '/provider/settings',
  UPDATE_AVAILABILITY: '/provider/availability',

  // Time Off
  REQUEST_TIME_OFF: '/provider/time-off',
  LIST_TIME_OFF: '/provider/time-off',
  CANCEL_TIME_OFF: (requestId: number | string) => `/provider/time-off/${requestId}`,

  // Clinical Documentation
  CREATE_NOTE: (patientId: number | string) => `/provider/patients/${patientId}/notes`,
  GET_PATIENT_NOTES: (patientId: number | string) => `/provider/patients/${patientId}/notes`,
  GET_NOTE: (noteId: number | string) => `/provider/notes/${noteId}`,

  // Prescriptions
  CREATE_PRESCRIPTION: (patientId: number | string) => `/provider/patients/${patientId}/prescriptions`,
  GET_PATIENT_PRESCRIPTIONS: (patientId: number | string) => `/provider/patients/${patientId}/prescriptions`,
  GET_PRESCRIPTION: (prescriptionId: number | string) => `/provider/prescriptions/${prescriptionId}`,
  UPDATE_PRESCRIPTION_STATUS: (prescriptionId: number | string) => `/provider/prescriptions/${prescriptionId}/status`,
} as const

/**
 * Admin Portal Endpoints
 * Protected endpoints for system administrators
 */
export const ADMIN_ENDPOINTS = {
  // User Management
  CREATE_USER: '/admin/users',
  LIST_USERS: '/admin/users',
  GET_USER: (id: number | string) => `/admin/users/${id}`,
  UPDATE_USER: (id: number | string) => `/admin/users/${id}`,
  UPDATE_USER_ROLE: (id: number | string) => `/admin/users/${id}/role`,
  ACTIVATE_USER: (id: number | string) => `/admin/users/${id}/activate`,
  DEACTIVATE_USER: (id: number | string) => `/admin/users/${id}/deactivate`,
  SEND_INVITATION: (id: number | string) => `/admin/users/${id}/send-invitation`,

  // Statistics
  STATS: '/admin/stats',
} as const

/**
 * Audit Log Endpoints
 * Protected endpoints for audit logging (HIPAA compliance)
 */
export const AUDIT_ENDPOINTS = {
  LOG_ACCESS: '/audit-log',
} as const

/**
 * Combined endpoints object for convenience
 * Provides a single import for all endpoints
 */
export const ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  CSRF: CSRF_ENDPOINTS,
  USER: USER_ENDPOINTS,
  APPOINTMENTS: APPOINTMENT_ENDPOINTS,
  MEDICAL_RECORDS: MEDICAL_RECORD_ENDPOINTS,
  MESSAGES: MESSAGE_ENDPOINTS,
  PATIENTS: PATIENT_ENDPOINTS,
  PROVIDER: PROVIDER_ENDPOINTS,
  ADMIN: ADMIN_ENDPOINTS,
  AUDIT: AUDIT_ENDPOINTS,
} as const

// Type exports for TypeScript consumers
export type AuthEndpoints = typeof AUTH_ENDPOINTS
export type CsrfEndpoints = typeof CSRF_ENDPOINTS
export type UserEndpoints = typeof USER_ENDPOINTS
export type AppointmentEndpoints = typeof APPOINTMENT_ENDPOINTS
export type MedicalRecordEndpoints = typeof MEDICAL_RECORD_ENDPOINTS
export type MessageEndpoints = typeof MESSAGE_ENDPOINTS
export type PatientEndpoints = typeof PATIENT_ENDPOINTS
export type ProviderEndpoints = typeof PROVIDER_ENDPOINTS
export type AdminEndpoints = typeof ADMIN_ENDPOINTS
export type AuditEndpoints = typeof AUDIT_ENDPOINTS
export type Endpoints = typeof ENDPOINTS
