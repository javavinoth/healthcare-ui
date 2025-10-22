# Backend Development Plan - Patient Portal (Phase 1)

## Overview
This document outlines the backend requirements for supporting the Patient Portal UI implementation. The plan covers REST API endpoints, database schema, authentication, validation, and integration patterns.

---

## 1. API Endpoints

### 1.1 Appointments API

#### Get Appointments List
```http
GET /api/appointments
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): Filter by appointment status
  - Values: `scheduled`, `confirmed`, `checked_in`, `completed`, `cancelled`, `no_show`
- `startDate` (optional): ISO 8601 date string
- `endDate` (optional): ISO 8601 date string
- `providerId` (optional): Filter by provider ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "string",
      "patientId": "string",
      "providerId": "string",
      "provider": {
        "id": "string",
        "firstName": "string",
        "lastName": "string",
        "specialty": "string",
        "npi": "string",
        "photoUrl": "string"
      },
      "date": "2025-01-15",
      "time": "10:00 AM",
      "type": "routine_checkup",
      "status": "scheduled",
      "reason": "string",
      "notes": "string",
      "isVirtual": false,
      "location": "string",
      "duration": 30,
      "createdAt": "2025-01-10T14:30:00Z",
      "updatedAt": "2025-01-10T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User doesn't have permission
- `500 Internal Server Error`: Server error

---

#### Get Appointment by ID
```http
GET /api/appointments/:id
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": "string",
  "patientId": "string",
  "providerId": "string",
  "provider": {
    "id": "string",
    "firstName": "string",
    "lastName": "string",
    "title": "MD",
    "specialty": "Family Medicine",
    "npi": "1234567890",
    "photoUrl": "string",
    "phone": "555-0123",
    "email": "provider@example.com"
  },
  "date": "2025-01-15",
  "time": "10:00 AM",
  "type": "routine_checkup",
  "status": "scheduled",
  "reason": "string",
  "notes": "string",
  "isVirtual": false,
  "virtualMeetingUrl": null,
  "location": "123 Main St, Suite 100",
  "duration": 30,
  "checkInTime": null,
  "checkOutTime": null,
  "createdAt": "2025-01-10T14:30:00Z",
  "updatedAt": "2025-01-10T14:30:00Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User doesn't own this appointment
- `404 Not Found`: Appointment not found
- `500 Internal Server Error`: Server error

---

#### Create Appointment
```http
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "providerId": "string (required)",
  "date": "2025-01-15 (required, ISO 8601 date)",
  "time": "10:00 AM (required)",
  "type": "routine_checkup (required)",
  "reason": "string (required, min 10 chars, max 500 chars)",
  "notes": "string (optional, max 1000 chars)",
  "isVirtual": false
}
```

**Appointment Types:**
- `routine_checkup`
- `follow_up`
- `consultation`
- `urgent_care`
- `procedure`
- `lab_work`
- `vaccination`
- `telehealth`

