import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import type { PatientDetail } from '@/types'
import { providerApi } from '@/lib/api'
import { extractErrorMessage } from '@/lib/utils/apiError'

const patientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code')
    .optional()
    .or(z.literal('')),
  insuranceProvider: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
  insuranceGroupNumber: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
})

type PatientFormData = z.infer<typeof patientSchema>

interface EditPatientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: PatientDetail
}

export default function EditPatientDialog({ open, onOpenChange, patient }: EditPatientDialogProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [allergies, setAllergies] = useState<string[]>(patient.allergies || [])
  const [newAllergy, setNewAllergy] = useState('')
  const [medications, setMedications] = useState<string[]>(patient.currentMedications || [])
  const [newMedication, setNewMedication] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: patient.firstName,
      lastName: patient.lastName,
      phoneNumber: patient.phoneNumber || '',
      dateOfBirth: patient.dateOfBirth || '',
      gender: patient.gender || '',
      addressLine1: patient.address?.line1 || '',
      addressLine2: patient.address?.line2 || '',
      city: patient.address?.city || '',
      state: patient.address?.state || '',
      zipCode: patient.address?.zipCode || '',
      insuranceProvider: patient.insurance?.provider || '',
      insurancePolicyNumber: patient.insurance?.policyNumber || '',
      insuranceGroupNumber: patient.insurance?.groupNumber || '',
      emergencyContactName: patient.emergencyContact?.name || '',
      emergencyContactPhone: patient.emergencyContact?.phone || '',
      emergencyContactRelationship: patient.emergencyContact?.relationship || '',
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: PatientFormData) =>
      providerApi.updatePatient(patient.id, {
        ...data,
        allergies,
        currentMedications: medications,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-detail', patient.id] })
      queryClient.invalidateQueries({ queryKey: ['provider-patients'] })
      toast({
        title: 'Patient updated',
        description: 'Patient information has been updated successfully',
      })
      onOpenChange(false)
    },
    onError: (error: unknown) => {
      const message = extractErrorMessage(error, 'An error occurred')
      toast({
        title: 'Error updating patient',
        description: message,
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: PatientFormData) => {
    updateMutation.mutate(data)
  }

  const addAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()])
      setNewAllergy('')
    }
  }

  const removeAllergy = (allergy: string) => {
    setAllergies(allergies.filter((a) => a !== allergy))
  }

  const addMedication = () => {
    if (newMedication.trim() && !medications.includes(newMedication.trim())) {
      setMedications([...medications, newMedication.trim()])
      setNewMedication('')
    }
  }

  const removeMedication = (medication: string) => {
    setMedications(medications.filter((m) => m !== medication))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Patient Information</DialogTitle>
          <DialogDescription>Update patient demographics and medical information</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
              <TabsTrigger value="insurance">Insurance</TabsTrigger>
              <TabsTrigger value="emergency">Emergency</TabsTrigger>
            </TabsList>

            {/* Personal Tab */}
            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" {...register('firstName')} />
                  {errors.firstName && (
                    <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" {...register('lastName')} />
                  {errors.lastName && (
                    <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={watch('gender')}
                    onValueChange={(value) => setValue('gender', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                      <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" type="tel" {...register('phoneNumber')} />
              </div>

              {/* Allergies */}
              <div>
                <Label>Allergies</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    placeholder="Add allergy"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                  />
                  <Button type="button" onClick={addAllergy}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allergies.map((allergy) => (
                    <Badge key={allergy} variant="destructive">
                      {allergy}
                      <button type="button" onClick={() => removeAllergy(allergy)} className="ml-2">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Medications */}
              <div>
                <Label>Current Medications</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newMedication}
                    onChange={(e) => setNewMedication(e.target.value)}
                    placeholder="Add medication"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMedication())}
                  />
                  <Button type="button" onClick={addMedication}>
                    Add
                  </Button>
                </div>
                <div className="space-y-1">
                  {medications.map((medication) => (
                    <div
                      key={medication}
                      className="flex items-center justify-between bg-gray-100 p-2 rounded"
                    >
                      <span className="text-sm">{medication}</span>
                      <button type="button" onClick={() => removeMedication(medication)}>
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Address Tab */}
            <TabsContent value="address" className="space-y-4">
              <div>
                <Label htmlFor="addressLine1">Address Line 1</Label>
                <Input id="addressLine1" {...register('addressLine1')} />
              </div>
              <div>
                <Label htmlFor="addressLine2">Address Line 2</Label>
                <Input id="addressLine2" {...register('addressLine2')} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" {...register('city')} />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input id="state" {...register('state')} />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input id="zipCode" {...register('zipCode')} />
                  {errors.zipCode && (
                    <p className="text-sm text-destructive mt-1">{errors.zipCode.message}</p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Insurance Tab */}
            <TabsContent value="insurance" className="space-y-4">
              <div>
                <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                <Input id="insuranceProvider" {...register('insuranceProvider')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="insurancePolicyNumber">Policy Number</Label>
                  <Input id="insurancePolicyNumber" {...register('insurancePolicyNumber')} />
                </div>
                <div>
                  <Label htmlFor="insuranceGroupNumber">Group Number</Label>
                  <Input id="insuranceGroupNumber" {...register('insuranceGroupNumber')} />
                </div>
              </div>
            </TabsContent>

            {/* Emergency Contact Tab */}
            <TabsContent value="emergency" className="space-y-4">
              <div>
                <Label htmlFor="emergencyContactName">Contact Name</Label>
                <Input id="emergencyContactName" {...register('emergencyContactName')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                  <Input
                    id="emergencyContactPhone"
                    type="tel"
                    {...register('emergencyContactPhone')}
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                  <Input
                    id="emergencyContactRelationship"
                    {...register('emergencyContactRelationship')}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
