import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  Users,
  UserPlus,
  Shield,
  Heart,
  Activity,
  ChevronRight,
  Plus,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import StatsCard from '@/components/patient/StatsCard'
import AppHeader from '@/components/shared/AppHeader'
import { HospitalStatusBadge } from '@/components/shared/HospitalStatusBadge'
import { adminApi, hospitalApi } from '@/lib/api'
import { queryKeys } from '@/lib/queryClient'
import { useAuthStore } from '@/stores/authStore'
import type { Hospital } from '@/types'

/**
 * Platform Dashboard - SYSTEM_ADMIN Overview Page
 * Shows platform-wide statistics and recent hospitals
 */
export default function PlatformDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // Fetch global platform statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: queryKeys.platform.stats,
    queryFn: () => adminApi.getStats(),
  })

  // Fetch recent hospitals (first 10, sorted by creation date)
  const { data: hospitalsData, isLoading: hospitalsLoading } = useQuery({
    queryKey: queryKeys.platform.recentHospitals(10),
    queryFn: () =>
      hospitalApi.getAll({
        page: 0,
        size: 10,
        sortBy: 'createdAt',
        sortDir: 'DESC',
      }),
  })

  // Fetch hospitals pending review (READY_FOR_REVIEW status)
  const { data: pendingReviewData } = useQuery({
    queryKey: queryKeys.hospitals.pendingReview(),
    queryFn: () =>
      hospitalApi.getPendingReview({
        page: 0,
        size: 10,
        sortBy: 'updatedAt',
        sortDir: 'DESC',
      }),
  })

  const recentHospitals = hospitalsData?.data || []
  const pendingReviewCount = pendingReviewData?.pagination?.totalElements || 0

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatHospitalType = (type: string) => {
    return type
      ?.split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ')
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* App Header */}
      <AppHeader title={`Platform Administration - Welcome, ${user?.firstName || 'Admin'}!`} />

      {/* Page Subheader */}
      <div className="bg-white border-b border-neutral-blue-gray/10 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <p className="text-body text-neutral-blue-gray/70">
              Manage hospitals and hospital administrators across the platform
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/platform/hospitals')}>
                <Building2 className="h-4 w-4 mr-2" />
                All Hospitals
              </Button>
              <Button onClick={() => navigate('/platform/hospitals?action=create')}>
                <Plus className="h-4 w-4 mr-2" />
                Onboard Hospital
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Platform Statistics */}
        <div className="mb-8">
          <h2 className="text-h2 text-neutral-blue-gray mb-4">Platform Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {statsLoading ? (
              <>
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </>
            ) : (
              <>
                <StatsCard
                  title="Total Hospitals"
                  value={stats?.totalHospitals || 0}
                  icon={Building2}
                  description={`${stats?.activeHospitals || 0} active`}
                  iconColor="text-primary-blue"
                  iconBgColor="bg-primary-blue/10"
                />
                <StatsCard
                  title="Hospital Admins"
                  value={stats?.totalHospitalAdmins || 0}
                  icon={Shield}
                  description="Managing facilities"
                  iconColor="text-error"
                  iconBgColor="bg-error/10"
                />
                <StatsCard
                  title="System Admins"
                  value={stats?.totalSystemAdmins || 0}
                  icon={Shield}
                  description="Platform administrators"
                  iconColor="text-error"
                  iconBgColor="bg-error/10"
                />
                <StatsCard
                  title="Total Users"
                  value={stats?.totalUsers || 0}
                  icon={Users}
                  description="All platform users"
                  iconColor="text-info"
                  iconBgColor="bg-info/10"
                />
                <StatsCard
                  title="Patients"
                  value={stats?.totalPatients || 0}
                  icon={Heart}
                  description="Registered patients"
                  iconColor="text-wellness"
                  iconBgColor="bg-wellness/10"
                />
                <StatsCard
                  title="Healthcare Providers"
                  value={(stats?.totalDoctors || 0) + (stats?.totalNurses || 0)}
                  icon={Activity}
                  description={`${stats?.totalDoctors || 0} doctors, ${stats?.totalNurses || 0} nurses`}
                  iconColor="text-accent-teal"
                  iconBgColor="bg-accent-teal/10"
                />
                <StatsCard
                  title="Support Staff"
                  value={(stats?.totalBillingStaff || 0) + (stats?.totalReceptionists || 0)}
                  icon={Users}
                  description={`${stats?.totalBillingStaff || 0} billing, ${
                    stats?.totalReceptionists || 0
                  } reception`}
                  iconColor="text-warning"
                  iconBgColor="bg-warning/10"
                />
                <StatsCard
                  title="Pending Verifications"
                  value={stats?.pendingVerifications || 0}
                  icon={UserPlus}
                  description="Unverified emails"
                  iconColor="text-warning"
                  iconBgColor="bg-warning/10"
                />
              </>
            )}
          </div>
        </div>

        {/* Hospitals Pending Review Widget */}
        {pendingReviewCount > 0 && (
          <div className="mb-8">
            <Card className="border-info/20 bg-info/5">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-info/10 rounded-lg">
                      <Clock className="h-6 w-6 text-info" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-blue-gray">
                        {pendingReviewCount} Hospital{pendingReviewCount !== 1 ? 's' : ''} Pending
                        Review
                      </h3>
                      <p className="text-sm text-neutral-blue-gray/60 mt-1">
                        Hospital admins have marked these hospitals as ready for approval
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate('/platform/hospitals?status=READY_FOR_REVIEW')}
                    variant="outline"
                  >
                    Review Now
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions Grid */}
        <div className="mb-8">
          <h2 className="text-h2 text-neutral-blue-gray mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Onboard New Hospital */}
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/platform/hospitals?action=create')}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary-blue/10 rounded-lg">
                      <Building2 className="h-6 w-6 text-primary-blue" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-blue-gray">
                        Onboard New Hospital
                      </h3>
                      <p className="text-sm text-neutral-blue-gray/60 mt-1">
                        Add a new hospital to the platform
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-neutral-blue-gray/40" />
                </div>
              </CardContent>
            </Card>

            {/* Manage All Hospitals */}
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/platform/hospitals')}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-wellness/10 rounded-lg">
                      <Building2 className="h-6 w-6 text-wellness" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-blue-gray">
                        Manage Hospitals
                      </h3>
                      <p className="text-sm text-neutral-blue-gray/60 mt-1">
                        View and manage all hospitals
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-neutral-blue-gray/40" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recently Onboarded Hospitals */}
        <Card>
          <div className="p-6 border-b border-neutral-blue-gray/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-h2 text-neutral-blue-gray">Recently Onboarded Hospitals</h2>
                <p className="text-sm text-neutral-blue-gray/60 mt-1">
                  Latest hospitals added to the platform
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate('/platform/hospitals')}>
                View All Hospitals
              </Button>
            </div>
          </div>
          <CardContent className="p-0">
            {hospitalsLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            ) : recentHospitals.length === 0 ? (
              <div className="p-12 text-center">
                <Building2 className="h-12 w-12 mx-auto text-neutral-blue-gray/30 mb-4" />
                <p className="text-neutral-blue-gray/60 mb-4">No hospitals onboarded yet</p>
                <Button onClick={() => navigate('/platform/hospitals?action=create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Onboard First Hospital
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hospital Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Onboarded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentHospitals.map((hospital: Hospital) => (
                    <TableRow key={hospital.id} className="cursor-pointer hover:bg-neutral-light">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-primary-blue" />
                          {hospital.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-neutral-blue-gray/70">
                        {formatHospitalType(hospital.hospitalType)}
                      </TableCell>
                      <TableCell className="text-neutral-blue-gray/70">
                        <div className="text-sm">
                          {hospital.location
                            ? `${hospital.location.district}, ${hospital.location.state}`
                            : 'No location set'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <HospitalStatusBadge status={hospital.status} />
                      </TableCell>
                      <TableCell className="text-neutral-blue-gray/70 text-sm">
                        {formatDate(hospital.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/platform/hospitals?view=${hospital.id}`)}
                        >
                          View Details
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
