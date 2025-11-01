import { format, parse, isValid } from 'date-fns'

/**
 * Date/Time Utility Functions
 * Standardized on ISO 8601 format:
 * - Dates: YYYY-MM-DD
 * - Times: HH:mm (24-hour format)
 * - DateTimes: YYYY-MM-DDTHH:mm:ssZ
 */

// ============================================================================
// FORMAT CONSTANTS
// ============================================================================

export const DATE_FORMAT = 'yyyy-MM-dd' // ISO 8601 date format
export const TIME_FORMAT = 'HH:mm' // 24-hour time format
export const DATETIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss'Z'" // ISO 8601 timestamp
export const DISPLAY_DATE_FORMAT = 'MMM dd, yyyy' // Human-readable: Jan 15, 2024
export const DISPLAY_DATETIME_FORMAT = 'MMM dd, yyyy HH:mm' // Human-readable with time
export const DISPLAY_TIME_FORMAT = 'HH:mm' // 24-hour display

// ============================================================================
// DATE FORMATTING FUNCTIONS
// ============================================================================

/**
 * Format a date to ISO 8601 date string (YYYY-MM-DD)
 * @param date - Date object or date string
 * @returns Formatted date string in YYYY-MM-DD format
 * @example formatDate(new Date()) // "2024-10-28"
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (!isValid(dateObj)) {
    throw new Error('Invalid date provided to formatDate')
  }
  return format(dateObj, DATE_FORMAT)
}

/**
 * Format a date for display (human-readable)
 * @param date - Date object or date string
 * @returns Formatted date string like "Jan 15, 2024"
 * @example formatDisplayDate(new Date()) // "Oct 28, 2024"
 */
export function formatDisplayDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (!isValid(dateObj)) {
    throw new Error('Invalid date provided to formatDisplayDate')
  }
  return format(dateObj, DISPLAY_DATE_FORMAT)
}

/**
 * Format a date with time for display
 * @param date - Date object or date string
 * @returns Formatted datetime string like "Jan 15, 2024 14:30"
 * @example formatDisplayDateTime(new Date()) // "Oct 28, 2024 14:30"
 */
export function formatDisplayDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (!isValid(dateObj)) {
    throw new Error('Invalid date provided to formatDisplayDateTime')
  }
  return format(dateObj, DISPLAY_DATETIME_FORMAT)
}

// ============================================================================
// TIME FORMATTING FUNCTIONS
// ============================================================================

/**
 * Format a time to 24-hour format (HH:mm)
 * @param time - Time string in various formats or Date object
 * @returns Formatted time string in HH:mm format
 * @example formatTime("2:30 PM") // "14:30"
 * @example formatTime("14:30") // "14:30"
 */
export function formatTime(time: string | Date): string {
  if (time instanceof Date) {
    return format(time, TIME_FORMAT)
  }

  // If already in HH:mm format, return as-is
  if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
    // Ensure leading zero for consistency
    const [hours, minutes] = time.split(':')
    return `${hours.padStart(2, '0')}:${minutes}`
  }

  // Try parsing 12-hour format (e.g., "2:30 PM")
  if (/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i.test(time)) {
    const parsed = parse(time, 'h:mm a', new Date())
    if (isValid(parsed)) {
      return format(parsed, TIME_FORMAT)
    }
  }

  throw new Error(`Invalid time format: ${time}`)
}

/**
 * Format a time for display (24-hour format)
 * @param time - Time string or Date object
 * @returns Formatted time string in HH:mm format
 * @example formatDisplayTime("14:30") // "14:30"
 */
export function formatDisplayTime(time: string | Date): string {
  return formatTime(time)
}

// ============================================================================
// DATETIME FORMATTING FUNCTIONS
// ============================================================================

/**
 * Format a datetime to ISO 8601 timestamp (YYYY-MM-DDTHH:mm:ssZ)
 * @param datetime - Date object or datetime string
 * @returns Formatted timestamp in ISO 8601 format
 * @example formatDateTime(new Date()) // "2024-10-28T14:30:00Z"
 */
export function formatDateTime(datetime: Date | string): string {
  const dateObj = typeof datetime === 'string' ? new Date(datetime) : datetime
  if (!isValid(dateObj)) {
    throw new Error('Invalid datetime provided to formatDateTime')
  }
  return format(dateObj, DATETIME_FORMAT)
}

// ============================================================================
// PARSING FUNCTIONS
// ============================================================================

/**
 * Parse a date string to Date object
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object
 * @example parseDate("2024-10-28") // Date object
 */
