import { useMemo } from 'react'
import {
  format,
  isSameDay,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  eachWeekOfInterval,
} from 'date-fns'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, MapPin, Video, User } from 'lucide-react'

type CalendarEvent = {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
  durationMinutes: number
  patientId: string
  patientName: string
  type: string
  status: string
  reason: string
  isVirtual: boolean
  virtualMeetingUrl?: string
  location?: string
  colorClass: string
}

type ViewMode = 'day' | 'week' | 'month'

interface ProviderCalendarProps {
  events: CalendarEvent[]
  viewMode: ViewMode
  currentDate: Date
  onEventClick: (event: CalendarEvent) => void
}

export default function ProviderCalendar({
  events,
  viewMode,
  currentDate,
  onEventClick,
}: ProviderCalendarProps) {
  if (viewMode === 'day') {
    return <DayView events={events} currentDate={currentDate} onEventClick={onEventClick} />
  }

  if (viewMode === 'week') {
    return <WeekView events={events} currentDate={currentDate} onEventClick={onEventClick} />
  }

  return <MonthView events={events} currentDate={currentDate} onEventClick={onEventClick} />
}

// Day View Component
function DayView({ events, currentDate, onEventClick }: Omit<ProviderCalendarProps, 'viewMode'>) {
  const hours = Array.from({ length: 13 }, (_, i) => i + 7) // 7 AM to 7 PM

  const dayEvents = useMemo(() => {
    const dateStr = format(currentDate, 'yyyy-MM-dd')
    return events.filter((event) => event.date === dateStr)
  }, [events, currentDate])

  const getEventsForHour = (hour: number) => {
    return dayEvents.filter((event) => {
      const eventHour = parseInt(event.startTime.split(':')[0])
      return eventHour === hour
    })
  }

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-semibold text-lg">{format(currentDate, 'EEEE, MMMM d, yyyy')}</h3>
      </div>
      <div className="divide-y">
        {hours.map((hour) => {
          const hourEvents = getEventsForHour(hour)
          const timeLabel =
            hour === 12 ? '12:00 PM' : hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`

          return (
            <div key={hour} className="flex min-h-[80px]">
              <div className="w-24 p-3 text-sm text-muted-foreground font-medium border-r bg-gray-50">
                {timeLabel}
              </div>
              <div className="flex-1 p-2">
                <div className="space-y-2">
                  {hourEvents.map((event) => (
                    <EventCard key={event.id} event={event} onClick={() => onEventClick(event)} />
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Week View Component
function WeekView({ events, currentDate, onEventClick }: Omit<ProviderCalendarProps, 'viewMode'>) {
  const weekStart = startOfWeek(currentDate)
  const weekEnd = endOfWeek(currentDate)
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const getEventsForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    return events.filter((event) => event.date === dateStr)
  }

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-semibold text-lg">
          {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
        </h3>
      </div>
      <div className="grid grid-cols-7 divide-x">
        {weekDays.map((day) => {
          const dayEvents = getEventsForDay(day)
          const isToday = isSameDay(day, new Date())

          return (
            <div key={day.toString()} className="min-h-[400px]">
              <div
                className={`p-3 border-b font-medium text-center ${isToday ? 'bg-primary/10 text-primary' : 'bg-gray-50'}`}
              >
                <div className="text-xs uppercase">{format(day, 'EEE')}</div>
                <div
                  className={`text-xl ${isToday ? 'bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mt-1' : ''}`}
                >
                  {format(day, 'd')}
                </div>
              </div>
              <div className="p-2 space-y-1">
                {dayEvents.map((event) => (
                  <Button
                    key={event.id}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-2 px-2"
                    onClick={() => onEventClick(event)}
                  >
                    <div className="w-full">
                      <div className="text-xs font-semibold">{event.startTime}</div>
                      <div className="text-xs truncate">{event.patientName}</div>
                      <Badge variant={getStatusVariant(event.status)} className="text-[10px] mt-1">
                        {event.status}
                      </Badge>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Month View Component
function MonthView({ events, currentDate, onEventClick }: Omit<ProviderCalendarProps, 'viewMode'>) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const weeks = eachWeekOfInterval({ start: calendarStart, end: calendarEnd })

  const getEventsForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    return events.filter((event) => event.date === dateStr)
  }

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-semibold text-lg">{format(currentDate, 'MMMM yyyy')}</h3>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b bg-gray-50">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {weeks.map((weekStart) => {
          const weekDays = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) })

          return weekDays.map((day) => {
            const dayEvents = getEventsForDay(day)
            const isToday = isSameDay(day, new Date())
            const isCurrentMonth = day.getMonth() === currentDate.getMonth()

            return (
              <div
                key={day.toString()}
                className={`min-h-[120px] border-r border-b p-2 ${!isCurrentMonth ? 'bg-gray-50' : ''}`}
              >
                <div
                  className={`text-sm font-medium mb-1 ${isToday ? 'bg-primary text-white rounded-full w-7 h-7 flex items-center justify-center' : isCurrentMonth ? '' : 'text-muted-foreground'}`}
                >
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <Button
                      key={event.id}
                      variant="ghost"
                      className="w-full justify-start h-auto p-1 text-left hover:bg-primary/10"
                      onClick={() => onEventClick(event)}
                    >
                      <div className="w-full">
                        <div className="text-[10px] font-medium truncate">
                          {event.startTime} {event.patientName}
                        </div>
                      </div>
                    </Button>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-muted-foreground pl-1">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })
        })}
      </div>
    </div>
  )
}

// Event Card Component
function EventCard({ event, onClick }: { event: CalendarEvent; onClick: () => void }) {
  return (
    <Card
      className="p-3 cursor-pointer hover:shadow-md transition-shadow border-l-4"
      style={{ borderLeftColor: getStatusColor(event.status) }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-semibold">
              {event.startTime} - {event.endTime}
            </span>
            <Badge variant={getStatusVariant(event.status)} className="text-xs">
              {event.status.replace('_', ' ')}
            </Badge>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-medium truncate">{event.patientName}</span>
          </div>

          <div className="text-xs text-muted-foreground mb-1">{event.type.replace(/_/g, ' ')}</div>

          <div className="text-xs text-muted-foreground line-clamp-2">{event.reason}</div>

          {event.isVirtual ? (
            <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
              <Video className="h-3 w-3" />
              <span>Virtual Appointment</span>
            </div>
          ) : (
            event.location && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{event.location}</span>
              </div>
            )
          )}
        </div>
      </div>
    </Card>
  )
}

// Helper Functions
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    SCHEDULED: '#3b82f6',
    CONFIRMED: '#10b981',
    CHECKED_IN: '#f59e0b',
    COMPLETED: '#6b7280',
    CANCELLED: '#ef4444',
    NO_SHOW: '#f97316',
  }
  return colors[status] || '#6b7280'
}

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    SCHEDULED: 'default',
    CONFIRMED: 'secondary',
    CHECKED_IN: 'default',
    COMPLETED: 'secondary',
    CANCELLED: 'destructive',
    NO_SHOW: 'outline',
  }
  return variants[status] || 'default'
}
