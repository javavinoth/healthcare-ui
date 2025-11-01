import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { providerApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Clock } from 'lucide-react'

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
        isActive: true,
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

  if (isLoadingSettings) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {availability.map((day, index) => {
          const dayInfo = DAYS_OF_WEEK[index]
          return (
            <div
              key={day.dayOfWeek}
              className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg transition-colors ${
                day.isActive ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'
              }`}
            >
              <div className="flex items-center justify-between sm:justify-start sm:w-40">
                <Label htmlFor={`${day.dayOfWeek}-active`} className="text-base font-medium">
                  {dayInfo.label}
                </Label>
                <Switch
                  id={`${day.dayOfWeek}-active`}
                  checked={day.isActive}
                  onCheckedChange={(checked: boolean) => updateDay(index, 'isActive', checked)}
                />
              </div>

              {day.isActive ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <Input
                      type="time"
                      value={day.startTime}
                      onChange={(e) => updateDay(index, 'startTime', e.target.value)}
                      className="w-full sm:w-32"
                      aria-label={`${dayInfo.label} start time`}
                    />
                  </div>
                  <span className="text-gray-500 hidden sm:inline">to</span>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <Input
                      type="time"
                      value={day.endTime}
                      onChange={(e) => updateDay(index, 'endTime', e.target.value)}
                      className="w-full sm:w-32"
                      aria-label={`${dayInfo.label} end time`}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">Not available</p>
              )}
            </div>
          )
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> Patients can only book appointments during your active hours. Make sure to disable days
          when you're not available.
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={!hasChanges || updateMutation.isPending}>
          {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Schedule
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
            Reset
          </Button>
        )}
      </div>
    </form>
  )
}
