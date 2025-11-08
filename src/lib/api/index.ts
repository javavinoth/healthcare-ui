/**
 * API Functions
 * Centralized API calls for the healthcare application
 * All API interactions should go through these functions
 *
 * Uses endpoint constants from './endpoints' for maintainability and type safety
 */

import apiClient, { setAccessToken, clearTokens } from './client'
import { ENDPOINTS } from './endpoints'
import type { LoginFormData, ProviderRegistrationFormData } from '@/lib/validations/auth'
import type {
  User,
  TwoFactorFormData,
  RegisterFormData,
  Appointment,
  MedicalRecord,
  Message,
  Conversation,
  Attachment,
  ApiResponse,
  PaginatedResponse,
  LoginResponse,
  AuthResponse,
  MessageResponse,
  Enable2FAResponse,
  PatientSummary,
  PatientDetail,
  PatientTimelineEvent,
  UpdatePatientData,
  VisitNote,
  VisitNoteFormData,
  Prescription,
  PrescriptionFormData,
  PrescriptionStatus,
  AuditLogResponse,
  ProviderDashboardResponse,
  ProviderStatsResponse,
  TodayAppointmentResponse,
  CalendarEventResponse,
  TimeBlockResponse,
  TimeOffResponse,
  ProviderSettingsResponse,
  AdminUserResponse,
  AvailabilityEntry,
  ProviderSearchResult,
} from '@/types'

/**
 * Authentication API (Backend Integration)
 */
export const authApi = {
  /**
   * Login - Step 1: Verify credentials
   * Returns either 2FA requirement or full auth response
   * Note: Refresh token is automatically set as HTTP-only cookie by backend
   */
  login: async (data: LoginFormData): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(ENDPOINTS.AUTH.LOGIN, data)

    // Store access token if no 2FA required
    // Refresh token is now in HTTP-only cookie (set by backend)
    if (response.data.accessToken) {
      setAccessToken(response.data.accessToken)
    }

    return response.data
  },

  /**
   * Login - Step 2: Verify 2FA code
   * Returns full auth response with tokens
   * Note: Refresh token is automatically set as HTTP-only cookie by backend
   */
  verify2FA: async (data: TwoFactorFormData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(ENDPOINTS.AUTH.VERIFY_2FA, data)

    // Store access token after successful 2FA
    // Refresh token is now in HTTP-only cookie (set by backend)
    if (response.data.accessToken) {
      setAccessToken(response.data.accessToken)
    }

    return response.data
  },

  /**
   * Register new patient account
   * Creates a new user with PATIENT role
   */
  register: async (data: RegisterFormData): Promise<User> => {
    const { confirmPassword: _confirmPassword, ...requestData } = data
    const response = await apiClient.post<User>(ENDPOINTS.AUTH.REGISTER, requestData)
    return response.data
  },

  /**
   * Register new provider account
   * Creates a new user with DOCTOR role in PENDING status
   * Requires admin approval before account activation
   */
  registerProvider: async (data: ProviderRegistrationFormData): Promise<User> => {
    const { confirmPassword: _confirmPassword, ...requestData } = data
    const response = await apiClient.post<User>(ENDPOINTS.AUTH.REGISTER_PROVIDER, requestData)
    return response.data
  },

  /**
   * Logout - Revoke tokens and clear session
   * Note: Refresh token is automatically read from HTTP-only cookie by backend
   */
  logout: async (): Promise<MessageResponse> => {
    try {
      // No need to send refresh token - it's in HTTP-only cookie (sent automatically)
      const response = await apiClient.post<MessageResponse>(ENDPOINTS.AUTH.LOGOUT, {})
      return response.data
    } finally {
      // Always clear tokens even if API call fails
      // Backend clears the HTTP-only cookie
      clearTokens()
    }
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>(ENDPOINTS.USER.CURRENT_USER)
    return response.data
  },

  /**
   * Update current user profile
   */
  updateProfile: async (data: {
    firstName: string
    lastName: string
    phoneNumber?: string
  }): Promise<User> => {
    const response = await apiClient.put<User>(ENDPOINTS.USER.UPDATE_PROFILE, data)
    return response.data
  },

  /**
   * Refresh access token using refresh token
   * Note: Refresh token is automatically read from HTTP-only cookie by backend
   * Backend will set new refresh token as HTTP-only cookie if rotated
   */
  refreshSession: async (): Promise<AuthResponse> => {
    // No need to send refresh token - it's in HTTP-only cookie (sent automatically)
    const response = await apiClient.post<AuthResponse>(ENDPOINTS.AUTH.REFRESH, {})

    // Update stored access token
    // Refresh token is handled via HTTP-only cookie (set by backend if rotated)
    if (response.data.accessToken) {
      setAccessToken(response.data.accessToken)
    }

    return response.data
  },

  /**
   * Request password reset email
   */
  requestPasswordReset: async (email: string): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>(ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      email,
    })
    return response.data
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token: string, password: string): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>(ENDPOINTS.AUTH.RESET_PASSWORD, {
      token,
      password,
    })
    return response.data
  },

  /**
   * Change password (authenticated users)
   */
  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>(ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
    })
    return response.data
  },

  /**
   * Enable 2FA - Get QR code
   */
  enable2FA: async (): Promise<Enable2FAResponse> => {
    const response = await apiClient.post<Enable2FAResponse>(ENDPOINTS.AUTH.ENABLE_2FA)
    return response.data
  },

  /**
   * Verify 2FA setup with code
   */
  verify2FASetup: async (code: string): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>(ENDPOINTS.AUTH.VERIFY_2FA_SETUP, {
      code,
    })
    return response.data
  },

  /**
   * Disable 2FA
   */
  disable2FA: async (code: string): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>(ENDPOINTS.AUTH.DISABLE_2FA, { code })
    return response.data
  },
}

