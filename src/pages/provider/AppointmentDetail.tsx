import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { Clock, User, Video, MapPin, FileText, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import AppHeader from '@/components/shared/AppHeader'
import CheckInDialog from '@/components/provider/CheckInDialog'
import CompleteAppointmentDialog from '@/components/provider/CompleteAppointmentDialog'
import MarkNoShowDialog from '@/components/provider/MarkNoShowDialog'
import { providerApi } from '@/lib/api'
import { useState } from 'react'

/**
 * Provider Appointment Detail Page
 * View full appointment details with quick actions
 */
export default function ProviderAppointmentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [dialogState, setDialogState] = useState({
    checkIn: false,
    complete: false,
    noShow: false,
  })

  // Fetch appointment details
  const {
    data: appointments = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['provider-appointments-detail', id],
    queryFn: async () => {
      if (!id) throw new Error('Appointment ID is required')
      // We'll fetch from the appointments list and filter by ID
      // In a production app, you'd have a dedicated endpoint
      const result = await providerApi.getAppointments({
        startDate: format(new Date(2020, 0, 1), 'yyyy-MM-dd'),
        endDate: format(new Date(2030, 11, 31), 'yyyy-MM-dd'),
      })
      return result
    },
    enabled: !!id,
  })

  const appointment = appointments.find((apt: any) => apt.id === id)

  const openDialog = (type: keyof typeof dialogState) => {
    setDialogState({ ...dialogState, [type]: true })
  }

  const closeDialog = (type: keyof typeof dialogState) => {
    setDialogState({ ...dialogState, [type]: false })
  }

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <AppHeader title="Appointment Details" showBackButton backPath="/provider/appointments" />
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
      <div className="h-screen flex flex-col bg-gray-50">
        <AppHeader title="Appointment Details" showBackButton backPath="/provider/appointments" />
        <div className="flex-1 overflow-auto flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">Appointment Not Found</p>
              <p className="text-sm text-muted-foreground mb-4">
                The appointment you're looking for doesn't exist or you don't have access to it.
              </p>
              <Button onClick={() => navigate('/provider/appointments')}>
                Back to Appointments
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
    > = {
      SCHEDULED: { label: 'Scheduled', variant: 'default' },
      CONFIRMED: { label: 'Confirmed', variant: 'secondary' },
      CHECKED_IN: { label: 'Checked In', variant: 'default' },
      COMPLETED: { label: 'Completed', variant: 'secondary' },
      CANCELLED: { label: 'Cancelled', variant: 'destructive' },
      NO_SHOW: { label: 'No Show', variant: 'outline' },
    }
    return statusMap[status] || { label: status, variant: 'default' }
  }

  const statusInfo = getStatusBadge(appointment.status)
  const canCheckIn = appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED'
  const canComplete =
    appointment.status === 'CHECKED_IN' ||
    appointment.status === 'CONFIRMED' ||
    appointment.status === 'SCHEDULED'
  const canMarkNoShow = appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELLED'

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <AppHeader title="Appointment Details" showBackButton backPath="/provider/appointments" />

      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Appointment Details</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {format(new Date(appointment.date), 'EEEE, MMMM d, yyyy')} at{' '}
                  {appointment.startTime}
                </p>
              </div>
              <Badge variant={statusInfo.variant} className="text-sm py-1 px-3">
                {statusInfo.label}
              </Badge>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              {canCheckIn && (
                <Button onClick={() => openDialog('checkIn')}>Check In Patient</Button>
              )}
              {canComplete && (
                <Button variant="outline" onClick={() => openDialog('complete')}>
                  Complete Appointment
                </Button>
              )}
              {canMarkNoShow && (
                <Button
                  variant="outline"
                  onClick={() => openDialog('noShow')}
                  className="text-orange-600 border-orange-600 hover:bg-orange-50"
                >
                  Mark No-Show
                </Button>
              )}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Appointment Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Appointment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Time</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.startTime} - {appointment.endTime} (
                        {appointment.durationMinutes} minutes)
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Type</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.type.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Reason for Visit</p>
                      <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                    </div>
                  </div>

                  {appointment.isVirtual ? (
                    <>
                      <Separator />
                      <div className="flex items-start gap-3">
                        <Video className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium">Virtual Appointment</p>
                          {appointment.virtualMeetingUrl && (
                            <Button
                              variant="link"
                              className="h-auto p-0 text-sm text-blue-600"
                              onClick={() => window.open(appointment.virtualMeetingUrl, '_blank')}
                            >
                              Join Virtual Meeting
                            </Button>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    appointment.location && (
                      <>
                        <Separator />
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">Location</p>
                            <p className="text-sm text-muted-foreground">{appointment.location}</p>
                          </div>
                        </div>
                      </>
                    )
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Patient Info */}
            <div className="space-y-6">
              {/* Patient Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Patient Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{appointment.patientName}</p>
                      <p className="text-sm text-muted-foreground">
                        Patient ID: {appointment.patientId.slice(0, 8)}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate(`/provider/patients/${appointment.patientId}`)}
                  >
                    View Patient Record
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Status Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium">
                        {format(new Date(appointment.date), 'MMM d')}
                      </span>
                    </div>
                    {appointment.status === 'CHECKED_IN' && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Checked In:</span>
                        <span className="font-medium text-green-600">Yes</span>
                      </div>
                    )}
                    {appointment.status === 'COMPLETED' && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Completed:</span>
                        <span className="font-medium text-green-600">Yes</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {appointment && (
        <>
          <CheckInDialog
            open={dialogState.checkIn}
            onOpenChange={() => closeDialog('checkIn')}
            appointment={{
              id: appointment.id,
              patientName: appointment.patientName,
              time: appointment.startTime,
              type: appointment.type,
            }}
          />
          <CompleteAppointmentDialog
            open={dialogState.complete}
            onOpenChange={() => closeDialog('complete')}
            appointment={{
              id: appointment.id,
              patientName: appointment.patientName,
              time: appointment.startTime,
              type: appointment.type,
            }}
          />
          <MarkNoShowDialog
            open={dialogState.noShow}
            onOpenChange={() => closeDialog('noShow')}
            appointment={{
              id: appointment.id,
              patientName: appointment.patientName,
              time: appointment.startTime,
              type: appointment.type,
            }}
          />
        </>
      )}
    </div>
  )
}
