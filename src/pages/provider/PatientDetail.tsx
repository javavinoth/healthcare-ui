import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import AppHeader from '@/components/shared/AppHeader'
import PatientOverview from '@/components/provider/PatientOverview'
import MedicalTimeline from '@/components/provider/MedicalTimeline'
import EditPatientDialog from '@/components/provider/EditPatientDialog'
import VisitNoteForm from '@/components/provider/VisitNoteForm'
import PrescriptionForm from '@/components/provider/PrescriptionForm'
import NotesList from '@/components/provider/NotesList'
import PrescriptionsList from '@/components/provider/PrescriptionsList'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Edit, FileText, User as UserIcon } from 'lucide-react'
import { providerApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Fetch patient detail
  const {
    data: patient,
    isLoading: isLoadingPatient,
    isError: isPatientError,
    error: patientError,
  } = useQuery({
    queryKey: ['patient-detail', id],
    queryFn: () => providerApi.getPatientDetail(id!),
    enabled: !!id,
    staleTime: 0, // HIPAA: PHI must not be cached
  })

  // Fetch patient timeline
  const {
    data: timeline,
    isLoading: isLoadingTimeline,
  } = useQuery({
    queryKey: ['patient-timeline', id],
    queryFn: () => providerApi.getPatientTimeline(id!),
    enabled: !!id,
    staleTime: 0, // HIPAA: PHI must not be cached
  })

  // Check if user is a doctor (can edit)
  const canEdit = user?.role === 'doctor'

  // Loading state
  if (isLoadingPatient) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <AppHeader title="Patient Details" showBackButton backPath="/provider/patients" />
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-10 w-full max-w-md mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-96" />
              <Skeleton className="h-96" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (isPatientError || !patient) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <AppHeader title="Patient Details" showBackButton backPath="/provider/patients" />
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-destructive mb-2">
                Error Loading Patient
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {patientError instanceof Error
                  ? patientError.message
                  : 'Patient not found or you do not have permission to access this patient'}
              </p>
              <Button onClick={() => navigate('/provider/patients')}>
                Back to Patients
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <AppHeader
        title={`${patient.firstName} ${patient.lastName}`}
        showBackButton
        backPath="/provider/patients"
      />

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {patient.firstName} {patient.lastName}
                {patient.age && (
                  <span className="text-lg text-muted-foreground font-normal ml-2">
                    ({patient.age} years old)
                  </span>
                )}
              </h1>
              {patient.medicalRecordNumber && (
                <p className="text-sm text-muted-foreground mt-1">
                  MRN: {patient.medicalRecordNumber}
                </p>
              )}
            </div>

            {canEdit && (
              <Button onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Patient
              </Button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UserIcon className="h-5 w-5 text-blue-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {patient.totalAppointments || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total Appointments
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="h-5 w-5 text-purple-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {patient.totalRecords || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Medical Records
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-5 w-5 text-green-700" />
                </div>
                <div>
                  <p className="text-sm font-medium">Last Visit</p>
                  <p className="text-sm text-muted-foreground">
                    {patient.lastAppointmentDate || 'No visits yet'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="timeline">Medical Timeline</TabsTrigger>
              <TabsTrigger value="notes">Clinical Notes</TabsTrigger>
              <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <PatientOverview patient={patient} />
            </TabsContent>

            <TabsContent value="timeline">
              <MedicalTimeline
                events={timeline || []}
                isLoading={isLoadingTimeline}
              />
            </TabsContent>

            <TabsContent value="notes">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold">Clinical Visit Notes</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      SOAP format documentation of patient visits
                    </p>
                  </div>
                  <VisitNoteForm
                    patientId={id!}
                    patientName={`${patient.firstName} ${patient.lastName}`}
                  />
                </div>
                <NotesList patientId={id!} />
              </div>
            </TabsContent>

            <TabsContent value="prescriptions">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold">Prescriptions</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Medication prescriptions for this patient
                    </p>
                  </div>
                  <PrescriptionForm
                    patientId={id!}
                    patientName={`${patient.firstName} ${patient.lastName}`}
                  />
                </div>
                <PrescriptionsList patientId={id!} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit Patient Dialog */}
      {canEdit && (
        <EditPatientDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          patient={patient}
        />
      )}
    </div>
  )
}
