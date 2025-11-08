import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { adminApi } from '@/lib/api'

interface CreateUserModalProps {
  open: boolean
  onClose: () => void
}

export default function CreateUserModal({ open, onClose }: CreateUserModalProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: '',
    password: '',
    sendInvitation: true,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const createUserMutation = useMutation({
    mutationFn: (data: {
      email: string
      password?: string
      firstName: string
      lastName: string
      phoneNumber?: string
      role: string
      sendInvitation?: boolean
    }) => adminApi.createUser(data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: formData.sendInvitation
          ? 'User created and invitation email sent'
          : 'User created successfully',
      })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
      handleClose()
    },
    onError: (error: unknown) => {
      const apiError = error as { response?: { data?: { message?: string } } }
      toast({
        title: 'Error',
        description: apiError.response?.data?.message || 'Failed to create user',
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

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!formData.role) {
      newErrors.role = 'Role is required'
    }

    // If not sending invitation and no password provided
    if (!formData.sendInvitation && !formData.password.trim()) {
      newErrors.password = 'Password is required when not sending invitation'
    }

    // Password strength validation if provided
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const submitData: {
      email: string
      password?: string
      firstName: string
      lastName: string
      phoneNumber?: string
      role: string
      sendInvitation?: boolean
    } = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      role: formData.role,
      sendInvitation: formData.sendInvitation,
    }

    if (formData.phoneNumber.trim()) {
      submitData.phoneNumber = formData.phoneNumber.trim()
    }

    // Only send password if not sending invitation and password is provided
    if (!formData.sendInvitation && formData.password) {
      submitData.password = formData.password
    }

    createUserMutation.mutate(submitData)
  }

  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      role: '',
      password: '',
      sendInvitation: true,
    })
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new user to the system. An invitation email will be sent with login credentials.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            {errors.firstName && <p className="text-sm text-error mt-1">{errors.firstName}</p>}
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

          {/* Email */}
          <div>
            <Label htmlFor="email">
              Email <span className="text-error">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@example.com"
              className={errors.email ? 'border-error' : ''}
            />
            {errors.email && <p className="text-sm text-error mt-1">{errors.email}</p>}
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

          {/* Role */}
          <div>
            <Label htmlFor="role">
              Role <span className="text-error">*</span>
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger className={errors.role ? 'border-error' : ''}>
                <SelectValue placeholder="Select user role" />
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
            {errors.role && <p className="text-sm text-error mt-1">{errors.role}</p>}
          </div>

          {/* Send Invitation Checkbox */}
          <div className="flex items-center space-x-2 p-4 bg-neutral-light rounded-md">
            <Checkbox
              id="sendInvitation"
              checked={formData.sendInvitation}
              onCheckedChange={(checked: boolean) =>
                setFormData({ ...formData, sendInvitation: checked })
              }
            />
            <div className="flex-1">
              <Label htmlFor="sendInvitation" className="text-sm font-medium cursor-pointer">
                Send invitation email
              </Label>
              <p className="text-xs text-neutral-blue-gray/60 mt-1">
                {formData.sendInvitation
                  ? 'A temporary password will be generated and sent via email'
                  : 'You must provide a password below'}
              </p>
            </div>
          </div>

          {/* Password (only if not sending invitation) */}
          {!formData.sendInvitation && (
            <div>
              <Label htmlFor="password">
                Password <span className="text-error">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password (min 8 characters)"
                className={errors.password ? 'border-error' : ''}
              />
              {errors.password && <p className="text-sm text-error mt-1">{errors.password}</p>}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createUserMutation.isPending}>
              {createUserMutation.isPending ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