**Response (201 Created):**
```json
{
  "id": "string",
  "patientId": "string",
  "providerId": "string",
  "date": "2025-01-15",
  "time": "10:00 AM",
  "type": "routine_checkup",
  "status": "scheduled",
  "reason": "string",
  "notes": "string",
  "isVirtual": false,
  "virtualMeetingUrl": null,
  "location": "string",
  "duration": 30,
  "createdAt": "2025-01-10T14:30:00Z",
  "updatedAt": "2025-01-10T14:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User doesn't have permission
- `409 Conflict`: Time slot already booked
- `500 Internal Server Error`: Server error

---

#### Reschedule Appointment
```http
PUT /api/appointments/:id/reschedule
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "date": "2025-01-20 (required)",
  "time": "02:00 PM (required)",
  "reason": "string (optional)"
}
```

**Response (200 OK):**
```json
{
  "id": "string",
  "patientId": "string",
  "providerId": "string",
  "date": "2025-01-20",
  "time": "02:00 PM",
  "type": "routine_checkup",
  "status": "scheduled",
  "reason": "string",
  "notes": "string",
  "isVirtual": false,
  "location": "string",
  "duration": 30,
  "updatedAt": "2025-01-10T15:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid date/time or validation errors
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User doesn't own this appointment
- `404 Not Found`: Appointment not found
- `409 Conflict`: Time slot already booked
- `422 Unprocessable Entity`: Cannot reschedule past appointments
- `500 Internal Server Error`: Server error

---

#### Cancel Appointment
```http
DELETE /api/appointments/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "string (required, min 10 chars)"
}
```

**Response (200 OK):**
```json
{
  "message": "Appointment cancelled successfully",
  "id": "string",
  "status": "cancelled",
  "cancelledAt": "2025-01-10T15:00:00Z",
  "cancellationReason": "string"
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User doesn't own this appointment
- `404 Not Found`: Appointment not found
- `422 Unprocessable Entity`: Cannot cancel past or already cancelled appointments
- `500 Internal Server Error`: Server error

---

### 1.2 Providers API

#### Search Providers
```http
POST /api/appointments/search-providers
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "specialty": "string (optional)",
  "location": "string (optional)",
  "date": "2025-01-15 (optional)",
  "insuranceAccepted": "string (optional)"
}
```

**Specialty Options:**
- `cardiology`
- `dermatology`
- `family_medicine`
- `internal_medicine`
- `neurology`
- `obstetrics_gynecology`
- `oncology`
- `ophthalmology`
- `orthopedics`
- `pediatrics`
- `psychiatry`
- `radiology`
- `surgery`
- `urology`

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "string",
      "firstName": "string",
      "lastName": "string",
      "title": "MD",
      "specialty": "Family Medicine",
      "specialties": ["Family Medicine", "Preventive Medicine"],
      "npi": "1234567890",
      "photoUrl": "string",
      "bio": "string",
      "languages": ["English", "Spanish"],
      "yearsOfExperience": 15,
      "education": "string",
      "certifications": ["Board Certified in Family Medicine"],
      "acceptingNewPatients": true,
      "rating": 4.8,
      "reviewCount": 245,
      "nextAvailableDate": "2025-01-15",
      "location": {
        "address": "123 Main St",
        "city": "Boston",
        "state": "MA",
        "zipCode": "02101"
      },
      "phone": "555-0123",
      "email": "provider@example.com"
    }
  ],
  "total": 12
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

---

#### Get Provider Available Slots
```http
GET /api/providers/:providerId/available-slots
Authorization: Bearer <token>
```

**Query Parameters:**
- `date` (required): ISO 8601 date string
- `duration` (optional): Appointment duration in minutes (default: 30)

**Response (200 OK):**
```json
{
  "date": "2025-01-15",
  "providerId": "string",
  "slots": [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM"
  ]
}
```

**Error Responses:**
- `400 Bad Request`: Invalid date format
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Provider not found
- `500 Internal Server Error`: Server error

---

### 1.3 Medical Records API

#### Get Medical Records
```http
GET /api/medical-records
Authorization: Bearer <token>
```

**Query Parameters:**
- `type` (optional): Filter by record type
  - Values: `lab_result`, `visit_note`, `prescription`, `imaging`, `referral`
- `startDate` (optional): ISO 8601 date string
- `endDate` (optional): ISO 8601 date string
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "string",
      "patientId": "string",
      "type": "lab_result",
      "title": "Annual Blood Work",
      "date": "2025-01-10",
      "providerId": "string",
      "provider": {
        "id": "string",
        "firstName": "string",
        "lastName": "string",
        "specialty": "string"
      },
      "description": "string",
      "attachments": [
        {
          "id": "string",
          "fileName": "blood-work-2025-01-10.pdf",
          "fileType": "application/pdf",
          "fileSize": 245632,
          "url": "string"
        }
      ],
      "isNew": true,
      "createdAt": "2025-01-10T14:30:00Z",
      "updatedAt": "2025-01-10T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 78,
    "totalPages": 4
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User doesn't have permission
- `500 Internal Server Error`: Server error

---

#### Download Medical Record Attachment
```http
GET /api/medical-records/:recordId/attachments/:attachmentId/download
Authorization: Bearer <token>
```

**Response (200 OK):**
- Returns file stream with appropriate Content-Type and Content-Disposition headers

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User doesn't own this record
- `404 Not Found`: Record or attachment not found
- `500 Internal Server Error`: Server error

---

## 2. Database Schema

### 2.1 Appointments Table
```sql
CREATE TABLE appointments (
  id VARCHAR(36) PRIMARY KEY,
  patient_id VARCHAR(36) NOT NULL,
  provider_id VARCHAR(36) NOT NULL,
  date DATE NOT NULL,
  time VARCHAR(10) NOT NULL,
  type ENUM(
    'routine_checkup',
    'follow_up',
    'consultation',
    'urgent_care',
    'procedure',
    'lab_work',
    'vaccination',
    'telehealth'
  ) NOT NULL,
  status ENUM(
    'scheduled',
    'confirmed',
    'checked_in',
    'completed',
    'cancelled',
    'no_show'
  ) NOT NULL DEFAULT 'scheduled',
  reason TEXT NOT NULL,
  notes TEXT,
  is_virtual BOOLEAN NOT NULL DEFAULT FALSE,
  virtual_meeting_url VARCHAR(500),
  location VARCHAR(500),
  duration INT NOT NULL DEFAULT 30,
  check_in_time DATETIME,
  check_out_time DATETIME,
  cancellation_reason TEXT,
  cancelled_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,

  INDEX idx_patient_id (patient_id),
  INDEX idx_provider_id (provider_id),
  INDEX idx_date (date),
  INDEX idx_status (status),
  INDEX idx_patient_date (patient_id, date),
  INDEX idx_provider_date (provider_id, date)
);
```

### 2.2 Providers Table (Extended User Information)
```sql
CREATE TABLE provider_profiles (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE,
  npi VARCHAR(10) UNIQUE,
  title VARCHAR(10),
  specialty VARCHAR(100) NOT NULL,
  specialties JSON,
  bio TEXT,
  languages JSON,
  years_of_experience INT,
  education TEXT,
  certifications JSON,
  accepting_new_patients BOOLEAN NOT NULL DEFAULT TRUE,
  rating DECIMAL(2, 1) DEFAULT 0.0,
  review_count INT DEFAULT 0,
  photo_url VARCHAR(500),
  phone VARCHAR(20),
  email VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  INDEX idx_specialty (specialty),
  INDEX idx_accepting_new_patients (accepting_new_patients),
  INDEX idx_rating (rating)
);
```

### 2.3 Provider Locations Table
```sql
CREATE TABLE provider_locations (
  id VARCHAR(36) PRIMARY KEY,
  provider_id VARCHAR(36) NOT NULL,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  country VARCHAR(2) NOT NULL DEFAULT 'US',
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (provider_id) REFERENCES provider_profiles(id) ON DELETE CASCADE,

  INDEX idx_provider_id (provider_id),
  INDEX idx_city_state (city, state)
);
```

### 2.4 Provider Availability Table
```sql
CREATE TABLE provider_availability (
  id VARCHAR(36) PRIMARY KEY,
  provider_id VARCHAR(36) NOT NULL,
  day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (provider_id) REFERENCES provider_profiles(id) ON DELETE CASCADE,

  INDEX idx_provider_day (provider_id, day_of_week)
);
```

### 2.5 Medical Records Table
```sql
CREATE TABLE medical_records (
  id VARCHAR(36) PRIMARY KEY,
  patient_id VARCHAR(36) NOT NULL,
  provider_id VARCHAR(36),
  appointment_id VARCHAR(36),
  type ENUM(
    'lab_result',
    'visit_note',
    'prescription',
    'imaging',
    'referral'
  ) NOT NULL,
  title VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  is_new BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,

  INDEX idx_patient_id (patient_id),
  INDEX idx_type (type),
  INDEX idx_date (date),
  INDEX idx_patient_date (patient_id, date)
);
```

### 2.6 Medical Record Attachments Table
```sql
CREATE TABLE medical_record_attachments (
  id VARCHAR(36) PRIMARY KEY,
  record_id VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size INT NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  url VARCHAR(500),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (record_id) REFERENCES medical_records(id) ON DELETE CASCADE,

  INDEX idx_record_id (record_id)
);
```

---

## 3. Authentication & Authorization

### 3.1 Authentication Requirements
- All endpoints require valid JWT token in `Authorization: Bearer <token>` header
- Tokens must be validated on every request
- Token payload must include:
  - `userId`: User ID
  - `email`: User email
  - `role`: User role (lowercase: `patient`, `doctor`, `nurse`, `admin`)
  - `iat`: Issued at timestamp
  - `exp`: Expiration timestamp

### 3.2 Authorization Rules

#### Appointments
- **GET /api/appointments**: Patients can only view their own appointments
- **GET /api/appointments/:id**: Patients can only view their own appointments
- **POST /api/appointments**: Only patients can create appointments
- **PUT /api/appointments/:id/reschedule**: Only the appointment owner can reschedule
- **DELETE /api/appointments/:id/cancel**: Only the appointment owner can cancel

#### Providers
- **POST /api/appointments/search-providers**: Any authenticated user can search
- **GET /api/providers/:providerId/available-slots**: Any authenticated user can view

#### Medical Records
- **GET /api/medical-records**: Patients can only view their own records
- **GET /api/medical-records/:recordId/attachments/:attachmentId/download**: Only record owner can download

### 3.3 Role Checking Implementation
```javascript
// Backend must normalize roles to lowercase for comparison
function hasRole(user, requiredRole) {
  return user.role.toLowerCase() === requiredRole.toLowerCase()
}