/**
 * Helper function to map backend appointment response to frontend format
 */
function mapAppointmentResponse(backendAppointment: Record<string, unknown>): Appointment {
  if (!backendAppointment) return null as unknown as Appointment

  return {
    ...backendAppointment,
    // Map provider object to provider name strings
    providerName: (backendAppointment.provider as Record<string, unknown>)
      ? `${(backendAppointment.provider as Record<string, unknown>).firstName} ${(backendAppointment.provider as Record<string, unknown>).lastName}`
      : 'Unknown Provider',
    providerSpecialty: (backendAppointment.provider as Record<string, unknown>)?.specialty as
      | string
      | undefined,

    // Map single time field to startTime/endTime
    startTime: (backendAppointment.time as string) || '',
    endTime: (backendAppointment.time as string) || '', // Could calculate end time based on duration

    // Map uppercase status to lowercase
    status: (backendAppointment.status as string)?.toLowerCase() || 'scheduled',

    // Type is already uppercase (already matches)
    type: backendAppointment.type,
  } as Appointment
}

/**
 * Appointments API
 */
export const appointmentsApi = {
  getAll: async (params?: {
    status?: string
    startDate?: string
    endDate?: string
  }): Promise<Appointment[]> => {
    const response = await apiClient.get(ENDPOINTS.APPOINTMENTS.LIST, { params })
    // Backend returns array directly, map each appointment
    const appointments = Array.isArray(response.data) ? response.data : []
    return appointments.map(mapAppointmentResponse)
  },

  getById: async (id: string): Promise<Appointment> => {
    const response = await apiClient.get(ENDPOINTS.APPOINTMENTS.GET_BY_ID(id))
    return mapAppointmentResponse(response.data)
  },

  create: async (data: Partial<Appointment>): Promise<Appointment> => {
    const response = await apiClient.post(ENDPOINTS.APPOINTMENTS.CREATE, data)
    return mapAppointmentResponse(response.data)
  },

  update: async (id: string, data: Partial<Appointment>): Promise<Appointment> => {
    const response = await apiClient.put(ENDPOINTS.APPOINTMENTS.UPDATE(id), data)
    return mapAppointmentResponse(response.data)
  },

  cancel: async (id: string, reason?: string): Promise<void> => {
    const response = await apiClient.delete(ENDPOINTS.APPOINTMENTS.CANCEL(id), { data: { reason } })
    return response.data
  },

  reschedule: async (id: string, newDate: string, newTime: string): Promise<Appointment> => {
    const response = await apiClient.put(ENDPOINTS.APPOINTMENTS.RESCHEDULE(id), {
      date: newDate,
      time: newTime,
    })
    return mapAppointmentResponse(response.data)
  },

  getAvailableSlots: async (providerId: string, date: string): Promise<{ slots: string[] }> => {
    const response = await apiClient.get(ENDPOINTS.APPOINTMENTS.AVAILABLE_SLOTS(providerId), {
      params: { date },
    })
    return response.data
  },
}