export function parseDate(dateString: string): Date {
  const parsed = parse(dateString, DATE_FORMAT, new Date())
  if (!isValid(parsed)) {
    throw new Error(`Invalid date string: ${dateString}`)
  }
  return parsed
}

/**
 * Parse a time string to Date object (with today's date)
 * @param timeString - Time string in HH:mm format
 * @returns Date object with today's date and the specified time
 * @example parseTime("14:30") // Date object with today's date at 14:30
 */
export function parseTime(timeString: string): Date {
  const parsed = parse(timeString, TIME_FORMAT, new Date())
  if (!isValid(parsed)) {
    throw new Error(`Invalid time string: ${timeString}`)
  }
  return parsed
}

/**
 * Parse an ISO 8601 datetime string to Date object
 * @param datetimeString - ISO 8601 timestamp string
 * @returns Date object
 * @example parseDateTime("2024-10-28T14:30:00Z") // Date object
 */
export function parseDateTime(datetimeString: string): Date {
  const parsed = new Date(datetimeString)
  if (!isValid(parsed)) {
    throw new Error(`Invalid datetime string: ${datetimeString}`)
  }
  return parsed
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate a date string in YYYY-MM-DD format
 * @param dateString - Date string to validate
 * @returns True if valid, false otherwise
 * @example isValidDateString("2024-10-28") // true
 * @example isValidDateString("10/28/2024") // false
 */
export function isValidDateString(dateString: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false
  }
  const parsed = parse(dateString, DATE_FORMAT, new Date())
  return isValid(parsed)
}

/**
 * Validate a time string in HH:mm format (24-hour)
 * @param timeString - Time string to validate
 * @returns True if valid, false otherwise
 * @example isValidTimeString("14:30") // true
 * @example isValidTimeString("2:30 PM") // false
 */
export function isValidTimeString(timeString: string): boolean {
  if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString)) {
    return false
  }
  const parsed = parse(timeString, TIME_FORMAT, new Date())
  return isValid(parsed)
}

/**
 * Validate an ISO 8601 datetime string
 * @param datetimeString - DateTime string to validate
 * @returns True if valid, false otherwise
 * @example isValidDateTimeString("2024-10-28T14:30:00Z") // true
 */
export function isValidDateTimeString(datetimeString: string): boolean {
  const parsed = new Date(datetimeString)
  return isValid(parsed)
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Get current date in YYYY-MM-DD format
 * @returns Current date string
 * @example getCurrentDate() // "2024-10-28"
 */
export function getCurrentDate(): string {
  return formatDate(new Date())
}

/**
 * Get current time in HH:mm format
 * @returns Current time string
 * @example getCurrentTime() // "14:30"
 */
export function getCurrentTime(): string {
  return formatTime(new Date())
}

/**
 * Get current datetime in ISO 8601 format
 * @returns Current datetime string
 * @example getCurrentDateTime() // "2024-10-28T14:30:00Z"
 */
export function getCurrentDateTime(): string {
  return formatDateTime(new Date())
}

/**
 * Combine date and time strings into a Date object
 * @param dateString - Date string in YYYY-MM-DD format
 * @param timeString - Time string in HH:mm format
 * @returns Date object
 * @example combineDateAndTime("2024-10-28", "14:30") // Date object
 */
export function combineDateAndTime(dateString: string, timeString: string): Date {
  const datetimeString = `${dateString}T${timeString}:00`
  const parsed = new Date(datetimeString)
  if (!isValid(parsed)) {
    throw new Error(`Invalid date/time combination: ${dateString} ${timeString}`)
  }
  return parsed
}

/**
 * Extract time from a Date object or datetime string
 * @param datetime - Date object or datetime string
 * @returns Time string in HH:mm format
 * @example extractTime(new Date()) // "14:30"
 * @example extractTime("2024-10-28T14:30:00Z") // "14:30"
 */
export function extractTime(datetime: Date | string): string {
  const dateObj = typeof datetime === 'string' ? new Date(datetime) : datetime
  if (!isValid(dateObj)) {
    throw new Error('Invalid datetime provided to extractTime')
  }
  return format(dateObj, TIME_FORMAT)
}

/**
 * Extract date from a Date object or datetime string
 * @param datetime - Date object or datetime string
 * @returns Date string in YYYY-MM-DD format
 * @example extractDate(new Date()) // "2024-10-28"
 * @example extractDate("2024-10-28T14:30:00Z") // "2024-10-28"
 */
export function extractDate(datetime: Date | string): string {
  const dateObj = typeof datetime === 'string' ? new Date(datetime) : datetime
  if (!isValid(dateObj)) {
    throw new Error('Invalid datetime provided to extractDate')
  }
  return format(dateObj, DATE_FORMAT)
}
