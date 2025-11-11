import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { departmentApi } from '@/lib/api'
import { invalidateDepartments } from '@/lib/queryClient'
import { extractErrorMessage } from '@/lib/utils/apiError'
import { updateDepartmentSchema, type UpdateDepartmentFormData } from '@/lib/validations/hospital'
import type { Department, Hospital } from '@/types'

interface EditDepartmentModalProps {
  open: boolean
  onClose: () => void
  department: Department
  hospitals: Hospital[]
}

export default function EditDepartmentModal({
  open,
  onClose,
  department,
  hospitals,
}: EditDepartmentModalProps) {
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<UpdateDepartmentFormData>({
    resolver: zodResolver(updateDepartmentSchema),
    defaultValues: {
      hospitalId: department.hospitalId,
      name: department.name,
      code: department.code,
      description: department.description || '',
      phoneNumber: department.phoneNumber || '',
      active: department.active,
    },
  })

  const hospitalId = watch('hospitalId')
  const active = watch('active')

  // Reset form when department changes
  useEffect(() => {
    if (department) {
      reset({
        hospitalId: department.hospitalId,
        name: department.name,
        code: department.code,
        description: department.description || '',
        phoneNumber: department.phoneNumber || '',
        active: department.active,
      })
    }
  }, [department, reset])

  const updateMutation = useMutation({
    mutationFn: (data: UpdateDepartmentFormData) => departmentApi.update(department.id, data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Department updated successfully',
      })
      invalidateDepartments()
      handleClose()
    },
    onError: (error: unknown) => {
      const message = extractErrorMessage(error, 'Failed to update department')
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: UpdateDepartmentFormData) => {
    updateMutation.mutate(data)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Department</DialogTitle>
          <DialogDescription>
            Update department information. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Active Status Toggle */}
          <div className="flex items-center justify-between p-4 bg-neutral-light rounded-lg">
            <div>
              <Label htmlFor="active" className="text-base font-medium">
                Department Status
              </Label>
              <p className="text-sm text-neutral-blue-gray/60">
                {active ? 'Department is currently active' : 'Department is currently inactive'}
              </p>
            </div>
            <Switch
              id="active"
              checked={active}
              onCheckedChange={(checked) => setValue('active', checked)}
            />
          </div>

          {/* Hospital Selection */}
          <div className="space-y-2">
            <Label htmlFor="hospitalId">
              Hospital <span className="text-destructive">*</span>
            </Label>
            <Select value={hospitalId} onValueChange={(value) => setValue('hospitalId', value)}>
              <SelectTrigger className={errors.hospitalId ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select a hospital" />
              </SelectTrigger>
              <SelectContent>
                {hospitals.map((hospital) => (
                  <SelectItem key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.hospitalId && (
              <p className="text-sm text-destructive">{errors.hospitalId.message}</p>
            )}
          </div>

          {/* Department Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Department Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Cardiology"
              {...register('name')}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          {/* Department Code */}
          <div className="space-y-2">
            <Label htmlFor="code">
              Department Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="code"
              placeholder="e.g., CARDIO-01"
              {...register('code')}
              className={errors.code ? 'border-destructive' : ''}
            />
            <p className="text-xs text-neutral-blue-gray/60">
              Unique code for the department (uppercase letters, numbers, hyphens, underscores)
            </p>
            {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
          </div>

          {/* Description (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="e.g., Specializes in heart and cardiovascular care"
              rows={3}
              {...register('description')}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
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

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
