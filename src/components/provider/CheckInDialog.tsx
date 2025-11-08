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
import { CheckCircle2 } from 'lucide-react'

interface CheckInDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: {
    id: string
    patientName: string
    time: string
    type: string
  }
}

export default function CheckInDialog({ open, onOpenChange, appointment }: CheckInDialogProps) {
  const [notes, setNotes] = useState('')
  const [isLateArrival, setIsLateArrival] = useState(false)
  const [minutesLate, setMinutesLate] = useState<number | undefined>()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const checkInMutation = useMutation({
    mutationFn: (data: { notes?: string; isLateArrival: boolean; minutesLate?: number }) =>
      providerApi.checkInAppointment(appointment.id, data),
    onSuccess: () => {
      toast({
        title: 'Patient Checked In',
        description: `${appointment.patientName} has been successfully checked in.`,
      })
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['provider-appointments'] })
      queryClient.invalidateQueries({ queryKey: ['provider-calendar'] })
      queryClient.invalidateQueries({ queryKey: ['provider-dashboard'] })
      // Reset form and close
      handleClose()
    },
    onError: (error: unknown) => {
      const apiError = error as { response?: { data?: { message?: string } } }
      toast({
        variant: 'destructive',
        title: 'Check-in Failed',
        description: apiError.response?.data?.message || 'Failed to check in patient',
      })
    },
  })

  const handleSubmit = () => {
    checkInMutation.mutate({
      notes: notes.trim() || undefined,
      isLateArrival,
      minutesLate: isLateArrival ? minutesLate : undefined,
    })
  }

  const handleClose = () => {
    setNotes('')
    setIsLateArrival(false)
    setMinutesLate(undefined)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Check In Patient
          </DialogTitle>
          <DialogDescription>
            Check in {appointment.patientName} for their {appointment.time} appointment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Late Arrival Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="lateArrival"
              checked={isLateArrival}
              onCheckedChange={(checked) => setIsLateArrival(checked === true)}
            />
            <label
              htmlFor="lateArrival"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Patient arrived late
            </label>
          </div>

          {/* Minutes Late Input */}
          {isLateArrival && (
            <div className="space-y-2">
              <Label htmlFor="minutesLate">Minutes Late</Label>
              <Input
                id="minutesLate"
                type="number"
                min="1"
                max="120"
                value={minutesLate || ''}
                onChange={(e) =>
                  setMinutesLate(e.target.value ? parseInt(e.target.value) : undefined)
                }
                placeholder="Enter minutes late"
              />
            </div>
          )}

          {/* Check-in Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about the check-in process..."
              rows={3}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">{notes.length}/1000 characters</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={checkInMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={checkInMutation.isPending}>
            {checkInMutation.isPending ? 'Checking In...' : 'Check In Patient'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
