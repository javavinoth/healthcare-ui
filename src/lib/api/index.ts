/**
 * API Functions
 * Centralized API calls for the healthcare application
 * All API interactions should go through these functions
 */

import apiClient, { setAccessToken, setRefreshToken, clearTokens, getRefreshToken } from './client'
import type {
  User,
  LoginFormData,
  TwoFactorFormData,
  RegisterFormData,
  Appointment,
  MedicalRecord,
  Message,
  Conversation,
  ApiResponse,
  PaginatedResponse,
  LoginResponse,
  AuthResponse,
  MessageResponse,
  Enable2FAResponse,
} from '@/types'

/**
 * Authentication API (Backend Integration)
 */
export const authApi = {
  /**
   * Login - Step 1: Verify credentials
   * Returns either 2FA requirement or full auth response
   */
  login: async (data: LoginFormData): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data)

    // Store tokens if no 2FA required
    if (response.data.accessToken && response.data.refreshToken) {
      setAccessToken(response.data.accessToken)
      setRefreshToken(response.data.refreshToken)
    }

    return response.data
  },

  /**
   * Login - Step 2: Verify 2FA code
   * Returns full auth response with tokens
   */
  verify2FA: async (data: TwoFactorFormData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/verify-2fa', data)

    // Store tokens after successful 2FA
    if (response.data.accessToken && response.data.refreshToken) {
      setAccessToken(response.data.accessToken)
      setRefreshToken(response.data.refreshToken)
    }

    return response.data
  },

  /**
   * Register new patient account
   * Creates a new user with PATIENT role
   */
  register: async (data: RegisterFormData): Promise<User> => {
    const { confirmPassword, ...requestData } = data
    const response = await apiClient.post<User>('/auth/register', requestData)
    return response.data
  },

  /**
   * Logout - Revoke tokens and clear session
   */
  logout: async (): Promise<MessageResponse> => {
    const refreshToken = getRefreshToken()

    try {
      const response = await apiClient.post<MessageResponse>('/auth/logout', { refreshToken })
      return response.data
    } finally {
      // Always clear tokens even if API call fails
      clearTokens()
    }
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/me')
    return response.data
  },

  /**
   * Update current user profile
   */
  updateProfile: async (data: { firstName: string; lastName: string; phoneNumber?: string }): Promise<User> => {
    const response = await apiClient.put<User>('/users/me', data)
    return response.data
  },

  /**
   * Refresh access token using refresh token
   */
  refreshSession: async (): Promise<AuthResponse> => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await apiClient.post<AuthResponse>('/auth/refresh', { refreshToken })

    // Update stored tokens
    if (response.data.accessToken) {
      setAccessToken(response.data.accessToken)
    }
    if (response.data.refreshToken) {
      setRefreshToken(response.data.refreshToken)
    }

    return response.data
  },

  /**
   * Request password reset email
   */
  requestPasswordReset: async (email: string): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>('/auth/forgot-password', { email })
    return response.data
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token: string, password: string): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>('/auth/reset-password', { token, password })
    return response.data
  },

  /**
   * Change password (authenticated users)
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>('/auth/change-password', {
      currentPassword,
      newPassword,
    })
    return response.data
  },

  /**
   * Enable 2FA - Get QR code
   */
  enable2FA: async (): Promise<Enable2FAResponse> => {
    const response = await apiClient.post<Enable2FAResponse>('/auth/enable-2fa')
    return response.data
  },

  /**
   * Verify 2FA setup with code
   */
  verify2FASetup: async (code: string): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>('/auth/verify-2fa-setup', { code })
    return response.data
  },

  /**
   * Disable 2FA
   */
  disable2FA: async (code: string): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>('/auth/disable-2fa', { code })
    return response.data
  },
}

/**
 * Helper function to map backend appointment response to frontend format
 */
