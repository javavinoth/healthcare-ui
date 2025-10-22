import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Clock } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { appointmentBookingSchema, type AppointmentBookingFormData } from '@/lib/validations/appointments'
import type { AppointmentType } from '@/types'

interface AppointmentBookingFormProps {
  providerId: string
  providerName: string
  availableSlots: string[]
  onSubmit: (data: AppointmentBookingFormData) => void
  onCancel?: () => void
  isLoading?: boolean
}

const appointmentTypes: { value: AppointmentType; label: string; description: string }[] = [
  { value: 'ROUTINE_CHECKUP', label: 'Routine Checkup', description: 'Annual physical or wellness visit' },
  { value: 'FOLLOW_UP', label: 'Follow-up', description: 'Follow-up from previous visit' },
  { value: 'CONSULTATION', label: 'Consultation', description: 'New patient consultation' },
  { value: 'URGENT_CARE', label: 'Urgent Care', description: 'Non-emergency urgent care' },
  { value: 'PROCEDURE', label: 'Procedure', description: 'Medical procedure' },
  { value: 'LAB_WORK', label: 'Lab Work', description: 'Laboratory tests' },
  { value: 'VACCINATION', label: 'Vaccination', description: 'Immunization or vaccination' },
  { value: 'TELEHEALTH', label: 'Telehealth', description: 'Virtual video consultation' },
]

export default function AppointmentBookingForm({
  providerId,
  providerName,
  availableSlots,
  onSubmit: onSubmitProp,
  onCancel,
  isLoading = false,
}: AppointmentBookingFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentBookingFormData>({
    resolver: zodResolver(appointmentBookingSchema),
    defaultValues: {
      providerId,
      date: '',
      time: '',
      reason: '',
      isVirtual: false,
      notes: '',
    },
  })

  const selectedType = watch('type')
  const selectedDate = watch('date')
  const selectedTime = watch('time')

  const onSubmit = handleSubmit((data) => {
    // Ensure isVirtual has a default value
    onSubmitProp({
      ...data,
      isVirtual: data.isVirtual ?? false,
    } as AppointmentBookingFormData)
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book Appointment</CardTitle>
        <CardDescription>with Dr. {providerName}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Appointment Type */}
          <div className="space-y-2">
            <Label htmlFor="type">
              Appointment Type <span className="text-error">*</span>
            </Label>
            <Select
              value={selectedType}
              onValueChange={(value) => {
                setValue('type', value as AppointmentType)
                // Auto-set isVirtual if telehealth is selected
                if (value === 'TELEHEALTH') {
                  setValue('isVirtual', true)
                }
              }}
            >
              <SelectTrigger id="type" className={errors.type ? 'border-error' : ''}>
                <SelectValue placeholder="Select appointment type" />
              </SelectTrigger>
              <SelectContent>
                {appointmentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-neutral-blue-gray/70">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-error">{errors.type.message}</p>
            )}
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="date">
              Preferred Date <span className="text-error">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              min={format(new Date(), 'yyyy-MM-dd')}
              {...register('date')}
              className={errors.date ? 'border-error' : ''}
            />
            {errors.date && (
              <p className="text-sm text-error">{errors.date.message}</p>
            )}
          </div>

          {/* Time Slot Selection */}
          <div className="space-y-2">
            <Label htmlFor="time">
              Time Slot <span className="text-error">*</span>
            </Label>
            {availableSlots.length > 0 ? (
              <Select
                value={selectedTime}
                onValueChange={(value) => setValue('time', value)}
              >
                <SelectTrigger id="time" className={errors.time ? 'border-error' : ''}>
                  <SelectValue placeholder="Select a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {slot}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-sm text-neutral-blue-gray/70 p-3 border rounded-md bg-neutral-light">
                {selectedDate ? 'No available slots for this date. Please select another date.' : 'Please select a date first to see available time slots.'}
              </div>
            )}
            {errors.time && (
              <p className="text-sm text-error">{errors.time.message}</p>
            )}
          </div>

          {/* Virtual Appointment Checkbox */}
          {selectedType !== 'TELEHEALTH' && (
            <div className="flex items-center gap-2">
              <input
                id="isVirtual"
                type="checkbox"
                {...register('isVirtual')}
                className="h-4 w-4 rounded border-neutral-blue-gray/30 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
              />
              <Label htmlFor="isVirtual" className="cursor-pointer font-normal">
                Request virtual appointment (if available)
              </Label>
            </div>
          )}

          {/* Reason for Visit */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason for Visit <span className="text-error">*</span>
            </Label>
            <textarea
              id="reason"
              rows={3}
              placeholder="Please describe the reason for your appointment..."
              {...register('reason')}
              className={`w-full rounded-md border ${
                errors.reason ? 'border-error' : 'border-neutral-blue-gray/30'
              } px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
            />
            {errors.reason && (
              <p className="text-sm text-error">{errors.reason.message}</p>
            )}
            <p className="text-xs text-neutral-blue-gray/60">
              Minimum 10 characters, maximum 500 characters
            </p>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <textarea
              id="notes"
              rows={2}
              placeholder="Any additional information for the provider..."
              {...register('notes')}
              className="w-full rounded-md border border-neutral-blue-gray/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            />
            {errors.notes && (
              <p className="text-sm text-error">{errors.notes.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading || isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="flex-1"
            >
              {isLoading || isSubmitting ? 'Booking...' : 'Book Appointment'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
