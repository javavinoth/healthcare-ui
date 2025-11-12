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

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
] as const

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
        hospitalType: hospital.hospitalType,
        email: hospital.email,
        phone: hospital.phone,
        location: {
          address: hospital.location?.address || hospital.addressLine1 || '',
          district: hospital.location?.district || hospital.city || '',
          pincode: hospital.location?.pincode || hospital.zipCode || '',
          state: (hospital.location?.state || hospital.state || 'Maharashtra') as
            | 'Andhra Pradesh'
            | 'Arunachal Pradesh'
            | 'Assam'
            | 'Bihar'
            | 'Chhattisgarh'
            | 'Goa'
            | 'Gujarat'
            | 'Haryana'
            | 'Himachal Pradesh'
            | 'Jharkhand'
            | 'Karnataka'
            | 'Kerala'
            | 'Madhya Pradesh'
            | 'Maharashtra'
            | 'Manipur'
            | 'Meghalaya'
            | 'Mizoram'
            | 'Nagaland'
            | 'Odisha'
            | 'Punjab'
            | 'Rajasthan'
            | 'Sikkim'
            | 'Tamil Nadu'
            | 'Telangana'
            | 'Tripura'
            | 'Uttar Pradesh'
            | 'Uttarakhand'
            | 'West Bengal'
            | 'Andaman and Nicobar Islands'
            | 'Chandigarh'
            | 'Dadra and Nagar Haveli and Daman and Diu'
            | 'Delhi'
            | 'Jammu and Kashmir'
            | 'Ladakh'
            | 'Lakshadweep'
            | 'Puducherry',
          countryCode: hospital.location?.countryCode || 'IN',
          metadata: hospital.location?.metadata || '',
        },
        registrationNumber: hospital.registrationNumber || hospital.licenseNumber || '',
        bedCapacity: hospital.bedCapacity || 0,
        emergencyServices: hospital.emergencyServices ?? true,
        status: hospital.status,
        metadata: hospital.metadata || '',
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
            Update hospital information. All fields are required except metadata.
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
                placeholder="e.g., Apollo Hospital"
                {...register('name')}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="READY_FOR_REVIEW">Ready for Review</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                        <SelectItem value="UNDER_CONSTRUCTION">Under Construction</SelectItem>
                        <SelectItem value="TEMPORARILY_CLOSED">Temporarily Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && (
                  <p className="text-sm text-destructive">{errors.status.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact & Location Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-blue-gray border-b pb-2">
              Contact & Location
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
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
                  10-digit mobile number starting with 6-9
                </p>
                {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="location.address">
                Street Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="location.address"
                placeholder="123 MG Road, Sector 5"
                {...register('location.address')}
                className={errors.location?.address ? 'border-destructive' : ''}
              />
              {errors.location?.address && (
                <p className="text-sm text-destructive">{errors.location.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* District */}
              <div className="space-y-2">
                <Label htmlFor="location.district">
                  District <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="location.district"
                  placeholder="Mumbai"
                  {...register('location.district')}
                  className={errors.location?.district ? 'border-destructive' : ''}
                />
                {errors.location?.district && (
                  <p className="text-sm text-destructive">{errors.location.district.message}</p>
                )}
              </div>

              {/* Pincode */}
              <div className="space-y-2">
                <Label htmlFor="location.pincode">
                  Pincode <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="location.pincode"
                  placeholder="400001"
                  maxLength={6}
                  {...register('location.pincode')}
                  className={errors.location?.pincode ? 'border-destructive' : ''}
                />
                {errors.location?.pincode && (
                  <p className="text-sm text-destructive">{errors.location.pincode.message}</p>
                )}
              </div>

              {/* State */}
              <div className="space-y-2">
                <Label htmlFor="location.state">
                  State <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="location.state"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={errors.location?.state ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {INDIAN_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.location?.state && (
                  <p className="text-sm text-destructive">{errors.location.state.message}</p>
                )}
              </div>
            </div>

            {/* Country Code */}
            <div className="space-y-2">
              <Label htmlFor="location.countryCode">
                Country Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="location.countryCode"
                placeholder="IN"
                maxLength={2}
                {...register('location.countryCode')}
                className={errors.location?.countryCode ? 'border-destructive' : ''}
                readOnly
              />
              <p className="text-xs text-neutral-blue-gray/60">Defaults to IN (India)</p>
              {errors.location?.countryCode && (
                <p className="text-sm text-destructive">{errors.location.countryCode.message}</p>
              )}
            </div>
          </div>

          {/* Facility Details Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-blue-gray border-b pb-2">
              Facility Details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Registration Number */}
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">
                  Registration Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="registrationNumber"
                  placeholder="MH-2024-001"
                  {...register('registrationNumber')}
                  className={errors.registrationNumber ? 'border-destructive' : ''}
                />
                {errors.registrationNumber && (
                  <p className="text-sm text-destructive">{errors.registrationNumber.message}</p>
                )}
              </div>

              {/* Bed Capacity */}
              <div className="space-y-2">
                <Label htmlFor="bedCapacity">
                  Bed Capacity <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="bedCapacity"
                  type="number"
                  min="1"
                  max="10000"
                  placeholder="500"
                  {...register('bedCapacity', { valueAsNumber: true })}
                  className={errors.bedCapacity ? 'border-destructive' : ''}
                />
                {errors.bedCapacity && (
                  <p className="text-sm text-destructive">{errors.bedCapacity.message}</p>
                )}
              </div>
            </div>

            {/* Emergency Services */}
            <div className="space-y-2">
              <Label>
                Emergency Services <span className="text-destructive">*</span>
              </Label>
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

            {/* Metadata / Notes */}
            <div className="space-y-2">
              <Label htmlFor="metadata">Notes / Metadata (Optional)</Label>
              <Textarea
                id="metadata"
                placeholder="Additional information or notes about the hospital"
                rows={3}
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