function mapAppointmentResponse(backendAppointment: any): any {
  if (!backendAppointment) return null

  return {
    ...backendAppointment,
    // Map provider object to provider name strings
    providerName: backendAppointment.provider
      ? `${backendAppointment.provider.firstName} ${backendAppointment.provider.lastName}`
      : 'Unknown Provider',
    providerSpecialty: backendAppointment.provider?.specialty,

    // Map single time field to startTime/endTime
    startTime: backendAppointment.time || '',
    endTime: backendAppointment.time || '', // Could calculate end time based on duration

    // Map uppercase status to lowercase
    status: backendAppointment.status?.toLowerCase() || 'scheduled',

    // Type is already uppercase (already matches)
    type: backendAppointment.type,
  }
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
    const response = await apiClient.get('/appointments', { params })
    // Backend returns array directly, map each appointment
    const appointments = Array.isArray(response.data) ? response.data : []
    return appointments.map(mapAppointmentResponse)
  },

  getById: async (id: string): Promise<Appointment> => {
    const response = await apiClient.get(`/appointments/${id}`)
    return mapAppointmentResponse(response.data)
  },

  create: async (data: Partial<Appointment>): Promise<Appointment> => {
    const response = await apiClient.post('/appointments', data)
    return mapAppointmentResponse(response.data)
  },

  update: async (id: string, data: Partial<Appointment>): Promise<Appointment> => {
    const response = await apiClient.put(`/appointments/${id}`, data)
    return mapAppointmentResponse(response.data)
  },

  cancel: async (id: string, reason?: string): Promise<void> => {
    const response = await apiClient.delete(`/appointments/${id}/cancel`, { data: { reason } })
    return response.data
  },

  reschedule: async (id: string, newDate: string, newTime: string): Promise<Appointment> => {
    const response = await apiClient.put(`/appointments/${id}/reschedule`, {
      date: newDate,
      time: newTime
    })
    return mapAppointmentResponse(response.data)
  },
}

/**
 * Helper function to map backend medical record response to frontend format
 */