function hasAnyRole(user, requiredRoles) {
  const userRole = user.role.toLowerCase()
  return requiredRoles.some(role => role.toLowerCase() === userRole)
}
```

---

## 4. Validation Rules

### 4.1 Appointment Booking Validation
```javascript
const appointmentBookingValidation = {
  providerId: {
    required: true,
    type: 'string',
    minLength: 1
  },
  date: {
    required: true,
    type: 'date',
    format: 'YYYY-MM-DD',
    validation: [
      'Must be today or future date',
      'Cannot be more than 6 months in advance'
    ]
  },
  time: {
    required: true,
    type: 'string',
    format: 'hh:mm AM/PM',
    validation: [
      'Must match provider available slots',
      'Slot must not be already booked'
    ]
  },
  type: {
    required: true,
    type: 'enum',
    values: [
      'routine_checkup',
      'follow_up',
      'consultation',
      'urgent_care',
      'procedure',
      'lab_work',
      'vaccination',
      'telehealth'
    ]
  },
  reason: {
    required: true,
    type: 'string',
    minLength: 10,
    maxLength: 500,
    sanitize: true
  },
  notes: {
    required: false,
    type: 'string',
    maxLength: 1000,
    sanitize: true
  },
  isVirtual: {
    required: false,
    type: 'boolean',
    default: false
  }
}
```

### 4.2 Provider Search Validation
```javascript
const providerSearchValidation = {
  specialty: {
    required: false,
    type: 'enum',
    values: [
      'cardiology', 'dermatology', 'family_medicine',
      'internal_medicine', 'neurology', 'obstetrics_gynecology',
      'oncology', 'ophthalmology', 'orthopedics',
      'pediatrics', 'psychiatry', 'radiology',
      'surgery', 'urology'
    ]
  },
  location: {
    required: false,
    type: 'string',
    maxLength: 200,
    sanitize: true
  },
  date: {
    required: false,
    type: 'date',
    format: 'YYYY-MM-DD'
  },
  insuranceAccepted: {
    required: false,
    type: 'string',
    maxLength: 100,
    sanitize: true
  }
}
```

### 4.3 Cancellation Validation
```javascript
const cancellationValidation = {
  reason: {
    required: true,
    type: 'string',
    minLength: 10,
    maxLength: 500,
    sanitize: true
  }
}
```

---

## 5. Error Handling

### 5.1 Standard Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "reason",
        "message": "Reason must be at least 10 characters"
      }
    ],
    "timestamp": "2025-01-10T14:30:00Z",
    "path": "/api/appointments"
  }
}
```

