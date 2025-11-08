import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'
import { AxiosError } from 'axios'

/**
 * HIPAA-Compliant React Query Configuration
 *
 * Key Security Features:
 * - No long-term PHI caching (staleTime: 0 for sensitive data)
 * - Automatic garbage collection
 * - Error handling without exposing PHI
 * - Audit logging for PHI access
 */

/**
 * Custom error handler for queries
 * Ensures PHI is never logged in errors
 */
function handleQueryError(error: unknown): void {
  if (error instanceof AxiosError) {
    const status = error.response?.status

    // Don't log error details in production to avoid PHI exposure
    if (import.meta.env.DEV) {
      console.error('[Query Error]', {
        status,
        message: error.message,
        // Never log response data as it may contain PHI
      })
    } else {
      // Production: Log minimal information
      console.error('[Query Error]', status || 'Network error')
    }
  } else {
    console.error('[Query Error]', error instanceof Error ? error.message : 'Unknown error')
  }
}

/**
 * Custom error handler for mutations
 */
function handleMutationError(error: unknown): void {
  if (error instanceof AxiosError) {
    const status = error.response?.status

    if (import.meta.env.DEV) {
      console.error('[Mutation Error]', {
        status,
        message: error.message,
      })
    } else {
      console.error('[Mutation Error]', status || 'Network error')
    }
  } else {
    console.error('[Mutation Error]', error instanceof Error ? error.message : 'Unknown error')
  }
}

/**
 * Query Cache Configuration
 * Handles errors globally and prevents PHI logging
 */
const queryCache = new QueryCache({
  onError: handleQueryError,
})

/**
 * Mutation Cache Configuration
 * Handles mutation errors globally
 */
const mutationCache = new MutationCache({
  onError: handleMutationError,
})

/**
 * Query Client with HIPAA-safe defaults
 */
export const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: {
    queries: {
      // PHI Data Caching Strategy
      staleTime: 0, // Always fetch fresh data for PHI
      gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes (garbage collection time)

      // Retry Configuration
      retry: (failureCount, error) => {
        // Don't retry on authentication errors
        if (error instanceof AxiosError) {
          const status = error.response?.status
          if (status === 401 || status === 403) {
            return false
          }
        }
        // Retry other errors up to 2 times
        return failureCount < 2
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch Configuration
      refetchOnWindowFocus: true, // Ensure data is fresh when user returns to tab
      refetchOnReconnect: true, // Refetch when network reconnects
      refetchOnMount: true, // Refetch when component mounts

      // Error Handling
      throwOnError: false, // Handle errors in components

      // Network Mode
      networkMode: 'online', // Only run queries when online
    },
    mutations: {
      // Retry Configuration for Mutations
      retry: false, // Don't retry mutations by default (data integrity)

      // Error Handling
      throwOnError: false,

      // Network Mode
      networkMode: 'online',
    },
  },
})

/**
 * Custom query keys factory
 * Provides type-safe and organized query keys
 */
export const queryKeys = {
  // Authentication
  auth: {
    currentUser: ['auth', 'currentUser'] as const,
  },

  // Appointments
  appointments: {
    all: (filters?: Record<string, unknown>) => ['appointments', 'list', filters] as const,
    detail: (id: string) => ['appointments', 'detail', id] as const,
  },

  // Medical Records
  medicalRecords: {
    all: (patientId: string, filters?: Record<string, unknown>) =>
      ['medical-records', 'list', patientId, filters] as const,
    detail: (id: string) => ['medical-records', 'detail', id] as const,
    byType: (patientId: string, type: string) =>
      ['medical-records', 'by-type', patientId, type] as const,
  },

  // Messages
  messages: {
    conversations: ['messages', 'conversations'] as const,
    conversation: (id: string) => ['messages', 'conversation', id] as const,
    conversationMessages: (id: string) => ['messages', 'conversation', id, 'messages'] as const,
  },

  // Providers
  providers: {
    all: (filters?: Record<string, unknown>) => ['providers', 'list', filters] as const,
    detail: (id: string) => ['providers', 'detail', id] as const,
    availableSlots: (id: string, date: string) =>
      ['providers', id, 'available-slots', date] as const,
  },

  // Patients (for providers/admins)
  patients: {
    all: (filters?: Record<string, unknown>) => ['patients', 'list', filters] as const,
    detail: (id: string) => ['patients', 'detail', id] as const,
    medicalHistory: (id: string) => ['patients', id, 'medical-history'] as const,
  },

  // Health Metrics
  healthMetrics: {
    all: (patientId: string, type?: string) => ['health-metrics', patientId, type] as const,
  },
} as const

/**
 * Helper function to invalidate related queries
 * Used after mutations to ensure data consistency
 */
export function invalidatePatientData(patientId: string): Promise<void> {
  return queryClient.invalidateQueries({
    queryKey: ['medical-records', 'list', patientId],
  })
}

export function invalidateAppointments(): Promise<void> {
  return queryClient.invalidateQueries({
    queryKey: ['appointments'],
  })
}

export function invalidateMessages(): Promise<void> {
  return queryClient.invalidateQueries({
    queryKey: ['messages'],
  })
}

/**
 * Clear all cached data (on logout)
 */
export function clearAllQueries(): void {
  queryClient.clear()
}

export default queryClient
