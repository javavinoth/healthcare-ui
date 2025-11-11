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
import { useToast } from '@/components/ui/use-toast'
import { departmentApi } from '@/lib/api'
import { invalidateDepartments } from '@/lib/queryClient'
import { extractErrorMessage } from '@/lib/utils/apiError'
import { createDepartmentSchema, type CreateDepartmentFormData } from '@/lib/validations/hospital'
import type { Hospital } from '@/types'

interface CreateDepartmentModalProps {
  open: boolean
  onClose: () => void
  hospitals: Hospital[]
}

export default function CreateDepartmentModal({
  open,
  onClose,
  hospitals,
}: CreateDepartmentModalProps) {
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<CreateDepartmentFormData>({
    resolver: zodResolver(createDepartmentSchema),
    defaultValues: {
      hospitalId: '',
      name: '',
      code: '',
      description: '',
      phoneNumber: '',
    },
  })

  const hospitalId = watch('hospitalId')

  const createMutation = useMutation({
    mutationFn: (data: CreateDepartmentFormData) => departmentApi.create(data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Department created successfully',
      })
      invalidateDepartments()
      handleClose()
    },
    onError: (error: unknown) => {
      const message = extractErrorMessage(error, 'Failed to create department')
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: CreateDepartmentFormData) => {
    createMutation.mutate(data)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Department</DialogTitle>
          <DialogDescription>
            Create a new department within a hospital. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Department'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
