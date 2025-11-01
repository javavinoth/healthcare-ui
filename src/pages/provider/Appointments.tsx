import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import AppHeader from '@/components/shared/AppHeader'
import ProviderCalendar from '@/components/provider/ProviderCalendar'
import CheckInDialog from '@/components/provider/CheckInDialog'
import CompleteAppointmentDialog from '@/components/provider/CompleteAppointmentDialog'
import MarkNoShowDialog from '@/components/provider/MarkNoShowDialog'
import BlockTimeDialog from '@/components/provider/BlockTimeDialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { providerApi } from '@/lib/api'
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Video,
  MapPin,
  CheckCircle2,
  CheckCircle,
  AlertCircle,
  List,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { format, startOfWeek, endOfWeek, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths, startOfMonth, endOfMonth } from 'date-fns'

type AppointmentEvent = {
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

type DialogState = {
  checkIn: boolean
  complete: boolean
  noShow: boolean
}

export default function ProviderAppointmentsPage() {
  const today = new Date()
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [calendarViewMode, setCalendarViewMode] = useState<'day' | 'week' | 'month'>('week')
  const [currentDate, setCurrentDate] = useState(today)
  const [startDate, setStartDate] = useState(startOfWeek(today))
  const [endDate, setEndDate] = useState(endOfWeek(today))
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentEvent | null>(null)
  const [dialogState, setDialogState] = useState<DialogState>({
    checkIn: false,
    complete: false,
    noShow: false,
  })
  const [blockTimeDialogOpen, setBlockTimeDialogOpen] = useState(false)

  // Fetch appointments
  const {
    data: appointments = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      'provider-appointments',
      format(startDate, 'yyyy-MM-dd'),
      format(endDate, 'yyyy-MM-dd'),
      statusFilter !== 'all' ? statusFilter : undefined,
    ],
    queryFn: () =>
      providerApi.getAppointments({
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        status: statusFilter !== 'all' ? statusFilter : undefined,
      }),
    staleTime: 1 * 60 * 1000, // 1 minute
  })

  // Filter and group appointments
  const groupedAppointments = useMemo(() => {
    const grouped: Record<string, AppointmentEvent[]> = {}
    appointments.forEach((apt: AppointmentEvent) => {
      if (!grouped[apt.date]) {
        grouped[apt.date] = []
      }
      grouped[apt.date].push(apt)
    })
    // Sort dates
    return Object.keys(grouped)
      .sort()
      .reduce((acc, date) => {
        acc[date] = grouped[date].sort((a, b) =>
          a.startTime.localeCompare(b.startTime)
        )
        return acc
      }, {} as Record<string, AppointmentEvent[]>)
  }, [appointments])

  // Quick date range selectors
  const setDateRange = (range: 'today' | 'week' | 'month') => {
    const now = new Date()
    switch (range) {
      case 'today':
        setCurrentDate(now)
        setStartDate(now)
        setEndDate(now)
        setCalendarViewMode('day')
        setViewMode('calendar')
        break
      case 'week':
        setCurrentDate(now)
        setStartDate(startOfWeek(now))
        setEndDate(endOfWeek(now))
        setCalendarViewMode('week')
        setViewMode('calendar')
        break
      case 'month':
        setCurrentDate(now)
        setStartDate(startOfMonth(now))
        setEndDate(endOfMonth(now))
        setCalendarViewMode('month')
        setViewMode('calendar')
        break
    }
  }

  // Calendar navigation
  const navigateCalendar = (direction: 'prev' | 'next') => {
    let newDate = currentDate

    if (calendarViewMode === 'day') {
      newDate = direction === 'next' ? addDays(currentDate, 1) : subDays(currentDate, 1)
      setStartDate(newDate)
      setEndDate(newDate)
    } else if (calendarViewMode === 'week') {
      newDate = direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1)
      setStartDate(startOfWeek(newDate))
      setEndDate(endOfWeek(newDate))
    } else if (calendarViewMode === 'month') {
      newDate = direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1)
      setStartDate(startOfMonth(newDate))
      setEndDate(endOfMonth(newDate))
    }

    setCurrentDate(newDate)
  }

  // Handle event click in calendar
  const handleCalendarEventClick = (event: AppointmentEvent) => {
    setSelectedAppointment(event)
    // Determine which dialog to open based on status
    if (event.status === 'SCHEDULED' || event.status === 'CONFIRMED') {
      openDialog('checkIn', event)
    } else if (event.status === 'CHECKED_IN') {
      openDialog('complete', event)
    }
  }

  const openDialog = (
    type: keyof DialogState,
    appointment: AppointmentEvent
  ) => {
    setSelectedAppointment(appointment)
    setDialogState({ ...dialogState, [type]: true })
  }

  const closeDialog = (type: keyof DialogState) => {
    setDialogState({ ...dialogState, [type]: false })
    setSelectedAppointment(null)
  }

  // Get status badge styling
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

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <AppHeader title="Appointments" />
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <AppHeader title="Appointments" />
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-destructive mb-2">
                Error Loading Appointments
              </h3>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : 'An error occurred'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <AppHeader title="Appointments" />

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Appointment Schedule
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your appointments and patient visits
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6 space-y-4">
            {/* View Mode Toggle */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4 mr-2" />
                  List
                </Button>
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Calendar
                </Button>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRange('today')}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRange('week')}
                >
                  This Week
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRange('month')}
                >
                  This Month
                </Button>

                {viewMode === 'list' && (
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                      <SelectItem value="CHECKED_IN">Checked In</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBlockTimeDialogOpen(true)}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Block Time
                </Button>
              </div>
            </div>

            {/* Calendar View Controls */}
            {viewMode === 'calendar' && (
              <div className="flex items-center justify-between bg-white rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateCalendar('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateCalendar('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <div className="text-sm font-semibold ml-2">
                    {calendarViewMode === 'day' && format(currentDate, 'EEEE, MMMM d, yyyy')}
                    {calendarViewMode === 'week' && `${format(startOfWeek(currentDate), 'MMM d')} - ${format(endOfWeek(currentDate), 'MMM d, yyyy')}`}
                    {calendarViewMode === 'month' && format(currentDate, 'MMMM yyyy')}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={calendarViewMode === 'day' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setCalendarViewMode('day')
                      setStartDate(currentDate)
                      setEndDate(currentDate)
                    }}
                  >
                    Day
                  </Button>
                  <Button
                    variant={calendarViewMode === 'week' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setCalendarViewMode('week')
                      setStartDate(startOfWeek(currentDate))
                      setEndDate(endOfWeek(currentDate))
                    }}
                  >
                    Week
                  </Button>
                  <Button
                    variant={calendarViewMode === 'month' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setCalendarViewMode('month')
                      setStartDate(startOfMonth(currentDate))
                      setEndDate(endOfMonth(currentDate))
                    }}
                  >
                    Month
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Date Range Display */}
          {viewMode === 'list' && (
            <div className="mb-4 text-sm text-muted-foreground">
              Showing: {format(startDate, 'MMM d, yyyy')} -{' '}
              {format(endDate, 'MMM d, yyyy')} ({appointments.length}{' '}
              {appointments.length === 1 ? 'appointment' : 'appointments'})
            </div>
          )}

          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <ProviderCalendar
              events={appointments}
              viewMode={calendarViewMode}
              currentDate={currentDate}
              onEventClick={handleCalendarEventClick}
            />
          )}

          {/* Appointments List */}
          {viewMode === 'list' && (
            <>
              {Object.keys(groupedAppointments).length === 0 ? (
                <div className="bg-white border-2 border-dashed rounded-lg p-12 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <CalendarIcon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Appointments</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    No appointments found for the selected date range and filters.
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(groupedAppointments).map(([date, dayAppts]) => (
                <div key={date}>
                  <h2 className="text-lg font-semibold mb-4 text-gray-900">
                    {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                  </h2>
                  <div className="space-y-3">
                    {dayAppts.map((apt) => (
                      <AppointmentCard
                        key={apt.id}
                        appointment={apt}
                        onCheckIn={() => openDialog('checkIn', apt)}
                        onComplete={() => openDialog('complete', apt)}
                        onNoShow={() => openDialog('noShow', apt)}
                        getStatusBadge={getStatusBadge}
                      />
                    ))}
                  </div>
                </div>
              ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Dialogs */}
      {selectedAppointment && (
        <>
          <CheckInDialog
            open={dialogState.checkIn}
            onOpenChange={() => closeDialog('checkIn')}
            appointment={{
              id: selectedAppointment.id,
              patientName: selectedAppointment.patientName,
              time: selectedAppointment.startTime,
              type: selectedAppointment.type,
            }}
          />
          <CompleteAppointmentDialog
            open={dialogState.complete}
            onOpenChange={() => closeDialog('complete')}
            appointment={{
              id: selectedAppointment.id,
              patientName: selectedAppointment.patientName,
              time: selectedAppointment.startTime,
              type: selectedAppointment.type,
            }}
          />
          <MarkNoShowDialog
            open={dialogState.noShow}
            onOpenChange={() => closeDialog('noShow')}
            appointment={{
              id: selectedAppointment.id,
              patientName: selectedAppointment.patientName,
              time: selectedAppointment.startTime,
              type: selectedAppointment.type,
            }}
          />
        </>
      )}
n      {/* Block Time Dialog */}
      <BlockTimeDialog
        open={blockTimeDialogOpen}
        onOpenChange={setBlockTimeDialogOpen}
        defaultDate={currentDate}
      />
    </div>
  )
}

// Appointment Card Component
function AppointmentCard({
  appointment,
  onCheckIn,
  onComplete,
  onNoShow,
  getStatusBadge,
}: {
  appointment: AppointmentEvent
  onCheckIn: () => void
  onComplete: () => void
  onNoShow: () => void
  getStatusBadge: (status: string) => {
    label: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
  }
}) {
  const statusInfo = getStatusBadge(appointment.status)
  const canCheckIn =
    appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED'
  const canComplete =
    appointment.status === 'CHECKED_IN' ||
    appointment.status === 'CONFIRMED' ||
    appointment.status === 'SCHEDULED'
  const canMarkNoShow =
    appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELLED'

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">
                {appointment.startTime} - {appointment.endTime}
              </span>
            </div>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            {appointment.isVirtual && (
              <Badge variant="outline" className="bg-blue-50">
                <Video className="h-3 w-3 mr-1" />
                Virtual
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{appointment.patientName}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">
              {appointment.type.replace(/_/g, ' ')}
            </span>
          </div>

          <p className="text-sm text-muted-foreground">{appointment.reason}</p>

          {!appointment.isVirtual && appointment.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {appointment.location}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {canCheckIn && (
            <Button size="sm" onClick={onCheckIn}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Check In
            </Button>
          )}
          {canComplete && (
            <Button size="sm" variant="outline" onClick={onComplete}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete
            </Button>
          )}
          {canMarkNoShow && (
            <Button
              size="sm"
              variant="outline"
              onClick={onNoShow}
              className="text-orange-600 hover:text-orange-700"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              No Show
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
