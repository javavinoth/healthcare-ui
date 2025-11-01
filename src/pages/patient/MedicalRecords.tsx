import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { FileText, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import AppHeader from '@/components/shared/AppHeader'
import MedicalRecordCard from '@/components/patient/MedicalRecordCard'
import EmptyState from '@/components/patient/EmptyState'
import { medicalRecordsApi } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'

/**
 * Medical Records List Page
 * View all medical records with filtering
 */
export default function MedicalRecords() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [typeFilter, setTypeFilter] = useState<string>('all')

  // Fetch medical records
  const {
    data: medicalRecordsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['medical-records', typeFilter],
    queryFn: async () => {
      const records = await medicalRecordsApi.getAll({
        type: typeFilter === 'all' ? undefined : typeFilter,
      })
      return records
    },
  })

  const medicalRecords = medicalRecordsData || []

  // Handle medical record actions
  const handleView = (id: string) => {
    navigate(`/patient/medical-records/${id}`)
  }

  const handleDownload = async (id: string) => {
    try {
      const blob = await medicalRecordsApi.download(id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `medical-record-${id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

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

  // Group records by new/existing
  const newRecords = medicalRecords.filter((record) => record.isNew)
  const existingRecords = medicalRecords.filter((record) => !record.isNew)

  return (
    <div className="h-screen flex flex-col bg-neutral-light">
      <AppHeader title="Medical Records" />

      <div className="flex-1 overflow-auto">
        {/* Page Header */}
        <div className="bg-white border-b border-neutral-blue-gray/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-h1 text-neutral-blue-gray">Medical Records</h1>
                <p className="text-body text-neutral-blue-gray/70 mt-1">
                  View your lab results, imaging reports, and visit notes
                </p>
              </div>
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
                  <Label htmlFor="type-filter">Record Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger id="type-filter">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Records</SelectItem>
                      <SelectItem value="lab_result">Lab Results</SelectItem>
                      <SelectItem value="imaging">Imaging</SelectItem>
                      <SelectItem value="visit_note">Visit Notes</SelectItem>
                      <SelectItem value="prescription">Prescriptions</SelectItem>
                      <SelectItem value="immunization">Immunizations</SelectItem>
                      <SelectItem value="procedure_note">Procedure Notes</SelectItem>
                      <SelectItem value="discharge_summary">Discharge Summaries</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Records List */}
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
                <p className="text-error mb-4">Failed to load medical records.</p>
                <Button onClick={() => refetch()} variant="outline">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : medicalRecords.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={
              typeFilter === 'all'
                ? 'No medical records found'
                : `No ${typeFilter.replace('_', ' ')} records`
            }
            description={
              typeFilter === 'all'
                ? "You don't have any medical records yet."
                : `You don't have any ${typeFilter.replace('_', ' ')} records. Try changing the filter.`
            }
            actionLabel={typeFilter === 'all' ? undefined : 'Show All'}
            onAction={() => (typeFilter === 'all' ? undefined : setTypeFilter('all'))}
          />
        ) : (
          <div className="space-y-8">
            {/* New Records */}
            {newRecords.length > 0 && (
              <div>
                <h2 className="text-h3 text-neutral-blue-gray mb-4">
                  New Records ({newRecords.length})
                </h2>
                <div className="space-y-4">
                  {newRecords.map((record) => (
                    <MedicalRecordCard
                      key={record.id}
                      record={record}
                      onView={handleView}
                      onDownload={handleDownload}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Records */}
            {existingRecords.length > 0 && (
              <div>
                <h2 className="text-h3 text-neutral-blue-gray mb-4">
                  {newRecords.length > 0 ? 'Previous Records' : 'All Records'} ({existingRecords.length})
                </h2>
                <div className="space-y-4">
                  {existingRecords.map((record) => (
                    <MedicalRecordCard
                      key={record.id}
                      record={record}
                      onView={handleView}
                      onDownload={handleDownload}
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
