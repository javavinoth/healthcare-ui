import { z } from 'zod'

/**
 * Hospital Management Validation Schemas
 * Using Zod for type-safe validation and XSS prevention
 */

/**
 * Phone Number validation (Indian 10-digit mobile format)
 * Must start with 6, 7, 8, or 9 and be exactly 10 digits
 */
const phoneNumberRegex = /^[6-9]\d{9}$/

/**
 * Hospital Type enum
 */
const hospitalTypeEnum = z.enum([
  'GENERAL',
  'SPECIALTY',
  'TEACHING',
  'RESEARCH',
  'COMMUNITY',
  'CRITICAL_ACCESS',
  'REHABILITATION',
  'PSYCHIATRIC',
])

/**
 * Hospital Status enum
 */
const hospitalStatusEnum = z.enum([
  'PENDING',
  'READY_FOR_REVIEW',
  'ACTIVE',
  'INACTIVE',
  'UNDER_CONSTRUCTION',
  'TEMPORARILY_CLOSED',
])

/**
 * Pincode validation (6-digit Indian format)
 */
const pincodeRegex = /^\d{6}$/

/**
 * Indian State Names enum (for validation)
 */
const indianStateEnum = z.enum([
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
])

/**
 * Hospital Location Schema (Nested object for Indian address format)
 */
const hospitalLocationSchema = z.object({
  address: z.string().min(1, 'Address is required').max(255, 'Address is too long').trim(),
  district: z.string().min(1, 'District is required').max(100, 'District is too long').trim(),
  pincode: z
    .string()
    .length(6, 'Pincode must be exactly 6 digits')
    .regex(pincodeRegex, 'Please enter a valid 6-digit pincode'),
  state: indianStateEnum,
  countryCode: z
    .string()
    .length(2, 'Country code must be a 2-letter code')
    .trim()
    .toUpperCase()
    .default('IN'),
  metadata: z.string().max(2000, 'Metadata is too long').trim().optional().or(z.literal('')),
})

/**
 * Hospital Creation Schema (Indian Format)
 */
export const createHospitalSchema = z.object({
  name: z.string().min(1, 'Hospital name is required').max(255, 'Hospital name is too long').trim(),
  hospitalType: hospitalTypeEnum,
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email is too long')
    .trim()
    .toLowerCase(),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(
      phoneNumberRegex,
      'Please enter a valid 10-digit Indian mobile number (e.g., 9876543210)'
    )
    .trim(),
  location: hospitalLocationSchema,
  registrationNumber: z
    .string()
    .min(1, 'Registration number is required')
    .max(100, 'Registration number is too long')
    .trim(),
  bedCapacity: z
    .number()
    .int()
    .min(1, 'Bed capacity must be at least 1')
    .max(10000, 'Bed capacity is too high'),
  emergencyServices: z.boolean(),
  status: hospitalStatusEnum.default('PENDING'),
  metadata: z.string().max(2000, 'Metadata is too long').trim().optional().or(z.literal('')),
})

export type CreateHospitalFormData = z.infer<typeof createHospitalSchema>

/**
 * Hospital Update Schema (Indian Format)
 * Same structure as create schema for consistency
 */
export const updateHospitalSchema = z.object({
  name: z.string().min(1, 'Hospital name is required').max(255, 'Hospital name is too long').trim(),
  hospitalType: hospitalTypeEnum,
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email is too long')
    .trim()
    .toLowerCase(),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(
      phoneNumberRegex,
      'Please enter a valid 10-digit Indian mobile number (e.g., 9876543210)'
    )
    .trim(),
  location: hospitalLocationSchema,
  registrationNumber: z
    .string()
    .min(1, 'Registration number is required')
    .max(100, 'Registration number is too long')
    .trim(),
  bedCapacity: z
    .number()
    .int()
    .min(1, 'Bed capacity must be at least 1')
    .max(10000, 'Bed capacity is too high'),
  emergencyServices: z.boolean(),
  status: hospitalStatusEnum,
  metadata: z.string().max(2000, 'Metadata is too long').trim().optional().or(z.literal('')),
})

export type UpdateHospitalFormData = z.infer<typeof updateHospitalSchema>

/**
 * Location Creation Schema
 */
export const createLocationSchema = z.object({
  hospitalId: z.string().min(1, 'Hospital is required'),
  name: z.string().min(1, 'Location name is required').max(200, 'Location name is too long').trim(),
  code: z
    .string()
    .min(1, 'Location code is required')
    .max(50, 'Location code is too long')
    .regex(
      /^[A-Z0-9_-]+$/,
      'Location code must contain only uppercase letters, numbers, hyphens, and underscores'
    )
    .trim(),
  address: z.string().max(255, 'Address is too long').trim().optional().or(z.literal('')),
  floor: z.string().max(50, 'Floor is too long').trim().optional().or(z.literal('')),
  buildingNumber: z
    .string()
    .max(50, 'Building number is too long')
    .trim()
    .optional()
    .or(z.literal('')),
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(
      phoneNumberRegex,
      'Please enter a valid 10-digit Indian mobile number (e.g., 9876543210)'
    )
    .trim(),
})

