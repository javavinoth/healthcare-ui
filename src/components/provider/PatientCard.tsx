import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Calendar, Mail } from 'lucide-react'
import type { PatientSummary } from '@/types'
import { format } from 'date-fns'

interface PatientCardProps {
  patient: PatientSummary
  onClick: (patientId: string) => void
}

export default function PatientCard({ patient, onClick }: PatientCardProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    try {
      return format(new Date(dateString), 'MMM d, yyyy')
    } catch {
      return 'N/A'
    }
  }

  const getGenderLabel = (gender?: string) => {
    if (!gender) return ''
    const labels: Record<string, string> = {
      MALE: 'M',
      FEMALE: 'F',
      OTHER: 'Other',
      PREFER_NOT_TO_SAY: '',
    }
    return labels[gender] || ''
  }

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-primary"
      onClick={() => onClick(patient.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="h-12 w-12 bg-primary/10">
            <AvatarFallback className="bg-primary text-white font-semibold">
              {getInitials(patient.firstName, patient.lastName)}
            </AvatarFallback>
          </Avatar>

          {/* Patient Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="font-semibold text-lg truncate">
                  {patient.firstName} {patient.lastName}
                  {patient.age && (
                    <span className="text-muted-foreground text-sm font-normal ml-2">
                      {patient.age}y {getGenderLabel(patient.gender)}
                    </span>
                  )}
                </h3>
                {patient.medicalRecordNumber && (
                  <p className="text-sm text-muted-foreground">
                    MRN: {patient.medicalRecordNumber}
                  </p>
                )}
              </div>

              {/* Unread Badge */}
              {patient.hasUnreadRecords && (
                <Badge variant="destructive" className="shrink-0">
                  New Records
                </Badge>
              )}
            </div>

            {/* Contact Info */}
            <div className="mt-2 space-y-1">
              {patient.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate">{patient.email}</span>
                </div>
              )}
            </div>

            {/* Appointment Dates */}
            <div className="mt-3 pt-3 border-t flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground">Last visit: </span>
                  <span className="font-medium">
                    {formatDate(patient.lastAppointmentDate)}
                  </span>
                </div>
              </div>
              {patient.upcomingAppointmentDate && (
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Next: </span>
                  <span className="font-medium text-primary">
                    {formatDate(patient.upcomingAppointmentDate)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