### 5.2 Error Codes
- `VALIDATION_ERROR`: Request validation failed
- `AUTHENTICATION_ERROR`: Invalid or missing token
- `AUTHORIZATION_ERROR`: User doesn't have permission
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource conflict (e.g., time slot already booked)
- `UNPROCESSABLE_ENTITY`: Business logic validation failed
- `INTERNAL_SERVER_ERROR`: Server error
- `RATE_LIMIT_EXCEEDED`: Too many requests

### 5.3 Business Logic Validations
1. **Appointment Booking**:
   - Time slot must be available (not already booked)
   - Date must be in the future
   - Provider must be accepting new patients
   - Cannot book more than 6 months in advance
   - Cannot book in the past

2. **Appointment Rescheduling**:
   - Cannot reschedule past appointments
   - Cannot reschedule cancelled appointments
   - New time slot must be available
   - Must be at least 2 hours before original appointment time

3. **Appointment Cancellation**:
   - Cannot cancel past appointments
   - Cannot cancel already cancelled appointments
   - Cancellation reason must be provided

---

## 6. CORS Configuration

```javascript
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
  maxAge: 86400 // 24 hours
}
```

---

## 7. Security Requirements

### 7.1 HIPAA Compliance
- All PHI (Protected Health Information) must be encrypted at rest and in transit
- Audit logging for all data access and modifications
- Data retention policies must be enforced
- Patient consent must be tracked for data sharing

