import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { providerApi } from '@/lib/api'
import type { MedicationRoute } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { extractErrorMessage } from '@/lib/utils/apiError'
import { Loader2, Pill, Plus } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuthStore } from '@/stores/authStore'

const prescriptionSchema = z.object({
  medicationName: z.string().min(1, 'Medication name is required').max(200),
  dosage: z.string().min(1, 'Dosage is required').max(100),
  route: z.string().optional(),
  frequency: z.string().min(1, 'Frequency is required').max(100),
  duration: z.string().max(100).optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  refills: z.number().min(0, 'Refills cannot be negative').max(12, 'Refills cannot exceed 12'),
  instructions: z.string().max(2000).optional(),
  diagnosis: z.string().max(500).optional(),
  pharmacyNotes: z.string().max(2000).optional(),
  expiresAt: z.string().optional(),
})

type PrescriptionFormData = z.infer<typeof prescriptionSchema>

interface PrescriptionFormProps {
  patientId: string
  patientName: string
  visitNoteId?: string
  trigger?: React.ReactNode
}

const MEDICATION_ROUTES: { value: MedicationRoute; label: string }[] = [
  { value: 'ORAL', label: 'Oral' },
  { value: 'TOPICAL', label: 'Topical' },
  { value: 'INJECTION', label: 'Injection' },
  { value: 'INTRAVENOUS', label: 'Intravenous (IV)' },
  { value: 'SUBLINGUAL', label: 'Sublingual' },
  { value: 'RECTAL', label: 'Rectal' },
  { value: 'TRANSDERMAL', label: 'Transdermal (Patch)' },
  { value: 'INHALATION', label: 'Inhalation' },
  { value: 'OPHTHALMIC', label: 'Ophthalmic (Eye)' },
  { value: 'OTIC', label: 'Otic (Ear)' },
  { value: 'NASAL', label: 'Nasal' },
]

export default function PrescriptionForm({
  patientId,
  patientName,
  visitNoteId,
  trigger,
}: PrescriptionFormProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const { user } = useAuthStore()

  // Only doctors can prescribe medications
  const canPrescribe = user?.role === 'doctor'

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      medicationName: '',
      dosage: '',
      route: '',
      frequency: '',
      duration: '',
      quantity: 30,
      refills: 0,
      instructions: '',
      diagnosis: '',
      pharmacyNotes: '',
      expiresAt: '',
    },
  })

  const route = watch('route')
  const instructions = watch('instructions')
  const diagnosis = watch('diagnosis')
  const pharmacyNotes = watch('pharmacyNotes')

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  // Create prescription mutation
  const createMutation = useMutation({
    mutationFn: (data: PrescriptionFormData) =>
      providerApi.createPrescription(patientId, {
        ...data,
        route: data.route && data.route.length > 0 ? (data.route as MedicationRoute) : undefined,
        visitNoteId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['provider', 'patients', patientId, 'prescriptions'],
      })
      queryClient.invalidateQueries({ queryKey: ['provider', 'patients', patientId, 'timeline'] })
      toast({
        title: 'Prescription Created',
        description: 'Prescription has been saved successfully.',
      })
      setOpen(false)
      reset()
    },
    onError: (error: unknown) => {
      const message = extractErrorMessage(error, 'Failed to create prescription. Please try again.')
      toast({
        title: 'Failed to Create Prescription',
        description: message,
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: PrescriptionFormData) => {
    createMutation.mutate(data)
  }

  if (!canPrescribe) {
    return (
      <Button disabled variant="outline" className="cursor-not-allowed">
        <Pill className="h-4 w-4 mr-2" />
        Write Prescription (Doctors Only)
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Write Prescription
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Write Prescription
          </DialogTitle>
          <DialogDescription>Create new prescription for {patientName}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4" aria-label="Prescription form content">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Medication Name */}
            <div className="space-y-2">
              <Label htmlFor="medicationName">
                Medication Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="medicationName"
                {...register('medicationName')}
                placeholder="e.g., Amoxicillin"
                maxLength={200}
                autoFocus
              />
              {errors.medicationName && (
                <p className="text-sm text-destructive">{errors.medicationName.message}</p>
              )}
            </div>

            {/* Dosage and Route */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dosage">
                  Dosage <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dosage"
                  {...register('dosage')}
                  placeholder="e.g., 500 mg"
                  maxLength={100}
                />
                {errors.dosage && (
                  <p className="text-sm text-destructive">{errors.dosage.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="route">Route</Label>
                <Select value={route} onValueChange={(value) => setValue('route', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select route" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEDICATION_ROUTES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Frequency and Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">
                  Frequency <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="frequency"
                  {...register('frequency')}
                  placeholder="e.g., Twice daily"
                  maxLength={100}
                />
                {errors.frequency && (
                  <p className="text-sm text-destructive">{errors.frequency.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  {...register('duration')}
                  placeholder="e.g., 7 days"
                  maxLength={100}
                />
              </div>
            </div>

            {/* Quantity and Refills */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">
                  Quantity <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  {...register('quantity', { valueAsNumber: true })}
                  placeholder="30"
                  min={1}
                />
                {errors.quantity && (
                  <p className="text-sm text-destructive">{errors.quantity.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="refills">Refills</Label>
                <Input
                  id="refills"
                  type="number"
                  {...register('refills', { valueAsNumber: true })}
                  placeholder="0"
                  min={0}
                  max={12}
                />
                {errors.refills && (
                  <p className="text-sm text-destructive">{errors.refills.message}</p>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions for Patient</Label>
              <Textarea
                id="instructions"
                {...register('instructions')}
                placeholder="e.g., Take with food. Complete full course even if symptoms improve."
                rows={3}
                maxLength={2000}
                className="resize-y"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{errors.instructions?.message}</span>
                <span>{instructions?.length || 0}/2000</span>
              </div>
            </div>

            {/* Diagnosis */}
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis / Indication</Label>
              <Input
                id="diagnosis"
                {...register('diagnosis')}
                placeholder="e.g., Bacterial sinusitis"
                maxLength={500}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{errors.diagnosis?.message}</span>
                <span>{diagnosis?.length || 0}/500</span>
              </div>
            </div>

            {/* Pharmacy Notes */}
            <div className="space-y-2">
              <Label htmlFor="pharmacyNotes">Notes for Pharmacy</Label>
              <Textarea
                id="pharmacyNotes"
                {...register('pharmacyNotes')}
                placeholder="Special instructions for pharmacy"
                rows={2}
                maxLength={2000}
                className="resize-y"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{errors.pharmacyNotes?.message}</span>
                <span>{pharmacyNotes?.length || 0}/2000</span>
              </div>
            </div>

            {/* Expiration Date */}
            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
              <Input id="expiresAt" type="date" {...register('expiresAt')} />
              <p className="text-xs text-muted-foreground">
                Date when prescription can no longer be filled
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false)
                  reset()
                }}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Prescription
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
