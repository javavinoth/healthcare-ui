import { lazy, Suspense, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/queryClient'
import { Toaster } from '@/components/ui/toaster'
import { useSessionMonitor } from '@/hooks/useSessionMonitor'
import { initializeApiClient } from '@/lib/api/client'

// Public Pages
import Home from '@/pages/Home'

// Auth Pages
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Verify2FA from '@/pages/Verify2FA'
import ForgotPassword from '@/pages/ForgotPassword'
import ResetPassword from '@/pages/ResetPassword'
import Profile from '@/pages/Profile'
import { ProtectedRoute, AccessDenied } from '@/components/shared/ProtectedRoute'
import SessionTimeoutModal from '@/components/shared/SessionTimeoutModal'
import SmartRedirect from '@/components/shared/SmartRedirect'

// Lazy-loaded pages (for code splitting)

const Dashboard = lazy(() => import('@/pages/Dashboard'))
const PatientDashboard = lazy(() => import('@/pages/patient/Dashboard'))
const PatientAppointments = lazy(() => import('@/pages/patient/Appointments'))
const PatientBookAppointment = lazy(() => import('@/pages/patient/BookAppointment'))
const PatientAppointmentDetail = lazy(() => import('@/pages/patient/AppointmentDetail'))
const PatientMedicalRecords = lazy(() => import('@/pages/patient/MedicalRecords'))
const PatientMedicalRecordDetail = lazy(() => import('@/pages/patient/MedicalRecordDetail'))
const PatientMessages = lazy(() => import('@/pages/patient/Messages'))
const ProviderDashboard = lazy(() => import('@/pages/provider/Dashboard'))
const ProviderMessages = lazy(() => import('@/pages/provider/Messages'))
const ProviderPatients = lazy(() => import('@/pages/provider/Patients'))
const ProviderPatientDetail = lazy(() => import('@/pages/provider/PatientDetail'))
const ProviderAppointments = lazy(() => import('@/pages/provider/Appointments'))
const ProviderAppointmentDetail = lazy(() => import('@/pages/provider/AppointmentDetail'))
const ProviderSchedule = lazy(() => import('@/pages/provider/Schedule'))
const ReceptionistDashboard = lazy(() => import('@/pages/receptionist/Dashboard'))
const ReceptionistMessages = lazy(() => import('@/pages/receptionist/Messages'))
const BillingDashboard = lazy(() => import('@/pages/billing/Dashboard'))
const BillingMessages = lazy(() => import('@/pages/billing/Messages'))
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'))
const AdminUserManagement = lazy(() => import('@/pages/admin/UserManagement'))

// Permissions
import { ROLES, PERMISSIONS } from '@/lib/constants/roles'

/**
 * Session Monitor Wrapper
 * Integrates session monitoring and API client initialization into the app
 */
function SessionMonitorWrapper({ children }: { children: React.ReactNode }) {
  const isInitialized = useRef(false)

  useSessionMonitor()

  // Initialize API client on mount to fetch CSRF token
  useEffect(() => {
    if (!isInitialized.current) {
      initializeApiClient()
      isInitialized.current = true

      if (import.meta.env.DEV) {
        console.log('[App] API client initialized')
      }
    }
  }, [])

  return <>{children}</>
}

/**
 * Healthcare Application with React Router
 * Implements RBAC-protected routing
 */
function AppRouter() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SessionMonitorWrapper>
          {/* Session Timeout Modal (shown globally when authenticated) */}
          <SessionTimeoutModal />
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-neutral-light">
              <div className="text-center">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                <p className="mt-4 text-neutral-blue-gray">Loading...</p>
              </div>
            </div>
          }
        >
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <SmartRedirect unauthenticatedBehavior="children">
                  <Home />
                </SmartRedirect>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-2fa" element={<Verify2FA />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/access-denied" element={<AccessDenied />} />

            {/* Protected Routes - Generic Dashboard (redirects to role-specific) */}
            <Route
              path="/dashboard"
              element={<SmartRedirect unauthenticatedBehavior="/" />}
            />

            {/* Protected Routes - Profile */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes - Patient Portal */}
            <Route
              path="/patient/dashboard"
              element={
                <ProtectedRoute allowedRoles={[ROLES.PATIENT]}>
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/appointments"
              element={
                <ProtectedRoute allowedRoles={[ROLES.PATIENT]}>
                  <PatientAppointments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/appointments/book"
              element={
                <ProtectedRoute allowedRoles={[ROLES.PATIENT]}>
                  <PatientBookAppointment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/appointments/:id"
              element={
                <ProtectedRoute allowedRoles={[ROLES.PATIENT]}>
                  <PatientAppointmentDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/medical-records"
              element={
                <ProtectedRoute allowedRoles={[ROLES.PATIENT]}>
                  <PatientMedicalRecords />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/medical-records/:id"
              element={
                <ProtectedRoute allowedRoles={[ROLES.PATIENT]}>
                  <PatientMedicalRecordDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/messages"
              element={
                <ProtectedRoute allowedRoles={[ROLES.PATIENT]}>
                  <PatientMessages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/*"
              element={<Navigate to="/patient/dashboard" replace />}
            />

            {/* Protected Routes - Provider Portal */}
            <Route
              path="/provider/dashboard"
              element={
                <ProtectedRoute
                  allowedRoles={[ROLES.DOCTOR, ROLES.NURSE]}
                  requiredPermissions={[PERMISSIONS.VIEW_PATIENT_RECORDS]}
                >
                  <ProviderDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/messages"
              element={
                <ProtectedRoute allowedRoles={[ROLES.DOCTOR, ROLES.NURSE]}>
                  <ProviderMessages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/patients"
              element={
                <ProtectedRoute
                  allowedRoles={[ROLES.DOCTOR, ROLES.NURSE]}
                  requiredPermissions={[PERMISSIONS.VIEW_PATIENT_RECORDS]}
                >
                  <ProviderPatients />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/patients/:id"
              element={
                <ProtectedRoute
                  allowedRoles={[ROLES.DOCTOR, ROLES.NURSE]}
                  requiredPermissions={[PERMISSIONS.VIEW_PATIENT_RECORDS]}
                >
                  <ProviderPatientDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/appointments/:id"
              element={
                <ProtectedRoute
                  allowedRoles={[ROLES.DOCTOR, ROLES.NURSE]}
                  requiredPermissions={[PERMISSIONS.VIEW_PATIENT_RECORDS]}
                >
                  <ProviderAppointmentDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/appointments"
              element={
                <ProtectedRoute
                  allowedRoles={[ROLES.DOCTOR, ROLES.NURSE]}
                  requiredPermissions={[PERMISSIONS.VIEW_PATIENT_RECORDS]}
                >
                  <ProviderAppointments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/schedule"
              element={
                <ProtectedRoute
                  allowedRoles={[ROLES.DOCTOR, ROLES.NURSE]}
                  requiredPermissions={[PERMISSIONS.MANAGE_SCHEDULE]}
                >
                  <ProviderSchedule />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/*"
              element={<Navigate to="/provider/dashboard" replace />}
            />

            {/* Protected Routes - Admin System */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute
                  allowedRoles={[ROLES.ADMIN]}
                  requiredPermissions={[PERMISSIONS.MANAGE_USERS]}
                >
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute
                  allowedRoles={[ROLES.ADMIN]}
                  requiredPermissions={[PERMISSIONS.MANAGE_USERS]}
                >
                  <AdminUserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={<Navigate to="/admin/dashboard" replace />}
            />

            {/* Protected Routes - Receptionist */}
            <Route
              path="/receptionist/dashboard"
              element={
                <ProtectedRoute allowedRoles={[ROLES.RECEPTIONIST]}>
                  <ReceptionistDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/receptionist/messages"
              element={
                <ProtectedRoute allowedRoles={[ROLES.RECEPTIONIST]}>
                  <ReceptionistMessages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/receptionist/*"
              element={<Navigate to="/receptionist/dashboard" replace />}
            />

            {/* Protected Routes - Billing Staff */}
            <Route
              path="/billing/dashboard"
              element={
                <ProtectedRoute allowedRoles={[ROLES.BILLING_STAFF]}>
                  <BillingDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/billing/messages"
              element={
                <ProtectedRoute allowedRoles={[ROLES.BILLING_STAFF]}>
                  <BillingMessages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/billing/*"
              element={<Navigate to="/billing/dashboard" replace />}
            />

            {/* 404 Not Found - Smart redirect based on auth status */}
            <Route path="*" element={<SmartRedirect unauthenticatedBehavior="/" />} />
          </Routes>
        </Suspense>
        </SessionMonitorWrapper>
      </BrowserRouter>

      {/* React Query Devtools (Development Only) */}
      {import.meta.env.VITE_ENABLE_REACT_QUERY_DEVTOOLS === 'true' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}

      {/* Toast Notifications */}
      <Toaster />
    </QueryClientProvider>
  )
}

export default AppRouter
