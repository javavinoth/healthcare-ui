import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Users, UserPlus, CheckCircle2, AlertCircle, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
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
import { adminApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

/**
 * Admin Dashboard - Main Overview Page
 * Shows user statistics and recent activity
 */
export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // Fetch admin statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.getStats(),
  })

  // Fetch recent users (first page, 10 users)
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin', 'users', 'recent'],
    queryFn: () =>
      adminApi.getAllUsers({
        page: 0,
        size: 10,
        sortBy: 'createdAt',
        sortDir: 'DESC',
      }),
  })

  const recentUsers = usersData?.data || []
  const totalProviders = (stats?.totalDoctors || 0) + (stats?.totalNurses || 0)

  const getRoleBadgeVariant = (role: string) => {
    const variants: Record<
      string,
      'default' | 'secondary' | 'success' | 'warning' | 'info' | 'destructive'
    > = {
      ADMIN: 'destructive',
      DOCTOR: 'success',
      NURSE: 'info',
      PATIENT: 'default',
      BILLING_STAFF: 'warning',
      RECEPTIONIST: 'secondary',
    }
    return variants[role] || 'default'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* App Header */}
      <AppHeader title={`Welcome, ${user?.firstName || 'Admin'}!`} />

      {/* Page Subheader */}
      <div className="bg-white border-b border-neutral-blue-gray/10 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <p className="text-body text-neutral-blue-gray/70">System Administration Dashboard</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/admin/users')}>
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
              <Button onClick={() => navigate('/admin/users?action=create')}>
                <UserPlus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                title="Total Users"
                value={stats?.totalUsers || 0}
                icon={Users}
                description={`${stats?.activeUsers || 0} active`}
                iconColor="text-primary"
                iconBgColor="bg-primary/10"
              />
              <StatsCard
                title="Patients"
                value={stats?.totalPatients || 0}
                icon={Users}
                description="Registered patients"
                iconColor="text-info"
                iconBgColor="bg-info/10"
              />
              <StatsCard
                title="Healthcare Providers"
                value={totalProviders}
                icon={Shield}
                description={`${stats?.totalDoctors || 0} doctors, ${stats?.totalNurses || 0} nurses`}
                iconColor="text-wellness"
                iconBgColor="bg-wellness/10"
              />
              <StatsCard
                title="Administrators"
                value={stats?.totalAdmins || 0}
                icon={Shield}
                description="System administrators"
                iconColor="text-error"
                iconBgColor="bg-error/10"
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
                icon={AlertCircle}
                description="Unverified email addresses"
                iconColor="text-warning"
                iconBgColor="bg-warning/10"
              />
            </>
          )}
        </div>

        {/* Recent Users */}
        <Card>
          <div className="p-6 border-b border-neutral-blue-gray/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-h2 text-neutral-blue-gray">Recently Created Users</h2>
                <p className="text-sm text-neutral-blue-gray/60 mt-1">
                  Latest user registrations and account creations
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate('/admin/users')}>
                View All Users
              </Button>
            </div>
          </div>
          <CardContent className="p-0">
            {usersLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            ) : recentUsers.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto text-neutral-blue-gray/30 mb-4" />
                <p className="text-neutral-blue-gray/60">No users found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell className="text-neutral-blue-gray/70">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.active ? (
                          <div className="flex items-center gap-2 text-wellness">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-sm">Active</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-neutral-blue-gray/50">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm">Inactive</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-neutral-blue-gray/70">
                        {formatDate(user.createdAt)}
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
