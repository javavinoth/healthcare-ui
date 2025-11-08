import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import { adminApi } from '@/lib/api'

interface ChangeRoleDialogProps {
  open: boolean
  onClose: () => void
  userId: string | null
}

export default function ChangeRoleDialog({ open, onClose, userId }: ChangeRoleDialogProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [selectedRole, setSelectedRole] = useState('')
  const [error, setError] = useState('')

  // Fetch user details
  const { data: user, isLoading } = useQuery({
    queryKey: ['admin', 'user', userId],
    queryFn: () => adminApi.getUserById(userId!),
    enabled: open && !!userId,
  })

  // Set initial role when user data is loaded
  useEffect(() => {
    if (user) {
      setSelectedRole(user.role)
    }
  }, [user])

  const changeRoleMutation = useMutation({
    mutationFn: (role: string) => adminApi.changeUserRole(userId!, role),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'User role changed successfully',
      })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', userId] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
      handleClose()
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to change user role',
        variant: 'destructive',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedRole) {
      setError('Please select a role')
      return
    }

    if (selectedRole === user?.role) {
      setError('Please select a different role')
      return
    }

    changeRoleMutation.mutate(selectedRole)
  }

  const handleClose = () => {
    setSelectedRole('')
    setError('')
    onClose()
  }

  const getRoleDescription = (role: string) => {
    const descriptions: Record<string, string> = {
      ADMIN: 'Full system access, user management, and administrative functions',
      DOCTOR: 'Access to patient records, appointments, and medical data',
      NURSE: 'Access to patient records, appointments, and care coordination',
      PATIENT: 'Access to personal health records and appointments',
      BILLING_STAFF: 'Access to billing, payments, and insurance information',
      RECEPTIONIST: 'Access to scheduling, appointments, and patient registration',
    }
    return descriptions[role] || ''
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>
            Change the user's role and access permissions. This will take effect immediately.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10" />
            <Skeleton className="h-20" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User Info */}
            <div className="p-4 bg-neutral-light rounded-md">
              <p className="text-sm font-medium text-neutral-blue-gray">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-neutral-blue-gray/60 mt-1">{user?.email}</p>
            </div>

            {/* Current Role */}
            <div>
              <Label>Current Role</Label>
              <div className="mt-2 p-3 bg-neutral-light rounded-md">
                <p className="text-sm font-medium text-neutral-blue-gray">
                  {user?.role?.replace('_', ' ')}
                </p>
                <p className="text-xs text-neutral-blue-gray/60 mt-1">
                  {getRoleDescription(user?.role || '')}
                </p>
              </div>
            </div>

            {/* New Role */}
            <div>
              <Label htmlFor="role">
                New Role <span className="text-error">*</span>
              </Label>
              <Select
                value={selectedRole}
                onValueChange={(value) => {
                  setSelectedRole(value)
                  setError('')
                }}
              >
                <SelectTrigger className={error ? 'border-error' : ''}>
                  <SelectValue placeholder="Select new role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                  <SelectItem value="DOCTOR">Doctor</SelectItem>
                  <SelectItem value="NURSE">Nurse</SelectItem>
                  <SelectItem value="PATIENT">Patient</SelectItem>
                  <SelectItem value="BILLING_STAFF">Billing Staff</SelectItem>
                  <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
                </SelectContent>
              </Select>
              {error && <p className="text-sm text-error mt-1">{error}</p>}
              {selectedRole && selectedRole !== user?.role && (
                <div className="mt-2 p-3 bg-info/10 rounded-md">
                  <p className="text-xs text-neutral-blue-gray/80">
                    {getRoleDescription(selectedRole)}
                  </p>
                </div>
              )}
            </div>

            {/* Warning */}
            {selectedRole && selectedRole !== user?.role && (
              <div className="flex gap-3 p-4 bg-warning/10 border border-warning/20 rounded-md">
                <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-blue-gray">Role Change Warning</p>
                  <p className="text-xs text-neutral-blue-gray/70 mt-1">
                    Changing the user's role will immediately affect their access permissions. Make
                    sure the user is aware of this change.
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  changeRoleMutation.isPending || !selectedRole || selectedRole === user?.role
                }
              >
                {changeRoleMutation.isPending ? 'Changing...' : 'Change Role'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