/**
 * Helper function to map backend medical record response to frontend format
 */
function mapMedicalRecordResponse(backendRecord: Record<string, unknown>): MedicalRecord {
  if (!backendRecord) return null as unknown as MedicalRecord

  // Map type from uppercase to lowercase with underscores
  const typeMapping: Record<string, string> = {
    LAB_RESULT: 'lab_result',
    IMAGING: 'imaging',
    VISIT_NOTE: 'visit_note',
    PRESCRIPTION: 'prescription',
    IMMUNIZATION: 'immunization',
    PROCEDURE_NOTE: 'procedure_note',
    DISCHARGE_SUMMARY: 'discharge_summary',
    REFERRAL: 'visit_note', // Map REFERRAL to visit_note as fallback
  }

  // Derive category from type
  const categoryMapping: Record<string, string> = {
    lab_result: 'Lab & Diagnostics',
    imaging: 'Imaging & Radiology',
    visit_note: 'Clinical Notes',
    prescription: 'Medications',
    immunization: 'Preventive Care',
    procedure_note: 'Procedures',
    discharge_summary: 'Hospital Records',
  }

  const mappedType =
    typeMapping[backendRecord.type as string] || (backendRecord.type as string).toLowerCase()

  return {
    ...backendRecord,
    // Map provider object to provider name string
    provider: (backendRecord.provider as Record<string, unknown>)
      ? `${(backendRecord.provider as Record<string, unknown>).firstName} ${(backendRecord.provider as Record<string, unknown>).lastName}`
      : 'Unknown Provider',

    // Map type to lowercase with underscores
    type: mappedType,

    // Map recordDate to date
    date: (backendRecord.recordDate || backendRecord.date) as string,

    // Map description to both content and summary
    content: (backendRecord.description || backendRecord.content || '') as string,
    summary: (backendRecord.description || backendRecord.summary || '') as string,

    // Add category based on type
    category: categoryMapping[mappedType] || 'Other',

    // Default status to 'final' if not provided
    status: ((backendRecord.status as string)?.toLowerCase() || 'final') as
      | 'final'
      | 'preliminary'
      | 'amended',

    // Map attachment field names
    attachments:
      (backendRecord.attachments as Record<string, unknown>[])?.map(
        (att: Record<string, unknown>) => ({
          id: att.id as string,
          name: (att.fileName || att.name) as string,
          type: (att.fileType || att.type) as string,
          size: (att.fileSize || att.size) as number,
          url: att.url as string,
        })
      ) || [],
  } as MedicalRecord
}

/**
 * Medical Records API
 */
export const medicalRecordsApi = {
  getAll: async (params?: {
    type?: string
    startDate?: string
    endDate?: string
    category?: string
  }): Promise<MedicalRecord[]> => {
    const response = await apiClient.get(ENDPOINTS.MEDICAL_RECORDS.LIST, { params })
    // Backend returns array directly, map each record
    const records = Array.isArray(response.data) ? response.data : []
    return records.map(mapMedicalRecordResponse)
  },

  getById: async (id: string): Promise<MedicalRecord> => {
    const response = await apiClient.get(ENDPOINTS.MEDICAL_RECORDS.GET_BY_ID(id))
    return mapMedicalRecordResponse(response.data)
  },

  markAsRead: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(ENDPOINTS.MEDICAL_RECORDS.MARK_READ(id))
    return response.data
  },

  downloadAttachment: async (recordId: string, attachmentId: string): Promise<Blob> => {
    const response = await apiClient.get(
      ENDPOINTS.MEDICAL_RECORDS.DOWNLOAD_ATTACHMENT(recordId, attachmentId),
      {
        responseType: 'blob',
      }
    )
    return response.data
  },

  /**
   * @deprecated Use downloadAttachment(recordId, attachmentId) instead
   * Backward-compatible helper that downloads the first attachment of a record
   */
  download: async (recordId: string): Promise<Blob> => {
    // Fetch the record to get the first attachment ID
    const record = await medicalRecordsApi.getById(recordId)
    if (!record.attachments || record.attachments.length === 0) {
      throw new Error('No attachments found for this medical record')
    }
    const firstAttachment = record.attachments[0]
    return medicalRecordsApi.downloadAttachment(recordId, firstAttachment.id)
  },
}