### 7.2 Rate Limiting
```javascript
const rateLimits = {
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // 100 requests per 15 minutes
  },
  auth: {
    windowMs: 15 * 60 * 1000,
    max: 5 // 5 login attempts per 15 minutes
  },
  appointments: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10 // 10 appointment bookings per hour
  }
}
```

### 7.3 Input Sanitization
- All text inputs must be sanitized to prevent XSS
- SQL injection prevention using parameterized queries
- File uploads must be validated (type, size, content)

### 7.4 CSRF Protection
- CSRF tokens required for all state-changing operations
- Token must be included in request headers: `X-CSRF-Token`

---

## 8. Caching Strategy

### 8.1 Cache-Control Headers
```javascript
const cacheStrategies = {
  appointments: 'no-store', // Never cache PHI
  medicalRecords: 'no-store', // Never cache PHI
  providers: 'public, max-age=300', // 5 minutes
  availableSlots: 'private, max-age=60' // 1 minute
}
```

### 8.2 ETags
- Implement ETag support for provider search results
- Client sends `If-None-Match` header
- Server returns `304 Not Modified` if content unchanged

---

## 9. Performance Requirements

### 9.1 Response Time Targets
- API endpoint response time: < 200ms (95th percentile)
- Search providers: < 500ms (95th percentile)
- File downloads: < 2s for files up to 10MB

### 9.2 Database Optimization
- Use database indexes on frequently queried fields
- Implement pagination for all list endpoints
- Use database connection pooling
- Consider read replicas for heavy read operations

### 9.3 Query Optimization
```sql
-- Example: Efficient appointment query with provider join
SELECT
  a.*,
  u.first_name as provider_first_name,
  u.last_name as provider_last_name,
  pp.specialty,
  pp.npi,
  pp.photo_url
FROM appointments a
INNER JOIN users u ON a.provider_id = u.id
INNER JOIN provider_profiles pp ON u.id = pp.user_id
WHERE a.patient_id = ?
  AND a.date >= CURDATE()
  AND a.status IN ('scheduled', 'confirmed')
ORDER BY a.date ASC, a.time ASC
LIMIT 3;
```

---

## 10. Testing Requirements

### 10.1 Unit Tests
- Test all validation functions
- Test authorization logic
- Test business logic (slot availability, booking conflicts)
- Test error handling

### 10.2 Integration Tests
- Test complete appointment booking flow
- Test appointment rescheduling flow
- Test appointment cancellation flow
- Test provider search with various filters
- Test medical records retrieval

### 10.3 Load Tests
- Simulate 100 concurrent users booking appointments
- Test database performance under load
- Test API rate limiting

---

## 11. Monitoring & Logging

### 11.1 Audit Logs
```javascript
const auditLogEntry = {
  timestamp: '2025-01-10T14:30:00Z',
  userId: 'string',
  userRole: 'patient',
  action: 'CREATE_APPOINTMENT',
  resource: 'appointments',
  resourceId: 'string',
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  requestId: 'string',
  status: 'success',
  details: {
    providerId: 'string',
    date: '2025-01-15',
    time: '10:00 AM'
  }
}
```

### 11.2 Application Logs
- Log all API requests with request ID
- Log all errors with stack traces
- Log slow queries (> 1 second)
- Log authentication failures

### 11.3 Metrics to Track
- API response times (p50, p95, p99)
- Error rates by endpoint
- Database query performance
- Appointment booking success rate
- Provider search result counts

---

## 12. API Integration Checklist

### Phase 1: Core Setup
- [ ] Set up database schema and migrations
- [ ] Implement authentication middleware
- [ ] Implement authorization middleware
- [ ] Set up CORS configuration
- [ ] Implement rate limiting
- [ ] Set up audit logging

### Phase 2: Appointments API
- [ ] Implement GET /api/appointments (list)
- [ ] Implement GET /api/appointments/:id (detail)
- [ ] Implement POST /api/appointments (create)
- [ ] Implement PUT /api/appointments/:id/reschedule
- [ ] Implement DELETE /api/appointments/:id/cancel
- [ ] Add validation for all endpoints
- [ ] Add unit tests for appointment logic
- [ ] Add integration tests for appointment flows

