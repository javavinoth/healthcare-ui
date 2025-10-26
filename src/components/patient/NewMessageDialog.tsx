import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { messagesApi, providersApi } from '@/lib/api'
import { sendMessageSchema, type SendMessageFormData } from '@/lib/validations/messaging'
import { cn } from '@/lib/utils'

interface NewMessageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * NewMessageDialog Component
 * Modal for starting a new conversation with a provider
 */
export default function NewMessageDialog({ open, onOpenChange }: NewMessageDialogProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedProviderId, setSelectedProviderId] = useState<string>('')

  // Fetch available providers
  const { data: providers, isLoading: providersLoading } = useQuery({
    queryKey: ['providers'],
    queryFn: () => providersApi.getAll({}),
    enabled: open, // Only fetch when dialog is open
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<SendMessageFormData>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      recipientId: '',
      subject: '',
      body: '',
    },
  })

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (data: SendMessageFormData) => messagesApi.sendMessage(data),
    onSuccess: () => {
      // Refresh conversations list
      queryClient.invalidateQueries({ queryKey: ['conversations'] })

      toast({
        title: 'Message sent',
        description: 'Your message has been sent successfully.',
        variant: 'success',
      })

      // Close dialog and reset form
      onOpenChange(false)
      reset()
      setSelectedProviderId('')
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to send message',
        description: error?.message || 'Please try again.',
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: SendMessageFormData) => {
    console.log('Form submitted:', { data, selectedProviderId })

    if (!selectedProviderId) {
      toast({
        title: 'Provider required',
        description: 'Please select a provider to send the message to.',
        variant: 'destructive',
      })
      return
    }

    console.log('Sending message to:', selectedProviderId)
    sendMessageMutation.mutate({
      ...data,
      recipientId: selectedProviderId,
    })
  }

  // Update form value when provider is selected
  const handleProviderChange = (providerId: string) => {
    setSelectedProviderId(providerId)
    setValue('recipientId', providerId)
  }

  const contentValue = watch('body')
  const characterCount = contentValue?.length || 0
  const maxCharacters = 5000
  const isNearLimit = characterCount > maxCharacters * 0.9

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Provider Selection */}
          <div className="space-y-2">
            <Label htmlFor="provider">To</Label>
            {providersLoading ? (
              <div className="text-small text-neutral-blue-gray/60">Loading providers...</div>
            ) : (
              <Select value={selectedProviderId} onValueChange={handleProviderChange}>
                <SelectTrigger id="provider">
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  {providers?.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.firstName} {provider.lastName} - {provider.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {!selectedProviderId && (
              <p className="text-small text-neutral-blue-gray/60">
                Select the healthcare provider you want to message
              </p>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject (Optional)</Label>
            <Input
              id="subject"
              {...register('subject')}
              placeholder="e.g., Question about medication"
              className={cn(errors.subject && 'border-error focus:ring-error')}
            />
            {errors.subject && (
              <p className="text-small text-error">{errors.subject.message}</p>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <div className="relative">
              <Textarea
                id="body"
                {...register('body')}
                placeholder="Type your message here..."
                className={cn(
                  'min-h-[150px] resize-none',
                  errors.body && 'border-error focus:ring-error'
                )}
              />
              <div className="absolute bottom-2 right-2">
                <span
                  className={cn(
                    'text-caption',
                    isNearLimit
                      ? 'text-error font-medium'
                      : 'text-neutral-blue-gray/50'
                  )}
                >
                  {characterCount} / {maxCharacters}
                </span>
              </div>
            </div>
            {errors.body && (
              <p className="text-small text-error">{errors.body.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                reset()
                setSelectedProviderId('')
              }}
              disabled={sendMessageMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={sendMessageMutation.isPending || !contentValue?.trim() || !selectedProviderId}
            >
              {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
            </Button>
          </div>

          {/* Debug info - remove in production */}
          {import.meta.env.DEV && (
            <div className="text-caption text-neutral-blue-gray/60 pt-2">
              Debug: Provider={selectedProviderId ? 'selected' : 'none'}, Content={contentValue?.length || 0} chars
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