/**
 * Helper function to convert Spring Boot Page to PaginatedResponse
 */
function mapSpringPageToResponse<T>(springPage: Record<string, unknown>): PaginatedResponse<T> {
  return {
    data: (springPage.content || springPage.data || springPage) as T[],
    total: (springPage.totalElements ||
      springPage.total ||
      (springPage.content as unknown[])?.length ||
      0) as number,
    page:
      springPage.number !== undefined
        ? (springPage.number as number)
        : ((springPage.page || 0) as number),
    pageSize: (springPage.size ||
      springPage.pageSize ||
      (springPage.content as unknown[])?.length ||
      0) as number,
    totalPages: (springPage.totalPages || 1) as number,
  }
}

/**
 * Messages API
 */
export const messagesApi = {
  /**
   * Get all conversations for the current user
   * @param page - Page number (0-indexed)
   * @param pageSize - Number of items per page
   */
  getConversations: async (
    page: number = 0,
    pageSize: number = 20
  ): Promise<PaginatedResponse<Conversation>> => {
    const response = await apiClient.get(ENDPOINTS.MESSAGES.CONVERSATIONS, {
      params: { page, size: pageSize, sort: 'updatedAt,desc' },
    })
    return mapSpringPageToResponse(response.data)
  },

  /**
   * Get a specific conversation by ID
   * @param id - Conversation ID
   */
  getConversation: async (id: string): Promise<Conversation> => {
    const response = await apiClient.get(ENDPOINTS.MESSAGES.CONVERSATION_BY_ID(id))
    return response.data
  },

  /**
   * Get all messages in a conversation
   * @param conversationId - Conversation ID
   * @param page - Page number (0-indexed)
   * @param pageSize - Number of items per page
   */
  getMessages: async (
    conversationId: string,
    page: number = 0,
    pageSize: number = 50
  ): Promise<PaginatedResponse<Message>> => {
    const response = await apiClient.get(ENDPOINTS.MESSAGES.CONVERSATION_MESSAGES(conversationId), {
      params: { page, size: pageSize, sort: 'sentAt,asc' },
    })
    return mapSpringPageToResponse(response.data)
  },

  /**
   * Send a new message or reply to a conversation
   * @param data - Message data (recipientId, subject, body, conversationId)
   */
  sendMessage: async (data: {
    recipientId: string
    subject?: string
    body: string
    conversationId?: string
  }): Promise<Message> => {
    const response = await apiClient.post(ENDPOINTS.MESSAGES.SEND, data)
    return response.data
  },

  /**
   * Mark a message as read
   * @param messageId - Message ID
   */
  markAsRead: async (messageId: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.MESSAGES.MARK_READ(messageId))
  },

  /**
   * Upload an attachment to a message
   * @param messageId - Message ID
   * @param file - File to upload
   */
  uploadAttachment: async (messageId: string, file: File): Promise<Attachment> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post(
      ENDPOINTS.MESSAGES.UPLOAD_ATTACHMENT(messageId),
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    )
    return response.data
  },

  /**
   * Download an attachment
   * Uses authenticated API client to download with proper auth headers
   * @param attachmentId - Attachment ID
   */
  downloadAttachment: async (attachmentId: string): Promise<Blob> => {
    const response = await apiClient.get(ENDPOINTS.MESSAGES.DOWNLOAD_ATTACHMENT(attachmentId))
    return response.data
  },

  /**
   * Get users that the current user can message
   * Returns list of users based on role permissions
   * @param params - Optional filters (role, search)
   */
  getMessageableUsers: async (params?: { role?: string; search?: string }): Promise<User[]> => {
    // For now, use a simple approach to fetch all active users
    // Filter will be applied client-side using messaging permissions
    const response = await apiClient.get(ENDPOINTS.ADMIN.LIST_USERS, {
      params: { ...params, size: 1000, page: 0, active: true },
    })
    // Safely extract users array with multiple fallback checks
    const users = response.data?.users || response.data || []
    return Array.isArray(users) ? users : []
  },
}

/**
 * Providers API
 */
export const providersApi = {
  getAll: async (params?: {
    specialty?: string
    location?: string
    acceptingNewPatients?: boolean
    search?: string
  }): Promise<ProviderSearchResult[]> => {
    const response = await apiClient.post(ENDPOINTS.APPOINTMENTS.SEARCH_PROVIDERS, params)
    // Backend returns array directly, ensure it's an array with safety check
    const providers = Array.isArray(response.data) ? response.data : []
    return providers
  },
}

