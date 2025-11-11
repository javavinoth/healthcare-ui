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
import { useToast } from '@/components/ui/use-toast'
import { hospitalApi } from '@/lib/api'
import { invalidateHospitals } from '@/lib/queryClient'
import { extractErrorMessage } from '@/lib/utils/apiError'
import type { Hospital } from '@/types'
import { CheckCircle2 } from 'lucide-react'

interface ApproveHospitalModalProps {
  open: boolean
  onClose: () => void
  hospital: Hospital | null
}

/**
 * Approve Hospital Modal (SYSTEM_ADMIN only)
 * Confirms hospital approval and changes status from READY_FOR_REVIEW to ACTIVE
 * Also activates the hospital admin account
 */
export default function ApproveHospitalModal({
  open,
  onClose,
  hospital,
}: ApproveHospitalModalProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const approveMutation = useMutation({
    mutationFn: (hospitalId: string) => hospitalApi.approve(hospitalId),
    onSuccess: () => {
      toast({
        title: 'Hospital Approved',
        description: `${hospital?.name} has been approved and is now active. Hospital admin account has been activated.`,
      })
      invalidateHospitals()
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
      queryClient.invalidateQueries({ queryKey: ['platform', 'stats'] })
      onClose()
    },
    onError: (error: unknown) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: extractErrorMessage(error),
      })
    },
  })

  const handleApprove = () => {
    if (!hospital) return
    approveMutation.mutate(hospital.id)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-wellness" />
            <DialogTitle>Approve Hospital</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Are you sure you want to approve <strong>{hospital?.name}</strong>?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="rounded-md bg-wellness/10 p-3 border border-wellness/20">
            <p className="text-sm text-wellness-foreground">
              <strong>What happens next:</strong>
            </p>
            <ul className="mt-2 space-y-1 text-sm text-wellness-foreground list-disc list-inside">
              <li>Hospital status will change to ACTIVE</li>
              <li>Hospital admin account will be activated</li>
              <li>Hospital admin can log in and manage the facility</li>
              <li>Hospital will be available in the active hospitals list</li>
            </ul>
          </div>

          {hospital?.location && (
            <div className="text-sm">
              <p className="font-medium">Hospital Location:</p>
              <p className="text-muted-foreground mt-1">
                {hospital.location.address}, {hospital.location.district}
                <br />
                {hospital.location.state} - {hospital.location.pincode}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={approveMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleApprove}
            disabled={approveMutation.isPending}
            className="bg-wellness hover:bg-wellness/90"
          >
            {approveMutation.isPending ? 'Approving...' : 'Approve Hospital'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
