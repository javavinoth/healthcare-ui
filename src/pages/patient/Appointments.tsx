import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Calendar, Plus, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import AppHeader from '@/components/shared/AppHeader'
import AppointmentCard from '@/components/patient/AppointmentCard'
import EmptyState from '@/components/patient/EmptyState'
import { appointmentsApi } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'

/**
 * Appointments List Page
 * View all appointments with filtering
 */
export default function Appointments() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Fetch appointments
  const {
    data: appointmentsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['appointments', statusFilter],
    queryFn: async () => {
      const appointments = await appointmentsApi.getAll({
        status: statusFilter === 'all' ? undefined : statusFilter,
      })
      return appointments
    },
  })

  const appointments = appointmentsData || []

  // Handle appointment actions
  const handleViewDetails = (id: string) => {
    navigate(`/patient/appointments/${id}`)
  }

  const handleJoinVideo = (videoLink: string) => {
    window.open(videoLink, '_blank', 'noopener,noreferrer')
    toast({
      title: 'Opening video call',
      description: 'Your virtual appointment is opening in a new window.',
      variant: 'success',
    })
  }

  // Group appointments by status
  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === 'scheduled' || apt.status === 'confirmed'
  )
  const pastAppointments = appointments.filter(
    (apt) => apt.status === 'completed' || apt.status === 'cancelled' || apt.status === 'no_show'
  )

  return (
    <div className="h-screen flex flex-col bg-neutral-light">
      <AppHeader title="My Appointments" />

      <div className="flex-1 overflow-auto">
        {/* Page Header */}
        <div className="bg-white border-b border-neutral-blue-gray/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-h1 text-neutral-blue-gray">My Appointments</h1>
                <p className="text-body text-neutral-blue-gray/70 mt-1">
                  View and manage your appointments
                </p>
              </div>
              <Button onClick={() => navigate('/patient/appointments/book')}>
                <Plus className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Filter className="h-5 w-5 text-neutral-blue-gray/70" />
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status-filter">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger id="status-filter">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Appointments</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <p className="text-error mb-4">Failed to load appointments.</p>
                <Button onClick={() => refetch()} variant="outline">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : appointments.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title={
              statusFilter === 'all'
                ? 'No appointments found'
                : `No ${statusFilter} appointments`
            }
            description={
              statusFilter === 'all'
                ? "You don't have any appointments yet. Book one to get started!"
                : `You don't have any ${statusFilter} appointments. Try changing the filter.`
            }
            actionLabel={statusFilter === 'all' ? 'Book Appointment' : 'Show All'}
            onAction={() =>
              statusFilter === 'all'
                ? navigate('/patient/appointments/book')
                : setStatusFilter('all')
            }
          />
        ) : (
          <div className="space-y-8">
            {/* Upcoming Appointments */}
            {(statusFilter === 'all' || statusFilter === 'scheduled' || statusFilter === 'confirmed') &&
              upcomingAppointments.length > 0 && (
                <div>
                  <h2 className="text-h3 text-neutral-blue-gray mb-4">
                    Upcoming ({upcomingAppointments.length})
                  </h2>
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        onViewDetails={handleViewDetails}
                        onJoinVideo={handleJoinVideo}
                      />
                    ))}
                  </div>
                </div>
              )}

            {/* Past Appointments */}
            {(statusFilter === 'all' || statusFilter === 'completed' || statusFilter === 'cancelled') &&
              pastAppointments.length > 0 && (
                <div>
                  <h2 className="text-h3 text-neutral-blue-gray mb-4">
                    Past ({pastAppointments.length})
                  </h2>
                  <div className="space-y-4">
                    {pastAppointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        onViewDetails={handleViewDetails}
                        onJoinVideo={handleJoinVideo}
                      />
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