export type CreateLocationFormData = z.infer<typeof createLocationSchema>

/**
 * Location Update Schema
 * Cannot use .extend() due to .or() transformations
 */
export const updateLocationSchema = z.object({
  hospitalId: z.string().min(1, 'Hospital is required'),
  name: z.string().min(1, 'Location name is required').max(200, 'Location name is too long').trim(),
  code: z
    .string()
    .min(1, 'Location code is required')
    .max(50, 'Location code is too long')
    .regex(
      /^[A-Z0-9_-]+$/,
      'Location code must contain only uppercase letters, numbers, hyphens, and underscores'
    )
    .trim(),
  address: z.string().max(255, 'Address is too long').trim().optional().or(z.literal('')),
  floor: z.string().max(50, 'Floor is too long').trim().optional().or(z.literal('')),
  buildingNumber: z
    .string()
    .max(50, 'Building number is too long')
    .trim()
    .optional()
    .or(z.literal('')),
  phoneNumber: z
    .string()
    .regex(phoneNumberRegex, 'Please enter a valid phone number (E.164 format)')
    .trim()
    .optional()
    .or(z.literal('')),
  active: z.boolean(),
})

export type UpdateLocationFormData = z.infer<typeof updateLocationSchema>

/**
 * Department Creation Schema
 */
export const createDepartmentSchema = z.object({
  hospitalId: z.string().min(1, 'Hospital is required'),
  name: z
    .string()
    .min(1, 'Department name is required')
    .max(200, 'Department name is too long')
    .trim(),
  code: z
    .string()
    .min(1, 'Department code is required')
    .max(50, 'Department code is too long')
    .regex(
      /^[A-Z0-9_-]+$/,
      'Department code must contain only uppercase letters, numbers, hyphens, and underscores'
    )
    .trim(),
  description: z.string().max(500, 'Description is too long').trim().optional().or(z.literal('')),
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(
      phoneNumberRegex,
      'Please enter a valid 10-digit Indian mobile number (e.g., 9876543210)'
    )
    .trim(),
})

export type CreateDepartmentFormData = z.infer<typeof createDepartmentSchema>

/**
 * Department Update Schema
 * Cannot use .extend() due to .or() transformations
 */
export const updateDepartmentSchema = z.object({
  hospitalId: z.string().min(1, 'Hospital is required'),
  name: z
    .string()
    .min(1, 'Department name is required')
    .max(200, 'Department name is too long')
    .trim(),
  code: z
    .string()
    .min(1, 'Department code is required')
    .max(50, 'Department code is too long')
    .regex(
      /^[A-Z0-9_-]+$/,
      'Department code must contain only uppercase letters, numbers, hyphens, and underscores'
    )
    .trim(),
  description: z.string().max(500, 'Description is too long').trim().optional().or(z.literal('')),
  phoneNumber: z
    .string()
    .regex(phoneNumberRegex, 'Please enter a valid phone number (E.164 format)')
    .trim()
    .optional()
    .or(z.literal('')),
  active: z.boolean(),
})

export type UpdateDepartmentFormData = z.infer<typeof updateDepartmentSchema>

/**
 * Employment Type Enum
 */
export const employmentTypeSchema = z.enum([
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'PER_DIEM',
  'VOLUNTEER',
])

/**
 * Staff Assignment Creation Schema
 */
export const createStaffAssignmentSchema = z
  .object({
    userId: z.string().min(1, 'User is required'),
    hospitalId: z.string().min(1, 'Hospital is required'),
    locationIds: z.array(z.string()).optional().default([]),
    departmentIds: z.array(z.string()).optional().default([]),
    employmentType: employmentTypeSchema,
    isPrimary: z.boolean().default(false),
    startDate: z
      .string()
      .min(1, 'Start date is required')
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
      .optional()
      .or(z.literal('')),
  })
  .refine(
    (data) => {
      if (data.endDate && data.endDate !== '') {
        return new Date(data.endDate) >= new Date(data.startDate)
      }
      return true
    },
    {
      message: 'End date must be after or equal to start date',
      path: ['endDate'],
    }
  )

export type CreateStaffAssignmentFormData = z.infer<typeof createStaffAssignmentSchema>

/**
 * Staff Assignment Update Schema
 * Cannot use .extend() due to .refine() and .default() transformations
 */
export const updateStaffAssignmentSchema = z
  .object({
    userId: z.string().min(1, 'User is required'),
    hospitalId: z.string().min(1, 'Hospital is required'),
    locationIds: z.array(z.string()).optional().default([]),
    departmentIds: z.array(z.string()).optional().default([]),
    employmentType: employmentTypeSchema,
    isPrimary: z.boolean().default(false),
    startDate: z
      .string()
      .min(1, 'Start date is required')
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
      .optional()
      .or(z.literal('')),
    active: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.endDate && data.endDate !== '') {
        return new Date(data.endDate) >= new Date(data.startDate)
      }
      return true
    },
    {
      message: 'End date must be after or equal to start date',
      path: ['endDate'],
    }
  )

