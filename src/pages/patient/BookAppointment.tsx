import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import AppHeader from '@/components/shared/AppHeader'
import ProviderSearchForm from '@/components/patient/ProviderSearchForm'
import ProviderCard from '@/components/patient/ProviderCard'
import AppointmentBookingForm from '@/components/patient/AppointmentBookingForm'
import EmptyState from '@/components/patient/EmptyState'
import { providersApi, appointmentsApi } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import {
  extractErrorMessage,
  getValidationErrors,
  formatValidationErrors,
} from '@/lib/utils/apiError'
import type {
  ProviderSearchFormData,
  AppointmentBookingFormData,
} from '@/lib/validations/appointments'
import type { ProviderSearchResult } from '@/types'

/**
 * Book Appointment Page
 * Multi-step appointment booking flow
 */
export default function BookAppointment() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [step, setStep] = useState<'search' | 'select' | 'book' | 'success'>('search')
  const [searchParams, setSearchParams] = useState<ProviderSearchFormData>({})
  const [selectedProvider, setSelectedProvider] = useState<ProviderSearchResult | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')

  // Fetch providers based on search
  const {
    data: providersData,
    isLoading: providersLoading,
    error: providersError,
  } = useQuery({
    queryKey: ['providers', searchParams],
    queryFn: async () => {
      console.log('[Provider Search] Fetching with params:', searchParams)
      const response = await providersApi.getAll({
        search: searchParams.search,
        specialty: searchParams.specialty,
        location: searchParams.location,
        acceptingNewPatients: searchParams.acceptingNewPatients,
      })
      console.log('[Provider Search] Raw response:', response)
      const data = response || []
      console.log('[Provider Search] Parsed data:', data, 'Count:', data.length)
      return data
    },
    enabled: step === 'select',
  })

  // Fetch available time slots when provider and date are selected
  const { data: slotsData, isLoading: slotsLoading } = useQuery({
    queryKey: ['availableSlots', selectedProvider?.id, selectedDate],
    queryFn: async () => {
      if (!selectedProvider?.id || !selectedDate) return { slots: [] }
      const response = await appointmentsApi.getAvailableSlots(selectedProvider.id, selectedDate)
      return response
    },
    enabled: step === 'book' && !!selectedProvider?.id && !!selectedDate,
    staleTime: 0, // Always fetch fresh availability data
  })

  // Book appointment mutation
  const bookAppointmentMutation = useMutation({
    mutationFn: appointmentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      setStep('success')
      toast({
        title: 'Appointment booked!',
        description: 'Your appointment has been successfully scheduled.',
        variant: 'success',
      })
    },
    onError: (error: unknown) => {
      // Check for validation errors first
      const validationErrors = getValidationErrors(error)
      const message =
        Object.keys(validationErrors).length > 0
          ? formatValidationErrors(error)
          : extractErrorMessage(error, 'Failed to book appointment. Please try again.')
      toast({
        title: 'Booking failed',
        description: message,
        variant: 'destructive',
      })
    },
  })

  const providers = providersData || []

  console.log(
    '[Provider Search] State - step:',
    step,
    'loading:',
    providersLoading,
    'error:',
    providersError,
    'providers:',
    providers,
    'count:',
    providers.length
  )

  // Handle search
  const handleSearch = (data: ProviderSearchFormData) => {
    console.log('[Provider Search] handleSearch called with:', data)
    setSearchParams(data)
    setStep('select')
  }

  // Handle provider selection
  const handleSelectProvider = (providerId: string) => {
    const provider = providers.find((p) => p.id === providerId)
    if (provider) {
      setSelectedProvider(provider as unknown as ProviderSearchResult)
      setStep('book')
    }
  }

  // Handle appointment booking
  const handleBookAppointment = async (data: AppointmentBookingFormData) => {
    if (!selectedProvider) return

    await bookAppointmentMutation.mutateAsync({
      ...data,
      providerId: selectedProvider.id,
      providerName: `${selectedProvider.firstName} ${selectedProvider.lastName}`,
      patientId: '', // Will be set by backend
      patientName: '', // Will be set by backend
      status: 'scheduled',
    })
  }

  return (
    <div className="h-screen flex flex-col bg-neutral-light">
      <AppHeader
        title="Book Appointment"
        showBackButton={step !== 'success'}
        backPath="/patient/appointments"
      />

      <div className="flex-1 overflow-auto">
        {/* Page Header */}
        <div className="bg-white border-b border-neutral-blue-gray/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div>
              <h1 className="text-h1 text-neutral-blue-gray">Book Appointment</h1>
              <p className="text-body text-neutral-blue-gray/70 mt-1">
                {step === 'search' && 'Search for a healthcare provider'}
                {step === 'select' && 'Select a provider'}
                {step === 'book' && 'Choose your appointment details'}
                {step === 'success' && 'Appointment confirmed'}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Step Indicator */}
          {step !== 'success' && (
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div
                  className={`flex items-center gap-2 ${step === 'search' ? 'text-primary' : 'text-neutral-blue-gray/50'}`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${step === 'search' ? 'bg-primary text-white' : 'bg-neutral-blue-gray/20'}`}
                  >
                    1
                  </div>
                  <span className="text-sm font-medium">Search</span>
                </div>
                <div className="flex-1 h-px bg-neutral-blue-gray/20 mx-4" />
                <div
                  className={`flex items-center gap-2 ${step === 'select' ? 'text-primary' : 'text-neutral-blue-gray/50'}`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${step === 'select' ? 'bg-primary text-white' : 'bg-neutral-blue-gray/20'}`}
                  >
                    2
                  </div>
                  <span className="text-sm font-medium">Select Provider</span>
                </div>
                <div className="flex-1 h-px bg-neutral-blue-gray/20 mx-4" />
                <div
                  className={`flex items-center gap-2 ${step === 'book' ? 'text-primary' : 'text-neutral-blue-gray/50'}`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${step === 'book' ? 'bg-primary text-white' : 'bg-neutral-blue-gray/20'}`}
                  >
                    3
                  </div>
                  <span className="text-sm font-medium">Book</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Search Providers */}
          {step === 'search' && (
            <ProviderSearchForm onSearch={handleSearch} onReset={() => setSearchParams({})} />
          )}

          {/* Step 2: Select Provider */}
          {step === 'select' && (
            <div className="space-y-4">
              {providersLoading ? (
                <>
                  <Skeleton className="h-48" />
                  <Skeleton className="h-48" />
                  <Skeleton className="h-48" />
                </>
              ) : providersError ? (
                <Card>
                  <CardContent className="p-12">
                    <p className="text-error text-center">
                      Failed to load providers. Please try again.
                    </p>
                  </CardContent>
                </Card>
              ) : providers.length === 0 ? (
                <EmptyState
                  icon={ArrowLeft}
                  title="No providers found"
                  description="No providers match your search criteria. Try adjusting your filters."
                  actionLabel="Back to Search"
                  onAction={() => setStep('search')}
                />
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-neutral-blue-gray/70">
                      Found {providers.length} provider{providers.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {providers.map((provider) => (
                    <ProviderCard
                      key={provider.id}
                      provider={provider as unknown as ProviderSearchResult}
                      onSelect={handleSelectProvider}
                      showSelectButton
                    />
                  ))}
                </>
              )}
            </div>
          )}

          {/* Step 3: Book Appointment */}
          {step === 'book' && selectedProvider && (
            <AppointmentBookingForm
              providerId={selectedProvider.id}
              providerName={`${selectedProvider.firstName} ${selectedProvider.lastName}`}
              availableSlots={slotsData?.slots || []}
              onSubmit={handleBookAppointment}
              onCancel={() => setStep('select')}
              isLoading={bookAppointmentMutation.isPending}
              isLoadingSlots={slotsLoading}
              onDateChange={(date) => setSelectedDate(date)}
            />
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <Card>
              <CardContent className="p-12">
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-wellness/10">
                      <CheckCircle className="h-12 w-12 text-wellness" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-h2 text-neutral-blue-gray mb-2">Appointment Confirmed!</h2>
                    <p className="text-neutral-blue-gray/70">
                      Your appointment has been successfully booked. You will receive a confirmation
                      email shortly.
                    </p>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => navigate('/patient/appointments')}>
                      View Appointments
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/patient/dashboard')}>
                      Back to Dashboard
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
