import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { providerApi } from '@/lib/api'
import { Clock } from 'lucide-react'

interface BlockTimeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultDate?: Date
}

/**
 * Block Time Dialog Component
 * Allows providers to block time slots for breaks, meetings, etc.
 */
export default function BlockTimeDialog({ open, onOpenChange, defaultDate }: BlockTimeDialogProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    blockDate: defaultDate ? format(defaultDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '10:00',
    reason: 'LUNCH_BREAK',
    notes: '',
    isRecurring: false,
  })

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => providerApi.createTimeBlock(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-appointments'] })
      queryClient.invalidateQueries({ queryKey: ['provider-time-blocks'] })
      toast({
        title: 'Time Block Created',
        description: 'Time slot has been blocked successfully',
      })
      handleClose()
    },
    onError: (error: unknown) => {
      const apiError = error as { response?: { data?: { message?: string } } }
      toast({
        title: 'Error',
        description: apiError.response?.data?.message || 'Failed to create time block',
        variant: 'destructive',
      })
    },
  })

  const handleClose = () => {
    setFormData({
      blockDate: defaultDate ? format(defaultDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '10:00',
      reason: 'LUNCH_BREAK',
      notes: '',
      isRecurring: false,
    })
    onOpenChange(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.blockDate || !formData.startTime || !formData.endTime || !formData.reason) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    if (formData.startTime >= formData.endTime) {
      toast({
        title: 'Validation Error',
        description: 'End time must be after start time',
        variant: 'destructive',
      })
      return
    }

    mutation.mutate(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Block Time
          </DialogTitle>
          <DialogDescription>
            Block a time slot on your schedule for breaks, meetings, or administrative work
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="blockDate">Date *</Label>
            <Input
              id="blockDate"
              type="date"
              value={formData.blockDate}
              onChange={(e) => setFormData({ ...formData, blockDate: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Select
              value={formData.reason}
              onValueChange={(value) => setFormData({ ...formData, reason: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LUNCH_BREAK">Lunch Break</SelectItem>
                <SelectItem value="PERSONAL_BREAK">Personal Break</SelectItem>
                <SelectItem value="MEETING">Meeting</SelectItem>
                <SelectItem value="ADMINISTRATIVE_WORK">Administrative Work</SelectItem>
                <SelectItem value="TRAINING">Training</SelectItem>
                <SelectItem value="TIME_OFF">Time Off</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating...' : 'Block Time'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
