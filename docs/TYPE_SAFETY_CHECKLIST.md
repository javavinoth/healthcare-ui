# Type Safety Improvement Checklist

**Goal:** Eliminate all explicit `any` types and re-enable `@typescript-eslint/no-explicit-any`

**Status:** 0 / 60 instances fixed

---

## Phase 1: Type Infrastructure

### Task 1.1: Create Error Type Definitions

- [ ] Create `src/types/errors.ts`

```typescript
import type { AxiosError } from 'axios'

/**
 * Standard API error response structure from backend
 */
export interface ApiErrorResponse {
  message: string
  errors?: Record<string, string[]>
  timestamp?: string
  status?: number
  path?: string
}

/**
 * Typed Axios error with backend error response
 */
export type ApiError = AxiosError<ApiErrorResponse>

/**
 * Helper to extract error message from API error
 */
export function getErrorMessage(error: unknown, defaultMessage = 'An error occurred'): string {
  if (error instanceof Error) {
    return (error as ApiError).response?.data?.message || error.message || defaultMessage
  }
  return defaultMessage
}
```

- [ ] Update `src/types/index.ts` to export error types

```typescript
// Add to existing exports
export type { ApiError, ApiErrorResponse } from './errors'
export { getErrorMessage } from './errors'
```

### Task 1.2: Create Backend DTO Interfaces

- [ ] Create `src/types/dtos.ts`

```typescript
/**
 * Backend Data Transfer Objects (DTOs)
 * These match the structure returned by the Spring Boot backend
 */

// User DTO from backend
export interface UserDTO {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  role: string
  enabled: boolean
  twoFactorEnabled?: boolean
  createdAt?: string
  updatedAt?: string
}

// Appointment DTO from backend
export interface AppointmentDTO {
  id: string
  patientId: string
  providerId: string
  patientName?: string
  providerName?: string
  provider?: {
    id: string
    firstName: string
    lastName: string
  }
  appointmentType: string
  status: string // UPPERCASE: SCHEDULED, COMPLETED, etc.
  scheduledTime: string
  duration: number
  reason?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
}

// Medical Record DTO from backend
export interface MedicalRecordDTO {
  id: string
  patientId: string
  providerId: string
  recordType: string // UPPERCASE: LAB_RESULT, etc.
  recordDate: string
  title: string
  description?: string
  attachments?: Array<{
    id: string
    fileName: string
    fileUrl: string
    fileType: string
    uploadedAt: string
  }>
  createdAt?: string
  updatedAt?: string
}

// Spring Boot Page wrapper
export interface SpringPage<T> {
  content: T[]
  pageable: {
    pageNumber: number
    pageSize: number
    sort: {
      sorted: boolean
      unsorted: boolean
      empty: boolean
    }
    offset: number
    paged: boolean
    unpaged: boolean
  }
  totalPages: number
  totalElements: number
  last: boolean
  first: boolean
  size: number
  number: number
  numberOfElements: number
  empty: boolean
  sort: {
    sorted: boolean
    unsorted: boolean
    empty: boolean
  }
}

// Time slot for appointments
export interface TimeSlot {
  time: string
  available: boolean
}

// Calendar event
export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  type: 'appointment' | 'time_off' | 'blocked'
  status?: string
  patientName?: string
}

// Time block
export interface TimeBlock {
  id: string
  startTime: string
  endTime: string
  reason: string
  type: 'blocked' | 'time_off'
}

// Conversation
export interface ConversationDTO {
  id: string
  participants: UserDTO[]
  lastMessage?: {
    id: string
    content: string
    senderId: string
    timestamp: string
  }
  unreadCount?: number
}
```

- [ ] Update `src/types/index.ts` to export DTO types

```typescript
// Add to existing exports
export type {
  UserDTO,
  AppointmentDTO,
  MedicalRecordDTO,
  SpringPage,
  TimeSlot,
  CalendarEvent,
  TimeBlock,
  ConversationDTO,
} from './dtos'
```

---

## Phase 2: Fix Error Handlers in Mutations (~30 instances)

**Pattern to fix:**
```typescript
// Before
onError: (error: any) => {
  toast({ title: error.response?.data?.message || 'Error' })
}

// After
onError: (error: ApiError) => {
  toast({ title: error.response?.data?.message || 'Error occurred' })
}
```

### Authentication Pages

- [ ] `src/pages/Verify2FA.tsx:63`
  - Replace `error: any` with `error: ApiError`

