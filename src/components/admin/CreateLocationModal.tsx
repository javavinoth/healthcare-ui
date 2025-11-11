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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { locationApi } from '@/lib/api'
import { invalidateLocations } from '@/lib/queryClient'
import { extractErrorMessage } from '@/lib/utils/apiError'
import { createLocationSchema, type CreateLocationFormData } from '@/lib/validations/hospital'
import type { Hospital } from '@/types'

interface CreateLocationModalProps {
  open: boolean
  onClose: () => void
  hospitals: Hospital[]
}

export default function CreateLocationModal({
  open,
  onClose,
  hospitals,
}: CreateLocationModalProps) {
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<CreateLocationFormData>({
    resolver: zodResolver(createLocationSchema),
    defaultValues: {
      hospitalId: '',
      name: '',
      code: '',
      address: '',
      floor: '',
      buildingNumber: '',
      phoneNumber: '',
    },
  })

  const hospitalId = watch('hospitalId')

  const createMutation = useMutation({
    mutationFn: (data: CreateLocationFormData) => locationApi.create(data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Location created successfully',
      })
      invalidateLocations()
      handleClose()
    },
    onError: (error: unknown) => {
      const message = extractErrorMessage(error, 'Failed to create location')
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: CreateLocationFormData) => {
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
          <DialogTitle>Add New Location</DialogTitle>
          <DialogDescription>
            Create a new location within a hospital. All fields marked with * are required.
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

          {/* Location Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Location Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Main Building - East Wing"
              {...register('name')}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          {/* Location Code */}
          <div className="space-y-2">
            <Label htmlFor="code">
              Location Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="code"
              placeholder="e.g., MB-EW-01"
              {...register('code')}
              className={errors.code ? 'border-destructive' : ''}
            />
            <p className="text-xs text-neutral-blue-gray/60">
              Unique code for the location (uppercase letters, numbers, hyphens, underscores)
            </p>
            {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
          </div>

          {/* Address (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="address">Address (Optional)</Label>
            <Input
              id="address"
              placeholder="e.g., 123 Main Street, Suite 200"
              {...register('address')}
              className={errors.address ? 'border-destructive' : ''}
            />
            {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
          </div>

          {/* Floor and Building Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Floor */}
            <div className="space-y-2">
              <Label htmlFor="floor">Floor (Optional)</Label>
              <Input
                id="floor"
                placeholder="e.g., 3rd Floor"
                {...register('floor')}
                className={errors.floor ? 'border-destructive' : ''}
              />
              {errors.floor && <p className="text-sm text-destructive">{errors.floor.message}</p>}
            </div>

            {/* Building Number */}
            <div className="space-y-2">
              <Label htmlFor="buildingNumber">Building Number (Optional)</Label>
              <Input
                id="buildingNumber"
                placeholder="e.g., Building A"
                {...register('buildingNumber')}
                className={errors.buildingNumber ? 'border-destructive' : ''}
              />
              {errors.buildingNumber && (
                <p className="text-sm text-destructive">{errors.buildingNumber.message}</p>
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

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Location'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
