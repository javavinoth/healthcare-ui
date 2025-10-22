import type { UserRole, Permission } from '../lib/constants/roles'

/**
 * Core User types for the healthcare application
 */

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  permissions: Permission[]
  avatar?: string
  phone?: string
  dateOfBirth?: string
  createdAt: string
  updatedAt: string
}

export interface Patient extends User {
  role: 'patient'
  medicalRecordNumber: string
  insuranceInfo?: InsuranceInfo
  emergencyContact?: EmergencyContact
  allergies?: string[]
  medications?: Medication[]
}

export interface Provider extends User {
  role: 'doctor' | 'nurse'
  specialty?: string
  licenseNumber: string
  npiNumber?: string
  bio?: string
  languages?: string[]
  acceptingNewPatients?: boolean
}

/**
 * Provider Search Result (matches backend ProviderResponse)
 */
export interface ProviderSearchResult {
  id: string
  firstName: string
  lastName: string
  title?: string
  specialty: string
  specialties?: string[]
  npi?: string
  photoUrl?: string
  bio?: string
  languages?: string[]
  yearsOfExperience?: number
  education?: string
  certifications?: string[]
  acceptingNewPatients: boolean
  rating?: number
  reviewCount?: number
  nextAvailableDate?: string
  location?: {
    address: string
    city: string
    state: string
    zipCode: string
  }
  phone?: string
  email?: string
}

export interface Admin extends User {
  role: 'admin' | 'billing_staff' | 'receptionist'
  department?: string
}

/**
 * Insurance Information
 */
export interface InsuranceInfo {
  provider: string
  policyNumber: string
  groupNumber?: string
  subscriberName: string
  subscriberRelationship: 'self' | 'spouse' | 'parent' | 'other'
}

/**
 * Emergency Contact
 */
export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
  email?: string
}

/**
 * Medication
 */
export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  prescribedBy: string
  prescribedDate: string
  active: boolean
  instructions?: string
}

/**
 * Appointment types
 */
export interface Appointment {
  id: string
  patientId: string
  patientName: string
  providerId: string
  providerName: string
  providerSpecialty?: string
  date: string
  startTime: string
  endTime: string
  type: AppointmentType
  status: AppointmentStatus
  reason?: string
  location?: string
  notes?: string
  isVirtual?: boolean
  videoLink?: string
  createdAt: string
  updatedAt: string
}

export type AppointmentType =
  | 'ROUTINE_CHECKUP'
  | 'FOLLOW_UP'
  | 'CONSULTATION'
  | 'URGENT_CARE'
  | 'PROCEDURE'
  | 'LAB_WORK'
  | 'VACCINATION'
  | 'TELEHEALTH'

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'checked_in'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'

/**
 * Medical Record types
 */
export interface MedicalRecord {
  id: string
  patientId: string
  type: MedicalRecordType
  title: string
  date: string
  provider: string
  category: string
  status: 'final' | 'preliminary' | 'amended'
  isNew?: boolean
  attachments?: Attachment[]
  content?: string
  summary?: string
  createdAt: string
}

export type MedicalRecordType =
  | 'lab_result'
  | 'imaging'
  | 'visit_note'
  | 'prescription'
  | 'immunization'
  | 'procedure_note'
  | 'discharge_summary'

export interface Attachment {
  id: string
  name: string
  type: string
  size: number
  url: string
}

/**
 * Health Metrics for charts and tracking
 */
export interface HealthMetric {
  id: string
  patientId: string
  type: HealthMetricType
  value: number
  unit: string
  date: string
  notes?: string
}

export type HealthMetricType =
  | 'blood_pressure_systolic'
  | 'blood_pressure_diastolic'
  | 'heart_rate'
  | 'temperature'
  | 'weight'
  | 'height'
  | 'bmi'
  | 'blood_glucose'
  | 'oxygen_saturation'

/**
 * Message types for patient-provider communication
 */
export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderRole: UserRole
  recipientId: string
  recipientName: string
  subject?: string
  content: string
  isRead: boolean
  attachments?: Attachment[]
  sentAt: string
  readAt?: string
}

export interface Conversation {
  id: string
  participantIds: string[]
  participants: ConversationParticipant[]
  subject: string
  lastMessage?: Message
  unreadCount: number
  createdAt: string
  updatedAt: string
}

export interface ConversationParticipant {
  id: string
  name: string
  role: UserRole
  avatar?: string
}

/**
 * API Response types
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: ApiError
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * Form types
 */
export interface LoginFormData {
  email: string
  password: string
  rememberMe?: boolean
}

export interface TwoFactorFormData {
  code: string
  tempToken?: string
}

export interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phoneNumber?: string
}

export interface ProfileFormData {
  firstName: string
  lastName: string
  phoneNumber?: string
}

export interface ChangePasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface AppointmentBookingFormData {
  providerId: string
  date: string
  time: string
  type: AppointmentType
  reason: string
  isVirtual?: boolean
}

/**
 * Backend Response Types (Match Spring Boot DTOs)
 */
export interface LoginResponse {
  requires2FA?: boolean
  tempToken?: string
  message?: string
  // For users without 2FA
  accessToken?: string
  refreshToken?: string
  tokenType?: string
  user?: User
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  user: User
}

export interface MessageResponse {
  message: string
  success?: boolean
}

export interface Enable2FAResponse {
  secret: string
  qrCodeDataUrl: string
  message: string
}

export interface CsrfTokenResponse {
  csrfToken: string
}