function mapMedicalRecordResponse(backendRecord: any): any {
  if (!backendRecord) return null

  // Map type from uppercase to lowercase with underscores
  const typeMapping: Record<string, string> = {
    'LAB_RESULT': 'lab_result',
    'IMAGING': 'imaging',
    'VISIT_NOTE': 'visit_note',
    'PRESCRIPTION': 'prescription',
    'IMMUNIZATION': 'immunization',
    'PROCEDURE_NOTE': 'procedure_note',
    'DISCHARGE_SUMMARY': 'discharge_summary',
    'REFERRAL': 'visit_note', // Map REFERRAL to visit_note as fallback
  }

  // Derive category from type
  const categoryMapping: Record<string, string> = {
    'lab_result': 'Lab & Diagnostics',
    'imaging': 'Imaging & Radiology',
    'visit_note': 'Clinical Notes',
    'prescription': 'Medications',
    'immunization': 'Preventive Care',
    'procedure_note': 'Procedures',
    'discharge_summary': 'Hospital Records',
  }

  const mappedType = typeMapping[backendRecord.type] || backendRecord.type.toLowerCase()

  return {
    ...backendRecord,
    // Map provider object to provider name string
    provider: backendRecord.provider
      ? `${backendRecord.provider.firstName} ${backendRecord.provider.lastName}`
      : 'Unknown Provider',

    // Map type to lowercase with underscores
    type: mappedType,

    // Map recordDate to date
    date: backendRecord.recordDate || backendRecord.date,

    // Map description to both content and summary
    content: backendRecord.description || backendRecord.content || '',
    summary: backendRecord.description || backendRecord.summary || '',

    // Add category based on type
    category: categoryMapping[mappedType] || 'Other',

    // Default status to 'final' if not provided
    status: backendRecord.status?.toLowerCase() || 'final',

    // Map attachment field names
    attachments: backendRecord.attachments?.map((att: any) => ({
      id: att.id,
      name: att.fileName || att.name,
      type: att.fileType || att.type,
      size: att.fileSize || att.size,
      url: att.url,
    })) || [],
  }
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
    const response = await apiClient.get('/medical-records', { params })
    // Backend returns array directly, map each record
    const records = Array.isArray(response.data) ? response.data : []
    return records.map(mapMedicalRecordResponse)
  },

  getById: async (id: string): Promise<MedicalRecord> => {
    const response = await apiClient.get(`/medical-records/${id}`)
    return mapMedicalRecordResponse(response.data)
  },

  markAsRead: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(`/medical-records/${id}/mark-read`)
    return response.data
  },

  download: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/medical-records/${id}/download`, {
      responseType: 'blob',
    })
    return response.data
  },
}

/**
 * Helper function to convert Spring Boot Page to PaginatedResponse
 */
function mapSpringPageToResponse<T>(springPage: any): PaginatedResponse<T> {
  return {
    data: springPage.content || springPage.data || springPage,
    total: springPage.totalElements || springPage.total || (springPage.content?.length || 0),
    page: springPage.number !== undefined ? springPage.number : (springPage.page || 0),
    pageSize: springPage.size || springPage.pageSize || (springPage.content?.length || 0),
    totalPages: springPage.totalPages || 1
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
    const response = await apiClient.get('/messages/conversations', {
      params: { page, size: pageSize, sort: 'updatedAt,desc' }
    })
    return mapSpringPageToResponse(response.data)
  },

  /**
   * Get a specific conversation by ID
   * @param id - Conversation ID
   */
  getConversation: async (id: string): Promise<Conversation> => {
    const response = await apiClient.get(`/messages/conversations/${id}`)
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
    const response = await apiClient.get(
      `/messages/conversations/${conversationId}/messages`,
      { params: { page, size: pageSize, sort: 'sentAt,asc' } }
    )
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
    const response = await apiClient.post('/messages', data)
    return response.data
  },

  /**
   * Mark a message as read
   * @param messageId - Message ID
   */
  markAsRead: async (messageId: string): Promise<void> => {
    await apiClient.post(`/messages/${messageId}/mark-read`)
  },

  /**
   * Upload an attachment to a message
   * @param messageId - Message ID
   * @param file - File to upload
   */
  uploadAttachment: async (
    messageId: string,
    file: File
  ): Promise<Attachment> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post(
      `/messages/${messageId}/attachments`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    )
    return response.data
  },

  /**
   * Download an attachment
   * Uses authenticated API client to download with proper auth headers
   * @param attachmentId - Attachment ID
   */
  downloadAttachment: async (attachmentId: string): Promise<any> => {
    const response = await apiClient.get(
      `/messages/attachments/${attachmentId}/download`
    )
    return response.data
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
  }): Promise<any[]> => {
    const response = await apiClient.post('/appointments/search-providers', params)
    return response.data
  },

  getAvailableSlots: async (
    providerId: string,
    date: string
  ): Promise<ApiResponse<{ slots: string[] }>> => {
    const response = await apiClient.get(`/appointments/providers/${providerId}/available-slots`, {
      params: { date },
    })
    return response.data
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
    const response = await apiClient.get('/patients', { params })
    return response.data
  },

  getById: async (id: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.get(`/patients/${id}`)
    return response.data
  },

  getMedicalHistory: async (id: string): Promise<ApiResponse<MedicalRecord[]>> => {
    const response = await apiClient.get(`/patients/${id}/medical-history`)
    return response.data
  },
}

/**
 * Provider API (for providers/doctors)
 */
export const providerApi = {
  getDashboard: async (): Promise<any> => {
    const response = await apiClient.get('/provider/dashboard')
    return response.data
  },

  getStats: async (): Promise<any> => {
    const response = await apiClient.get('/provider/stats')
    return response.data
  },

  getTodayAppointments: async (): Promise<any[]> => {
    const response = await apiClient.get('/provider/appointments/today')
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
  }): Promise<any> => {
    const response = await apiClient.post('/admin/users', data)
    return response.data
  },

  getAllUsers: async (params?: {
    page?: number
    size?: number
    role?: string
    search?: string
    sortBy?: string
    sortDir?: string
  }): Promise<any> => {
    const response = await apiClient.get('/admin/users', { params })
    return response.data
  },

  getUserById: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/admin/users/${id}`)
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
  ): Promise<any> => {
    const response = await apiClient.put(`/admin/users/${id}`, data)
    return response.data
  },

  changeUserRole: async (id: string, role: string): Promise<any> => {
    const response = await apiClient.put(`/admin/users/${id}/role`, { role })
    return response.data
  },

  activateUser: async (id: string): Promise<any> => {
    const response = await apiClient.post(`/admin/users/${id}/activate`)
    return response.data
  },

  deactivateUser: async (id: string): Promise<any> => {
    const response = await apiClient.post(`/admin/users/${id}/deactivate`)
    return response.data
  },

  sendInvitation: async (id: string): Promise<any> => {
    const response = await apiClient.post(`/admin/users/${id}/send-invitation`)
    return response.data
  },

  getStats: async (): Promise<any> => {
    const response = await apiClient.get('/admin/stats')
    return response.data
  },
}

/**
 * Audit Logging (HIPAA Compliance)
 * Logs all PHI access events
 */
export const auditApi = {
  logAccess: async (data: {
    action: string
    resourceType: string
    resourceId: string
    details?: Record<string, unknown>
  }): Promise<void> => {
    try {
      await apiClient.post('/audit-log', data)
    } catch (error) {
      // Don't let audit logging failures break the app
      console.error('Failed to log audit event:', error)
    }
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
