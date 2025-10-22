import { z } from 'zod'

/**
 * Appointment Form Validation Schemas
 * Using Zod for type-safe validation
 */

/**
 * Provider Search Schema
 */
export const providerSearchSchema = z.object({
  specialty: z.string().optional(),
  location: z.string().optional(),
  acceptingNewPatients: z.boolean().optional(),
  search: z.string().optional(),
})

export type ProviderSearchFormData = z.infer<typeof providerSearchSchema>

/**
 * Appointment Booking Schema
 */
export const appointmentBookingSchema = z.object({
  providerId: z.string().min(1, 'Please select a provider'),
  date: z.string().min(1, 'Please select a date'),
  time: z.string().min(1, 'Please select a time slot'),
  type: z.enum([
    'ROUTINE_CHECKUP',
    'FOLLOW_UP',
    'CONSULTATION',
    'URGENT_CARE',
    'PROCEDURE',
    'LAB_WORK',
    'VACCINATION',
    'TELEHEALTH',
  ]).refine((val) => val !== undefined, {
    message: 'Please select an appointment type',
  }),
  reason: z
    .string()
    .min(10, 'Please provide a reason (at least 10 characters)')
    .max(500, 'Reason is too long (maximum 500 characters)')
    .trim(),
  isVirtual: z.boolean().optional(),
  notes: z.string().max(1000, 'Notes are too long (maximum 1000 characters)').optional(),
})

export type AppointmentBookingFormData = z.infer<typeof appointmentBookingSchema>

/**
 * Appointment Reschedule Schema
 */
export const appointmentRescheduleSchema = z.object({
  newDate: z.string().min(1, 'Please select a new date'),
  newTime: z.string().min(1, 'Please select a new time slot'),
  reason: z
    .string()
    .min(5, 'Please provide a reason for rescheduling (at least 5 characters)')
    .max(500, 'Reason is too long (maximum 500 characters)')
    .trim()
    .optional(),
})

export type AppointmentRescheduleFormData = z.infer<typeof appointmentRescheduleSchema>

/**
 * Appointment Cancellation Schema
 */
export const appointmentCancellationSchema = z.object({
  reason: z
    .string()
    .min(10, 'Please provide a reason for cancellation (at least 10 characters)')
    .max(500, 'Reason is too long (maximum 500 characters)')
    .trim(),
})

export type AppointmentCancellationFormData = z.infer<typeof appointmentCancellationSchema>

/**
 * Appointment Filter Schema
 */
export const appointmentFilterSchema = z.object({
  status: z.enum([
    'all',
    'scheduled',
    'confirmed',
    'checked_in',
    'in_progress',
    'completed',
    'cancelled',
    'no_show',
  ]).optional().default('all'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  providerId: z.string().optional(),
  type: z.string().optional(),
})

export type AppointmentFilterFormData = z.infer<typeof appointmentFilterSchema>
