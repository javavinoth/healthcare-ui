import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Calendar, FileText, MessageSquare, Plus, Clock, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import AppHeader from '@/components/shared/AppHeader'
import StatsCard from '@/components/patient/StatsCard'
import AppointmentCard from '@/components/patient/AppointmentCard'
import MedicalRecordCard from '@/components/patient/MedicalRecordCard'
import EmptyState from '@/components/patient/EmptyState'
import { appointmentsApi, medicalRecordsApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/components/ui/use-toast'

/**
 * Patient Dashboard - Main Overview Page
 * Shows upcoming appointments, recent medical records, and quick actions
 */
export default function PatientDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { toast } = useToast()

  // Fetch upcoming appointments
  const {
    data: appointmentsData,
    isLoading: appointmentsLoading,
    error: appointmentsError,
  } = useQuery({
    queryKey: ['appointments', 'upcoming'],
    queryFn: async () => {
      const appointments = await appointmentsApi.getAll({
        status: 'scheduled',
      })
      return appointments
    },
  })

  // Fetch recent medical records
  const {
    data: medicalRecordsData,
    isLoading: recordsLoading,
    error: recordsError,
  } = useQuery({
    queryKey: ['medical-records', 'recent'],
    queryFn: async () => {
      const records = await medicalRecordsApi.getAll({})
      return records
    },
  })

  const upcomingAppointments = appointmentsData?.slice(0, 3) || []
  const recentRecords = medicalRecordsData?.slice(0, 5) || []
  const newRecordsCount = recentRecords.filter((r) => r.isNew).length

  // Handle appointment actions
  const handleViewAppointmentDetails = (id: string) => {
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

  // Handle medical record actions
  const handleViewRecord = (_id: string) => {
    // Navigate to records view (to be implemented)
    toast({
      title: 'Medical Records',
      description: 'Medical records viewer coming soon!',
      variant: 'info',
    })
  }

  const handleDownloadRecord = async (id: string) => {
    try {
      const blob = await medicalRecordsApi.download(id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `medical-record-${id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: 'Download started',
        description: 'Your medical record is being downloaded.',
        variant: 'success',
      })
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'Failed to download medical record. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="h-screen flex flex-col bg-neutral-light">
      <AppHeader title="Patient Dashboard" />

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
                  Here's your health overview
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
              <StatsCard
                title="Upcoming Appointments"
                value={upcomingAppointments.length}
                icon={Calendar}
                description={
                  upcomingAppointments.length > 0
                    ? `Next: ${upcomingAppointments[0]?.date}`
                    : 'No upcoming appointments'
                }
                iconColor="text-primary"
                iconBgColor="bg-primary/10"
              />
              <StatsCard
                title="New Medical Records"
                value={newRecordsCount}
                icon={FileText}
                description={newRecordsCount > 0 ? 'Unread records available' : 'All caught up!'}
                iconColor="text-info"
                iconBgColor="bg-info/10"
              />
              <StatsCard
                title="Health Status"
                value="Good"
                icon={Activity}
                description="Based on recent checkups"
                iconColor="text-wellness"
                iconBgColor="bg-wellness/10"
              />
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Button
            variant="outline"
            className="h-auto py-4 flex-col gap-2"
            onClick={() => navigate('/patient/appointments/book')}
          >
            <Calendar className="h-6 w-6" />
            <span>Book Appointment</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex-col gap-2"
            onClick={() => navigate('/patient/appointments')}
          >
            <Clock className="h-6 w-6" />
            <span>View All Appointments</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex-col gap-2"
            onClick={() => navigate('/patient/messages')}
          >
            <MessageSquare className="h-6 w-6" />
            <span>Message Provider</span>
          </Button>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Appointments */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h2 text-neutral-blue-gray">Upcoming Appointments</h2>
              {upcomingAppointments.length > 0 && (
                <Button
                  variant="link"
                  onClick={() => navigate('/patient/appointments')}
                >
                  View all
                </Button>
              )}
            </div>

            {appointmentsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
              </div>
            ) : appointmentsError ? (
              <div className="bg-white rounded-lg p-6 border border-error/20">
                <p className="text-error">Failed to load appointments. Please try again.</p>
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No upcoming appointments"
                description="You don't have any scheduled appointments. Book one to see your healthcare provider."
                actionLabel="Book Appointment"
                onAction={() => navigate('/patient/appointments/book')}
              />
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onViewDetails={handleViewAppointmentDetails}
                    onJoinVideo={handleJoinVideo}
                    compact
                  />
                ))}
              </div>
            )}
          </div>

          {/* Recent Medical Records */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h2 text-neutral-blue-gray">Recent Medical Records</h2>
              {recentRecords.length > 0 && (
                <Button variant="link">View all</Button>
              )}
            </div>

            {recordsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
            ) : recordsError ? (
              <div className="bg-white rounded-lg p-6 border border-error/20">
                <p className="text-error">Failed to load medical records. Please try again.</p>
              </div>
            ) : recentRecords.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No medical records"
                description="Your medical records will appear here once they are available."
              />
            ) : (
              <div className="space-y-4">
                {recentRecords.map((record) => (
                  <MedicalRecordCard
                    key={record.id}
                    record={record}
                    onView={handleViewRecord}
                    onDownload={handleDownloadRecord}
                    compact
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