- [ ] `src/pages/ForgotPassword.tsx:45`
  - Replace `error: any` with `error: ApiError`

- [ ] `src/pages/ResetPassword.tsx:61`
  - Replace `error: any` with `error: ApiError`

- [ ] `src/pages/Register.tsx:84`
  - Replace `error: any` with `error: ApiError`

- [ ] `src/pages/Register.tsx:105`
  - Replace `error: any` with `error: ApiError`

- [ ] `src/pages/Login.tsx:63`
  - Replace `error: any` with `error: ApiError`

### Profile Page

- [ ] `src/pages/Profile.tsx:88` - Profile update error
- [ ] `src/pages/Profile.tsx:109` - Password change error
- [ ] `src/pages/Profile.tsx:129` - 2FA enable error
- [ ] `src/pages/Profile.tsx:145` - 2FA disable error
- [ ] `src/pages/Profile.tsx:159` - Verify 2FA error

### Admin Components

- [ ] `src/components/admin/ChangeRoleDialog.tsx:63`
- [ ] `src/components/admin/CreateUserModal.tsx:58`
- [ ] `src/components/admin/EditUserModal.tsx:68`

### Patient Pages

- [ ] `src/pages/patient/BookAppointment.tsx:82`
- [ ] `src/pages/patient/AppointmentDetail.tsx:109`
- [ ] `src/pages/patient/AppointmentDetail.tsx:135`

### Provider Components

- [ ] `src/components/provider/BlockTimeDialog.tsx:60`
- [ ] `src/components/provider/CheckInDialog.tsx:53`
- [ ] `src/components/provider/CompleteAppointmentDialog.tsx:63`
- [ ] `src/components/provider/EditPatientDialog.tsx:114`
- [ ] `src/components/provider/MarkNoShowDialog.tsx:56`
- [ ] `src/components/provider/PrescriptionForm.tsx:139`
- [ ] `src/components/provider/WeeklyScheduleEditor.tsx:97`
- [ ] `src/components/provider/ProviderSettingsForm.tsx:76`
- [ ] `src/components/provider/TimeOffRequestDialog.tsx:95`
- [ ] `src/components/provider/VisitNoteForm.tsx:104`
- [ ] `src/components/provider/TimeOffList.tsx:72`

### Messaging Components

- [ ] `src/components/shared/messaging/SendMessageForm.tsx:104`
- [ ] `src/components/shared/messaging/NewMessageDialog.tsx:88`

---

## Phase 3: Fix API Function Return Types (6 functions)

**File:** `src/lib/api/index.ts`

### Task 3.1: Add proper return types

- [ ] **Line 499** - `getMessageableUsers`
  ```typescript
  // Before
  getMessageableUsers: async (params?: { role?: string; search?: string }): Promise<any[]> => {

  // After
  getMessageableUsers: async (params?: { role?: string; search?: string }): Promise<User[]> => {
  ```

- [ ] **Line 520** - `getConversations`
  ```typescript
  // Before
  }): Promise<any[]> => {

  // After
  }): Promise<ConversationDTO[]> => {
  ```

- [ ] **Line 566** - `getTodayAppointments`
  ```typescript
  // Before
  getTodayAppointments: async (): Promise<any[]> => {

  // After
  getTodayAppointments: async (): Promise<Appointment[]> => {
  ```

- [ ] **Line 603** - `getAvailableSlots`
  ```typescript
  // Before
  }): Promise<any[]> => {

  // After
  }): Promise<TimeSlot[]> => {
  ```

- [ ] **Line 610** - `getCalendar`
  ```typescript
  // Before
  getCalendar: async (params: { startDate: string; endDate: string }): Promise<any[]> => {

  // After
  getCalendar: async (params: { startDate: string; endDate: string }): Promise<CalendarEvent[]> => {
  ```

- [ ] **Line 666** - `getTimeBlocks`
  ```typescript
  // Before
  getTimeBlocks: async (params: { startDate: string; endDate: string }): Promise<any[]> => {

  // After
  getTimeBlocks: async (params: { startDate: string; endDate: string }): Promise<TimeBlock[]> => {
  ```

---

## Phase 4: Fix Mapper Functions (3 functions)

**File:** `src/lib/api/index.ts`

- [ ] **Line 216** - `mapAppointmentResponse`
  ```typescript
  // Before
  function mapAppointmentResponse(backendAppointment: any): any {

  // After
  function mapAppointmentResponse(backendAppointment: AppointmentDTO): Appointment {
  ```

