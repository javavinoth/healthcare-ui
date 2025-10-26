import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/queryClient'
import { Toaster } from '@/components/ui/toaster'

// Auth Pages
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Verify2FA from '@/pages/Verify2FA'
import ForgotPassword from '@/pages/ForgotPassword'
import ResetPassword from '@/pages/ResetPassword'
import Profile from '@/pages/Profile'
import { ProtectedRoute, AccessDenied } from '@/components/shared/ProtectedRoute'
import SessionTimeoutModal from '@/components/shared/SessionTimeoutModal'

// Lazy-loaded pages (for code splitting)
import { lazy, Suspense } from 'react'

const Dashboard = lazy(() => import('@/pages/Dashboard'))
const PatientDashboard = lazy(() => import('@/pages/patient/Dashboard'))
const PatientAppointments = lazy(() => import('@/pages/patient/Appointments'))
const PatientBookAppointment = lazy(() => import('@/pages/patient/BookAppointment'))
const PatientAppointmentDetail = lazy(() => import('@/pages/patient/AppointmentDetail'))
const PatientMedicalRecords = lazy(() => import('@/pages/patient/MedicalRecords'))
const PatientMedicalRecordDetail = lazy(() => import('@/pages/patient/MedicalRecordDetail'))
const ProviderDashboard = lazy(() => import('@/pages/provider/Dashboard'))
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'))
const AdminUserManagement = lazy(() => import('@/pages/admin/UserManagement'))

// Permissions
import { ROLES, PERMISSIONS } from '@/lib/constants/roles'

/**
 * Healthcare Application with React Router
 * Implements RBAC-protected routing
 */
function AppRouter() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
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
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-2fa" element={<Verify2FA />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/access-denied" element={<AccessDenied />} />

            {/* Protected Routes - General Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
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
              path="/patient/*"
              element={<Navigate to="/patient/dashboard" replace />}
            />

            {/* Protected Routes - Provider Dashboard */}
            <Route
              path="/provider/*"
              element={
                <ProtectedRoute
                  allowedRoles={[ROLES.DOCTOR, ROLES.NURSE]}
                  requiredPermissions={[PERMISSIONS.VIEW_PATIENT_RECORDS]}
                >
                  <ProviderDashboard />
                </ProtectedRoute>
              }
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

            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* 404 Not Found */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
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
