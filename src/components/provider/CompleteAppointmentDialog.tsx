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
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { providerApi } from '@/lib/api'
import { extractErrorMessage } from '@/lib/utils/apiError'
import { CheckCircle } from 'lucide-react'

interface CompleteAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: {
    id: string
    patientName: string
    time: string
    type: string
  }
}

export default function CompleteAppointmentDialog({
  open,
  onOpenChange,
  appointment,
}: CompleteAppointmentDialogProps) {
  const [notes, setNotes] = useState('')
  const [followUpRequired, setFollowUpRequired] = useState(false)
  const [followUpInstructions, setFollowUpInstructions] = useState('')
  const [followUpDays, setFollowUpDays] = useState<number | undefined>()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const completeMutation = useMutation({
    mutationFn: (data: {
      notes: string
      followUpRequired?: boolean
      followUpInstructions?: string
      followUpDays?: number
    }) => providerApi.completeAppointment(appointment.id, data),
    onSuccess: () => {
      toast({
        title: 'Appointment Completed',
        description: `Visit with ${appointment.patientName} has been marked as completed.`,
      })
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['provider-appointments'] })
      queryClient.invalidateQueries({ queryKey: ['provider-calendar'] })
      queryClient.invalidateQueries({ queryKey: ['provider-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['provider-stats'] })
      // Reset form and close
      handleClose()
    },
    onError: (error: unknown) => {
      const message = extractErrorMessage(error, 'Failed to complete appointment')
      toast({
        variant: 'destructive',
        title: 'Failed to Complete',
        description: message,
      })
    },
  })

  const handleSubmit = () => {
    if (notes.trim().length < 10) {
      toast({
        variant: 'destructive',
        title: 'Notes Required',
        description: 'Please provide visit notes (at least 10 characters)',
      })
      return
    }

    completeMutation.mutate({
      notes: notes.trim(),
      followUpRequired,
      followUpInstructions: followUpRequired ? followUpInstructions.trim() || undefined : undefined,
      followUpDays: followUpRequired ? followUpDays : undefined,
    })
  }

  const handleClose = () => {
    setNotes('')
    setFollowUpRequired(false)
    setFollowUpInstructions('')
    setFollowUpDays(undefined)
    onOpenChange(false)
  }

  const isValid = notes.trim().length >= 10

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Complete Appointment
          </DialogTitle>
          <DialogDescription>
            Complete visit with {appointment.patientName} - {appointment.time}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Visit Notes (Required) */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-1">
              Visit Notes
              <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Document the visit details, assessment, and plan..."
              rows={6}
              maxLength={5000}
              className={
                notes.trim().length > 0 && notes.trim().length < 10 ? 'border-destructive' : ''
              }
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {notes.trim().length < 10 && notes.trim().length > 0
                  ? `${10 - notes.trim().length} more characters needed`
                  : 'Minimum 10 characters required'}
              </span>
              <span>{notes.length}/5000 characters</span>
            </div>
          </div>

          {/* Follow-up Required */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="followUpRequired"
              checked={followUpRequired}
              onCheckedChange={(checked) => setFollowUpRequired(checked === true)}
            />
            <label
              htmlFor="followUpRequired"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Follow-up appointment required
            </label>
          </div>

          {/* Follow-up Details */}
          {followUpRequired && (
            <div className="space-y-4 pl-6 border-l-2 border-primary/20">
              <div className="space-y-2">
                <Label htmlFor="followUpInstructions">Follow-up Instructions</Label>
                <Textarea
                  id="followUpInstructions"
                  value={followUpInstructions}
                  onChange={(e) => setFollowUpInstructions(e.target.value)}
                  placeholder="Specific instructions for follow-up..."
                  rows={3}
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground">
                  {followUpInstructions.length}/1000 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="followUpDays">Recommended Timeframe (Days)</Label>
                <Input
                  id="followUpDays"
                  type="number"
                  min="1"
                  max="365"
                  value={followUpDays || ''}
                  onChange={(e) =>
                    setFollowUpDays(e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  placeholder="e.g., 7, 14, 30"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={completeMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || completeMutation.isPending}>
            {completeMutation.isPending ? 'Completing...' : 'Complete Appointment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