export type UpdateStaffAssignmentFormData = z.infer<typeof updateStaffAssignmentSchema>

/**
 * Filter validation schemas (optional - for query params)
 */
export const hospitalFiltersSchema = z.object({
  search: z.string().optional(),
  active: z.boolean().optional(),
  page: z.number().int().min(0).optional().default(0),
  size: z.number().int().min(1).max(100).optional().default(25),
})

export type HospitalFilters = z.infer<typeof hospitalFiltersSchema>

export const locationFiltersSchema = z.object({
  hospitalId: z.string().optional(),
  search: z.string().optional(),
  active: z.boolean().optional(),
  page: z.number().int().min(0).optional().default(0),
  size: z.number().int().min(1).max(100).optional().default(25),
})

export type LocationFilters = z.infer<typeof locationFiltersSchema>

export const departmentFiltersSchema = z.object({
  hospitalId: z.string().optional(),
  search: z.string().optional(),
  active: z.boolean().optional(),
  page: z.number().int().min(0).optional().default(0),
  size: z.number().int().min(1).max(100).optional().default(25),
})

export type DepartmentFilters = z.infer<typeof departmentFiltersSchema>

export const staffAssignmentFiltersSchema = z.object({
  hospitalId: z.string().optional(),
  userId: z.string().optional(),
  departmentId: z.string().optional(),
  role: z.string().optional(),
  employmentType: employmentTypeSchema.optional(),
  active: z.boolean().optional(),
  page: z.number().int().min(0).optional().default(0),
  size: z.number().int().min(1).max(100).optional().default(25),
})

export type StaffAssignmentFilters = z.infer<typeof staffAssignmentFiltersSchema>

/**
 * ============================================
 * Hospital Approval Workflow Validation Schemas
 * ============================================
 */

/**
 * Indian State Names (Full names, not codes)
 * Using the array format for createHospitalWithAdminSchema refine validation
 */
const indianStateNames = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
] as const

/**
 * Create Hospital with Admin Schema (SYSTEM_ADMIN only)
 * Simplified hospital creation with minimal required fields + hospital admin user details
 */
export const createHospitalWithAdminSchema = z.object({
  // Hospital details
  hospitalName: z
    .string()
    .min(1, 'Hospital name is required')
    .max(255, 'Hospital name is too long')
    .trim(),
  district: z.string().min(1, 'District is required').max(30, 'District is too long').trim(),
  pincode: z
    .string()
    .length(6, 'Pincode must be exactly 6 digits')
    .regex(pincodeRegex, 'Please enter a valid 6-digit pincode'),
  state: z
    .string()
    .min(1, 'State is required')
    .max(30, 'State is too long')
    .trim()
    .refine((val) => indianStateNames.includes(val as (typeof indianStateNames)[number]), {
      message: 'Please select a valid Indian state',
    }),

  // Hospital admin details
  adminFirstName: z
    .string()
    .min(1, 'Admin first name is required')
    .max(100, 'Admin first name is too long')
    .trim(),
  adminLastName: z
    .string()
    .min(1, 'Admin last name is required')
    .max(100, 'Admin last name is too long')
    .trim(),
  adminEmail: z
    .string()
    .email('Please enter a valid email address')
    .max(255, 'Email is too long')
    .trim()
    .toLowerCase(),
  adminPhone: z
    .string()
    .length(10, 'Phone number must be exactly 10 digits')
    .regex(
      phoneNumberRegex,
      'Please enter a valid 10-digit Indian mobile number (e.g., 9876543210)'
    ),

  // Optional: Send invitation email
  sendInvitation: z.boolean().optional().default(true),
})

export type CreateHospitalWithAdminFormData = z.infer<typeof createHospitalWithAdminSchema>

/**
 * Mark Hospital Ready for Review Schema (HOSPITAL_ADMIN only)
 * Optional notes field for submission
 */
export const markReadyForReviewSchema = z.object({
  notes: z
    .string()
    .max(1000, 'Notes are too long (max 1000 characters)')
    .trim()
    .optional()
    .or(z.literal('')),
})

export type MarkReadyForReviewFormData = z.infer<typeof markReadyForReviewSchema>

/**
 * Approve/Reject Hospital Schema (SYSTEM_ADMIN only)
 * Requires rejection reason if rejecting
 */
export const approveRejectHospitalSchema = z
  .object({
    approved: z.boolean(),
    rejectionReason: z
      .string()
      .max(1000, 'Rejection reason is too long (max 1000 characters)')
      .trim()
      .optional()
      .or(z.literal('')),
  })
  .refine(
    (data) => {
      // If rejecting (approved = false), rejection reason is required
      if (data.approved === false) {
        return data.rejectionReason && data.rejectionReason.trim().length > 0
      }
      return true
    },
    {
      message: 'Rejection reason is required when rejecting a hospital',
      path: ['rejectionReason'],
    }
  )

export type ApproveRejectHospitalFormData = z.infer<typeof approveRejectHospitalSchema>