### Phase 3: Providers API
- [ ] Implement POST /api/appointments/search-providers
- [ ] Implement GET /api/providers/:providerId/available-slots
- [ ] Seed provider data (at least 20 providers across specialties)
- [ ] Implement provider availability calculation
- [ ] Add unit tests for provider search
- [ ] Add integration tests for provider endpoints

### Phase 4: Medical Records API
- [ ] Implement GET /api/medical-records
- [ ] Implement GET /api/medical-records/:recordId/attachments/:attachmentId/download
- [ ] Set up file storage (S3 or local)
- [ ] Implement file upload validation
- [ ] Seed medical record data (at least 10 records per patient)
- [ ] Add unit tests for medical records
- [ ] Add integration tests for file downloads

### Phase 5: Testing & Documentation
- [ ] Complete API documentation (Swagger/OpenAPI)
- [ ] Perform load testing
- [ ] Perform security audit
- [ ] Set up monitoring and alerting
- [ ] Document deployment process

---

## 13. Environment Variables

```bash
# Database
DATABASE_URL=mysql://user:password@localhost:3306/healthcare_db
DATABASE_POOL_SIZE=20

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION=7d

# CORS
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Storage
STORAGE_TYPE=s3
AWS_REGION=us-east-1
AWS_S3_BUCKET=healthcare-medical-records
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Email (for notifications)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASSWORD=your-password

# Application
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# Session
SESSION_TIMEOUT=900000
```

---

## 14. Deployment Considerations

### 14.1 Infrastructure
- Use load balancer for horizontal scaling
- Set up database read replicas for read-heavy operations
- Use CDN for static assets and provider photos
- Implement health check endpoint: `GET /health`

### 14.2 Database Migrations
- Use migration tool (e.g., Flyway, Liquibase, or framework-specific tool)
- Version all schema changes
- Test migrations in staging environment first

### 14.3 Rollback Strategy
- Keep at least 3 previous versions deployable
- Database migrations must be backward compatible
- Implement feature flags for new features

---

## 15. Next Steps

1. **Review this plan** with backend team and stakeholders
2. **Estimate effort** for each phase (2-4 weeks total)
3. **Set up development environment** with database and seed data
4. **Implement Phase 1** (Core Setup) - 2-3 days
5. **Implement Phase 2** (Appointments API) - 3-4 days
6. **Implement Phase 3** (Providers API) - 2-3 days
7. **Implement Phase 4** (Medical Records API) - 2-3 days
8. **Phase 5** (Testing & Documentation) - 2-3 days
9. **Integration testing** between frontend and backend - 2 days
10. **Performance optimization** - 1-2 days
11. **Security audit** - 1 day
12. **Production deployment** - 1 day

---

## Appendix A: Sample Test Data

### Sample Providers
```json
{
  "id": "provider-1",
  "firstName": "Sarah",
  "lastName": "Johnson",
  "title": "MD",
  "specialty": "Family Medicine",
  "specialties": ["Family Medicine", "Preventive Medicine"],
  "npi": "1234567890",
  "bio": "Dr. Johnson has over 15 years of experience in family medicine...",
  "languages": ["English", "Spanish"],
  "yearsOfExperience": 15,
  "acceptingNewPatients": true,
  "rating": 4.8,
  "reviewCount": 245
}
```

### Sample Appointments
```json
{
  "id": "appt-1",
  "patientId": "patient-1",
  "providerId": "provider-1",
  "date": "2025-01-20",
  "time": "10:00 AM",
  "type": "routine_checkup",
  "status": "scheduled",
  "reason": "Annual physical examination and wellness checkup",
  "isVirtual": false,
  "duration": 30
}
```

### Sample Medical Records
```json
{
  "id": "record-1",
  "patientId": "patient-1",
  "providerId": "provider-1",
  "type": "lab_result",
  "title": "Annual Blood Work",
  "date": "2025-01-10",
  "description": "Complete metabolic panel, lipid panel, and CBC",
  "isNew": true,
  "attachments": [
    {
      "id": "att-1",
      "fileName": "blood-work-2025-01-10.pdf",
      "fileType": "application/pdf",
      "fileSize": 245632
    }
  ]
}
```
