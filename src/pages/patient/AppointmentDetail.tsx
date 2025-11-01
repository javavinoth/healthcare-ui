import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Video,
  Edit,
  X,
  AlertTriangle,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import AppHeader from '@/components/shared/AppHeader'
import { appointmentsApi } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import type { AppointmentStatus } from '@/types'

const statusConfig: Record<AppointmentStatus, { variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'info', label: string }> = {
  scheduled: { variant: 'default', label: 'Scheduled' },
  confirmed: { variant: 'success', label: 'Confirmed' },
  checked_in: { variant: 'info', label: 'Checked In' },
  in_progress: { variant: 'warning', label: 'In Progress' },
  completed: { variant: 'secondary', label: 'Completed' },
  cancelled: { variant: 'destructive', label: 'Cancelled' },
  no_show: { variant: 'destructive', label: 'No Show' },
}

/**
 * Appointment Detail Page
 * View appointment details and manage (reschedule/cancel)
 */
export default function AppointmentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [cancelReason, setCancelReason] = useState('')

  // Fetch appointment details
  const {
    data: appointment,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['appointment', id],
    queryFn: async () => {
      if (!id) throw new Error('Appointment ID is required')
      const appointment = await appointmentsApi.getById(id)
      return appointment
    },
    enabled: !!id,
  })

  // Helper function to convert 24-hour time to 12-hour format with AM/PM
  const convertTo12Hour = (time24: string): string => {
    const [hours, minutes] = time24.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const hours12 = hours % 12 || 12
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  // Reschedule mutation
  const rescheduleMutation = useMutation({
    mutationFn: async () => {
      if (!id || !rescheduleDate || !rescheduleTime) {
        throw new Error('Missing required fields')
      }
      // Convert time to 12-hour format before sending to backend
      const formattedTime = convertTo12Hour(rescheduleTime)
      return appointmentsApi.reschedule(id, rescheduleDate, formattedTime)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['appointment', id] })
      setShowRescheduleDialog(false)
      toast({
        title: 'Appointment rescheduled',
        description: 'Your appointment has been successfully rescheduled.',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Reschedule failed',
        description: error.response?.data?.message || 'Failed to reschedule appointment.',
        variant: 'destructive',
      })
    },
  })

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('Appointment ID is required')
      return appointmentsApi.cancel(id, cancelReason)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['appointment', id] })
      setShowCancelDialog(false)
      toast({
        title: 'Appointment cancelled',
        description: 'Your appointment has been cancelled.',
        variant: 'success',
      })
      navigate('/patient/appointments')
    },
    onError: (error: any) => {
      toast({
        title: 'Cancellation failed',
        description: error.response?.data?.message || 'Failed to cancel appointment.',
        variant: 'destructive',
      })
    },
  })

  const handleReschedule = () => {
    rescheduleMutation.mutate()
  }

  const handleCancel = () => {
    const trimmedReason = cancelReason.trim()

    if (!trimmedReason) {
      toast({
        title: 'Reason required',
        description: 'Please provide a reason for cancellation.',
        variant: 'warning',
      })
      return
    }

    if (trimmedReason.length < 10) {
      toast({
        title: 'Reason too short',
        description: 'Cancellation reason must be at least 10 characters.',
        variant: 'warning',
      })
      return
    }

    if (trimmedReason.length > 500) {
      toast({
        title: 'Reason too long',
        description: 'Cancellation reason cannot exceed 500 characters.',
        variant: 'warning',
      })
      return
    }

    cancelMutation.mutate()
  }

  const handleJoinVideo = () => {
    if (appointment?.videoLink) {
      window.open(appointment.videoLink, '_blank', 'noopener,noreferrer')
      toast({
        title: 'Opening video call',
        description: 'Your virtual appointment is opening in a new window.',
        variant: 'success',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-neutral-light">
        <AppHeader title="Appointment Details" showBackButton backPath="/patient/appointments" />
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !appointment) {
    return (
      <div className="h-screen flex flex-col bg-neutral-light">
        <AppHeader title="Appointment Details" showBackButton backPath="/patient/appointments" />
        <div className="flex-1 overflow-auto flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-12 text-center">
              <p className="text-error mb-4">Failed to load appointment details.</p>
              <Button onClick={() => navigate('/patient/appointments')}>
                Back to Appointments
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const appointmentDate = new Date(appointment.date)
  const statusInfo = statusConfig[appointment.status]
  const canReschedule = appointment.status === 'scheduled' || appointment.status === 'confirmed'
  const canCancel = appointment.status === 'scheduled' || appointment.status === 'confirmed'
  const canJoinVideo = appointment.isVirtual && appointment.videoLink && canReschedule

  return (
    <div className="h-screen flex flex-col bg-neutral-light">
      <AppHeader title="Appointment Details" showBackButton backPath="/patient/appointments" />

      <div className="flex-1 overflow-auto">
        {/* Page Header */}
        <div className="bg-white border-b border-neutral-blue-gray/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div>
              <h1 className="text-h1 text-neutral-blue-gray">Appointment Details</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-h2">
                  Appointment with Dr. {appointment.providerName}
                </CardTitle>
                {appointment.providerSpecialty && (
                  <p className="text-sm text-neutral-blue-gray/70 mt-1">
                    {appointment.providerSpecialty}
                  </p>
                )}
              </div>
              <Badge variant={statusInfo.variant as any}>{statusInfo.label}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Appointment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-neutral-blue-gray/70 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-neutral-blue-gray/70">Date</p>
                    <p className="text-base text-neutral-blue-gray">
                      {format(appointmentDate, 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-neutral-blue-gray/70 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-neutral-blue-gray/70">Time</p>
                    <p className="text-base text-neutral-blue-gray">
                      {appointment.startTime} - {appointment.endTime}
                    </p>
                  </div>
                </div>

                {appointment.isVirtual ? (
                  <div className="flex items-start gap-3">
                    <Video className="h-5 w-5 text-info mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-neutral-blue-gray/70">Type</p>
                      <p className="text-base text-info">Virtual Appointment</p>
                    </div>
                  </div>
                ) : appointment.location ? (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-neutral-blue-gray/70 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-neutral-blue-gray/70">Location</p>
                      <p className="text-base text-neutral-blue-gray">{appointment.location}</p>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="space-y-4">
                {appointment.type && (
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-neutral-blue-gray/70 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-neutral-blue-gray/70">
                        Appointment Type
                      </p>
                      <p className="text-base text-neutral-blue-gray capitalize">
                        {appointment.type.toLowerCase().replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                )}

                {appointment.reason && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-neutral-blue-gray/70 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-neutral-blue-gray/70">Reason</p>
                      <p className="text-base text-neutral-blue-gray">{appointment.reason}</p>
                    </div>
                  </div>
                )}

                {appointment.notes && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-neutral-blue-gray/70 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-neutral-blue-gray/70">Notes</p>
                      <p className="text-base text-neutral-blue-gray">{appointment.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-4 border-t">
              {canJoinVideo && (
                <Button onClick={handleJoinVideo} className="bg-info hover:bg-info/90">
                  <Video className="h-4 w-4 mr-2" />
                  Join Video Call
                </Button>
              )}
              {canReschedule && (
                <Button variant="outline" onClick={() => setShowRescheduleDialog(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Reschedule
                </Button>
              )}
              {canCancel && (
                <Button variant="destructive" onClick={() => setShowCancelDialog(true)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel Appointment
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reschedule Dialog */}
      <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Choose a new date and time for your appointment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reschedule-date">New Date</Label>
              <Input
                id="reschedule-date"
                type="date"
                min={format(new Date(), 'yyyy-MM-dd')}
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reschedule-time">New Time</Label>
              <Input
                id="reschedule-time"
                type="time"
                value={rescheduleTime}
                onChange={(e) => setRescheduleTime(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowRescheduleDialog(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleReschedule}
              disabled={!rescheduleDate || !rescheduleTime || rescheduleMutation.isPending}
              className="flex-1"
            >
              {rescheduleMutation.isPending ? 'Rescheduling...' : 'Confirm'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-error">
              <AlertTriangle className="h-5 w-5" />
              Cancel Appointment
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancel-reason">Reason for Cancellation *</Label>
              <textarea
                id="cancel-reason"
                rows={3}
                placeholder="Please provide a reason (minimum 10 characters)..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                maxLength={500}
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  cancelReason.trim().length > 0 && cancelReason.trim().length < 10
                    ? 'border-error focus:ring-error'
                    : 'border-neutral-blue-gray/30 focus:ring-primary'
                }`}
              />
              <div className="flex items-center justify-between text-xs">
                <span
                  className={
                    cancelReason.trim().length > 0 && cancelReason.trim().length < 10
                      ? 'text-error'
                      : cancelReason.trim().length >= 10
                      ? 'text-wellness'
                      : 'text-neutral-blue-gray/60'
                  }
                >
                  {cancelReason.trim().length < 10
                    ? `Minimum 10 characters (${cancelReason.trim().length}/10)`
                    : 'Valid reason length'}
                </span>
                <span className="text-neutral-blue-gray/60">
                  {cancelReason.length}/500
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowCancelDialog(false)} className="flex-1">
              Keep Appointment
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={
                cancelMutation.isPending ||
                cancelReason.trim().length < 10 ||
                cancelReason.trim().length > 500
              }
              className="flex-1"
            >
              {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Appointment'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
