import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  FileText,
  Pill,
  FlaskConical,
  User,
} from 'lucide-react'
import type { PatientTimelineEvent } from '@/types'
import { format, isToday, isYesterday, isThisWeek, parseISO } from 'date-fns'

interface MedicalTimelineProps {
  events: PatientTimelineEvent[]
  isLoading?: boolean
}

export default function MedicalTimeline({
  events,
  isLoading,
}: MedicalTimelineProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'APPOINTMENT':
        return Calendar
      case 'LAB_RESULT':
        return FlaskConical
      case 'PRESCRIPTION':
        return Pill
      case 'MEDICAL_RECORD':
      default:
        return FileText
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'APPOINTMENT':
        return 'bg-blue-100 text-blue-700'
      case 'LAB_RESULT':
        return 'bg-purple-100 text-purple-700'
      case 'PRESCRIPTION':
        return 'bg-green-100 text-green-700'
      case 'MEDICAL_RECORD':
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusBadgeVariant = (status?: string) => {
    if (!status) return 'secondary'
    const statusLower = status.toLowerCase()
    if (statusLower === 'completed' || statusLower === 'final')
      return 'default'
    if (statusLower === 'scheduled' || statusLower === 'confirmed')
      return 'secondary'
    if (statusLower === 'cancelled') return 'destructive'
    return 'secondary'
  }

  const formatDateGroup = (dateString: string) => {
    try {
      const date = parseISO(dateString)
      if (isToday(date)) return 'Today'
      if (isYesterday(date)) return 'Yesterday'
      if (isThisWeek(date)) return format(date, 'EEEE')
      return format(date, 'MMMM d, yyyy')
    } catch {
      return dateString
    }
  }

  const formatTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'h:mm a')
    } catch {
      return ''
    }
  }

  // Group events by date
  const groupedEvents = events.reduce((groups, event) => {
    const dateGroup = formatDateGroup(event.date)
    if (!groups[dateGroup]) {
      groups[dateGroup] = []
    }
    groups[dateGroup].push(event)
    return groups
  }, {} as Record<string, PatientTimelineEvent[]>)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="bg-white border-2 border-dashed rounded-lg p-12 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2">
          No timeline events yet
        </h3>
        <p className="text-sm text-muted-foreground">
          Appointments and medical records will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedEvents).map(([dateGroup, groupEvents]) => (
        <div key={dateGroup}>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 sticky top-0 bg-gray-50 py-2">
            {dateGroup}
          </h3>
          <div className="space-y-3">
            {groupEvents.map((event) => {
              const Icon = getEventIcon(event.type)
              const colorClass = getEventColor(event.type)

              return (
                <Card
                  key={event.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`p-2 rounded-lg shrink-0 ${colorClass}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-sm">
                            {event.title}
                          </h4>
                          {event.status && (
                            <Badge
                              variant={getStatusBadgeVariant(event.status)}
                              className="shrink-0 text-xs"
                            >
                              {event.status}
                            </Badge>
                          )}
                        </div>

                        {event.description && (
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {event.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {event.providerName && (
                            <div className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5" />
                              <span>{event.providerName}</span>
                            </div>
                          )}
                          {event.date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{formatTime(event.date)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
