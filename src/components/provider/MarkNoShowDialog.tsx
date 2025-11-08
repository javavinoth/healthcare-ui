import { useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { providerApi } from '@/lib/api'
import { AlertCircle } from 'lucide-react'

interface MarkNoShowDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: {
    id: string
    patientName: string
    time: string
    type: string
  }
}

export default function MarkNoShowDialog({
  open,
  onOpenChange,
  appointment,
}: MarkNoShowDialogProps) {
  const [notes, setNotes] = useState('')
  const [patientContacted, setPatientContacted] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const noShowMutation = useMutation({
    mutationFn: (data: { notes?: string; patientContacted: boolean }) =>
      providerApi.markNoShow(appointment.id, data),
    onSuccess: () => {
      toast({
        title: 'Marked as No-Show',
        description: `Appointment with ${appointment.patientName} has been marked as no-show.`,
      })
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['provider-appointments'] })
      queryClient.invalidateQueries({ queryKey: ['provider-calendar'] })
      queryClient.invalidateQueries({ queryKey: ['provider-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['provider-stats'] })
      // Reset form and close
      handleClose()
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to Mark No-Show',
        description: error.response?.data?.message || 'Failed to mark appointment as no-show',
      })
    },
  })

  const handleSubmit = () => {
    noShowMutation.mutate({
      notes: notes.trim() || undefined,
      patientContacted,
    })
  }

  const handleClose = () => {
    setNotes('')
    setPatientContacted(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            Mark as No-Show
          </DialogTitle>
          <DialogDescription>
            Mark {appointment.patientName}'s {appointment.time} appointment as no-show
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning Message */}
          <div className="rounded-lg bg-orange-50 border border-orange-200 p-3">
            <p className="text-sm text-orange-900">
              This action will mark the appointment as no-show. The patient did not arrive for their
              scheduled appointment.
            </p>
          </div>

          {/* Patient Contacted Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="patientContacted"
              checked={patientContacted}
              onCheckedChange={(checked) => setPatientContacted(checked === true)}
            />
            <label
              htmlFor="patientContacted"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Patient was contacted
            </label>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about the no-show..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">{notes.length}/500 characters</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={noShowMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={noShowMutation.isPending} variant="destructive">
            {noShowMutation.isPending ? 'Marking...' : 'Mark as No-Show'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
