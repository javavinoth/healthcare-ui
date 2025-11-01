import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Calendar, MessageSquare, Users, ClipboardCheck, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import AppHeader from '@/components/shared/AppHeader'
import { appointmentsApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { format } from 'date-fns'

/**
 * Receptionist Dashboard - Main Overview Page
 * Shows today's appointments, check-in status, and quick actions for reception staff
 */
export default function ReceptionistDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // Fetch today's appointments
  const {
    data: appointmentsData,
    isLoading: appointmentsLoading,
    error: appointmentsError,
  } = useQuery({
    queryKey: ['appointments', 'today'],
    queryFn: async () => {
      const appointments = await appointmentsApi.getAll({
        status: 'scheduled',
      })
      // Filter for today's appointments
      const today = new Date().toDateString()
      return appointments.filter(
        (apt) => new Date(apt.date).toDateString() === today
      )
    },
  })

  const todaysAppointments = appointmentsData || []
  const checkedInCount = todaysAppointments.filter((apt) => apt.status === 'checked_in').length
  const upcomingCount = todaysAppointments.filter((apt) => apt.status === 'scheduled').length

  return (
    <div className="h-screen flex flex-col bg-neutral-light">
      <AppHeader title="Receptionist Dashboard" />

      <div className="flex-1 overflow-auto">
        {/* Welcome Section */}
        <div className="bg-white border-b border-neutral-blue-gray/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-h1 text-neutral-blue-gray">
                  Welcome back, {user?.firstName}!
                </h1>
                <p className="text-body text-neutral-blue-gray/70 mt-1">
                  Here's today's reception overview
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {appointmentsLoading ? (
              <>
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </>
            ) : (
              <>
                <div className="bg-white rounded-lg p-6 border border-neutral-blue-gray/10 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-caption text-neutral-blue-gray/70">
                        Today's Appointments
                      </p>
                      <p className="text-h2 text-neutral-blue-gray mt-1">
                        {todaysAppointments.length}
                      </p>
                      <p className="text-caption text-neutral-blue-gray/70 mt-1">
                        {format(new Date(), 'EEEE, MMM dd')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-neutral-blue-gray/10 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-wellness/10">
                      <ClipboardCheck className="h-6 w-6 text-wellness" />
                    </div>
                    <div>
                      <p className="text-caption text-neutral-blue-gray/70">
                        Checked In
                      </p>
                      <p className="text-h2 text-neutral-blue-gray mt-1">
                        {checkedInCount}
                      </p>
                      <p className="text-caption text-neutral-blue-gray/70 mt-1">
                        {upcomingCount} pending
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-neutral-blue-gray/10 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-info/10">
                      <MessageSquare className="h-6 w-6 text-info" />
                    </div>
                    <div>
                      <p className="text-caption text-neutral-blue-gray/70">
                        Messages
                      </p>
                      <p className="text-h2 text-neutral-blue-gray mt-1">
                        -
                      </p>
                      <p className="text-caption text-neutral-blue-gray/70 mt-1">
                        View inbox
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate('/receptionist/messages')}
            >
              <MessageSquare className="h-6 w-6" />
              <span>View Messages</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate('/receptionist/appointments')}
            >
              <Calendar className="h-6 w-6" />
              <span>Manage Appointments</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate('/receptionist/patients')}
            >
              <Users className="h-6 w-6" />
              <span>Patient Check-In</span>
            </Button>
          </div>

          {/* Today's Appointments */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h2 text-neutral-blue-gray">Today's Appointments</h2>
              {todaysAppointments.length > 0 && (
                <Button
                  variant="link"
                  onClick={() => navigate('/receptionist/appointments')}
                >
                  View all
                </Button>
              )}
            </div>

            {appointmentsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>
            ) : appointmentsError ? (
              <div className="bg-white rounded-lg p-6 border border-error/20">
                <p className="text-error">Failed to load appointments. Please try again.</p>
              </div>
            ) : todaysAppointments.length === 0 ? (
              <div className="bg-white rounded-lg p-8 border border-neutral-blue-gray/10 text-center">
                <Calendar className="h-12 w-12 text-neutral-blue-gray/30 mx-auto mb-4" />
                <p className="text-h3 text-neutral-blue-gray mb-2">
                  No appointments scheduled
                </p>
                <p className="text-body text-neutral-blue-gray/70">
                  There are no appointments scheduled for today.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-neutral-blue-gray/10 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-blue-gray/10">
                    <thead className="bg-neutral-light">
                      <tr>
                        <th className="px-6 py-3 text-left text-caption font-medium text-neutral-blue-gray/70 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-3 text-left text-caption font-medium text-neutral-blue-gray/70 uppercase tracking-wider">
                          Patient
                        </th>
                        <th className="px-6 py-3 text-left text-caption font-medium text-neutral-blue-gray/70 uppercase tracking-wider">
                          Provider
                        </th>
                        <th className="px-6 py-3 text-left text-caption font-medium text-neutral-blue-gray/70 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-caption font-medium text-neutral-blue-gray/70 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-blue-gray/10">
                      {todaysAppointments.map((appointment) => (
                        <tr key={appointment.id} className="hover:bg-neutral-light/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-body text-neutral-blue-gray">
                              <Clock className="h-4 w-4 mr-2 text-neutral-blue-gray/50" />
                              {format(new Date(appointment.date), 'h:mm a')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-body font-medium text-neutral-blue-gray">
                              {appointment.patientName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-body text-neutral-blue-gray/70">
                              {appointment.provider}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-body text-neutral-blue-gray/70">
                              {appointment.type.replace(/_/g, ' ')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-caption rounded-full ${
                                appointment.status === 'checked_in'
                                  ? 'bg-wellness/10 text-wellness'
                                  : appointment.status === 'scheduled'
                                  ? 'bg-info/10 text-info'
                                  : 'bg-neutral-blue-gray/10 text-neutral-blue-gray'
                              }`}
                            >
                              {appointment.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
