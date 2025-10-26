import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import { adminApi } from '@/lib/api'

interface EditUserModalProps {
  open: boolean
  onClose: () => void
  userId: string | null
}

export default function EditUserModal({ open, onClose, userId }: EditUserModalProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    active: true,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch user details
  const { data: user, isLoading } = useQuery({
    queryKey: ['admin', 'user', userId],
    queryFn: () => adminApi.getUserById(userId!),
    enabled: open && !!userId,
  })

  // Populate form when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        active: user.active ?? true,
      })
    }
  }, [user])

  const updateUserMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateUser(userId!, data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'User updated successfully',
      })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', userId] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
      handleClose()
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update user',
        variant: 'destructive',
      })
    },
  })

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const submitData: any = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      active: formData.active,
    }

    if (formData.phoneNumber.trim()) {
      submitData.phoneNumber = formData.phoneNumber.trim()
    }

    updateUserMutation.mutate(submitData)
  }

  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      active: true,
    })
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user details. To change the role, use the Change Role option.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email (read-only) */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="bg-neutral-light"
              />
              <p className="text-xs text-neutral-blue-gray/60 mt-1">
                Email address cannot be changed
              </p>
            </div>

            {/* First Name */}
            <div>
              <Label htmlFor="firstName">
                First Name <span className="text-error">*</span>
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Enter first name"
                className={errors.firstName ? 'border-error' : ''}
              />
              {errors.firstName && (
                <p className="text-sm text-error mt-1">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <Label htmlFor="lastName">
                Last Name <span className="text-error">*</span>
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Enter last name"
                className={errors.lastName ? 'border-error' : ''}
              />
              {errors.lastName && <p className="text-sm text-error mt-1">{errors.lastName}</p>}
            </div>

            {/* Phone Number */}
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            {/* Role (read-only) */}
            <div>
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={user?.role?.replace('_', ' ') || ''}
                disabled
                className="bg-neutral-light"
              />
              <p className="text-xs text-neutral-blue-gray/60 mt-1">
                Use Change Role option to modify user role
              </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-2 p-4 bg-neutral-light rounded-md">
              <Checkbox
                id="active"
                checked={formData.active}
                onCheckedChange={(checked: boolean) =>
                  setFormData({ ...formData, active: checked })
                }
              />
              <div className="flex-1">
                <Label htmlFor="active" className="text-sm font-medium cursor-pointer">
                  Active Account
                </Label>
                <p className="text-xs text-neutral-blue-gray/60 mt-1">
                  {formData.active
                    ? 'User can log in and access the system'
                    : 'User account is disabled'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending ? 'Updating...' : 'Update User'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