/**
 * Patients API (for providers and admins)
 */
export const patientsApi = {
  getAll: async (params?: {
    search?: string
    page?: number
    pageSize?: number
  }): Promise<ApiResponse<PaginatedResponse<User>>> => {
    const response = await apiClient.get(ENDPOINTS.PATIENTS.LIST, { params })
    return response.data
  },

  getById: async (id: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.get(ENDPOINTS.PATIENTS.GET_BY_ID(id))
    return response.data
  },

  getMedicalHistory: async (id: string): Promise<ApiResponse<MedicalRecord[]>> => {
    const response = await apiClient.get(ENDPOINTS.PATIENTS.MEDICAL_HISTORY(id))
    return response.data
  },
}

/**
 * Provider API (for providers/doctors)
 */
export const providerApi = {
  getDashboard: async (): Promise<ProviderDashboardResponse> => {
    const response = await apiClient.get(ENDPOINTS.PROVIDER.DASHBOARD)
    return response.data
  },

  getStats: async (): Promise<ProviderStatsResponse> => {
    const response = await apiClient.get(ENDPOINTS.PROVIDER.STATS)
    return response.data
  },

  getTodayAppointments: async (): Promise<TodayAppointmentResponse[]> => {
    const response = await apiClient.get(ENDPOINTS.PROVIDER.TODAY_APPOINTMENTS)
    // Backend returns array directly, ensure it's an array with safety check
    const appointments = Array.isArray(response.data) ? response.data : []
    return appointments
  },

  // Patient Management
  getPatients: async (params?: {
    page?: number
    size?: number
    search?: string
  }): Promise<PaginatedResponse<PatientSummary>> => {
    const response = await apiClient.get(ENDPOINTS.PROVIDER.PATIENTS, { params })
    return response.data
  },

  getPatientDetail: async (patientId: string): Promise<PatientDetail> => {
    const response = await apiClient.get(ENDPOINTS.PROVIDER.PATIENT_DETAIL(patientId))
    return response.data
  },

  getPatientTimeline: async (patientId: string): Promise<PatientTimelineEvent[]> => {
    const response = await apiClient.get(ENDPOINTS.PROVIDER.PATIENT_TIMELINE(patientId))
    return response.data
  },

  updatePatient: async (patientId: string, data: UpdatePatientData): Promise<PatientDetail> => {
    const response = await apiClient.put(ENDPOINTS.PROVIDER.UPDATE_PATIENT(patientId), data)
    return response.data
  },

  // Appointment Management
  getAppointments: async (params: {
    startDate: string
    endDate: string
    status?: string
  }): Promise<CalendarEventResponse[]> => {
    const response = await apiClient.get(ENDPOINTS.PROVIDER.APPOINTMENTS, { params })
    // Backend returns array directly, ensure it's an array with safety check
    const appointments = Array.isArray(response.data) ? response.data : []
    return appointments
  },

  getCalendar: async (params: {
    startDate: string
    endDate: string
  }): Promise<CalendarEventResponse[]> => {
    const response = await apiClient.get(ENDPOINTS.PROVIDER.CALENDAR, { params })
    // Backend returns array directly, ensure it's an array with safety check
    const calendar = Array.isArray(response.data) ? response.data : []
    return calendar
  },

  checkInAppointment: async (
    appointmentId: string,
    data: {
      notes?: string
      isLateArrival?: boolean
      minutesLate?: number
    }
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(ENDPOINTS.PROVIDER.CHECK_IN(appointmentId), data)
    return response.data
  },

  completeAppointment: async (
    appointmentId: string,
    data: {
      notes: string
      followUpRequired?: boolean
      followUpInstructions?: string
      followUpDays?: number
    }
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(
      ENDPOINTS.PROVIDER.COMPLETE_APPOINTMENT(appointmentId),
      data
    )
    return response.data
  },

  markNoShow: async (
    appointmentId: string,
    data: {
      notes?: string
      patientContacted?: boolean
    }
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(ENDPOINTS.PROVIDER.MARK_NO_SHOW(appointmentId), data)
    return response.data
  },

  // Time Blocking
  createTimeBlock: async (data: {
    blockDate: string
    startTime: string
    endTime: string
    reason: string
    notes?: string
    isRecurring?: boolean
  }): Promise<TimeBlockResponse> => {
    const response = await apiClient.post(ENDPOINTS.PROVIDER.CREATE_TIME_BLOCK, data)
    return response.data
  },

  getTimeBlocks: async (params: {
    startDate: string
    endDate: string
  }): Promise<TimeBlockResponse[]> => {
    const response = await apiClient.get(ENDPOINTS.PROVIDER.LIST_TIME_BLOCKS, { params })
    // Backend returns array directly, ensure it's an array with safety check
    const timeBlocks = Array.isArray(response.data) ? response.data : []
    return timeBlocks
  },

  deleteTimeBlock: async (timeBlockId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(ENDPOINTS.PROVIDER.DELETE_TIME_BLOCK(timeBlockId))
    return response.data
  },

  // Schedule Management
  getProviderSettings: async (): Promise<ProviderSettingsResponse> => {
    const response = await apiClient.get(ENDPOINTS.PROVIDER.GET_SETTINGS)
    return response.data
  },

  updateProviderSettings: async (data: { slotDuration: number }): Promise<ApiResponse<void>> => {
    const response = await apiClient.put(ENDPOINTS.PROVIDER.UPDATE_SETTINGS, data)
    return response.data
  },

  updateAvailability: async (data: {
    availability: AvailabilityEntry[]
  }): Promise<ApiResponse<void>> => {
    const response = await apiClient.put(ENDPOINTS.PROVIDER.UPDATE_AVAILABILITY, data)
    return response.data
  },

  requestTimeOff: async (data: {
    startDate: string
    endDate: string
    reason: string
    notes?: string
  }): Promise<TimeOffResponse> => {
    const response = await apiClient.post(ENDPOINTS.PROVIDER.REQUEST_TIME_OFF, data)
    return response.data
  },

  getTimeOffRequests: async (): Promise<TimeOffResponse[]> => {
    const response = await apiClient.get(ENDPOINTS.PROVIDER.LIST_TIME_OFF)
    // Backend returns array directly, ensure it's an array with safety check
    const timeOffRequests = Array.isArray(response.data) ? response.data : []
    return timeOffRequests
  },

  cancelTimeOffRequest: async (requestId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(ENDPOINTS.PROVIDER.CANCEL_TIME_OFF(requestId))
    return response.data
  },

  // Clinical Documentation
  // Visit Notes (SOAP format)
  createVisitNote: async (patientId: string, data: VisitNoteFormData): Promise<VisitNote> => {
    const response = await apiClient.post(ENDPOINTS.PROVIDER.CREATE_NOTE(patientId), data)
    return response.data
  },

  getPatientVisitNotes: async (patientId: string): Promise<VisitNote[]> => {
    const response = await apiClient.get(ENDPOINTS.PROVIDER.GET_PATIENT_NOTES(patientId))
    // Backend returns array directly, ensure it's an array with safety check
    const notes = Array.isArray(response.data) ? response.data : []
    return notes
  },

  getVisitNoteById: async (noteId: string): Promise<VisitNote> => {
    const response = await apiClient.get(ENDPOINTS.PROVIDER.GET_NOTE(noteId))
    return response.data
  },

  // Prescriptions
  createPrescription: async (
    patientId: string,
    data: PrescriptionFormData
  ): Promise<Prescription> => {
    const response = await apiClient.post(ENDPOINTS.PROVIDER.CREATE_PRESCRIPTION(patientId), data)
    return response.data
  },

  getPatientPrescriptions: async (patientId: string, status?: string): Promise<Prescription[]> => {
    const params = status ? { status } : {}
    const response = await apiClient.get(ENDPOINTS.PROVIDER.GET_PATIENT_PRESCRIPTIONS(patientId), {
      params,
    })
    // Backend returns array directly, ensure it's an array with safety check
    const prescriptions = Array.isArray(response.data) ? response.data : []
    return prescriptions
  },

  getPrescriptionById: async (prescriptionId: string): Promise<Prescription> => {
    const response = await apiClient.get(ENDPOINTS.PROVIDER.GET_PRESCRIPTION(prescriptionId))
    return response.data
  },

  updatePrescriptionStatus: async (
    prescriptionId: string,
    data: { status: PrescriptionStatus; reason?: string }
  ): Promise<Prescription> => {
    const response = await apiClient.put(
      ENDPOINTS.PROVIDER.UPDATE_PRESCRIPTION_STATUS(prescriptionId),
      data
    )
    return response.data
  },
}

