# Type Safety Examples - Quick Reference

This document provides before/after examples for common `any` type replacements.

---

## 1. Error Handlers in Mutations

### Before:
```typescript
import { useMutation } from '@tanstack/react-query'
import { toast } from '@/components/ui/use-toast'
import { authApi } from '@/lib/api'

const mutation = useMutation({
  mutationFn: authApi.login,
  onSuccess: () => {
    navigate('/dashboard')
  },
  onError: (error: any) => {
    toast({
      variant: 'destructive',
      title: 'Login failed',
      description: error.response?.data?.message || 'Invalid credentials',
    })
  },
})
```

### After:
```typescript
import { useMutation } from '@tanstack/react-query'
import { toast } from '@/components/ui/use-toast'
import { authApi } from '@/lib/api'
import type { ApiError } from '@/types'

const mutation = useMutation({
  mutationFn: authApi.login,
  onSuccess: () => {
    navigate('/dashboard')
  },
  onError: (error: ApiError) => {
    toast({
      variant: 'destructive',
      title: 'Login failed',
      description: error.response?.data?.message || 'Invalid credentials',
    })
  },
})
```

---

## 2. Catch Block Error Handling

### Before:
```typescript
try {
  const response = await fetch(url)
  const blob = await response.blob()
  // ... download logic
} catch (error: any) {
  toast({
    variant: 'destructive',
    title: error.message || 'Download failed',
  })
}
```

### After:
```typescript
import { getErrorMessage } from '@/types'

try {
  const response = await fetch(url)
  const blob = await response.blob()
  // ... download logic
} catch (error) {
  toast({
    variant: 'destructive',
    title: getErrorMessage(error, 'Download failed'),
  })
}
```

**Or explicitly:**
```typescript
try {
  const response = await fetch(url)
  const blob = await response.blob()
  // ... download logic
} catch (error) {
  const message = error instanceof Error ? error.message : 'Download failed'
  toast({
    variant: 'destructive',
    title: message,
  })
}
```

---

## 3. Array Mapping

### Before:
```typescript
<div>
  {users.map((user: any) => (
    <UserCard
      key={user.id}
      name={user.firstName + ' ' + user.lastName}
      email={user.email}
    />
  ))}
</div>
```

### After (Inferred):
```typescript
<div>
  {users.map((user) => (
    <UserCard
      key={user.id}
      name={user.firstName + ' ' + user.lastName}
      email={user.email}
    />
  ))}
</div>
```

### After (Explicit):
```typescript
import type { User } from '@/types'

<div>
  {users.map((user: User) => (
    <UserCard
      key={user.id}
      name={user.firstName + ' ' + user.lastName}
      email={user.email}
    />
  ))}
</div>
```

**Best practice:** Use inferred types when the array type is already known from context.

---

## 4. API Mapper Functions

### Before:
```typescript
function mapAppointmentResponse(backendAppointment: any): any {
  return {
    id: backendAppointment.id,
    patientId: backendAppointment.patientId,
    providerId: backendAppointment.providerId,
    status: backendAppointment.status.toLowerCase(),
    scheduledTime: backendAppointment.scheduledTime,
    // ... more fields
  }
}
```

### After:
```typescript
import type { AppointmentDTO, Appointment } from '@/types'

function mapAppointmentResponse(backendAppointment: AppointmentDTO): Appointment {
  return {
    id: backendAppointment.id,
    patientId: backendAppointment.patientId,
    providerId: backendAppointment.providerId,
    status: backendAppointment.status.toLowerCase() as Appointment['status'],
    scheduledTime: backendAppointment.scheduledTime,
    // ... more fields
  }
}
```

**Benefits:**
- TypeScript will error if backend structure changes
- Autocomplete works for both input and output
- Refactoring is safer

---

## 5. API Function Return Types

### Before:
```typescript
export const appointmentApi = {
  getTodayAppointments: async (): Promise<any[]> => {
    const response = await apiClient.get('/appointments/today')
    return response.data.map(mapAppointmentResponse)
  },
}
```

### After:
```typescript
import type { Appointment } from '@/types'

export const appointmentApi = {
  getTodayAppointments: async (): Promise<Appointment[]> => {
    const response = await apiClient.get('/appointments/today')
    return response.data.map(mapAppointmentResponse)
  },
}
```

**Benefits:**
- Callers know exactly what type they'll receive
- TypeScript checks the mapper function returns correct type
- IntelliSense shows available properties

---

## 6. Form Data Transformations

### Before:
```typescript
const onSubmit = (data: CreateUserFormData) => {
  const submitData: any = {
    username: data.username,
    email: data.email,
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
    role: data.role,
  }

  mutation.mutate(submitData)
}
```

### After (Inferred):
```typescript
const onSubmit = (data: CreateUserFormData) => {
  const submitData = {
    username: data.username,
    email: data.email,
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
    role: data.role,
  }

  mutation.mutate(submitData)
}
```

### After (Explicit Interface):
```typescript
interface CreateUserRequest {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  role: string
}

const onSubmit = (data: CreateUserFormData) => {
  const submitData: CreateUserRequest = {
    username: data.username,
    email: data.email,
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
    role: data.role,
  }

  mutation.mutate(submitData)
}
```

**When to use explicit interface:**
- API expects specific field names different from form
- Need to validate all required fields are present
- Want to document the API contract

---

## 7. Generic Utility Functions

