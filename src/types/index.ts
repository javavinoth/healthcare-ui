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
    pincode: string
  }
  phone?: string
  email?: string
}

export interface Admin extends User {
  role: 'hospital_admin' | 'system_admin' | 'billing_staff' | 'receptionist'
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
 * Updated to match backend standardized response format
 */

/**
 * Response metadata (included in all API responses)
 */
export interface ResponseMeta {
  timestamp: string
  requestId: string
  apiVersion: string
}

/**
 * Standard success response wrapper
 */
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string | null
  meta: ResponseMeta
}

/**
 * Pagination metadata (for paginated responses)
 */
export interface PaginationMeta {
  currentPage: number
  pageSize: number
  totalElements: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: PaginationMeta
  message?: string | null
  meta: ResponseMeta
}

/**
 * Error response structure (returned on failures)
 */
export interface ErrorResponse {
  success: false
  timestamp: string
  status: number
  error: string
  message: string
  errorCode: string
  path: string
  validationErrors?: Record<string, string>
  meta: ResponseMeta
}

/**
 * @deprecated Use ErrorResponse instead
 * Keeping for backward compatibility during migration
 */
export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
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
 *
 * Note: refreshToken is stored as HTTP-only cookie (not in response body)
 * Backend sets the cookie automatically - front-end cannot access it via JavaScript
 * This prevents XSS attacks from stealing refresh tokens
 */
export interface LoginResponse {
  requires2FA?: boolean
  tempToken?: string
  message?: string
  // For users without 2FA
  accessToken?: string
  refreshToken?: string | null // Optional - now in HTTP-only cookie (backend sets it)
  tokenType?: string
  user?: User
}

