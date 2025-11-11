import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { adminApi, staffAssignmentApi } from '@/lib/api'
import { invalidateStaffAssignments } from '@/lib/queryClient'
import { extractErrorMessage } from '@/lib/utils/apiError'
import {
  createAndAssignHospitalAdminSchema,
  type CreateAndAssignHospitalAdminFormData,
} from '@/lib/validations/platform'
import type { Hospital } from '@/types'

interface CreateHospitalAdminModalProps {
  open: boolean
  onClose: () => void
  hospital: Hospital
}

/**
 * Create Hospital Admin Modal (SYSTEM_ADMIN only)
 *
 * Allows SYSTEM_ADMIN to create a HOSPITAL_ADMIN user and assign them to a hospital
 * in a single workflow. This enforces the restriction that SYSTEM_ADMIN can only
 * create HOSPITAL_ADMIN users.
 */
export default function CreateHospitalAdminModal({
  open,
  onClose,
  hospital,
}: CreateHospitalAdminModalProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<CreateAndAssignHospitalAdminFormData>({
    resolver: zodResolver(createAndAssignHospitalAdminSchema) as any,
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      sendInvitation: true,
      hospitalId: hospital.id,
      isPrimaryHospital: true,
      roleAtHospital: 'Hospital Administrator',
      employmentType: 'FULL_TIME',
      startDate: format(new Date(), 'yyyy-MM-dd'),
    },
  })

  const createAndAssignMutation = useMutation({
    mutationFn: async (data: CreateAndAssignHospitalAdminFormData) => {
      // Step 1: Create Hospital Admin user
      const user = await adminApi.createUser({
        email: data.email,
        password: data.password || undefined,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber || undefined,
        role: 'HOSPITAL_ADMIN',
        sendInvitation: data.sendInvitation,
      })

      // Step 2: Assign to hospital
      const assignment = await staffAssignmentApi.create({
        userId: user.id,
        hospitalId: data.hospitalId,
        locationIds: [],
        departmentIds: [],
        employmentType: data.employmentType as any,
        isPrimary: data.isPrimaryHospital,
        startDate: data.startDate || format(new Date(), 'yyyy-MM-dd'),
      })

      return { user, assignment }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Hospital Admin created and assigned successfully',
      })
      invalidateStaffAssignments(hospital.id)
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
      queryClient.invalidateQueries({ queryKey: ['platform', 'stats'] })
      handleClose()
    },
    onError: (error: unknown) => {
      const message = extractErrorMessage(error, 'Failed to create Hospital Admin')
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: CreateAndAssignHospitalAdminFormData) => {
    createAndAssignMutation.mutate(data)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const sendInvitation = watch('sendInvitation')

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Hospital Administrator</DialogTitle>
          <DialogDescription>
            Create a new Hospital Admin user and assign them to {hospital.name}. Fields marked with
            * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit) as any} className="space-y-6">
          {/* User Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-blue-gray border-b pb-2">
              User Information
            </h3>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@hospital.com"
                {...register('email')}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="Jane"
                  {...register('firstName')}
                  className={errors.firstName ? 'border-destructive' : ''}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName.message}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  {...register('lastName')}
                  className={errors.lastName ? 'border-destructive' : ''}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="9876543210"
                {...register('phoneNumber')}
                className={errors.phoneNumber ? 'border-destructive' : ''}
              />
              <p className="text-xs text-neutral-blue-gray/60">
                10-digit mobile number starting with 6-9 (required)
              </p>
              {errors.phoneNumber && (
                <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Leave empty to auto-generate"
                {...register('password')}
                className={errors.password ? 'border-destructive' : ''}
                disabled={sendInvitation}
              />
              <p className="text-xs text-neutral-blue-gray/60">
                {sendInvitation
                  ? 'Password will be auto-generated and sent via email'
                  : 'Min 8 chars with uppercase, lowercase, number, special char'}
              </p>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Send Invitation */}
            <div className="flex items-center space-x-2">
              <Controller
                name="sendInvitation"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="sendInvitation"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="sendInvitation" className="font-normal cursor-pointer">
                Send invitation email with login credentials
              </Label>
            </div>
          </div>

          {/* Assignment Details Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-blue-gray border-b pb-2">
              Assignment Details
            </h3>

            {/* Hospital (Read-only) */}
            <div className="space-y-2">
              <Label>Hospital</Label>
              <div className="p-3 bg-neutral-light rounded-md">
                <p className="text-sm font-medium text-neutral-blue-gray">{hospital.name}</p>
                <p className="text-xs text-neutral-blue-gray/60 mt-1">
                  {hospital.city}, {hospital.state}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Role at Hospital */}
              <div className="space-y-2">
                <Label htmlFor="roleAtHospital">Role Title</Label>
                <Input
                  id="roleAtHospital"
                  placeholder="Hospital Administrator"
                  {...register('roleAtHospital')}
                  className={errors.roleAtHospital ? 'border-destructive' : ''}
                />
                {errors.roleAtHospital && (
                  <p className="text-sm text-destructive">{errors.roleAtHospital.message}</p>
                )}
              </div>

              {/* Employment Type */}
              <div className="space-y-2">
                <Label htmlFor="employmentType">Employment Type</Label>
                <Controller
                  name="employmentType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={errors.employmentType ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FULL_TIME">Full Time</SelectItem>
                        <SelectItem value="PART_TIME">Part Time</SelectItem>
                        <SelectItem value="CONTRACT">Contract</SelectItem>
                        <SelectItem value="CONSULTANT">Consultant</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.employmentType && (
                  <p className="text-sm text-destructive">{errors.employmentType.message}</p>
                )}
              </div>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                {...register('startDate')}
                className={errors.startDate ? 'border-destructive' : ''}
              />
              {errors.startDate && (
                <p className="text-sm text-destructive">{errors.startDate.message}</p>
              )}
            </div>

            {/* Is Primary Hospital */}
            <div className="flex items-center space-x-2">
              <Controller
                name="isPrimaryHospital"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="isPrimaryHospital"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="isPrimaryHospital" className="font-normal cursor-pointer">
                Set as primary hospital for this administrator
              </Label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || createAndAssignMutation.isPending}>
              {createAndAssignMutation.isPending ? 'Creating...' : 'Create & Assign'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
