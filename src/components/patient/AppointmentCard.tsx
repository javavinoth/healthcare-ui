import { format } from 'date-fns'
import { Calendar, Clock, MapPin, Video, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Appointment, AppointmentStatus } from '@/types'

interface AppointmentCardProps {
  appointment: Appointment
  onViewDetails?: (id: string) => void
  onJoinVideo?: (videoLink: string) => void
  compact?: boolean
}

const statusConfig: Record<
  AppointmentStatus,
  {
    variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'info'
    label: string
  }
> = {
  scheduled: { variant: 'default', label: 'Scheduled' },
  confirmed: { variant: 'success', label: 'Confirmed' },
  checked_in: { variant: 'info', label: 'Checked In' },
  in_progress: { variant: 'warning', label: 'In Progress' },
  completed: { variant: 'secondary', label: 'Completed' },
  cancelled: { variant: 'destructive', label: 'Cancelled' },
  no_show: { variant: 'destructive', label: 'No Show' },
}

export default function AppointmentCard({
  appointment,
  onViewDetails,
  onJoinVideo,
  compact = false,
}: AppointmentCardProps) {
  const appointmentDate = new Date(appointment.date)
  const statusInfo = statusConfig[appointment.status]
  const isUpcoming = appointment.status === 'scheduled' || appointment.status === 'confirmed'
  const canJoinVideo = appointment.isVirtual && appointment.videoLink && isUpcoming

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className={compact ? 'p-4' : 'p-6'}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Header - Provider and Status */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-blue-gray">
                    Dr. {appointment.providerName}
                  </h3>
                  {appointment.providerSpecialty && (
                    <p className="text-sm text-neutral-blue-gray/70">
                      {appointment.providerSpecialty}
                    </p>
                  )}
                </div>
              </div>
              <Badge variant={statusInfo.variant as any}>{statusInfo.label}</Badge>
            </div>

            {/* Appointment Details */}
            <div className="space-y-2 text-sm text-neutral-blue-gray/80">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{format(appointmentDate, 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  {appointment.startTime} - {appointment.endTime}
                </span>
              </div>
              {appointment.type && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Type:</span>
                  <span className="capitalize">
                    {appointment.type.toLowerCase().replace('_', ' ')}
                  </span>
                </div>
              )}
              {appointment.isVirtual ? (
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-info" />
                  <span>Virtual Appointment</span>
                </div>
              ) : appointment.location ? (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{appointment.location}</span>
                </div>
              ) : null}
              {appointment.reason && !compact && (
                <div className="pt-1">
                  <span className="font-medium">Reason: </span>
                  <span>{appointment.reason}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            {!compact && (
              <div className="flex gap-2 pt-2">
                {canJoinVideo && (
                  <Button
                    size="sm"
                    onClick={() => onJoinVideo?.(appointment.videoLink!)}
                    className="bg-info hover:bg-info/90"
                  >
                    <Video className="h-4 w-4 mr-1" />
                    Join Video Call
                  </Button>
                )}
                {onViewDetails && (
                  <Button size="sm" variant="outline" onClick={() => onViewDetails(appointment.id)}>
                    View Details
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
