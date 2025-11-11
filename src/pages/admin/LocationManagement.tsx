import { useState, useMemo } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  MapPin,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  Building2,
  Phone,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import AppHeader from '@/components/shared/AppHeader'
import { hospitalApi, locationApi } from '@/lib/api'
import { queryKeys, invalidateLocations } from '@/lib/queryClient'
import { extractErrorMessage } from '@/lib/utils/apiError'
import CreateLocationModal from '@/components/admin/CreateLocationModal'
import EditLocationModal from '@/components/admin/EditLocationModal'
import type { Location } from '@/types'

/**
 * Location Management Page
 * Manage hospital locations (buildings, floors, wings)
 */
export default function LocationManagement() {
  const { toast } = useToast()

  // State for filters
  const [search, setSearch] = useState('')
  const [hospitalFilter, setHospitalFilter] = useState<string>('ALL')
  const [activeFilter, setActiveFilter] = useState<string>('ALL')

  // Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  // Fetch active hospitals for filter dropdown
  const { data: hospitals = [] } = useQuery({
    queryKey: queryKeys.hospitals.active,
    queryFn: () => hospitalApi.getActive(),
  })

  // Fetch all locations (we'll filter client-side for simplicity)
  const { data: allLocations = [], isLoading } = useQuery({
    queryKey: queryKeys.locations.all(),
    queryFn: async () => {
      // Fetch locations for all hospitals
      const locationsPromises = hospitals.map((hospital) => locationApi.getByHospital(hospital.id))
      const locationsArrays = await Promise.all(locationsPromises)
      return locationsArrays.flat()
    },
    enabled: hospitals.length > 0,
  })

  // Client-side filtering
  const filteredLocations = useMemo(() => {
    let filtered = allLocations

    // Filter by hospital
    if (hospitalFilter !== 'ALL') {
      filtered = filtered.filter((loc) => loc.hospitalId === hospitalFilter)
    }

    // Filter by active status
    if (activeFilter === 'ACTIVE') {
      filtered = filtered.filter((loc) => loc.active)
    } else if (activeFilter === 'INACTIVE') {
      filtered = filtered.filter((loc) => !loc.active)
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (loc) =>
          loc.name.toLowerCase().includes(searchLower) ||
          loc.code.toLowerCase().includes(searchLower) ||
          loc.hospitalName?.toLowerCase().includes(searchLower) ||
          loc.floor?.toLowerCase().includes(searchLower) ||
          loc.buildingNumber?.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  }, [allLocations, hospitalFilter, activeFilter, search])

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => locationApi.delete(id),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Location deleted successfully',
      })
      invalidateLocations()
      setDeleteDialogOpen(false)
      setSelectedLocation(null)
    },
    onError: (error: unknown) => {
      const message = extractErrorMessage(error, 'Failed to delete location')
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
    },
  })

  // Handler functions
  const handleSearch = (value: string) => {
    setSearch(value)
  }

  const handleHospitalFilter = (value: string) => {
    setHospitalFilter(value)
  }

  const handleActiveFilter = (value: string) => {
    setActiveFilter(value)
  }

  const handleEditLocation = (location: Location) => {
    setSelectedLocation(location)
    setEditModalOpen(true)
  }

  const handleDeleteLocation = (location: Location) => {
    setSelectedLocation(location)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedLocation) {
      deleteMutation.mutate(selectedLocation.id)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* App Header */}
      <AppHeader title="Location Management" showBackButton backPath="/admin/dashboard" />

      {/* Page Subheader */}
      <div className="bg-white border-b border-neutral-blue-gray/10 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <p className="text-body text-neutral-blue-gray/70">
              Manage hospital locations, buildings, and floors
            </p>
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          {/* Filters */}
          <div className="p-6 border-b border-neutral-blue-gray/10">
            <div className="flex flex-col gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-blue-gray/50" />
                <Input
                  placeholder="Search by location name, code, floor, or building..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Hospital and Status Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Hospital Filter */}
                <Select value={hospitalFilter} onValueChange={handleHospitalFilter}>
                  <SelectTrigger className="w-full sm:w-[250px]">
                    <SelectValue placeholder="Filter by hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Hospitals</SelectItem>
                    {hospitals.map((hospital) => (
                      <SelectItem key={hospital.id} value={hospital.id}>
                        {hospital.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Active Filter */}
                <Select value={activeFilter} onValueChange={handleActiveFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Locations</SelectItem>
                    <SelectItem value="ACTIVE">Active Only</SelectItem>
                    <SelectItem value="INACTIVE">Inactive Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results count */}
            {!isLoading && (
              <div className="mt-4 text-sm text-neutral-blue-gray/60">
                Showing {filteredLocations.length} locations
              </div>
            )}
          </div>

          {/* Table */}
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            ) : filteredLocations.length === 0 ? (
              <div className="p-12 text-center">
                <MapPin className="h-12 w-12 mx-auto text-neutral-blue-gray/30 mb-4" />
                <p className="text-neutral-blue-gray/60">No locations found</p>
                {(search || hospitalFilter !== 'ALL' || activeFilter !== 'ALL') && (
                  <Button
                    variant="link"
                    onClick={() => {
                      setSearch('')
                      setHospitalFilter('ALL')
                      setActiveFilter('ALL')
                    }}
                    className="mt-2"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hospital</TableHead>
                      <TableHead>Location Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Floor/Building</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLocations.map((location) => (
                      <TableRow key={location.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-primary-blue" />
                            {location.hospitalName || 'Unknown'}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-wellness" />
                            {location.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-neutral-blue-gray/70">
                          <Badge variant="outline">{location.code}</Badge>
                        </TableCell>
                        <TableCell className="text-neutral-blue-gray/70 text-sm">
                          <div>
                            {location.floor && <div>Floor: {location.floor}</div>}
                            {location.buildingNumber && (
                              <div>Building: {location.buildingNumber}</div>
                            )}
                            {!location.floor && !location.buildingNumber && '-'}
                          </div>
                        </TableCell>
                        <TableCell className="text-neutral-blue-gray/70">
                          {location.phoneNumber ? (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3 text-neutral-blue-gray/50" />
                              {location.phoneNumber}
                            </div>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {location.active ? (
                            <div className="flex items-center gap-2 text-wellness">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="text-sm">Active</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-neutral-blue-gray/50">
                              <AlertCircle className="h-4 w-4" />
                              <span className="text-sm">Inactive</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-neutral-blue-gray/70 text-sm">
                          {formatDate(location.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditLocation(location)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Location
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteLocation(location)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Location
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <CreateLocationModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        hospitals={hospitals}
      />

      {selectedLocation && (
        <EditLocationModal
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false)
            setSelectedLocation(null)
          }}
          location={selectedLocation}
          hospitals={hospitals}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Location</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedLocation?.name}? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedLocation(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Location'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