export interface AuthResponse {
  accessToken: string
  refreshToken?: string | null // Optional - now in HTTP-only cookie (backend sets it)
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
  pincode?: string
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
  pincode?: string
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
  subjective?: string // Patient's description (symptoms, concerns, history)
  objective?: string // Provider's observations (exam findings, vitals)
  assessment: string // Diagnosis, clinical impression
  plan: string // Treatment plan, next steps, follow-up
  // Additional Details
  chiefComplaint?: string // Brief summary of visit reason
  diagnosisCodes?: string // ICD-10 codes (comma-separated)
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

export type PrescriptionStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'DISCONTINUED'

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

// ============================================================================
// Admin Portal Types
// ============================================================================

export interface AdminUserResponse extends User {
  phoneNumber?: string
  active: boolean
  emailVerified?: boolean
  accountLocked: boolean
  failedLoginAttempts: number
  lastLoginIp?: string
  createdBy?: string
  updatedBy?: string
}

/**
 * Platform-level statistics (SYSTEM_ADMIN)
 */
export interface PlatformStatsResponse {
  scope: 'GLOBAL'
  totalUsers: number
  totalPatients: number
  totalDoctors: number
  totalNurses: number
  totalAdmins: number // Deprecated, use totalHospitalAdmins
  totalSystemAdmins: number
  totalHospitalAdmins: number
  totalBillingStaff: number
  totalReceptionists: number
  pendingVerifications: number
  totalHospitals?: number
  activeHospitals?: number
}

// ============================================================================
// Provider Portal Types
// ============================================================================

export interface ProviderStatsResponse {
  appointmentsToday: number
  appointmentsCompleted: number
  appointmentsPending: number
  patientsToday: number
  unreadMessages: number
  pendingTasks: number
}

export interface TodayAppointmentResponse {
  id: string
  patientId: string
  patientName: string
  time: string
  type: string
  status: string
  reason: string
  isVirtual: boolean
  scheduledAt: string
}

export interface ProviderDashboardResponse {
  stats: ProviderStatsResponse
  todayAppointments: TodayAppointmentResponse[]
  providerName: string
  specialty: string
}

export interface CalendarEventResponse {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
  durationMinutes: number
  patientId: string
  patientName: string
  type: string
  status: string
  reason: string
  isVirtual: boolean
  virtualMeetingUrl?: string
  location?: string
  colorClass: string
}

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY'

export interface AvailabilityEntry {
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
  isActive: boolean
}

export interface ProviderSettingsResponse {
  slotDuration: number
  availability: AvailabilityEntry[]
}

export interface TimeBlockResponse {
  id: string
  providerId: string
  providerName?: string
  blockDate: string
  startTime: string
  endTime: string
  reason: string
  notes?: string
  isRecurring: boolean
  createdAt: string
}

export type TimeOffReason = 'VACATION' | 'SICK_LEAVE' | 'PERSONAL' | 'CONFERENCE' | 'OTHER'

export type TimeOffStatus = 'PENDING' | 'APPROVED' | 'DENIED' | 'CANCELLED'

export interface TimeOffResponse {
  id: string
  startDate: string
  endDate: string
  reason: TimeOffReason
  notes?: string
  status: TimeOffStatus
  durationDays: number
  approvedBy?: string
  approvedByName?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Audit Log Types
// ============================================================================

export interface AuditLogResponse {
  id: string
  userEmail: string
  userRole: string
  action: string
  resourceType: string
  resourceId?: string
  description: string
  httpMethod?: string
  endpoint?: string
  ipAddress: string
  userAgent?: string
  responseStatus?: number
  success: boolean
  failureReason?: string
  timestamp: string
  sessionId?: string
  phiAccessed: boolean
  patientId?: string
  complianceNotes?: string
}

// ============================================================================
// Hospital Management Types
// ============================================================================

/**
 * Employment Type for staff assignments
 */
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'PER_DIEM' | 'VOLUNTEER'

/**
 * Hospital Type enum
 */
export type HospitalType =
  | 'GENERAL'
  | 'SPECIALTY'
  | 'TEACHING'
  | 'RESEARCH'
  | 'COMMUNITY'
  | 'CRITICAL_ACCESS'
  | 'REHABILITATION'
  | 'PSYCHIATRIC'

/**
 * Hospital Status enum
 */
export type HospitalStatus =
  | 'PENDING'
  | 'READY_FOR_REVIEW'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'UNDER_CONSTRUCTION'
  | 'TEMPORARILY_CLOSED'

/**
 * Trauma Level enum
 */
export type TraumaLevel = 'LEVEL_I' | 'LEVEL_II' | 'LEVEL_III' | 'LEVEL_IV' | 'NONE'

/**
 * Hospital Location (Geographic)
 * Represents the physical address/location of a hospital
 * Different from Location which represents internal hospital locations
 */
export interface HospitalLocation {
  id: string
  hospitalId: string
  hospitalName: string
  address: string
  district: string
  pincode: string
  state: string
  countryCode: string
  metadata?: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Hospital entity (Indian Format)
 * Represents a healthcare facility/organization
 */
export interface Hospital {
  id: string
  name: string
  hospitalType: HospitalType
  email: string
  phone: string
  // Geographic location (required)
  location: HospitalLocation
  registrationNumber: string
  bedCapacity: number
  emergencyServices: boolean
  metadata?: string
  status: HospitalStatus
  // Approval workflow fields
  readyForReview: boolean
  reviewedBy: string | null
  reviewedByName: string | null
  reviewedAt: string | null
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
  // Deprecated fields (for backward compatibility with old US format)
  code?: string
  website?: string
  licenseNumber?: string
  taxId?: string
  traumaLevel?: TraumaLevel
  accreditationInfo?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  pincode?: string
  country?: string
  address?: string
  phoneNumber?: string
  active?: boolean
}

/**
 * Location within a hospital
 * E.g., Building A, Floor 3, Wing B
 */
export interface Location {
  id: string
  hospitalId: string
  hospitalName?: string
  name: string
  code: string
  address?: string
  floor?: string
  buildingNumber?: string
  phoneNumber?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Department within a hospital
 * E.g., Cardiology, Emergency, Radiology
 */
export interface Department {
  id: string
  hospitalId: string
  hospitalName?: string
  name: string
  code: string
  description?: string
  phoneNumber?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Staff assignment to hospital
 * Links users (doctors, nurses, staff) to hospitals with specific roles
 */
export interface HospitalStaffAssignment {
  id: string
  userId: string
  userName?: string
  userRole?: string
  hospitalId: string
  hospitalName?: string
  locationIds?: string[]
  locations?: Location[]
  departmentIds?: string[]
  departments?: Department[]
  employmentType: EmploymentType
  isPrimary: boolean
  startDate: string
  endDate?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Hospital with full details (including locations, departments, staff)
 */
export interface HospitalDetail extends Hospital {
  locations?: Location[]
  departments?: Department[]
  staffCount?: number
}

/**
 * Form data types for hospital management (Indian Format)
 * Re-exported from validation schemas for consistency
 */
export type { CreateHospitalFormData, UpdateHospitalFormData } from '@/lib/validations/hospital'

/**
 * Hospital Approval Workflow Request/Response Types
 */

/**
 * Request to create hospital with admin in one operation
 * SYSTEM_ADMIN only - creates hospital with PENDING status + hospital admin user
 */
export interface CreateHospitalWithAdminRequest {
  hospitalName: string
  district: string
  pincode: string
  state: string
  adminFirstName: string
  adminLastName: string
  adminEmail: string
  adminPhone: string
  sendInvitation?: boolean
}

/**
 * Response from creating hospital with admin
 */
export interface CreateHospitalWithAdminResponse {
  hospital: Hospital
  adminUserId: string
  adminEmail: string
  adminFullName: string
  message: string
}

/**
 * Request to mark hospital as ready for review
 * HOSPITAL_ADMIN only - marks their hospital as complete and ready for approval
 */
export interface MarkReadyForReviewRequest {
  notes?: string
}

/**
 * Request to approve or reject a hospital
 * SYSTEM_ADMIN only
 */
export interface ApproveRejectHospitalRequest {
  approved: boolean
  rejectionReason?: string
}

export interface CreateLocationFormData {
  hospitalId: string
  name: string
  code: string
  address?: string
  floor?: string
  buildingNumber?: string
  phoneNumber?: string
}

export interface UpdateLocationFormData extends CreateLocationFormData {
  active: boolean
}

export interface CreateDepartmentFormData {
  hospitalId: string
  name: string
  code: string
  description?: string
  phoneNumber?: string
}

export interface UpdateDepartmentFormData extends CreateDepartmentFormData {
  active: boolean
}

export interface CreateStaffAssignmentFormData {
  userId: string
  hospitalId: string
  locationIds?: string[]
  departmentIds?: string[]
  employmentType: EmploymentType
  isPrimary: boolean
  startDate: string
  endDate?: string
}

export interface UpdateStaffAssignmentFormData extends CreateStaffAssignmentFormData {
  active: boolean
}

/**
 * Filter types for hospital management
 */
export interface HospitalFilters {
  search?: string
  status?: HospitalStatus
  active?: boolean // Deprecated, use status instead
  hospitalType?: HospitalType
  page?: number
  size?: number
  sortBy?: string
  sortDir?: 'ASC' | 'DESC'
}

export interface LocationFilters {
  hospitalId?: string
  search?: string
  active?: boolean
  page?: number
  size?: number
}

export interface DepartmentFilters {
  hospitalId?: string
  search?: string
  active?: boolean
  page?: number
  size?: number
}

export interface StaffAssignmentFilters {
  hospitalId?: string
  userId?: string
  departmentId?: string
  role?: UserRole
  employmentType?: EmploymentType
  active?: boolean
  page?: number
  size?: number
}
