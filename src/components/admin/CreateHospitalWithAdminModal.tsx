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
import { useToast } from '@/components/ui/use-toast'
import { hospitalApi } from '@/lib/api'
import { invalidateHospitals } from '@/lib/queryClient'
import { extractErrorMessage } from '@/lib/utils/apiError'
import {
  createHospitalWithAdminSchema,
  type CreateHospitalWithAdminFormData,
} from '@/lib/validations/hospital'
import { Info } from 'lucide-react'

interface CreateHospitalWithAdminModalProps {
  open: boolean
  onClose: () => void
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
]

/**
 * Create Hospital with Admin Modal (SYSTEM_ADMIN only)
 * Creates a hospital with minimal information + hospital admin user in one operation
 * Hospital starts with PENDING status
 */
export default function CreateHospitalWithAdminModal({
  open,
  onClose,
}: CreateHospitalWithAdminModalProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<CreateHospitalWithAdminFormData>({
    resolver: zodResolver(createHospitalWithAdminSchema) as any,
    defaultValues: {
      hospitalName: '',
      district: '',
      pincode: '',
      state: '',
      adminFirstName: '',
      adminLastName: '',
      adminEmail: '',
      adminPhone: '',
      sendInvitation: true,
    },
  })

  const sendInvitation = watch('sendInvitation')

  const createMutation = useMutation({
    mutationFn: hospitalApi.createWithAdmin,
    onSuccess: (response) => {
      toast({
        title: 'Success',
        description: response.message || 'Hospital and admin created successfully',
      })
      invalidateHospitals()
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
      queryClient.invalidateQueries({ queryKey: ['platform', 'stats'] })
      handleClose()
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: extractErrorMessage(error),
      })
    },
  })

  const onSubmit = (data: CreateHospitalWithAdminFormData) => {
    createMutation.mutate(data)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Hospital with Admin</DialogTitle>
          <DialogDescription>
            Create a new hospital with minimal information and assign a hospital admin. The hospital
            will start with PENDING status until the admin completes the details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Info Banner */}
          <div className="flex gap-3 rounded-md bg-info/10 p-3 border border-info/20">
            <Info className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
            <div className="text-sm text-info-foreground">
              <p className="font-semibold">Approval Workflow</p>
              <p className="mt-1">
                Hospital will be created with <strong>PENDING</strong> status. The hospital admin
                can complete the details and mark it ready for your review and approval.
              </p>
            </div>
          </div>

          {/* Hospital Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Hospital Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="hospitalName">
                  Hospital Name <span className="text-error">*</span>
                </Label>
                <Input
                  id="hospitalName"
                  {...register('hospitalName')}
                  placeholder="e.g., Apollo Multispecialty Hospital"
                  className="mt-1"
                />
                {errors.hospitalName && (
                  <p className="text-sm text-error mt-1">{errors.hospitalName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="district">
                  District <span className="text-error">*</span>
                </Label>
                <Input
                  id="district"
                  {...register('district')}
                  placeholder="e.g., Chennai Central"
                  className="mt-1"
                />
                {errors.district && (
                  <p className="text-sm text-error mt-1">{errors.district.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="pincode">
                  Pincode <span className="text-error">*</span>
                </Label>
                <Input
                  id="pincode"
                  {...register('pincode')}
                  placeholder="e.g., 600001"
                  maxLength={6}
                  className="mt-1"
                />
                {errors.pincode && (
                  <p className="text-sm text-error mt-1">{errors.pincode.message}</p>
                )}
              </div>

              <div className="col-span-2">
                <Label htmlFor="state">
                  State <span className="text-error">*</span>
                </Label>
                <Controller
                  name="state"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.state && <p className="text-sm text-error mt-1">{errors.state.message}</p>}
              </div>
            </div>
          </div>

          {/* Hospital Admin Details */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold">Hospital Admin Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="adminFirstName">
                  First Name <span className="text-error">*</span>
                </Label>
                <Input
                  id="adminFirstName"
                  {...register('adminFirstName')}
                  placeholder="e.g., Rajesh"
                  className="mt-1"
                />
                {errors.adminFirstName && (
                  <p className="text-sm text-error mt-1">{errors.adminFirstName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="adminLastName">
                  Last Name <span className="text-error">*</span>
                </Label>
                <Input
                  id="adminLastName"
                  {...register('adminLastName')}
                  placeholder="e.g., Kumar"
                  className="mt-1"
                />
                {errors.adminLastName && (
                  <p className="text-sm text-error mt-1">{errors.adminLastName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="adminEmail">
                  Email <span className="text-error">*</span>
                </Label>
                <Input
                  id="adminEmail"
                  type="email"
                  {...register('adminEmail')}
                  placeholder="e.g., rajesh.kumar@apollo.com"
                  className="mt-1"
                />
                {errors.adminEmail && (
                  <p className="text-sm text-error mt-1">{errors.adminEmail.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="adminPhone">
                  Phone Number <span className="text-error">*</span>
                </Label>
                <Input
                  id="adminPhone"
                  {...register('adminPhone')}
                  placeholder="e.g., 9876543210"
                  maxLength={10}
                  className="mt-1"
                />
                {errors.adminPhone && (
                  <p className="text-sm text-error mt-1">{errors.adminPhone.message}</p>
                )}
              </div>

              <div className="col-span-2">
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
                  <Label
                    htmlFor="sendInvitation"
                    className="text-sm font-normal cursor-pointer select-none"
                  >
                    Send invitation email with auto-generated password
                  </Label>
                </div>
                {sendInvitation && (
                  <p className="text-sm text-muted-foreground mt-2 ml-6">
                    An email will be sent to the admin with login credentials and instructions.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Hospital & Admin'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
