import type { UserRole, Permission } from '../lib/constants/roles'

/**
 * Core User types for the healthcare application
 */

/**
 * Account Status for user approval workflow
 */
export type AccountStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  permissions: Permission[]
  accountStatus?: AccountStatus
  avatar?: string
  phone?: string
  dateOfBirth?: string
  twoFactorEnabled?: boolean
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
 *
 * Date/Time Format Standards (ISO 8601):
 * - date: YYYY-MM-DD (e.g., "2024-10-28")
 * - startTime/endTime: HH:mm (24-hour format, e.g., "14:30")
 * - createdAt/updatedAt: ISO 8601 timestamp (e.g., "2024-10-28T14:30:00Z")
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

/**
 * Patient Management Types (Phase 2.2)
 * For provider patient management functionality
 */

export interface PatientSummary {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  dateOfBirth?: string
  gender?: string
  medicalRecordNumber?: string
  lastAppointmentDate?: string
  upcomingAppointmentDate?: string
  hasUnreadRecords?: boolean
  age?: number
}

export interface AddressInfo {
  line1?: string
  line2?: string
  city?: string
  state?: string
  zipCode?: string
}

export interface EmergencyContactInfo {
  name?: string
  phone?: string
  relationship?: string
}

export interface PatientDetail {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  dateOfBirth?: string
  gender?: string
  medicalRecordNumber?: string
  age?: number
  address?: AddressInfo
  insurance?: InsuranceInfo
  emergencyContact?: EmergencyContactInfo
  allergies?: string[]
  currentMedications?: string[]
  totalAppointments?: number
  totalRecords?: number
  lastAppointmentDate?: string
  upcomingAppointmentDate?: string
}

export interface PatientTimelineEvent {
  id: string
  type: 'APPOINTMENT' | 'MEDICAL_RECORD' | 'PRESCRIPTION' | 'LAB_RESULT'
  date: string
  title: string
  description?: string
  providerName?: string
  status?: string
  category?: string
}

export interface PaginatedPatients {
  patients: PatientSummary[]
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface UpdatePatientData {
  firstName: string
  lastName: string
  phoneNumber?: string
  dateOfBirth?: string
  gender?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  zipCode?: string
  insuranceProvider?: string
  insurancePolicyNumber?: string
  insuranceGroupNumber?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactRelationship?: string
  allergies?: string[]
  currentMedications?: string[]
}

/**
 * Clinical Documentation Types (Phase 2.4)
 * For provider clinical notes and prescriptions
 */

/**
 * Visit Note (SOAP Format)
 * Subjective, Objective, Assessment, Plan
 */
export interface VisitNote {
  id: string
  patientId: string
  patient: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  providerId: string
  provider: {
    id: string
    firstName: string
    lastName: string
    specialty?: string
  }
  appointmentId?: string
  // SOAP Format Fields
  subjective?: string    // Patient's description (symptoms, concerns, history)
  objective?: string     // Provider's observations (exam findings, vitals)
  assessment: string     // Diagnosis, clinical impression
  plan: string           // Treatment plan, next steps, follow-up
  // Additional Details
  chiefComplaint?: string    // Brief summary of visit reason
  diagnosisCodes?: string    // ICD-10 codes (comma-separated)
  createdAt: string
  updatedAt: string
}

/**
 * Prescription
 */
export interface Prescription {
  id: string
  patientId: string
  patient: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  providerId: string
  provider: {
    id: string
    firstName: string
    lastName: string
    specialty?: string
  }
  visitNoteId?: string
  // Medication Details
  medicationName: string
  dosage: string
  route?: MedicationRoute
  frequency: string
  duration?: string
  quantity: number
  refills: number
  instructions?: string
  // Status and Dates
  status: PrescriptionStatus
  prescribedDate: string
  expiresAt?: string
  discontinuedAt?: string
  discontinuedReason?: string
  // Clinical Information
  diagnosis?: string
  pharmacyNotes?: string
  createdAt: string
  updatedAt: string
}

export type MedicationRoute =
  | 'ORAL'
  | 'TOPICAL'
  | 'INJECTION'
  | 'INTRAVENOUS'
  | 'SUBLINGUAL'
  | 'RECTAL'
  | 'TRANSDERMAL'
  | 'INHALATION'
  | 'OPHTHALMIC'
  | 'OTIC'
  | 'NASAL'

export type PrescriptionStatus =
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISCONTINUED'

/**
 * Form Data for Clinical Documentation
 */
export interface VisitNoteFormData {
  patientId?: string
  appointmentId?: string
  subjective?: string
  objective?: string
  assessment: string
  plan: string
  chiefComplaint?: string
  diagnosisCodes?: string
}

export interface PrescriptionFormData {
  patientId?: string
  visitNoteId?: string
  medicationName: string
  dosage: string
  route?: MedicationRoute
  frequency: string
  duration?: string
  quantity: number
  refills: number
  instructions?: string
  diagnosis?: string
  pharmacyNotes?: string
  expiresAt?: string
}
