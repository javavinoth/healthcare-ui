import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  CheckCircle2,
  Clock,
  Users,
  MessageSquare,
  ClipboardList,
  Video,
  User,
  Settings,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import StatsCard from '@/components/patient/StatsCard'
import AppHeader from '@/components/shared/AppHeader'
import ScheduleSetupPrompt from '@/components/provider/ScheduleSetupPrompt'
import { providerApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/components/ui/use-toast'

/**
 * Provider Dashboard - Main Overview Page
 * Shows today's stats, appointments, and quick actions
 */
export default function ProviderDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { toast } = useToast()

  // Schedule setup prompt state
  const [showSchedulePrompt, setShowSchedulePrompt] = useState(false)
  const [schedulePromptDismissed, setSchedulePromptDismissed] = useState(false)

  // Fetch provider dashboard data
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useQuery({
    queryKey: ['provider', 'dashboard'],
    queryFn: () => providerApi.getDashboard(),
  })

  // Fetch provider settings to check schedule configuration
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['provider', 'settings'],
    queryFn: providerApi.getProviderSettings,
  })

  const stats = dashboardData?.stats || {}
  const todayAppointments = dashboardData?.todayAppointments || []
  const providerName = dashboardData?.providerName || user?.firstName || 'Provider'
  const specialty = dashboardData?.specialty || 'Healthcare Provider'

  // Check if schedule is configured (at least one day is active)
  const isScheduleConfigured = settings?.availability?.some((day: any) => day.isActive) || false

  // Check localStorage for prompt dismissal
  useEffect(() => {
    if (user?.id) {
      const dismissedKey = `schedule-prompt-dismissed-${user.id}`
      const isDismissed = localStorage.getItem(dismissedKey) === 'true'
      setSchedulePromptDismissed(isDismissed)

      // Show prompt if schedule not configured and not dismissed
      if (!settingsLoading && !isScheduleConfigured && !isDismissed) {
        setShowSchedulePrompt(true)
      }
    }
  }, [user?.id, isScheduleConfigured, settingsLoading])

  // Handle prompt dismissal
  const handleDismissPrompt = () => {
    if (user?.id) {
      const dismissedKey = `schedule-prompt-dismissed-${user.id}`
      localStorage.setItem(dismissedKey, 'true')
      setSchedulePromptDismissed(true)
    }
  }

  // Handle appointment actions
  const handleViewPatient = (patientId: string) => {
    navigate(`/provider/patients/${patientId}`)
  }

  const handleViewAppointment = (appointmentId: string) => {
    navigate(`/provider/appointments/${appointmentId}`)
  }

  const handleJoinVirtual = () => {
    toast({
      title: 'Virtual Appointment',
      description: 'Virtual appointment integration coming soon!',
      variant: 'info',
    })
  }

  // Format appointment status
  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      SCHEDULED: 'bg-info/10 text-info border-info/20',
      IN_PROGRESS: 'bg-primary/10 text-primary border-primary/20',
      COMPLETED: 'bg-wellness/10 text-wellness border-wellness/20',
      CANCELLED: 'bg-neutral-blue-gray/10 text-neutral-blue-gray border-neutral-blue-gray/20',
    }

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full border ${
          statusColors[status] || statusColors.SCHEDULED
        }`}
      >
        {status}
      </span>
    )
  }

  // Format appointment type
  const getTypeBadge = (type: string) => {
    const typeColors: Record<string, string> = {
      CONSULTATION: 'bg-primary/10 text-primary',
      FOLLOW_UP: 'bg-info/10 text-info',
      ROUTINE_CHECKUP: 'bg-wellness/10 text-wellness',
      EMERGENCY: 'bg-error/10 text-error',
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${typeColors[type] || typeColors.CONSULTATION}`}>
        {type.replace('_', ' ')}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Schedule Setup Prompt Modal */}
      <ScheduleSetupPrompt
        open={showSchedulePrompt}
        onOpenChange={setShowSchedulePrompt}
        onDismiss={handleDismissPrompt}
      />

      {/* App Header */}
      <AppHeader title={`Welcome back, Dr. ${providerName}!`} />

      {/* Schedule Not Configured Banner */}
      {!settingsLoading && !isScheduleConfigured && (
        <div className="bg-warning/10 border-b-2 border-warning/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-warning/90 mb-1">
                  Action Required: Set Up Your Availability
                </p>
                <p className="text-sm text-warning/80 mb-3">
                  Your schedule is not configured. Patients cannot book appointments with you until you set your
                  available hours.
                </p>
                <Button
                  size="sm"
                  onClick={() => navigate('/provider/schedule')}
                  className="gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Set Up Schedule Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Subheader */}
      <div className="bg-white border-b border-neutral-blue-gray/10 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <p className="text-body text-neutral-blue-gray/70">{specialty}</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/provider/messages')}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
                {stats.unreadMessages > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-error text-white rounded-full">
                    {stats.unreadMessages}
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/provider/patients')}
              >
                <Users className="h-4 w-4 mr-2" />
                My Patients
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/provider/schedule')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage Schedule
              </Button>
              <Button
                onClick={() => navigate('/provider/appointments')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                View Schedule
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {dashboardLoading ? (
            <>
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </>
          ) : dashboardError ? (
            <div className="col-span-full bg-white rounded-lg p-6 border border-error/20">
              <p className="text-error">Failed to load dashboard data. Please try again.</p>
            </div>
          ) : (
            <>
              <StatsCard
                title="Appointments Today"
                value={stats.appointmentsToday || 0}
                icon={Calendar}
                description={`${stats.appointmentsPending || 0} pending`}
                iconColor="text-primary"
                iconBgColor="bg-primary/10"
              />
              <StatsCard
                title="Completed Today"
                value={stats.appointmentsCompleted || 0}
                icon={CheckCircle2}
                description="Appointments finished"
                iconColor="text-wellness"
                iconBgColor="bg-wellness/10"
              />
              <StatsCard
                title="Pending Appointments"
                value={stats.appointmentsPending || 0}
                icon={Clock}
                description="Awaiting completion"
                iconColor="text-info"
                iconBgColor="bg-info/10"
              />
              <StatsCard
                title="Patients Today"
                value={stats.patientsToday || 0}
                icon={Users}
                description="Unique patients"
                iconColor="text-secondary"
                iconBgColor="bg-secondary/10"
              />
              <StatsCard
                title="Unread Messages"
                value={stats.unreadMessages || 0}
                icon={MessageSquare}
                description={stats.unreadMessages > 0 ? 'Require attention' : 'All caught up!'}
                iconColor="text-warning"
                iconBgColor="bg-warning/10"
              />
              <StatsCard
                title="Pending Tasks"
                value={stats.pendingTasks || 0}
                icon={ClipboardList}
                description="Notes & follow-ups"
                iconColor="text-neutral-blue-gray"
                iconBgColor="bg-neutral-blue-gray/10"
              />
            </>
          )}
        </div>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Today's Schedule</span>
              <span className="text-sm font-normal text-neutral-blue-gray/60">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>
            ) : dashboardError ? (
              <div className="text-center py-8 text-error">Failed to load today's schedule.</div>
            ) : todayAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-neutral-blue-gray/30 mb-4" />
                <p className="text-neutral-blue-gray/60">No appointments scheduled for today</p>
                <p className="text-sm text-neutral-blue-gray/50 mt-2">Enjoy your day!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayAppointments.map((appointment: any) => (
                  <div
                    key={appointment.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-neutral-blue-gray/10 hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-pointer"
                    onClick={() => handleViewAppointment(appointment.id)}
                  >
                    {/* Time */}
                    <div className="flex flex-col items-center justify-center w-20 text-center">
                      <p className="text-sm font-semibold text-neutral-blue-gray">{appointment.time}</p>
                      {appointment.isVirtual && (
                        <div className="mt-1" title="Virtual Appointment">
                          <Video className="h-4 w-4 text-info" />
                        </div>
                      )}
                    </div>

                    {/* Patient Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-neutral-blue-gray/50" />
                        <p className="font-semibold text-neutral-blue-gray truncate">
                          {appointment.patientName}
                        </p>
                      </div>
                      <p className="text-sm text-neutral-blue-gray/70 truncate">{appointment.reason}</p>
                      <div className="flex gap-2 mt-2">
                        {getTypeBadge(appointment.type)}
                        {getStatusBadge(appointment.status)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewPatient(appointment.patientId)
                        }}
                      >
                        <User className="h-4 w-4 mr-1" />
                        View Patient
                      </Button>
                      {appointment.isVirtual && appointment.status === 'SCHEDULED' && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleJoinVirtual()
                          }}
                        >
                          <Video className="h-4 w-4 mr-1" />
                          Join
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
