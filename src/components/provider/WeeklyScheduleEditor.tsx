import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { providerApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Clock, Calendar, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

const DAYS_OF_WEEK = [
  { key: 'MONDAY', label: 'Monday' },
  { key: 'TUESDAY', label: 'Tuesday' },
  { key: 'WEDNESDAY', label: 'Wednesday' },
  { key: 'THURSDAY', label: 'Thursday' },
  { key: 'FRIDAY', label: 'Friday' },
  { key: 'SATURDAY', label: 'Saturday' },
  { key: 'SUNDAY', label: 'Sunday' },
]

const daySchema = z.object({
  dayOfWeek: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  isActive: z.boolean(),
})

type DayFormData = z.infer<typeof daySchema>

const scheduleSchema = z.object({
  availability: z.array(daySchema),
})

type ScheduleFormData = z.infer<typeof scheduleSchema>

export default function WeeklyScheduleEditor() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [hasChanges, setHasChanges] = useState(false)

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      availability: DAYS_OF_WEEK.map((day) => ({
        dayOfWeek: day.key,
        startTime: '09:00',
        endTime: '17:00',
        isActive: false, // Default to OFF - providers must explicitly enable days
      })),
    },
  })

  const availability = watch('availability')

  // Fetch current settings
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['provider', 'settings'],
    queryFn: providerApi.getProviderSettings,
  })

  // Load availability into form when data arrives
  useEffect(() => {
    if (settings?.availability && settings.availability.length > 0) {
      // Map backend data to form structure
      const availabilityMap = new Map(
        settings.availability.map((item: any) => [item.dayOfWeek, item])
      )

      const formData = DAYS_OF_WEEK.map((day) => {
        const existingData = availabilityMap.get(day.key)
        return {
          dayOfWeek: day.key,
          startTime: existingData?.startTime || '09:00',
          endTime: existingData?.endTime || '17:00',
          isActive: existingData?.isActive ?? false,
        }
      })

      reset({ availability: formData })
      setHasChanges(false)
    }
  }, [settings, reset])

  // Update availability mutation
  const updateMutation = useMutation({
    mutationFn: (data: ScheduleFormData) => providerApi.updateAvailability(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider', 'settings'] })
      setHasChanges(false)
      toast({
        title: 'Schedule Updated',
        description: 'Your weekly availability has been saved successfully.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.response?.data?.message || 'Failed to update schedule. Please try again.',
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: ScheduleFormData) => {
    updateMutation.mutate(data)
  }

  const updateDay = (index: number, field: keyof DayFormData, value: any) => {
    const newAvailability = [...availability]
    newAvailability[index] = { ...newAvailability[index], [field]: value }
    setValue('availability', newAvailability)
    setHasChanges(true)
  }

  // Helper: Enable all days
  const enableAllDays = () => {
    const newAvailability = availability.map(day => ({
      ...day,
      isActive: true,
    }))
    setValue('availability', newAvailability)
    setHasChanges(true)
  }

  // Helper: Disable all days
  const disableAllDays = () => {
    const newAvailability = availability.map(day => ({
      ...day,
      isActive: false,
    }))
    setValue('availability', newAvailability)
    setHasChanges(true)
  }

  // Helper: Apply business hours template (Mon-Fri 9-5)
  const applyBusinessHours = () => {
    const newAvailability = availability.map(day => ({
      ...day,
      startTime: '09:00',
      endTime: '17:00',
      isActive: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'].includes(day.dayOfWeek),
    }))
    setValue('availability', newAvailability)
    setHasChanges(true)
  }

  // Check if all days are disabled
  const allDaysDisabled = availability.every(day => !day.isActive)
  const activeDaysCount = availability.filter(day => day.isActive).length

  if (isLoadingSettings) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pb-4 border-b">
        <div className="flex items-center gap-2 text-sm text-neutral-blue-gray/70">
          <Calendar className="h-4 w-4" />
          <span className="font-medium">Quick Actions:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={applyBusinessHours}
            className="gap-1"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Business Hours (Mon-Fri 9-5)
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={enableAllDays}
            className="gap-1"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Enable All Days
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={disableAllDays}
            className="gap-1 text-neutral-blue-gray"
          >
            <XCircle className="h-3.5 w-3.5" />
            Disable All Days
          </Button>
        </div>
      </div>

      {/* Status Summary */}
      {activeDaysCount > 0 && (
        <div className="bg-wellness/10 border border-wellness/20 rounded-lg p-3 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-wellness flex-shrink-0" />
          <p className="text-sm text-wellness/90">
            <strong>{activeDaysCount}</strong> {activeDaysCount === 1 ? 'day' : 'days'} enabled. Patients can book appointments during these times.
          </p>
        </div>
      )}

      {/* Warning if all days disabled */}
      {allDaysDisabled && (
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-warning/90 mb-1">No Available Time Slots</p>
            <p className="text-sm text-warning/80">
              You currently have no days enabled. Patients will not be able to book appointments with you.
              Enable at least one day to start accepting bookings.
            </p>
          </div>
        </div>
      )}

      {/* Weekly Schedule */}
      <div className="space-y-3">
        {availability.map((day, index) => {
          const dayInfo = DAYS_OF_WEEK[index]
          return (
            <div
              key={day.dayOfWeek}
              className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 border-2 rounded-xl transition-all duration-200 ${
                day.isActive
                  ? 'bg-primary/5 border-primary/30 shadow-sm hover:shadow-md hover:border-primary/50'
                  : 'bg-neutral-blue-gray/5 border-neutral-blue-gray/10 hover:border-neutral-blue-gray/20'
              }`}
            >
              {/* Day Label & Segmented Control Toggle */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2 min-w-[120px]">
                  <Calendar className={`h-4 w-4 ${day.isActive ? 'text-primary' : 'text-neutral-blue-gray/40'}`} />
                  <Label
                    className={`text-base font-semibold ${
                      day.isActive ? 'text-neutral-blue-gray' : 'text-neutral-blue-gray/50'
                    }`}
                  >
                    {dayInfo.label}
                  </Label>
                </div>

                {/* Segmented Control */}
                <div className="inline-flex rounded-lg border-2 border-neutral-blue-gray/20 p-0.5 bg-neutral-blue-gray/5">
                  <button
                    type="button"
                    onClick={() => updateDay(index, 'isActive', false)}
                    className={`px-6 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
                      !day.isActive
                        ? 'bg-neutral-blue-gray/90 text-white shadow-sm'
                        : 'text-neutral-blue-gray/60 hover:text-neutral-blue-gray hover:bg-neutral-blue-gray/5'
                    }`}
                    aria-label={`Set ${dayInfo.label} to unavailable`}
                  >
                    OFF
                  </button>
                  <button
                    type="button"
                    onClick={() => updateDay(index, 'isActive', true)}
                    className={`px-6 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
                      day.isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-neutral-blue-gray/60 hover:text-neutral-blue-gray hover:bg-neutral-blue-gray/5'
                    }`}
                    aria-label={`Set ${dayInfo.label} to available`}
                  >
                    ON
                  </button>
                </div>
              </div>

              {/* Time Inputs or Unavailable Message */}
              {day.isActive ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Clock className="h-4 w-4 text-primary" />
                    <Input
                      type="time"
                      value={day.startTime}
                      onChange={(e) => updateDay(index, 'startTime', e.target.value)}
                      className="w-full sm:w-36 border-primary/20 focus:border-primary"
                      aria-label={`${dayInfo.label} start time`}
                    />
                  </div>
                  <span className="text-neutral-blue-gray/50 font-medium hidden sm:inline">to</span>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Clock className="h-4 w-4 text-primary" />
                    <Input
                      type="time"
                      value={day.endTime}
                      onChange={(e) => updateDay(index, 'endTime', e.target.value)}
                      className="w-full sm:w-36 border-primary/20 focus:border-primary"
                      aria-label={`${dayInfo.label} end time`}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-1">
                  <XCircle className="h-4 w-4 text-neutral-blue-gray/40" />
                  <p className="text-sm text-neutral-blue-gray/50 italic font-medium">Not available</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Info Box */}
      <div className="bg-info/10 border border-info/20 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
        <div className="text-sm text-info/90">
          <p className="font-semibold mb-1">How Availability Works</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Days marked as "OFF" will not show any appointment slots to patients</li>
            <li>Set your working hours for each day you want to accept appointments</li>
            <li>Changes take effect immediately after saving</li>
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
        <Button
          type="submit"
          disabled={!hasChanges || updateMutation.isPending}
          className="gap-2"
        >
          {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {updateMutation.isPending ? 'Saving...' : 'Save Schedule'}
        </Button>
        {hasChanges && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (settings?.availability) {
                const availabilityMap = new Map(
                  settings.availability.map((item: any) => [item.dayOfWeek, item])
                )
                const formData = DAYS_OF_WEEK.map((day) => {
                  const existingData = availabilityMap.get(day.key)
                  return {
                    dayOfWeek: day.key,
                    startTime: existingData?.startTime || '09:00',
                    endTime: existingData?.endTime || '17:00',
                    isActive: existingData?.isActive ?? false,
                  }
                })
                reset({ availability: formData })
                setHasChanges(false)
              }
            }}
          >
            Reset Changes
          </Button>
        )}
      </div>
    </form>
  )
}