- [ ] **Line 293** - `mapMedicalRecordResponse`
  ```typescript
  // Before
  function mapMedicalRecordResponse(backendRecord: any): any {

  // After
  function mapMedicalRecordResponse(backendRecord: MedicalRecordDTO): MedicalRecord {
  ```

- [ ] **Line 393** - `mapSpringPageToResponse`
  ```typescript
  // Before
  function mapSpringPageToResponse<T>(springPage: any): PaginatedResponse<T> {

  // After
  function mapSpringPageToResponse<T>(springPage: SpringPage<T>): PaginatedResponse<T> {
  ```

- [ ] **Line 346** - Fix attachment mapping type
  ```typescript
  // Before
  backendRecord.attachments?.map((att: any) => ({

  // After
  backendRecord.attachments?.map((att) => ({
  // TypeScript will infer the type from MedicalRecordDTO.attachments
  ```

---

## Phase 5: Fix Array Mapping in Components (~8 instances)

**Pattern:** Remove explicit `any` type annotations - let TypeScript infer from context

### Admin Pages

- [ ] `src/pages/admin/UserManagement.tsx:319`
  ```typescript
  // Before
  {users.map((user: any) => (

  // After
  {users.map((user) => (
  // Or explicitly: (user: User)
  ```

- [ ] `src/pages/admin/Dashboard.tsx:205`
  ```typescript
  // Before
  {recentUsers.map((user: any) => (

  // After
  {recentUsers.map((user) => (
  ```

### Provider Pages

- [ ] `src/pages/provider/AppointmentDetail.tsx:50`
  ```typescript
  // Before
  const appointment = appointments.find((apt: any) => apt.id === id)

  // After
  const appointment = appointments.find((apt) => apt.id === id)
  ```

- [ ] `src/pages/provider/Dashboard.tsx:60`
  ```typescript
  // Before
  const isScheduleConfigured = settings?.availability?.some((day: any) => day.isActive) || false

  // After
  const isScheduleConfigured = settings?.availability?.some((day) => day.isActive) || false
  ```

- [ ] `src/pages/provider/Dashboard.tsx:310`
  ```typescript
  // Before
  {todayAppointments.map((appointment: any) => (

  // After
  {todayAppointments.map((appointment) => (
  ```

- [ ] `src/pages/provider/Schedule.tsx:22`
  ```typescript
  // Before
  const isScheduleConfigured = settings?.availability?.some((day: any) => day.isActive) || false

  // After
  const isScheduleConfigured = settings?.availability?.some((day) => day.isActive) || false
  ```

- [ ] `src/pages/provider/Schedule.tsx:23`
  ```typescript
  // Before
  const activeDaysCount = settings?.availability?.filter((day: any) => day.isActive).length || 0

  // After
  const activeDaysCount = settings?.availability?.filter((day) => day.isActive).length || 0
  ```

### Messaging Components

- [ ] `src/components/shared/messaging/NewMessageDialog.tsx:50`
  ```typescript
  // Before
  const otherUsers = allUsers.filter((u: any) => u.id !== user.id)

  // After
  const otherUsers = allUsers.filter((u) => u.id !== user.id)
  ```

- [ ] `src/components/shared/messaging/NewMessageDialog.tsx:159`
  ```typescript
  // Before
  {messagableUsers?.map((recipient: any) => (

  // After
  {messagableUsers?.map((recipient) => (
  ```

### Provider Components

- [ ] `src/components/provider/WeeklyScheduleEditor.tsx:68`
  ```typescript
  // Before
  settings.availability.map((item: any) => [item.dayOfWeek, item])

  // After
  settings.availability.map((item) => [item.dayOfWeek, item])
  ```

- [ ] `src/components/provider/WeeklyScheduleEditor.tsx:350`
  ```typescript
  // Before
  settings.availability.map((item: any) => [item.dayOfWeek, item])

  // After
  settings.availability.map((item) => [item.dayOfWeek, item])
  ```

---

## Phase 6: Fix Data Transformations (2 instances)

### Admin Create User Modal

- [ ] `src/components/admin/CreateUserModal.tsx:46`
  ```typescript
  // Before
  mutationFn: (data: any) => adminApi.createUser(data),

  // After
  mutationFn: (data: CreateUserFormData) => adminApi.createUser(data),
  ```

