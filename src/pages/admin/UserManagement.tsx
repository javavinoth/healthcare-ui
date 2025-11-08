import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import {
  Users,
  UserPlus,
  Search,
  MoreVertical,
  Edit,
  Shield,
  Power,
  PowerOff,
  Mail,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
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
import { useToast } from '@/components/ui/use-toast'
import AppHeader from '@/components/shared/AppHeader'
import { adminApi } from '@/lib/api'
import CreateUserModal from '@/components/admin/CreateUserModal'
import EditUserModal from '@/components/admin/EditUserModal'
import ChangeRoleDialog from '@/components/admin/ChangeRoleDialog'

/**
 * User Management Page
 * Full user administration interface
 */
export default function UserManagement() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // State for filters and pagination
  const [page, setPage] = useState(0)
  const [size] = useState(20)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [sortBy] = useState('createdAt')
  const [sortDir] = useState('DESC')

  // Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [changeRoleDialogOpen, setChangeRoleDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  // Handle URL params for create action
  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'create') {
      setCreateModalOpen(true)
      // Remove the action param
      searchParams.delete('action')
      setSearchParams(searchParams)
    }
  }, [searchParams, setSearchParams])

  // Fetch users with filters
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin', 'users', page, size, roleFilter, search, sortBy, sortDir],
    queryFn: () =>
      adminApi.getAllUsers({
        page,
        size,
        role: roleFilter || undefined,
        search: search || undefined,
        sortBy,
        sortDir,
      }),
  })

  const users = usersData?.data || []
  const totalPages = usersData?.totalPages || 0
  const totalElements = usersData?.total || 0

  // Mutations for user actions
  const activateMutation = useMutation({
    mutationFn: (userId: string) => adminApi.activateUser(userId),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'User activated successfully',
      })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to activate user',
        variant: 'destructive',
      })
    },
  })

  const deactivateMutation = useMutation({
    mutationFn: (userId: string) => adminApi.deactivateUser(userId),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'User deactivated successfully',
      })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to deactivate user',
        variant: 'destructive',
      })
    },
  })

  const sendInvitationMutation = useMutation({
    mutationFn: (userId: string) => adminApi.sendInvitation(userId),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Invitation email sent successfully',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to send invitation email',
        variant: 'destructive',
      })
    },
  })

  // Handler functions
  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(0) // Reset to first page
  }

  const handleRoleFilter = (value: string) => {
    setRoleFilter(value === 'ALL' ? '' : value)
    setPage(0) // Reset to first page
  }

  const handleActivate = (userId: string) => {
    activateMutation.mutate(userId)
  }

  const handleDeactivate = (userId: string) => {
    deactivateMutation.mutate(userId)
  }

  const handleSendInvitation = (userId: string) => {
    sendInvitationMutation.mutate(userId)
  }

  const handleEditUser = (userId: string) => {
    setSelectedUserId(userId)
    setEditModalOpen(true)
  }

  const handleChangeRole = (userId: string) => {
    setSelectedUserId(userId)
    setChangeRoleDialogOpen(true)
  }

  const getRoleBadgeVariant = (role: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      ADMIN: 'destructive',
      DOCTOR: 'default',
      NURSE: 'default',
      PATIENT: 'secondary',
      BILLING_STAFF: 'secondary',
      RECEPTIONIST: 'secondary',
    }
    return variants[role] || 'default'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* App Header */}
      <AppHeader title="User Management" showBackButton backPath="/admin/dashboard" />

      {/* Page Subheader */}
      <div className="bg-white border-b border-neutral-blue-gray/10 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <p className="text-body text-neutral-blue-gray/70">
              Manage all system users and their roles
            </p>
            <Button onClick={() => setCreateModalOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Create User
            </Button>
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
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Role Filter */}
              <Select value={roleFilter || 'ALL'} onValueChange={handleRoleFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Roles</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="DOCTOR">Doctor</SelectItem>
                  <SelectItem value="NURSE">Nurse</SelectItem>
                  <SelectItem value="PATIENT">Patient</SelectItem>
                  <SelectItem value="BILLING_STAFF">Billing Staff</SelectItem>
                  <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results count */}
            {!isLoading && (
              <div className="mt-4 text-sm text-neutral-blue-gray/60">
                Showing {users.length} of {totalElements} users
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
            ) : users.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto text-neutral-blue-gray/30 mb-4" />
                <p className="text-neutral-blue-gray/60">No users found</p>
                {(search || roleFilter) && (
                  <Button
                    variant="link"
                    onClick={() => {
                      setSearch('')
                      setRoleFilter('')
                    }}
                    className="mt-2"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell className="text-neutral-blue-gray/70">
                        <div className="flex items-center gap-2">
                          {user.email}
                          {user.emailVerified && <CheckCircle2 className="h-4 w-4 text-wellness" />}
                        </div>
                      </TableCell>
                      <TableCell className="text-neutral-blue-gray/70">
                        {user.phoneNumber || '-'}
                      </TableCell>
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
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditUser(user.id)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleChangeRole(user.id)}>
                              <Shield className="h-4 w-4 mr-2" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.active ? (
                              <DropdownMenuItem onClick={() => handleDeactivate(user.id)}>
                                <PowerOff className="h-4 w-4 mr-2" />
                                Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleActivate(user.id)}>
                                <Power className="h-4 w-4 mr-2" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleSendInvitation(user.id)}>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Invitation
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="p-6 border-t border-neutral-blue-gray/10">
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
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Modals */}
      <CreateUserModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} />
      <EditUserModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setSelectedUserId(null)
        }}
        userId={selectedUserId}
      />
      <ChangeRoleDialog
        open={changeRoleDialogOpen}
        onClose={() => {
          setChangeRoleDialogOpen(false)
          setSelectedUserId(null)
        }}
        userId={selectedUserId}
      />
    </div>
  )
}