/**
 * Admin API (for administrators)
 */
export const adminApi = {
  // User Management
  createUser: async (data: {
    email: string
    password?: string
    firstName: string
    lastName: string
    phoneNumber?: string
    role: string
    sendInvitation?: boolean
  }): Promise<AdminUserResponse> => {
    const response = await apiClient.post(ENDPOINTS.ADMIN.CREATE_USER, data)
    return response.data
  },

  getAllUsers: async (params?: {
    page?: number
    size?: number
    role?: string
    search?: string
    sortBy?: string
    sortDir?: string
  }): Promise<PaginatedResponse<AdminUserResponse>> => {
    const response = await apiClient.get(ENDPOINTS.ADMIN.LIST_USERS, { params })
    return mapSpringPageToResponse(response.data)
  },

  getUserById: async (id: string): Promise<AdminUserResponse> => {
    const response = await apiClient.get(ENDPOINTS.ADMIN.GET_USER(id))
    return response.data
  },

  updateUser: async (
    id: string,
    data: {
      firstName: string
      lastName: string
      phoneNumber?: string
      active?: boolean
    }
  ): Promise<AdminUserResponse> => {
    const response = await apiClient.put(ENDPOINTS.ADMIN.UPDATE_USER(id), data)
    return response.data
  },

  changeUserRole: async (id: string, role: string): Promise<AdminUserResponse> => {
    const response = await apiClient.put(ENDPOINTS.ADMIN.UPDATE_USER_ROLE(id), { role })
    return response.data
  },

  activateUser: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(ENDPOINTS.ADMIN.ACTIVATE_USER(id))
    return response.data
  },

  deactivateUser: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(ENDPOINTS.ADMIN.DEACTIVATE_USER(id))
    return response.data
  },

  sendInvitation: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(ENDPOINTS.ADMIN.SEND_INVITATION(id))
    return response.data
  },

  getStats: async (): Promise<Record<string, number>> => {
    const response = await apiClient.get(ENDPOINTS.ADMIN.STATS)
    return response.data
  },
}