- [ ] `src/components/admin/CreateUserModal.tsx:109`
  ```typescript
  // Before
  const submitData: any = {

  // After - Option 1: Use type from API
  const submitData = {

  // After - Option 2: Create explicit interface
  interface CreateUserSubmitData {
    username: string
    email: string
    password: string
    firstName: string
    lastName: string
    role: string
  }
  const submitData: CreateUserSubmitData = {
  ```

### Admin Edit User Modal

- [ ] `src/components/admin/EditUserModal.tsx:57`
  ```typescript
  // Before
  mutationFn: (data: any) => adminApi.updateUser(userId!, data),

  // After
  mutationFn: (data: EditUserFormData) => adminApi.updateUser(userId!, data),
  ```

- [ ] `src/components/admin/EditUserModal.tsx:99`
  ```typescript
  // Before
  const submitData: any = {

  // After - Let TypeScript infer or use explicit interface
  const submitData = {
  ```

---

## Phase 7: Fix Generic Utility Functions (1 instance)

- [ ] `src/components/provider/WeeklyScheduleEditor.tsx:111`
  ```typescript
  // Before
  const updateDay = (index: number, field: keyof DayFormData, value: any) => {
    const newDays = [...days]
    newDays[index][field] = value
    setDays(newDays)
  }

  // After - Generic constrained type
  const updateDay = <K extends keyof DayFormData>(
    index: number,
    field: K,
    value: DayFormData[K]
  ) => {
    const newDays = [...days]
    newDays[index][field] = value
    setDays(newDays)
  }
  ```

---

## Phase 8: Fix Catch Block Error Handler (1 instance)

- [ ] `src/components/shared/messaging/MessageThread.tsx:119`
  ```typescript
  // Before
  } catch (error: any) {

  // After
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Download failed'
  ```

- [ ] `src/components/shared/messaging/MessageThread.tsx:96`
  ```typescript
  // Before - May need type for attachment
  const handleDownloadAttachment = async (attachment: any) => {

  // After - Create proper type or extract from Message type
  interface MessageAttachment {
    id: string
    fileName: string
    fileUrl: string
  }
  const handleDownloadAttachment = async (attachment: MessageAttachment) => {
  ```

---

## Phase 9: Re-enable ESLint Rule

- [ ] Update `eslint.config.js`
  ```javascript
  // Line 23-24
  // Before
  '@typescript-eslint/no-explicit-any': 'off',

  // After
  '@typescript-eslint/no-explicit-any': 'error',
  ```

---

## Phase 10: Verification & Testing

- [ ] Run type check: `npm run type-check`
  - Should complete with **0 errors**

- [ ] Run linter: `npm run lint`
  - Should complete with **0 errors**
  - Should complete with **0 warnings** (or acceptable warnings only)

- [ ] Run build: `npm run build`
  - Should complete successfully

- [ ] Test in dev mode: `npm run dev`
  - Verify application still functions correctly
  - Test key user flows:
    - [ ] Login/logout
    - [ ] Book appointment
    - [ ] View medical records
    - [ ] Send message
    - [ ] Provider schedule management

- [ ] Check for regression
  - [ ] No new console errors
  - [ ] All API calls still work
  - [ ] Form submissions still work
  - [ ] Error handling displays properly

---

## Completion Criteria

- [ ] All 60 `any` type instances have been replaced
- [ ] `@typescript-eslint/no-explicit-any` rule is enabled
- [ ] All verification tests pass
- [ ] No regression in functionality
- [ ] Code review completed
- [ ] Changes committed with meaningful commit message

---

## Rollback Plan

If issues are encountered:

1. Revert ESLint config change first:
   ```javascript
   '@typescript-eslint/no-explicit-any': 'warn', // Gradual enforcement
   ```

2. Keep type improvements even if rule isn't fully enforced yet

3. Fix remaining issues incrementally

4. Re-enable as 'error' when all instances are resolved

---

## Notes

- **Priority files** (high PHI risk):
  - `src/lib/api/index.ts` - All API interactions
  - Medical record components
  - Patient data components

- **Low risk files**:
  - UI-only components
  - Utility functions

- **Testing focus**:
  - Error handling in forms
  - API response parsing
  - Data transformations

---

## Estimated Time: 4-5 hours

**Breakdown:**
- Phase 1: 1-2 hours (type infrastructure)
- Phase 2: 1 hour (error handlers)
- Phase 3-7: 2 hours (API, mappers, misc)
- Phase 8-10: 30 min (verification)

---

**Last Updated:** 2025-11-08
