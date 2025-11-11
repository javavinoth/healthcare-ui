import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { hospitalApi } from '@/lib/api'
import { invalidateHospitals } from '@/lib/queryClient'
import { extractErrorMessage } from '@/lib/utils/apiError'
import {
  markReadyForReviewSchema,
  type MarkReadyForReviewFormData,
} from '@/lib/validations/hospital'
import type { Hospital } from '@/types'
import { Send } from 'lucide-react'

interface MarkReadyForReviewModalProps {
  open: boolean
  onClose: () => void
  hospital: Hospital | null
  hasLocation: boolean
  hasDepartments: boolean
}

/**
 * Mark Hospital Ready for Review Modal (HOSPITAL_ADMIN only)
 * Allows HOSPITAL_ADMIN to mark their hospital as complete and ready for SYSTEM_ADMIN approval
 * Changes status from PENDING to READY_FOR_REVIEW
 */
export default function MarkReadyForReviewModal({
  open,
  onClose,
  hospital,
  hasLocation,
  hasDepartments,
}: MarkReadyForReviewModalProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<MarkReadyForReviewFormData>({
    resolver: zodResolver(markReadyForReviewSchema) as any,
    defaultValues: {
      notes: '',
    },
  })

  const canSubmit = hasLocation && hasDepartments

  const markReadyMutation = useMutation({
    mutationFn: (data: { hospitalId: string; request: MarkReadyForReviewFormData }) =>
      hospitalApi.markReadyForReview(data.hospitalId, data.request),
    onSuccess: () => {
      toast({
        title: 'Hospital Submitted for Review',
        description: `${hospital?.name} has been marked as ready. System admin will review your submission.`,
      })
      invalidateHospitals()
      queryClient.invalidateQueries({ queryKey: ['hospitals', 'detail', hospital?.id] })
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

  const onSubmit = (data: MarkReadyForReviewFormData) => {
    if (!hospital || !canSubmit) return
    markReadyMutation.mutate({
      hospitalId: hospital.id,
      request: data,
    })
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Send className="h-6 w-6 text-info" />
            <DialogTitle>Mark Hospital Ready for Review</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Submit your hospital for system admin approval.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-3 py-2">
            {!canSubmit && (
              <div className="rounded-md bg-warning/10 p-3 border border-warning/20">
                <p className="text-sm font-semibold text-warning-foreground">Cannot submit yet</p>
                <ul className="mt-2 space-y-1 text-sm text-warning-foreground list-disc list-inside">
                  {!hasLocation && <li>Hospital must have a location</li>}
                  {!hasDepartments && <li>Hospital must have at least 1 department</li>}
                </ul>
              </div>
            )}

            {canSubmit && (
              <>
                <div className="rounded-md bg-info/10 p-3 border border-info/20">
                  <p className="text-sm text-info-foreground">
                    <strong>What happens next:</strong>
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-info-foreground list-disc list-inside">
                    <li>Hospital status will change to READY_FOR_REVIEW</li>
                    <li>System admin will be notified to review your hospital</li>
                    <li>You can still edit details if needed (resets status to PENDING)</li>
                    <li>Upon approval, your account will be activated</li>
                  </ul>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    {...register('notes')}
                    placeholder="Add any notes or comments for the system admin (e.g., special features, certifications, etc.)"
                    rows={4}
                    className="mt-1"
                  />
                  {errors.notes && (
                    <p className="text-sm text-error mt-1">{errors.notes.message}</p>
                  )}
                </div>

                <div className="text-sm">
                  <p className="font-medium">Hospital:</p>
                  <p className="text-muted-foreground">{hospital?.name}</p>
                  {hospital?.location && (
                    <p className="text-muted-foreground text-xs mt-1">
                      {hospital.location.district}, {hospital.location.state} -{' '}
                      {hospital.location.pincode}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !canSubmit}>
              {isSubmitting ? 'Submitting...' : 'Mark Ready for Review'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
