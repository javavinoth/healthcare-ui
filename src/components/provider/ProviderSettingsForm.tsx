import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { providerApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'

const settingsSchema = z.object({
  slotDuration: z.number().min(5).max(240),
})

type SettingsFormData = z.infer<typeof settingsSchema>

const SLOT_DURATION_OPTIONS = [
  { value: 15, label: '15 minutes' },
  { value: 20, label: '20 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
]

export default function ProviderSettingsForm() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      slotDuration: 30,
    },
  })

  const slotDuration = watch('slotDuration')

  // Fetch current settings
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['provider', 'settings'],
    queryFn: providerApi.getProviderSettings,
  })

  // Load settings into form when data arrives
  useEffect(() => {
    if (settings) {
      setValue('slotDuration', settings.slotDuration)
    }
  }, [settings, setValue])

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: (data: SettingsFormData) => providerApi.updateProviderSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider', 'settings'] })
      toast({
        title: 'Settings Updated',
        description: 'Your appointment settings have been saved successfully.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.response?.data?.message || 'Failed to update settings. Please try again.',
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: SettingsFormData) => {
    updateMutation.mutate(data)
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
        <div>
          <Label htmlFor="slotDuration">Appointment Slot Duration</Label>
          <p className="text-sm text-gray-500 mt-1 mb-3">
            Choose how long each appointment slot should be. This will be used when patients book appointments.
          </p>
          <Select
            value={slotDuration.toString()}
            onValueChange={(value) => setValue('slotDuration', parseInt(value), { shouldDirty: true })}
          >
            <SelectTrigger id="slotDuration" className="w-full sm:w-[300px]">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              {SLOT_DURATION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> Changing your slot duration will affect future appointment bookings. Existing
            appointments will not be affected.
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={!isDirty || updateMutation.isPending}>
          {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
        {isDirty && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (settings) {
                setValue('slotDuration', settings.slotDuration)
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
