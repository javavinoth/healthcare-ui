import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import {
  Building2,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  MapPin,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Shield,
  Users,
  UserPlus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AppHeader from '@/components/shared/AppHeader'
import { hospitalApi, staffAssignmentApi } from '@/lib/api'
import { queryKeys, invalidateHospitals } from '@/lib/queryClient'
import { extractErrorMessage } from '@/lib/utils/apiError'
import { useAuthStore } from '@/stores/authStore'
import { ROLES } from '@/lib/constants/roles'
import CreateHospitalWithAdminModal from '@/components/admin/CreateHospitalWithAdminModal'
import EditHospitalModal from '@/components/admin/EditHospitalModal'
import CreateHospitalAdminModal from '@/components/platform/CreateHospitalAdminModal'
import ApproveHospitalModal from '@/components/admin/ApproveHospitalModal'
import RejectHospitalModal from '@/components/admin/RejectHospitalModal'
import { HospitalStatusBadge } from '@/components/shared/HospitalStatusBadge'
import type { Hospital, HospitalStaffAssignment } from '@/types'
import { CheckCircle2, XCircle } from 'lucide-react'

/**
 * Hospital Management Page
 * Full hospital administration interface with CRUD operations
 * Supports both SYSTEM_ADMIN and HOSPITAL_ADMIN roles with different permissions
 */
export default function HospitalManagement() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [searchParams, setSearchParams] = useSearchParams()

  const isSystemAdmin = user?.role === ROLES.SYSTEM_ADMIN

  // State for filters and pagination
  const [page, setPage] = useState(0)
  const [size] = useState(25)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  // Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [createAdminModalOpen, setCreateAdminModalOpen] = useState(false)
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null)
  const [viewHospitalId, setViewHospitalId] = useState<string | null>(null)

  // Handle query params for actions
  useEffect(() => {
    const action = searchParams.get('action')
    const viewId = searchParams.get('view')

    if (action === 'create' && isSystemAdmin) {
      setCreateModalOpen(true)
      setSearchParams({}) // Clear params
    }

    if (viewId) {
      setViewHospitalId(viewId)
    }
  }, [searchParams, setSearchParams, isSystemAdmin])

  // Fetch hospitals with filters
  const { data: hospitalsData, isLoading } = useQuery({
    queryKey: queryKeys.hospitals.all({
      page,
      size,
      search: search || undefined,
      status: statusFilter === 'ALL' ? undefined : (statusFilter as any),
    }),
    queryFn: () =>
      hospitalApi.getAll({
        page,
        size,
        search: search || undefined,
        status: statusFilter === 'ALL' ? undefined : (statusFilter as any),
      }),
  })

  // Fetch hospital admins when viewing a specific hospital
  const { data: hospitalAdmins, isLoading: adminsLoading } = useQuery({
    queryKey: ['hospital', viewHospitalId, 'admins'],
    queryFn: () =>
      staffAssignmentApi.getByHospital(viewHospitalId!, { role: 'hospital_admin' as any }),
    enabled: !!viewHospitalId && isSystemAdmin,
  })

  const hospitals = hospitalsData?.data || []
  const totalPages = hospitalsData?.pagination?.totalPages || 0
  const totalElements = hospitalsData?.pagination?.totalElements || 0

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => hospitalApi.delete(id),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Hospital deleted successfully',
      })
      invalidateHospitals()
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
      setDeleteDialogOpen(false)
      setSelectedHospital(null)
    },
    onError: (error: unknown) => {
      const message = extractErrorMessage(error, 'Failed to delete hospital')
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
    },
  })

  // Handler functions
  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(0) // Reset to first page
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    setPage(0) // Reset to first page
  }

  const handleViewHospital = (hospital: Hospital) => {
    setSelectedHospital(hospital)
    setViewHospitalId(hospital.id)
  }

  const handleCloseHospitalView = () => {
    setViewHospitalId(null)
    setSelectedHospital(null)
  }

  const handleCreateAdmin = (hospital: Hospital) => {
    setSelectedHospital(hospital)
    setCreateAdminModalOpen(true)
  }

  const handleEditHospital = (hospital: Hospital) => {
    setSelectedHospital(hospital)
    setEditModalOpen(true)
  }

  const handleDeleteHospital = (hospital: Hospital) => {
    setSelectedHospital(hospital)
    setDeleteDialogOpen(true)
  }

  const handleApproveHospital = (hospital: Hospital) => {
    setSelectedHospital(hospital)
    setApproveModalOpen(true)
  }

  const handleRejectHospital = (hospital: Hospital) => {
    setSelectedHospital(hospital)
    setRejectModalOpen(true)
  }

  const confirmDelete = () => {
    if (selectedHospital) {
      deleteMutation.mutate(selectedHospital.id)
    }
  }

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

  // If viewing a specific hospital, show detail view
  if (viewHospitalId && selectedHospital) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <AppHeader
          title={`Hospital: ${selectedHospital.name}`}
          showBackButton
          backPath={isSystemAdmin ? '/platform/hospitals' : '/hospital-admin/hospitals'}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              {isSystemAdmin && <TabsTrigger value="admins">Hospital Admins</TabsTrigger>}
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <Card>
                <div className="p-6 border-b border-neutral-blue-gray/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-h2 text-neutral-blue-gray">{selectedHospital.name}</h2>
                      <div className="mt-2">
                        <HospitalStatusBadge status={selectedHospital.status} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleCloseHospitalView}>
                        Back to List
                      </Button>
                      <Button onClick={() => handleEditHospital(selectedHospital)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Hospital
                      </Button>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-blue-gray mb-3">
                        Basic Information
                      </h3>
                      <dl className="space-y-2 text-sm">
                        <div>
                          <dt className="text-neutral-blue-gray/60">Code</dt>
                          <dd className="font-medium">{selectedHospital.code || 'N/A'}</dd>
                        </div>
                        <div>
                          <dt className="text-neutral-blue-gray/60">Type</dt>
                          <dd className="font-medium">
                            {formatHospitalType(selectedHospital.hospitalType)}
                          </dd>
                        </div>
                        {selectedHospital.traumaLevel &&
                          selectedHospital.traumaLevel !== 'NONE' && (
                            <div>
                              <dt className="text-neutral-blue-gray/60">Trauma Level</dt>
                              <dd className="font-medium">
                                {selectedHospital.traumaLevel.replace('_', ' ')}
                              </dd>
                            </div>
                          )}
                        {selectedHospital.bedCapacity && (
                          <div>
                            <dt className="text-neutral-blue-gray/60">Bed Capacity</dt>
                            <dd className="font-medium">{selectedHospital.bedCapacity} beds</dd>
                          </div>
                        )}
                        <div>
                          <dt className="text-neutral-blue-gray/60">Emergency Services</dt>
                          <dd className="font-medium">
                            {selectedHospital.emergencyServices ? 'Available' : 'Not Available'}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    {/* Contact Information */}
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-blue-gray mb-3">
                        Contact Information
                      </h3>
                      <dl className="space-y-2 text-sm">
                        {selectedHospital.email && (
                          <div className="flex items-start gap-2">
                            <Mail className="h-4 w-4 text-neutral-blue-gray/50 mt-0.5" />
                            <div>
                              <dt className="text-neutral-blue-gray/60">Email</dt>
                              <dd className="font-medium">{selectedHospital.email}</dd>
                            </div>
                          </div>
                        )}
                        {(selectedHospital.phone || selectedHospital.phoneNumber) && (
                          <div className="flex items-start gap-2">
                            <Phone className="h-4 w-4 text-neutral-blue-gray/50 mt-0.5" />
                            <div>
                              <dt className="text-neutral-blue-gray/60">Phone</dt>
                              <dd className="font-medium">
                                {selectedHospital.phone || selectedHospital.phoneNumber}
                              </dd>
                            </div>
                          </div>
                        )}
                        {selectedHospital.website && (
                          <div>
                            <dt className="text-neutral-blue-gray/60">Website</dt>
                            <dd className="font-medium">
                              <a
                                href={selectedHospital.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-blue hover:underline"
                              >
                                {selectedHospital.website}
                              </a>
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>

                    {/* Address */}
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-blue-gray mb-3">Address</h3>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-neutral-blue-gray/50 mt-0.5" />
                        <div className="text-sm">
                          {selectedHospital.location ? (
                            <>
                              <p>{selectedHospital.location.address}</p>
                              <p>
                                {selectedHospital.location.district},{' '}
                                {selectedHospital.location.state}
                              </p>
                              <p>Pincode: {selectedHospital.location.pincode}</p>
                              <p>Country: {selectedHospital.location.countryCode}</p>
                            </>
                          ) : (
                            // Fallback for old format
                            <>
                              {selectedHospital.addressLine1 && (
                                <p>{selectedHospital.addressLine1}</p>
                              )}
                              {selectedHospital.addressLine2 && (
                                <p>{selectedHospital.addressLine2}</p>
                              )}
                              {selectedHospital.city && selectedHospital.state && (
                                <p>
                                  {selectedHospital.city}, {selectedHospital.state}{' '}
                                  {selectedHospital.zipCode}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Facility Details */}
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-blue-gray mb-3">
                        Facility Details
                      </h3>
                      <dl className="space-y-2 text-sm">
                        {selectedHospital.registrationNumber && (
                          <div>
                            <dt className="text-neutral-blue-gray/60">Registration Number</dt>
                            <dd className="font-medium">{selectedHospital.registrationNumber}</dd>
                          </div>
                        )}
                        {/* Fallback for old format */}
                        {!selectedHospital.registrationNumber && selectedHospital.licenseNumber && (
                          <div>
                            <dt className="text-neutral-blue-gray/60">License Number</dt>
                            <dd className="font-medium">{selectedHospital.licenseNumber}</dd>
                          </div>
                        )}
                        {selectedHospital.bedCapacity && (
                          <div>
                            <dt className="text-neutral-blue-gray/60">Bed Capacity</dt>
                            <dd className="font-medium">{selectedHospital.bedCapacity} beds</dd>
                          </div>
                        )}
                        {typeof selectedHospital.emergencyServices !== 'undefined' && (
                          <div>
                            <dt className="text-neutral-blue-gray/60">Emergency Services</dt>
                            <dd className="font-medium">
                              {selectedHospital.emergencyServices ? 'Available' : 'Not Available'}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>

                  {selectedHospital.metadata && (
                    <div className="mt-6 pt-6 border-t border-neutral-blue-gray/10">
                      <h3 className="text-sm font-semibold text-neutral-blue-gray mb-2">Notes</h3>
                      <p className="text-sm text-neutral-blue-gray/70 whitespace-pre-wrap">
                        {selectedHospital.metadata}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Hospital Admins Tab (SYSTEM_ADMIN only) */}
            {isSystemAdmin && (
              <TabsContent value="admins">
                <Card>
                  <div className="p-6 border-b border-neutral-blue-gray/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-h2 text-neutral-blue-gray">Hospital Administrators</h2>
                        <p className="text-sm text-neutral-blue-gray/60 mt-1">
                          Manage HOSPITAL_ADMIN users assigned to {selectedHospital.name}
                        </p>
                      </div>
                      <Button onClick={() => handleCreateAdmin(selectedHospital)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Hospital Admin
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-0">
                    {adminsLoading ? (
                      <div className="p-6 space-y-4">
                        <Skeleton className="h-12" />
                        <Skeleton className="h-12" />
                        <Skeleton className="h-12" />
                      </div>
                    ) : !hospitalAdmins || hospitalAdmins.length === 0 ? (
                      <div className="p-12 text-center">
                        <Shield className="h-12 w-12 mx-auto text-neutral-blue-gray/30 mb-4" />
                        <p className="text-neutral-blue-gray/60 mb-4">
                          No hospital administrators assigned yet
                        </p>
                        <Button onClick={() => handleCreateAdmin(selectedHospital)}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add First Hospital Admin
                        </Button>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>User ID</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Employment Type</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>Primary</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {hospitalAdmins.map((admin: HospitalStaffAssignment) => (
                            <TableRow key={admin.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-primary-blue" />
                                  {admin.userName || 'N/A'}
                                </div>
                              </TableCell>
                              <TableCell className="text-neutral-blue-gray/70">
                                {admin.userId}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {admin.userRole || 'Hospital Administrator'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-neutral-blue-gray/70">
                                {admin.employmentType?.replace('_', ' ')}
                              </TableCell>
                              <TableCell className="text-neutral-blue-gray/70 text-sm">
                                {admin.startDate ? formatDate(admin.startDate) : 'N/A'}
                              </TableCell>
                              <TableCell>
                                {admin.isPrimary && <Badge variant="success">Primary</Badge>}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* App Header */}
      <AppHeader
        title="Hospital Management"
        showBackButton
        backPath={isSystemAdmin ? '/platform/dashboard' : '/hospital-admin/dashboard'}
      />

      {/* Page Subheader */}
      <div className="bg-white border-b border-neutral-blue-gray/10 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <p className="text-body text-neutral-blue-gray/70">
              {isSystemAdmin
                ? 'Onboard and manage hospitals across the platform'
                : 'Manage hospitals, locations, departments, and staff assignments'}
            </p>
            {isSystemAdmin && (
              <Button onClick={() => setCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Onboard Hospital
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          {/* Filters */}
          <div className="p-6 border-b border-neutral-blue-gray/10">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-blue-gray/50" />
                <Input
                  placeholder="Search by name or district..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Hospitals</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="READY_FOR_REVIEW">Ready for Review</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="UNDER_CONSTRUCTION">Under Construction</SelectItem>
                  <SelectItem value="TEMPORARILY_CLOSED">Temporarily Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results count */}
            {!isLoading && (
              <div className="mt-4 text-sm text-neutral-blue-gray/60">
                Showing {hospitals.length} of {totalElements} hospitals
              </div>
            )}
          </div>

          {/* Table */}
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            ) : hospitals.length === 0 ? (
              <div className="p-12 text-center">
                <Building2 className="h-12 w-12 mx-auto text-neutral-blue-gray/30 mb-4" />
                <p className="text-neutral-blue-gray/60">No hospitals found</p>
                {(search || statusFilter !== 'ALL') && (
                  <Button
                    variant="link"
                    onClick={() => {
                      setSearch('')
                      setStatusFilter('ALL')
                    }}
                    className="mt-2"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hospital Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hospitals.map((hospital) => (
                      <TableRow
                        key={hospital.id}
                        className="cursor-pointer hover:bg-neutral-light/50"
                      >
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-primary-blue" />
                              {hospital.name}
                            </div>
                            {hospital.code && (
                              <Badge variant="outline" className="mt-1 w-fit">
                                {hospital.code}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-neutral-blue-gray/70 text-sm">
                          {formatHospitalType(hospital.hospitalType)}
                        </TableCell>
                        <TableCell className="text-neutral-blue-gray/70">
                          <div className="flex items-start gap-1">
                            <MapPin className="h-3 w-3 mt-1 text-neutral-blue-gray/50" />
                            <div className="text-sm">
                              {hospital.location ? (
                                <>
                                  <div>
                                    {hospital.location.district}, {hospital.location.state}
                                  </div>
                                  <div className="text-xs text-neutral-blue-gray/50">
                                    {hospital.location.pincode}
                                  </div>
                                </>
                              ) : (
                                <div className="text-xs text-neutral-blue-gray/50">
                                  No location set
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-neutral-blue-gray/70">
                          <div className="space-y-1 text-sm">
                            {(hospital.phone || hospital.phoneNumber) && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-neutral-blue-gray/50" />
                                {hospital.phone || hospital.phoneNumber}
                              </div>
                            )}
                            {hospital.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3 text-neutral-blue-gray/50" />
                                {hospital.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <HospitalStatusBadge status={hospital.status} />
                        </TableCell>
                        <TableCell className="text-neutral-blue-gray/70 text-sm">
                          {formatDate(hospital.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewHospital(hospital)}>
                                <Building2 className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditHospital(hospital)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Hospital
                              </DropdownMenuItem>
                              {isSystemAdmin && hospital.status === 'READY_FOR_REVIEW' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleApproveHospital(hospital)}
                                    className="text-wellness"
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Approve Hospital
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleRejectHospital(hospital)}
                                    className="text-error"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject Hospital
                                  </DropdownMenuItem>
                                </>
                              )}
                              {isSystemAdmin && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleCreateAdmin(hospital)}>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add Hospital Admin
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteHospital(hospital)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Hospital
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="p-4 border-t border-neutral-blue-gray/10">
              <div className="flex items-center justify-between">
                <div className="text-sm text-neutral-blue-gray/60">
                  Page {page + 1} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Modals */}
      <CreateHospitalWithAdminModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      {selectedHospital && (
        <>
          <EditHospitalModal
            open={editModalOpen}
            onClose={() => {
              setEditModalOpen(false)
              setSelectedHospital(null)
            }}
            hospital={selectedHospital}
          />

          {isSystemAdmin && (
            <>
              <CreateHospitalAdminModal
                open={createAdminModalOpen}
                onClose={() => {
                  setCreateAdminModalOpen(false)
                  setSelectedHospital(null)
                }}
                hospital={selectedHospital}
              />

              <ApproveHospitalModal
                open={approveModalOpen}
                onClose={() => {
                  setApproveModalOpen(false)
                  setSelectedHospital(null)
                }}
                hospital={selectedHospital}
              />

              <RejectHospitalModal
                open={rejectModalOpen}
                onClose={() => {
                  setRejectModalOpen(false)
                  setSelectedHospital(null)
                }}
                hospital={selectedHospital}
              />
            </>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hospital</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedHospital?.name}? This action cannot be
              undone. All associated locations, departments, and staff assignments will also be
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedHospital(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Hospital'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
