import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import AppHeader from '@/components/shared/AppHeader'
import PatientCard from '@/components/provider/PatientCard'
import PatientSearchBar from '@/components/provider/PatientSearchBar'
import PatientPagination from '@/components/provider/PatientPagination'
import { Skeleton } from '@/components/ui/skeleton'
import { Users } from 'lucide-react'
import { providerApi } from '@/lib/api'
import type { PatientSummary } from '@/types'

export default function PatientsPage() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch patients with pagination and search
  const {
    data: patientsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['provider-patients', currentPage, searchQuery],
    queryFn: () =>
      providerApi.getPatients({
        page: currentPage,
        size: 20,
        search: searchQuery || undefined,
      }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(0) // Reset to first page on new search
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePatientClick = (patientId: string) => {
    navigate(`/provider/patients/${patientId}`)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <AppHeader title="My Patients" showBackButton backPath="/provider/dashboard" />
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="mb-6">
              <Skeleton className="h-10 w-full max-w-md" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-40" />
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
        <AppHeader title="My Patients" showBackButton backPath="/provider/dashboard" />
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-destructive mb-2">
                Error Loading Patients
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

  const patients = patientsData?.data || []
  const isEmpty = patients.length === 0

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <AppHeader title="My Patients" />

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">My Patients</h1>
            <p className="text-sm text-muted-foreground">View and manage your patients</p>
          </div>

          {/* Search Bar */}
          <div className="mb-6 max-w-md">
            <PatientSearchBar onSearch={handleSearch} />
          </div>

          {/* Empty State */}
          {isEmpty && (
            <div className="bg-white border-2 border-dashed rounded-lg p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? 'No patients found' : 'No patients yet'}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {searchQuery
                  ? `No patients match "${searchQuery}". Try a different search term.`
                  : 'Patients you have appointments with will appear here.'}
              </p>
            </div>
          )}

          {/* Patient Grid */}
          {!isEmpty && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {patients.map((patient: PatientSummary) => (
                  <PatientCard key={patient.id} patient={patient} onClick={handlePatientClick} />
                ))}
              </div>

              {/* Pagination */}
              {patientsData &&
                patientsData.pagination &&
                patientsData.pagination.totalPages > 1 && (
                  <PatientPagination
                    currentPage={patientsData.pagination.currentPage}
                    totalPages={patientsData.pagination.totalPages}
                    totalElements={patientsData.pagination.totalElements}
                    pageSize={patientsData.pagination.pageSize}
                    hasNext={patientsData.pagination.hasNext}
                    hasPrevious={patientsData.pagination.hasPrevious}
                    onPageChange={handlePageChange}
                  />
                )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
