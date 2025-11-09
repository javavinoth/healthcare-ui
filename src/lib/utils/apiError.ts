/**
 * API Error Utility Functions
 *
 * Helpers for extracting and handling error messages from the new backend ErrorResponse format
 */

import type { ErrorResponse } from '@/types'
import { AxiosError } from 'axios'

/**
 * Type guard to check if an error is an ErrorResponse
 */
export function isErrorResponse(error: unknown): error is { response: { data: ErrorResponse } } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: unknown }).response === 'object' &&
    (error as { response?: { data?: unknown } }).response !== null &&
    'data' in (error as { response: { data?: unknown } }).response &&
    typeof (error as { response: { data?: { success?: unknown } } }).response.data === 'object' &&
    (error as { response: { data: { success?: unknown } } }).response.data !== null &&
    'success' in (error as { response: { data: { success?: unknown } } }).response.data &&
    (error as { response: { data: { success: unknown } } }).response.data.success === false
  )
}

/**
 * Type guard to check if the error has validation errors
 */
export function isValidationError(
  error: unknown
): error is { response: { data: ErrorResponse & { validationErrors: Record<string, string> } } } {
  return (
    isErrorResponse(error) &&
    'validationErrors' in error.response.data &&
    typeof error.response.data.validationErrors === 'object' &&
    error.response.data.validationErrors !== null
  )
}

/**
 * Extract error message from various error types
 *
 * Handles:
 * - New ErrorResponse format
 * - Generic Axios errors
 * - Network errors
 * - Unknown errors
 *
 * @param error - The error object (can be any type)
 * @param fallbackMessage - Default message if extraction fails
 * @returns User-friendly error message
 */
export function extractErrorMessage(
  error: unknown,
  fallbackMessage = 'An unexpected error occurred'
): string {
  // Handle ErrorResponse format
  if (isErrorResponse(error)) {
    return error.response.data.message || fallbackMessage
  }

  // Handle Axios errors
  if (error instanceof AxiosError) {
    // Try to extract message from response
    if (error.response?.data) {
      const data = error.response.data as { message?: string }
      if (data.message) {
        return data.message
      }
    }

    // Use Axios error message
    if (error.message) {
      return error.message
    }
  }

  // Handle generic Error objects
  if (error instanceof Error) {
    return error.message
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error
  }

  // Fallback
  return fallbackMessage
}

/**
 * Extract validation errors from ErrorResponse
 *
 * @param error - The error object
 * @returns Object with field-specific validation errors, or empty object
 */
export function getValidationErrors(error: unknown): Record<string, string> {
  if (isValidationError(error)) {
    return error.response.data.validationErrors
  }
  return {}
}

/**
 * Extract error code from ErrorResponse
 *
 * @param error - The error object
 * @returns Error code or undefined
 */
export function getErrorCode(error: unknown): string | undefined {
  if (isErrorResponse(error)) {
    return error.response.data.errorCode
  }
  return undefined
}

/**
 * Extract request ID from ErrorResponse (useful for debugging/support)
 *
 * @param error - The error object
 * @returns Request ID or undefined
 */
export function getRequestId(error: unknown): string | undefined {
  if (isErrorResponse(error)) {
    return error.response.data.meta?.requestId
  }
  return undefined
}

/**
 * Format validation errors into a readable string
 *
 * @param error - The error object
 * @returns Formatted validation error message
 */
export function formatValidationErrors(error: unknown): string {
  const validationErrors = getValidationErrors(error)
  const errors = Object.entries(validationErrors)

  if (errors.length === 0) {
    return ''
  }

  if (errors.length === 1) {
    return errors[0][1]
  }

  return errors.map(([field, message]) => `${field}: ${message}`).join('; ')
}

/**
 * Get HTTP status code from error
 *
 * @param error - The error object
 * @returns HTTP status code or undefined
 */
export function getErrorStatus(error: unknown): number | undefined {
  if (isErrorResponse(error)) {
    return error.response.data.status
  }

  if (error instanceof AxiosError) {
    return error.response?.status
  }

  return undefined
}

/**
 * Check if error is a specific HTTP status
 *
 * @param error - The error object
 * @param status - HTTP status code to check
 * @returns True if error matches the status
 */
export function isErrorStatus(error: unknown, status: number): boolean {
  return getErrorStatus(error) === status
}

/**
 * Common status checks
 */
export const isUnauthorized = (error: unknown) => isErrorStatus(error, 401)
export const isForbidden = (error: unknown) => isErrorStatus(error, 403)
export const isNotFound = (error: unknown) => isErrorStatus(error, 404)
export const isConflict = (error: unknown) => isErrorStatus(error, 409)
export const isUnprocessableEntity = (error: unknown) => isErrorStatus(error, 422)
export const isServerError = (error: unknown) => {
  const status = getErrorStatus(error)
  return status !== undefined && status >= 500
}
