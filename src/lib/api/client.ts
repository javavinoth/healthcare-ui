import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { clearActiveSessionId } from '@/lib/utils/sessionSync'

/**
 * HIPAA-Compliant API Client
 *
 * Backend Architecture:
 * - Spring Boot servlet context-path: /api (all endpoints prefixed with /api)
 * - Base URL configured via VITE_API_URL (includes /api suffix)
 * - Public endpoints: No authentication required (login, register, etc.)
 * - Protected endpoints: Require JWT Bearer token (automatically added by interceptor)
 *
 * Security Features:
 * - HTTPS-only in production
 * - JWT Bearer token authentication (sessionStorage)
 * - Request/response logging (PHI-filtered in production)
 * - Automatic 401 handling (logout + redirect to login)
 * - Session timeout handling
 * - Single-session enforcement across tabs
 *
 * Environment Configuration:
 * - Development: VITE_API_URL=http://localhost:8080/api
 * - Production:  VITE_API_URL=/api (relative) or https://api.domain.com/api (absolute)
 */

/**
 * Axios Client Instance
 *
 * Base URL includes /api prefix (servlet context path)
 * All endpoint paths in ENDPOINTS constants are relative to this base
 *
 * Example:
 *   baseURL = http://localhost:8080/api
 *   endpoint = '/auth/login'
 *   final URL = http://localhost:8080/api/auth/login
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 30000, // 30 seconds
  withCredentials: true, // Include HTTP-only cookies in requests
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Bypass ngrok browser warning
  },
})

/**
 * Get access token from sessionStorage
 */
export function getAccessToken(): string | null {
  return sessionStorage.getItem('accessToken')
}

/**
 * Set access token in sessionStorage
 */
export function setAccessToken(token: string): void {
  sessionStorage.setItem('accessToken', token)
}

/**
 * Get refresh token from sessionStorage
 */
export function getRefreshToken(): string | null {
  return sessionStorage.getItem('refreshToken')
}

/**
 * Set refresh token in sessionStorage
 */
export function setRefreshToken(token: string): void {
  sessionStorage.setItem('refreshToken', token)
}

/**
 * Clear all tokens and session ID
 */
export function clearTokens(): void {
  sessionStorage.removeItem('accessToken')
  sessionStorage.removeItem('refreshToken')
  clearActiveSessionId()
}

/**
 * Request Interceptor
 * Adds JWT access token to requests
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add JWT Bearer token to all requests
    const accessToken = getAccessToken()
    if (accessToken && config.headers) {
      config.headers['Authorization'] = `Bearer ${accessToken}`
    }

    // Log requests in development (never log PHI!)
    if (import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true' && import.meta.env.DEV) {
      console.log('[API Request]', {
        method: config.method?.toUpperCase(),
        url: config.url,
        // Don't log request data as it may contain PHI
      })
    }

    return config
  },
  (error: AxiosError) => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

/**
 * Response Interceptor
 * Handles authentication, errors, and response logging
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true' && import.meta.env.DEV) {
      console.log('[API Response]', {
        status: response.status,
        url: response.config.url,
        // Don't log response data as it may contain PHI
      })
    }

    return response
  },
  (error: AxiosError) => {
    // Handle specific error codes
    if (error.response) {
      const status = error.response.status

      switch (status) {
        case 401:
          // Unauthorized - Session expired or invalid
          console.warn('[API] Unauthorized - redirecting to login')
          // Clear all auth tokens
          clearTokens()
          // Redirect to login page
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login?sessionExpired=true'
          }
          break

        case 403:
          // Forbidden - User doesn't have permission
          console.warn('[API] Forbidden - insufficient permissions')
          break

        case 429:
          // Too many requests - Rate limiting
          console.warn('[API] Rate limit exceeded')
          break

        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors
          console.error('[API] Server error:', status)
          break

        default:
          console.error('[API] Error:', status)
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('[API] No response received:', error.message)
    } else {
      // Error in request configuration
      console.error('[API] Request configuration error:', error.message)
    }

    return Promise.reject(error)
  }
)

/**
 * Check if we're in a secure context
 * In production, we should only use HTTPS
 */
export function isSecureContext(): boolean {
  if (import.meta.env.PROD) {
    return window.location.protocol === 'https:'
  }
  return true // Allow HTTP in development
}

/**
 * Security warning for non-HTTPS in production
 */
if (import.meta.env.PROD && !isSecureContext()) {
  console.error('SECURITY WARNING: Application is running over HTTP in production. PHI data is at risk!')
}

export default apiClient
