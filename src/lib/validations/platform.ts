import { z } from 'zod'

/**
 * Platform Administration Validation Schemas (SYSTEM_ADMIN)
 * Used for hospital admin creation and assignment operations
 */

/**
 * Phone Number validation (Indian 10-digit mobile format)
 * Must start with 6, 7, 8, or 9 and be exactly 10 digits
 */
const phoneNumberRegex = /^[6-9]\d{9}$/

/**
 * Password validation
 * Min 8 chars, must contain uppercase, lowercase, number, special char (@$!%*?&)
 */
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

/**
 * Employment Type enum for staff assignments
 */
const employmentTypeEnum = z.enum([
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'CONSULTANT',
  'VOLUNTEER',
  'RESIDENT',
  'FELLOW',
])

/**
 * Hospital Admin Creation Schema
 * SYSTEM_ADMIN can only create HOSPITAL_ADMIN users
 */
export const createHospitalAdminSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email is too long')
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      passwordRegex,
      'Password must contain uppercase, lowercase, number, and special character (@$!%*?&)'
    )
    .optional()
    .or(z.literal('')),
  firstName: z.string().min(1, 'First name is required').max(100, 'First name is too long').trim(),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name is too long').trim(),
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(
      phoneNumberRegex,
      'Please enter a valid 10-digit Indian mobile number (e.g., 9876543210)'
    )
    .trim(),
  role: z.literal('HOSPITAL_ADMIN'),
  sendInvitation: z.boolean().optional().default(false),
})

export type CreateHospitalAdminFormData = z.infer<typeof createHospitalAdminSchema>

/**
 * Hospital Assignment Schema
 * Assigns a hospital admin to a specific hospital
 */
export const assignHospitalAdminSchema = z
  .object({
    userId: z.string().min(1, 'User is required'),
    hospitalId: z.string().min(1, 'Hospital is required'),
    hospitalLocationId: z.string().optional().or(z.literal('')).nullable(),
    departmentId: z.string().optional().or(z.literal('')).nullable(),
    isPrimaryHospital: z.boolean().optional().default(false),
    roleAtHospital: z
      .string()
      .max(100, 'Role at hospital is too long')
      .trim()
      .optional()
      .or(z.literal('')),
    employmentType: employmentTypeEnum.optional(),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
      .optional()
      .or(z.literal('')),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
      .optional()
      .or(z.literal(''))
      .nullable(),
    metadata: z
      .string()
      .max(2000, 'Metadata is too long')
      .trim()
      .optional()
      .or(z.literal(''))
      .nullable(),
  })
  .refine(
    (data) => {
      if (data.endDate && data.endDate !== '' && data.startDate && data.startDate !== '') {
        return new Date(data.endDate) >= new Date(data.startDate)
      }
      return true
    },
    {
      message: 'End date must be after or equal to start date',
      path: ['endDate'],
    }
  )

export type AssignHospitalAdminFormData = z.infer<typeof assignHospitalAdminSchema>

/**
 * Combined Hospital Admin Creation + Assignment Schema
 * Used when creating and assigning a hospital admin in a single operation
 */
export const createAndAssignHospitalAdminSchema = z.object({
  // User creation fields
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email is too long')
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      passwordRegex,
      'Password must contain uppercase, lowercase, number, and special character (@$!%*?&)'
    )
    .optional()
    .or(z.literal('')),
  firstName: z.string().min(1, 'First name is required').max(100, 'First name is too long').trim(),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name is too long').trim(),
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(
      phoneNumberRegex,
      'Please enter a valid 10-digit Indian mobile number (e.g., 9876543210)'
    )
    .trim(),
  sendInvitation: z.boolean().optional().default(true),

  // Assignment fields
  hospitalId: z.string().min(1, 'Hospital is required'),
  isPrimaryHospital: z.boolean().optional().default(true),
  roleAtHospital: z
    .string()
    .max(100, 'Role at hospital is too long')
    .trim()
    .optional()
    .or(z.literal(''))
    .default('Hospital Administrator'),
  employmentType: employmentTypeEnum.optional().default('FULL_TIME'),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
    .optional()
    .or(z.literal('')),
})

export type CreateAndAssignHospitalAdminFormData = z.infer<
  typeof createAndAssignHospitalAdminSchema
>
