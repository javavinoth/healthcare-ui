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
  approveRejectHospitalSchema,
  type ApproveRejectHospitalFormData,
} from '@/lib/validations/hospital'
import type { Hospital } from '@/types'
import { XCircle } from 'lucide-react'

interface RejectHospitalModalProps {
  open: boolean
  onClose: () => void
  hospital: Hospital | null
}

/**
 * Reject Hospital Modal (SYSTEM_ADMIN only)
 * Allows SYSTEM_ADMIN to reject a hospital with a required rejection reason
 * Changes status from READY_FOR_REVIEW back to PENDING
 */
export default function RejectHospitalModal({ open, onClose, hospital }: RejectHospitalModalProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ApproveRejectHospitalFormData>({
    resolver: zodResolver(approveRejectHospitalSchema) as any,
    defaultValues: {
      approved: false,
      rejectionReason: '',
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (data: { hospitalId: string; request: ApproveRejectHospitalFormData }) =>
      hospitalApi.reject(data.hospitalId, data.request),
    onSuccess: () => {
      toast({
        title: 'Hospital Rejected',
        description: `${hospital?.name} has been rejected. Hospital admin has been notified with your feedback.`,
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

  const onSubmit = (data: ApproveRejectHospitalFormData) => {
    if (!hospital) return
    rejectMutation.mutate({
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
            <XCircle className="h-6 w-6 text-error" />
            <DialogTitle>Reject Hospital</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Provide feedback to help the hospital admin improve their submission.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-3 py-2">
            <div className="text-sm">
              <p className="font-medium">Hospital:</p>
              <p className="text-muted-foreground">{hospital?.name}</p>
            </div>

            <div className="rounded-md bg-error/10 p-3 border border-error/20">
              <p className="text-sm text-error-foreground">
                <strong>What happens next:</strong>
              </p>
              <ul className="mt-2 space-y-1 text-sm text-error-foreground list-disc list-inside">
                <li>Hospital status will change back to PENDING</li>
                <li>Hospital admin will see your rejection reason</li>
                <li>Hospital admin can make corrections and resubmit</li>
                <li>Hospital admin account remains PENDING (not activated)</li>
              </ul>
            </div>

            <div>
              <Label htmlFor="rejectionReason">
                Rejection Reason <span className="text-error">*</span>
              </Label>
              <Textarea
                id="rejectionReason"
                {...register('rejectionReason')}
                placeholder="Explain what needs to be corrected. Be specific and constructive. (e.g., 'Please add Cardiology department and update emergency contact number.')"
                rows={5}
                className="mt-1"
              />
              {errors.rejectionReason && (
                <p className="text-sm text-error mt-1">{errors.rejectionReason.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                This message will be visible to the hospital admin.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} variant="destructive">
              {isSubmitting ? 'Rejecting...' : 'Reject Hospital'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
