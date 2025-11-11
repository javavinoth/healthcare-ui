import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  Globe,
  Calendar,
  AlertCircle,
  Edit,
  Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import AppHeader from '@/components/shared/AppHeader'
import { HospitalStatusBadge } from '@/components/shared/HospitalStatusBadge'
import { HospitalCompletionChecklist } from '@/components/shared/HospitalCompletionChecklist'
import MarkReadyForReviewModal from '@/components/admin/MarkReadyForReviewModal'
import { hospitalApi, locationApi, departmentApi } from '@/lib/api'
import { queryKeys } from '@/lib/queryClient'
import { format } from 'date-fns'
import type { Hospital } from '@/types'

/**
 * Hospital Admin Dashboard
 * Shows hospital status, completion checklist, and allows marking ready for review
 * HOSPITAL_ADMIN only
 */
export default function HospitalAdminDashboard() {
  const navigate = useNavigate()
  const [markReadyModalOpen, setMarkReadyModalOpen] = useState(false)

  // Get hospital admin's assigned hospital
  // In a real implementation, this would come from user's hospital assignment
  // For now, we'll fetch the first hospital they're assigned to
  const { data: hospitalsData, isLoading: hospitalsLoading } = useQuery({
    queryKey: queryKeys.hospitals.all({ page: 0, size: 1 }),
    queryFn: () => hospitalApi.getAll({ page: 0, size: 1 }),
  })

  const hospital: Hospital | null = hospitalsData?.data?.[0] || null

  // Fetch locations for the hospital
  const { data: locationsData } = useQuery({
    queryKey: ['locations', 'hospital', hospital?.id],
    queryFn: () => locationApi.getByHospital(hospital!.id),
    enabled: !!hospital?.id,
  })

  // Fetch departments for the hospital
  const { data: departmentsData } = useQuery({
    queryKey: ['departments', 'hospital', hospital?.id],
    queryFn: () => departmentApi.getByHospital(hospital!.id),
    enabled: !!hospital?.id,
  })

  const locations = locationsData || []
  const departments = departmentsData || []

  const hasLocation = !!hospital?.location
  const hasDepartments = departments.length > 0
  const hasContactEmail = !!hospital?.email
  const hasWebsite = !!hospital?.website

  const canMarkReady = hasLocation && hasDepartments && hospital?.status === 'PENDING'

  if (hospitalsLoading) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <AppHeader title="My Hospital" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-64 mb-6" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (!hospital) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <AppHeader title="My Hospital" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You are not assigned to any hospital. Please contact system administrator.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* App Header */}
      <AppHeader title={`My Hospital - ${hospital.name}`} />

      {/* Page Subheader */}
      <div className="bg-white border-b border-neutral-blue-gray/10 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HospitalStatusBadge status={hospital.status} />
              <p className="text-body text-neutral-blue-gray/70">
                {hospital.status === 'PENDING' && 'Complete hospital details to submit for review'}
                {hospital.status === 'READY_FOR_REVIEW' && 'Awaiting system admin approval'}
                {hospital.status === 'ACTIVE' && 'Your hospital is approved and active'}
              </p>
            </div>
            {hospital.status === 'PENDING' && (
              <Button onClick={() => navigate('/hospital-admin/hospitals')}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Hospital
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Rejection Alert */}
        {hospital.rejectionReason && hospital.status === 'PENDING' && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold">Your hospital submission was rejected</p>
              <p className="mt-2">{hospital.rejectionReason}</p>
              {hospital.reviewedByName && hospital.reviewedAt && (
                <p className="text-sm mt-2 opacity-80">
                  Reviewed by {hospital.reviewedByName} on{' '}
                  {format(new Date(hospital.reviewedAt), 'MMM dd, yyyy')}
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Ready for Review Info */}
        {hospital.status === 'READY_FOR_REVIEW' && (
          <Alert className="mb-6 border-info bg-info/5">
            <AlertCircle className="h-4 w-4 text-info" />
            <AlertDescription className="text-info-foreground">
              <p className="font-semibold">Your hospital is awaiting approval</p>
              <p className="mt-2">
                System administrator will review your submission. You can still edit details if
                needed (this will reset status to PENDING).
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Active Status Info */}
        {hospital.status === 'ACTIVE' && (
          <Alert className="mb-6 border-wellness bg-wellness/5">
            <AlertCircle className="h-4 w-4 text-wellness" />
            <AlertDescription className="text-wellness-foreground">
              <p className="font-semibold">Your hospital is approved and active!</p>
              <p className="mt-2">
                You can now manage your facility, staff, and resources. Contact system administrator
                if you need to make changes.
              </p>
              {hospital.reviewedByName && hospital.reviewedAt && (
                <p className="text-sm mt-2 opacity-80">
                  Approved by {hospital.reviewedByName} on{' '}
                  {format(new Date(hospital.reviewedAt), 'MMM dd, yyyy')}
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Hospital Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hospital Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Hospital Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-blue-gray">{hospital.name}</h3>
                  {hospital.code && (
                    <p className="text-sm text-neutral-blue-gray/60 mt-1">Code: {hospital.code}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hospital.location && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-neutral-blue-gray/50 mt-1" />
                      <div className="text-sm">
                        <p className="font-medium text-neutral-blue-gray">Location</p>
                        <p className="text-neutral-blue-gray/70 mt-1">
                          {hospital.location.address}
                          <br />
                          {hospital.location.district}, {hospital.location.state}
                          <br />
                          {hospital.location.pincode}
                        </p>
                      </div>
                    </div>
                  )}

                  {hospital.email && (
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 text-neutral-blue-gray/50 mt-1" />
                      <div className="text-sm">
                        <p className="font-medium text-neutral-blue-gray">Email</p>
                        <p className="text-neutral-blue-gray/70 mt-1">{hospital.email}</p>
                      </div>
                    </div>
                  )}

                  {hospital.phone && (
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-neutral-blue-gray/50 mt-1" />
                      <div className="text-sm">
                        <p className="font-medium text-neutral-blue-gray">Phone</p>
                        <p className="text-neutral-blue-gray/70 mt-1">{hospital.phone}</p>
                      </div>
                    </div>
                  )}

                  {hospital.website && (
                    <div className="flex items-start gap-2">
                      <Globe className="h-4 w-4 text-neutral-blue-gray/50 mt-1" />
                      <div className="text-sm">
                        <p className="font-medium text-neutral-blue-gray">Website</p>
                        <p className="text-neutral-blue-gray/70 mt-1">
                          <a
                            href={hospital.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-blue hover:underline"
                          >
                            {hospital.website}
                          </a>
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-neutral-blue-gray/50 mt-1" />
                    <div className="text-sm">
                      <p className="font-medium text-neutral-blue-gray">Created</p>
                      <p className="text-neutral-blue-gray/70 mt-1">
                        {format(new Date(hospital.createdAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>

                {!hospital.location && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Location information is required. Please update hospital details.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-blue-gray/60">Locations</p>
                      <p className="text-2xl font-bold text-neutral-blue-gray mt-1">
                        {locations.length}
                      </p>
                    </div>
                    <MapPin className="h-8 w-8 text-primary-blue/30" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-blue-gray/60">Departments</p>
                      <p className="text-2xl font-bold text-neutral-blue-gray mt-1">
                        {departments.length}
                      </p>
                    </div>
                    <Building2 className="h-8 w-8 text-wellness/30" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Completion Checklist */}
          <div className="space-y-6">
            {hospital.status === 'PENDING' && (
              <>
                <HospitalCompletionChecklist
                  hasLocation={hasLocation}
                  hasDepartments={hasDepartments}
                  hasContactEmail={hasContactEmail}
                  hasWebsite={hasWebsite}
                />

                <Card>
                  <CardContent className="p-6">
                    <Button
                      className="w-full"
                      disabled={!canMarkReady}
                      onClick={() => setMarkReadyModalOpen(true)}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Mark Ready for Review
                    </Button>
                    {!canMarkReady && (
                      <p className="text-sm text-neutral-blue-gray/60 text-center mt-3">
                        Complete all required items to submit for review
                      </p>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/hospital-admin/hospitals')}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Manage Hospital
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/hospital-admin/locations')}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Manage Locations
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/hospital-admin/departments')}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Manage Departments
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mark Ready Modal */}
      {hospital && (
        <MarkReadyForReviewModal
          open={markReadyModalOpen}
          onClose={() => setMarkReadyModalOpen(false)}
          hospital={hospital}
          hasLocation={hasLocation}
          hasDepartments={hasDepartments}
        />
      )}
    </div>
  )
}