/**
 * Audit Logging (HIPAA Compliance)
 * Logs all PHI access events
 */
/**
 * Audit Log API
 * Backend handles audit logging automatically via AOP/interceptors
 * These endpoints are for VIEWING audit logs only
 */
export const auditApi = {
  /**
   * Get all audit logs (Admin only)
   * Supports pagination via Spring Boot Pageable
   */
  getAll: async (params?: {
    page?: number
    size?: number
  }): Promise<PaginatedResponse<AuditLogResponse>> => {
    const response = await apiClient.get(ENDPOINTS.AUDIT.LIST, { params })
    return mapSpringPageToResponse(response.data)
  },

  /**
   * Get current user's audit logs
   */
  getMy: async (params?: {
    page?: number
    size?: number
  }): Promise<PaginatedResponse<AuditLogResponse>> => {
    const response = await apiClient.get(ENDPOINTS.AUDIT.MY_LOGS, { params })
    return mapSpringPageToResponse(response.data)
  },

  /**
   * Get audit logs for specific user (Admin only)
   */
  getUserLogs: async (
    userId: string,
    params?: { page?: number; size?: number }
  ): Promise<PaginatedResponse<AuditLogResponse>> => {
    const response = await apiClient.get(ENDPOINTS.AUDIT.USER_LOGS(userId), { params })
    return mapSpringPageToResponse(response.data)
  },

  /**
   * Get PHI access logs for specific patient (Provider/Admin)
   */
  getPatientLogs: async (
    patientId: string,
    params?: { page?: number; size?: number }
  ): Promise<PaginatedResponse<AuditLogResponse>> => {
    const response = await apiClient.get(ENDPOINTS.AUDIT.PATIENT_LOGS(patientId), { params })
    return mapSpringPageToResponse(response.data)
  },
}

export default {
  auth: authApi,
  appointments: appointmentsApi,
  medicalRecords: medicalRecordsApi,
  messages: messagesApi,
  providers: providersApi,
  patients: patientsApi,
  provider: providerApi,
  admin: adminApi,
  audit: auditApi,
}
