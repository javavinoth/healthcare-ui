import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { hospitalApi } from '@/lib/api'
import { invalidateHospitals } from '@/lib/queryClient'
import { extractErrorMessage } from '@/lib/utils/apiError'
import { updateHospitalSchema, type UpdateHospitalFormData } from '@/lib/validations/hospital'
import type { Hospital } from '@/types'

interface EditHospitalModalProps {
  open: boolean
  onClose: () => void
  hospital: Hospital
}

export default function EditHospitalModal({ open, onClose, hospital }: EditHospitalModalProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UpdateHospitalFormData>({
    resolver: zodResolver(updateHospitalSchema) as any,
  })

  // Reset form when hospital changes
  useEffect(() => {
    if (hospital) {
      reset({
        name: hospital.name,
        code: hospital.code || '',
        hospitalType: hospital.hospitalType,
        email: hospital.email || '',
        phone: hospital.phone || hospital.phoneNumber || '',
        website: hospital.website || '',
        addressLine1: hospital.addressLine1 || hospital.address || '',
        addressLine2: hospital.addressLine2 || '',
        city: hospital.city,
        state: hospital.state,
        zipCode: hospital.zipCode,
        country: hospital.country || 'US',
        licenseNumber: hospital.licenseNumber || '',
        taxId: hospital.taxId || '',
        bedCapacity: hospital.bedCapacity,
        traumaLevel: hospital.traumaLevel,
        emergencyServices: hospital.emergencyServices ?? true,
        accreditationInfo: hospital.accreditationInfo || '',
        metadata: hospital.metadata || '',
        status: hospital.status,
      })
    }
  }, [hospital, reset])

  const updateMutation = useMutation({
    mutationFn: (data: UpdateHospitalFormData) => hospitalApi.update(hospital.id, data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Hospital updated successfully',
      })
      invalidateHospitals()
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
      queryClient.invalidateQueries({ queryKey: ['platform', 'stats'] })
      handleClose()
    },
    onError: (error: unknown) => {
      const message = extractErrorMessage(error, 'Failed to update hospital')
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: UpdateHospitalFormData) => {
    updateMutation.mutate(data)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Hospital</DialogTitle>
          <DialogDescription>
            Update hospital information. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit) as any} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-blue-gray border-b pb-2">
              Basic Information
            </h3>

            {/* Hospital Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Hospital Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., City General Hospital"
                {...register('name')}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Hospital Code */}
              <div className="space-y-2">
                <Label htmlFor="code">Hospital Code</Label>
                <Input
                  id="code"
                  placeholder="e.g., CGH-001"
                  {...register('code')}
                  className={errors.code ? 'border-destructive' : ''}
                />
                {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
              </div>

              {/* Hospital Type */}
              <div className="space-y-2">
                <Label htmlFor="hospitalType">
                  Hospital Type <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="hospitalType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={errors.hospitalType ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GENERAL">General</SelectItem>
                        <SelectItem value="SPECIALTY">Specialty</SelectItem>
                        <SelectItem value="TEACHING">Teaching</SelectItem>
                        <SelectItem value="RESEARCH">Research</SelectItem>
                        <SelectItem value="COMMUNITY">Community</SelectItem>
                        <SelectItem value="CRITICAL_ACCESS">Critical Access</SelectItem>
                        <SelectItem value="REHABILITATION">Rehabilitation</SelectItem>
                        <SelectItem value="PSYCHIATRIC">Psychiatric</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.hospitalType && (
                  <p className="text-sm text-destructive">{errors.hospitalType.message}</p>
                )}
              </div>
            </div>

            {/* Hospital Status */}
            <div className="space-y-2">
              <Label htmlFor="status">
                Status <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={errors.status ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="UNDER_CONSTRUCTION">Under Construction</SelectItem>
                      <SelectItem value="TEMPORARILY_CLOSED">Temporarily Closed</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-blue-gray border-b pb-2">
              Contact Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@hospital.com"
                  {...register('email')}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  {...register('phone')}
                  className={errors.phone ? 'border-destructive' : ''}
                />
                <p className="text-xs text-neutral-blue-gray/60">
                  10-digit mobile number starting with 6-9 (required)
                </p>
                {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
              </div>
              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://hospital.com"
                  {...register('website')}
                  className={errors.website ? 'border-destructive' : ''}
                />
                {errors.website && (
                  <p className="text-sm text-destructive">{errors.website.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-blue-gray border-b pb-2">Address</h3>

            {/* Address Line 1 */}
            <div className="space-y-2">
              <Label htmlFor="addressLine1">
                Street Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="addressLine1"
                placeholder="123 Medical Center Drive"
                {...register('addressLine1')}
                className={errors.addressLine1 ? 'border-destructive' : ''}
              />
              {errors.addressLine1 && (
                <p className="text-sm text-destructive">{errors.addressLine1.message}</p>
              )}
            </div>

            {/* Address Line 2 */}
            <div className="space-y-2">
              <Label htmlFor="addressLine2">Address Line 2</Label>
              <Input
                id="addressLine2"
                placeholder="Building A, Suite 100"
                {...register('addressLine2')}
                className={errors.addressLine2 ? 'border-destructive' : ''}
              />
              {errors.addressLine2 && (
                <p className="text-sm text-destructive">{errors.addressLine2.message}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city">
                  City <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="city"
                  placeholder="New York"
                  {...register('city')}
                  className={errors.city ? 'border-destructive' : ''}
                />
                {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
              </div>

              {/* State */}
              <div className="space-y-2">
                <Label htmlFor="state">
                  State <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="state"
                  placeholder="NY"
                  maxLength={2}
                  {...register('state')}
                  className={errors.state ? 'border-destructive' : ''}
                />
                {errors.state && <p className="text-sm text-destructive">{errors.state.message}</p>}
              </div>

              {/* ZIP Code */}
              <div className="space-y-2">
                <Label htmlFor="zipCode">
                  ZIP Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="zipCode"
                  placeholder="10001"
                  {...register('zipCode')}
                  className={errors.zipCode ? 'border-destructive' : ''}
                />
                {errors.zipCode && (
                  <p className="text-sm text-destructive">{errors.zipCode.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Facility Details Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-blue-gray border-b pb-2">
              Facility Details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* License Number */}
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input
                  id="licenseNumber"
                  placeholder="HL-2024-001"
                  {...register('licenseNumber')}
                  className={errors.licenseNumber ? 'border-destructive' : ''}
                />
                {errors.licenseNumber && (
                  <p className="text-sm text-destructive">{errors.licenseNumber.message}</p>
                )}
              </div>

              {/* Tax ID */}
              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID / EIN</Label>
                <Input
                  id="taxId"
                  placeholder="12-3456789"
                  {...register('taxId')}
                  className={errors.taxId ? 'border-destructive' : ''}
                />
                {errors.taxId && <p className="text-sm text-destructive">{errors.taxId.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Bed Capacity */}
              <div className="space-y-2">
                <Label htmlFor="bedCapacity">Bed Capacity</Label>
                <Input
                  id="bedCapacity"
                  type="number"
                  min="1"
                  placeholder="500"
                  {...register('bedCapacity', { valueAsNumber: true })}
                  className={errors.bedCapacity ? 'border-destructive' : ''}
                />
                {errors.bedCapacity && (
                  <p className="text-sm text-destructive">{errors.bedCapacity.message}</p>
                )}
              </div>

              {/* Trauma Level */}
              <div className="space-y-2">
                <Label htmlFor="traumaLevel">Trauma Level</Label>
                <Controller
                  name="traumaLevel"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value || ''} onValueChange={field.onChange}>
                      <SelectTrigger className={errors.traumaLevel ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LEVEL_I">Level I</SelectItem>
                        <SelectItem value="LEVEL_II">Level II</SelectItem>
                        <SelectItem value="LEVEL_III">Level III</SelectItem>
                        <SelectItem value="LEVEL_IV">Level IV</SelectItem>
                        <SelectItem value="NONE">None</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.traumaLevel && (
                  <p className="text-sm text-destructive">{errors.traumaLevel.message}</p>
                )}
              </div>

              {/* Emergency Services */}
              <div className="space-y-2">
                <Label htmlFor="emergencyServices">Emergency Services</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Controller
                    name="emergencyServices"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="emergencyServices"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="emergencyServices" className="font-normal cursor-pointer">
                    Has emergency services
                  </Label>
                </div>
              </div>
            </div>

            {/* Accreditation Info */}
            <div className="space-y-2">
              <Label htmlFor="accreditationInfo">Accreditation Information</Label>
              <Textarea
                id="accreditationInfo"
                placeholder="e.g., Joint Commission Accredited - Status: Active"
                rows={2}
                {...register('accreditationInfo')}
                className={errors.accreditationInfo ? 'border-destructive' : ''}
              />
              {errors.accreditationInfo && (
                <p className="text-sm text-destructive">{errors.accreditationInfo.message}</p>
              )}
            </div>

            {/* Metadata / Notes */}
            <div className="space-y-2">
              <Label htmlFor="metadata">Notes / Metadata</Label>
              <Textarea
                id="metadata"
                placeholder="Additional information or notes about the hospital"
                rows={2}
                {...register('metadata')}
                className={errors.metadata ? 'border-destructive' : ''}
              />
              {errors.metadata && (
                <p className="text-sm text-destructive">{errors.metadata.message}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || updateMutation.isPending}>
              {updateMutation.isPending ? 'Updating...' : 'Update Hospital'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
