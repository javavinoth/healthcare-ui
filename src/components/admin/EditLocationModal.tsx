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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { locationApi } from '@/lib/api'
import { invalidateLocations } from '@/lib/queryClient'
import { extractErrorMessage } from '@/lib/utils/apiError'
import { updateLocationSchema, type UpdateLocationFormData } from '@/lib/validations/hospital'
import type { Location, Hospital } from '@/types'

interface EditLocationModalProps {
  open: boolean
  onClose: () => void
  location: Location
  hospitals: Hospital[]
}

export default function EditLocationModal({
  open,
  onClose,
  location,
  hospitals,
}: EditLocationModalProps) {
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<UpdateLocationFormData>({
    resolver: zodResolver(updateLocationSchema),
    defaultValues: {
      hospitalId: location.hospitalId,
      name: location.name,
      code: location.code,
      address: location.address || '',
      floor: location.floor || '',
      buildingNumber: location.buildingNumber || '',
      phoneNumber: location.phoneNumber || '',
      active: location.active,
    },
  })

  const hospitalId = watch('hospitalId')
  const active = watch('active')

  // Reset form when location changes
  useEffect(() => {
    if (location) {
      reset({
        hospitalId: location.hospitalId,
        name: location.name,
        code: location.code,
        address: location.address || '',
        floor: location.floor || '',
        buildingNumber: location.buildingNumber || '',
        phoneNumber: location.phoneNumber || '',
        active: location.active,
      })
    }
  }, [location, reset])

  const updateMutation = useMutation({
    mutationFn: (data: UpdateLocationFormData) => locationApi.update(location.id, data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Location updated successfully',
      })
      invalidateLocations()
      handleClose()
    },
    onError: (error: unknown) => {
      const message = extractErrorMessage(error, 'Failed to update location')
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: UpdateLocationFormData) => {
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
          <DialogTitle>Edit Location</DialogTitle>
          <DialogDescription>
            Update location information. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Active Status Toggle */}
          <div className="flex items-center justify-between p-4 bg-neutral-light rounded-lg">
            <div>
              <Label htmlFor="active" className="text-base font-medium">
                Location Status
              </Label>
              <p className="text-sm text-neutral-blue-gray/60">
                {active ? 'Location is currently active' : 'Location is currently inactive'}
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
            <Button type="submit" disabled={isSubmitting || updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
