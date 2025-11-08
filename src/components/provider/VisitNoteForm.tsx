import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { providerApi } from '@/lib/api'
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
import { useToast } from '@/components/ui/use-toast'
import { Loader2, FileText, Plus } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

const visitNoteSchema = z.object({
  subjective: z.string().max(5000, 'Subjective section cannot exceed 5000 characters').optional(),
  objective: z.string().max(5000, 'Objective section cannot exceed 5000 characters').optional(),
  assessment: z
    .string()
    .min(1, 'Assessment is required')
    .max(5000, 'Assessment cannot exceed 5000 characters'),
  plan: z.string().min(1, 'Plan is required').max(5000, 'Plan cannot exceed 5000 characters'),
  chiefComplaint: z.string().max(500, 'Chief complaint cannot exceed 500 characters').optional(),
  diagnosisCodes: z.string().max(500, 'Diagnosis codes cannot exceed 500 characters').optional(),
})

type VisitNoteFormData = z.infer<typeof visitNoteSchema>

interface VisitNoteFormProps {
  patientId: string
  patientName: string
  appointmentId?: string
  trigger?: React.ReactNode
}

export default function VisitNoteForm({
  patientId,
  patientName,
  appointmentId,
  trigger,
}: VisitNoteFormProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<VisitNoteFormData>({
    resolver: zodResolver(visitNoteSchema),
    defaultValues: {
      subjective: '',
      objective: '',
      assessment: '',
      plan: '',
      chiefComplaint: '',
      diagnosisCodes: '',
    },
  })

  // Watch all fields for character counters
  const subjective = watch('subjective')
  const objective = watch('objective')
  const assessment = watch('assessment')
  const plan = watch('plan')
  const chiefComplaint = watch('chiefComplaint')
  const diagnosisCodes = watch('diagnosisCodes')

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  // Create visit note mutation
  const createMutation = useMutation({
    mutationFn: (data: VisitNoteFormData) =>
      providerApi.createVisitNote(patientId, {
        ...data,
        appointmentId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider', 'patients', patientId, 'notes'] })
      queryClient.invalidateQueries({ queryKey: ['provider', 'patients', patientId, 'timeline'] })
      toast({
        title: 'Visit Note Created',
        description: 'Clinical visit note has been saved successfully.',
      })
      setOpen(false)
      reset()
    },
    onError: (error: unknown) => {
      const apiError = error as { response?: { data?: { message?: string } } }
      toast({
        title: 'Failed to Create Note',
        description:
          apiError.response?.data?.message || 'Failed to create visit note. Please try again.',
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: VisitNoteFormData) => {
    createMutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Visit Note
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create Visit Note (SOAP Format)
          </DialogTitle>
          <DialogDescription>Document clinical visit for {patientName}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4" aria-label="Visit note form content">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Chief Complaint */}
            <div className="space-y-2">
              <Label htmlFor="chiefComplaint">
                Chief Complaint <span className="text-muted-foreground text-xs">(Optional)</span>
              </Label>
              <Input
                id="chiefComplaint"
                {...register('chiefComplaint')}
                placeholder="Brief summary of visit reason"
                maxLength={500}
                autoFocus
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{errors.chiefComplaint?.message}</span>
                <span>{chiefComplaint?.length || 0}/500</span>
              </div>
            </div>

            {/* Subjective - S */}
            <div className="space-y-2">
              <Label htmlFor="subjective" className="text-lg font-semibold text-primary">
                S - Subjective{' '}
                <span className="text-muted-foreground text-sm font-normal">(Optional)</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                Patient's description: symptoms, concerns, history, what they tell you
              </p>
              <Textarea
                id="subjective"
                {...register('subjective')}
                placeholder="Patient reports..."
                rows={4}
                maxLength={5000}
                className="resize-y"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="text-destructive">{errors.subjective?.message}</span>
                <span>{subjective?.length || 0}/5000</span>
              </div>
            </div>

            {/* Objective - O */}
            <div className="space-y-2">
              <Label htmlFor="objective" className="text-lg font-semibold text-primary">
                O - Objective{' '}
                <span className="text-muted-foreground text-sm font-normal">(Optional)</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                Provider's observations: exam findings, vital signs, lab results, what you observe
              </p>
              <Textarea
                id="objective"
                {...register('objective')}
                placeholder="Physical examination reveals..."
                rows={4}
                maxLength={5000}
                className="resize-y"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="text-destructive">{errors.objective?.message}</span>
                <span>{objective?.length || 0}/5000</span>
              </div>
            </div>

            {/* Assessment - A */}
            <div className="space-y-2">
              <Label htmlFor="assessment" className="text-lg font-semibold text-primary">
                A - Assessment <span className="text-destructive">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                Diagnosis, clinical impression, problem list, what you think
              </p>
              <Textarea
                id="assessment"
                {...register('assessment')}
                placeholder="Diagnosis: ..."
                rows={4}
                maxLength={5000}
                className="resize-y"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="text-destructive">{errors.assessment?.message}</span>
                <span>{assessment?.length || 0}/5000</span>
              </div>
            </div>

            {/* Plan - P */}
            <div className="space-y-2">
              <Label htmlFor="plan" className="text-lg font-semibold text-primary">
                P - Plan <span className="text-destructive">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                Treatment plan, medications, procedures, follow-up, what you'll do
              </p>
              <Textarea
                id="plan"
                {...register('plan')}
                placeholder="Treatment plan: ..."
                rows={4}
                maxLength={5000}
                className="resize-y"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="text-destructive">{errors.plan?.message}</span>
                <span>{plan?.length || 0}/5000</span>
              </div>
            </div>

            {/* Diagnosis Codes */}
            <div className="space-y-2">
              <Label htmlFor="diagnosisCodes">
                ICD-10 Codes{' '}
                <span className="text-muted-foreground text-xs">(Optional, comma-separated)</span>
              </Label>
              <Input
                id="diagnosisCodes"
                {...register('diagnosisCodes')}
                placeholder="e.g., J06.9, R50.9"
                maxLength={500}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{errors.diagnosisCodes?.message}</span>
                <span>{diagnosisCodes?.length || 0}/500</span>
              </div>
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
                Save Visit Note
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