### Before:
```typescript
const updateDay = (index: number, field: keyof DayFormData, value: any) => {
  const newDays = [...days]
  newDays[index][field] = value
  setDays(newDays)
}

// Usage
updateDay(0, 'startTime', '09:00')
updateDay(0, 'isActive', true)
```

### After:
```typescript
const updateDay = <K extends keyof DayFormData>(
  index: number,
  field: K,
  value: DayFormData[K]
) => {
  const newDays = [...days]
  newDays[index][field] = value
  setDays(newDays)
}

// Usage - TypeScript now enforces value type matches field
updateDay(0, 'startTime', '09:00') // OK
updateDay(0, 'isActive', true)     // OK
updateDay(0, 'isActive', '09:00')  // ERROR: string is not assignable to boolean
```

**Benefits:**
- Type safety for the value parameter
- Prevents assigning wrong types to fields
- Better autocomplete

---

## 8. Mutation Function Parameters

### Before:
```typescript
const mutation = useMutation({
  mutationFn: (data: any) => adminApi.createUser(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] })
  },
})
```

### After:
```typescript
const mutation = useMutation({
  mutationFn: (data: CreateUserFormData) => adminApi.createUser(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] })
  },
})
```

**Or infer from API function signature:**
```typescript
const mutation = useMutation({
  mutationFn: adminApi.createUser, // Type inferred from function signature
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] })
  },
})
```

---

## 9. Spring Boot Pagination

### Before:
```typescript
function mapSpringPageToResponse<T>(springPage: any): PaginatedResponse<T> {
  return {
    data: springPage.content,
    page: springPage.number,
    pageSize: springPage.size,
    total: springPage.totalElements,
    totalPages: springPage.totalPages,
  }
}
```

### After:
```typescript
import type { SpringPage, PaginatedResponse } from '@/types'

function mapSpringPageToResponse<T>(springPage: SpringPage<T>): PaginatedResponse<T> {
  return {
    data: springPage.content,
    page: springPage.number,
    pageSize: springPage.size,
    total: springPage.totalElements,
    totalPages: springPage.totalPages,
  }
}
```

**Usage:**
```typescript
// Before - no type checking
const result = mapSpringPageToResponse(response.data)

// After - TypeScript knows result.data is User[]
const result = mapSpringPageToResponse<User>(response.data)
```

---

## 10. Optional Callback Parameters

### Before:
```typescript
const handleDownloadAttachment = async (attachment: any) => {
  try {
    const response = await fetch(attachment.fileUrl)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = attachment.fileName
    a.click()
  } catch (error) {
    console.error('Download failed:', error)
  }
}
```

### After:
```typescript
interface MessageAttachment {
  id: string
  fileName: string
  fileUrl: string
}

const handleDownloadAttachment = async (attachment: MessageAttachment) => {
  try {
    const response = await fetch(attachment.fileUrl)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = attachment.fileName
    a.click()
  } catch (error) {
    console.error('Download failed:', error)
  }
}
```

**Or extract from existing type:**
```typescript
import type { Message } from '@/types'

type MessageAttachment = Message['attachments'][number]

const handleDownloadAttachment = async (attachment: MessageAttachment) => {
  // ...
}
```

---

## Common Patterns Summary

| Pattern | Before | After |
|---------|--------|-------|
| Error handlers | `(error: any)` | `(error: ApiError)` |
| Array mapping | `.map((item: any)` | `.map((item)` or `.map((item: Type)` |
| Mapper functions | `(data: any): any` | `(data: DTO): Model` |
| API returns | `Promise<any[]>` | `Promise<Type[]>` |
| Form submit | `(data: any)` | Infer or use form type |
| Generic utils | `value: any` | `value: T[K]` |
| Catch blocks | `catch (error: any)` | `catch (error)` + type guard |

---

## Import Checklist

After creating the type infrastructure, you'll need these imports:

```typescript
// Error handling
import type { ApiError } from '@/types'
import { getErrorMessage } from '@/types'

// DTOs (for API functions/mappers)
import type {
  UserDTO,
  AppointmentDTO,
  MedicalRecordDTO,
  SpringPage
} from '@/types'

// Models (for component props and return types)
import type {
  User,
  Appointment,
  MedicalRecord,
  PaginatedResponse
} from '@/types'
```

---

## Testing Your Changes

After each fix, verify:

1. **Type checking passes:**
   ```bash
   npm run type-check
   ```

2. **No lint errors:**
   ```bash
   npm run lint
   ```

3. **Component still renders:**
   - Check in browser
   - Verify no console errors

4. **Functionality preserved:**
   - Test the specific feature
   - Verify error handling works

---

## Tips

1. **Start with high-value files first:**
   - `src/types/errors.ts` and `src/types/dtos.ts` (infrastructure)
   - `src/lib/api/index.ts` (affects everything)
   - Error handlers (safety improvement)

2. **Use TypeScript's type inference:**
   - Don't annotate when TypeScript can infer
   - Let the function return type flow to callers

3. **Test incrementally:**
   - Fix one file at a time
   - Run type-check after each change
   - Commit small, working changes

4. **When stuck:**
   - Hover over variables in VS Code to see inferred type
   - Use `// @ts-expect-error` temporarily to mark known issues
   - Add TODO comments for complex cases

5. **Document complex types:**
   - Add JSDoc comments for non-obvious types
   - Reference backend API documentation

---

**Good luck! The type system is your friend. 🎉**
