import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { providerApi } from '@/lib/api'
import PrescriptionCard from './PrescriptionCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Pill, AlertCircle } from 'lucide-react'

interface PrescriptionsListProps {
  patientId: string
}

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Prescriptions' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'DISCONTINUED', label: 'Discontinued' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export default function PrescriptionsList({ patientId }: PrescriptionsListProps) {
  const [statusFilter, setStatusFilter] = useState('ALL')

  const {
    data: prescriptions,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['provider', 'patients', patientId, 'prescriptions', statusFilter],
    queryFn: () =>
      providerApi.getPatientPrescriptions(
        patientId,
        statusFilter === 'ALL' ? undefined : statusFilter
      ),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3 p-4 border rounded-lg">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    const apiError = error as { response?: { data?: { message?: string } } }
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
        <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Prescriptions</h3>
        <p className="text-sm text-muted-foreground">
          {apiError?.response?.data?.message || 'Failed to load prescriptions. Please try again.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {statusFilter && statusFilter !== 'ALL' && (
          <Button variant="ghost" size="sm" onClick={() => setStatusFilter('ALL')}>
            Clear Filter
          </Button>
        )}
      </div>

      {/* Prescriptions List */}
      {!prescriptions || prescriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Pill className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Prescriptions</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {statusFilter && statusFilter !== 'ALL'
              ? `No ${statusFilter.toLowerCase()} prescriptions found for this patient.`
              : 'No prescriptions have been written for this patient yet. Click "Write Prescription" to create one.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((prescription) => (
            <PrescriptionCard key={prescription.id} prescription={prescription} />
          ))}
        </div>
      )}
    </div>
  )
}
