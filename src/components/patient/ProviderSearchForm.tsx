import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { providerSearchSchema, type ProviderSearchFormData } from '@/lib/validations/appointments'

interface ProviderSearchFormProps {
  onSearch: (data: ProviderSearchFormData) => void
  onReset?: () => void
  isLoading?: boolean
}

const specialties = [
  'Cardiology',
  'Dermatology',
  'Family Medicine',
  'Internal Medicine',
  'Neurology',
  'Obstetrics & Gynecology',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Radiology',
  'Surgery',
  'Urology',
]

export default function ProviderSearchForm({
  onSearch,
  onReset,
  isLoading = false,
}: ProviderSearchFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProviderSearchFormData>({
    resolver: zodResolver(providerSearchSchema),
    defaultValues: {
      specialty: 'all',
      location: '',
      acceptingNewPatients: undefined,
      search: '',
    },
  })

  const specialty = watch('specialty')
  const acceptingNewPatients = watch('acceptingNewPatients')

  const handleReset = () => {
    reset()
    onReset?.()
  }

  // Transform form data before submission (convert 'all' to undefined for backend)
  const onSubmit = (data: ProviderSearchFormData) => {
    const transformedData = {
      ...data,
      specialty: data.specialty === 'all' ? undefined : data.specialty,
      location: data.location?.trim() || undefined,
    }
    onSearch(transformedData)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search by Name */}
            <div className="space-y-2">
              <Label htmlFor="search">Provider Name</Label>
              <Input
                id="search"
                placeholder="Search by name..."
                {...register('search')}
                className={errors.search ? 'border-error' : ''}
              />
              {errors.search && <p className="text-sm text-error">{errors.search.message}</p>}
            </div>

            {/* Specialty Filter */}
            <div className="space-y-2">
              <Label htmlFor="specialty">Specialty</Label>
              <Select value={specialty} onValueChange={(value) => setValue('specialty', value)}>
                <SelectTrigger id="specialty">
                  <SelectValue placeholder="All specialties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All specialties</SelectItem>
                  {specialties.map((spec) => (
                    <SelectItem key={spec} value={spec.toLowerCase()}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location Filter */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="City or ZIP code" {...register('location')} />
            </div>

            {/* Accepting New Patients */}
            <div className="space-y-2">
              <Label htmlFor="acceptingNewPatients">Availability</Label>
              <Select
                value={acceptingNewPatients === undefined ? 'all' : acceptingNewPatients.toString()}
                onValueChange={(value) =>
                  setValue('acceptingNewPatients', value === 'all' ? undefined : value === 'true')
                }
              >
                <SelectTrigger id="acceptingNewPatients">
                  <SelectValue placeholder="All providers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All providers</SelectItem>
                  <SelectItem value="true">Accepting new patients</SelectItem>
                  <SelectItem value="false">Not accepting new patients</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleReset} disabled={isLoading}>
              <X className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Search className="h-4 w-4 mr-1" />
              {isLoading ? 'Searching...' : 'Search Providers'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
