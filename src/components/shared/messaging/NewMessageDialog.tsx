import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { useAuthStore } from '@/stores/authStore'
import { messagesApi } from '@/lib/api'
import { sendMessageSchema, type SendMessageFormData } from '@/lib/validations/messaging'
import { filterMessagableUsers } from '@/lib/constants/messagingPermissions'
import { cn } from '@/lib/utils'
import { extractErrorMessage } from '@/lib/utils/apiError'

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
  const { user } = useAuthStore()
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('')

  // Fetch all users that the current user can message
  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['messageable-users'],
    queryFn: () => messagesApi.getMessageableUsers(),
    enabled: open, // Only fetch when dialog is open
  })

  // Filter users based on current user's role permissions
  const messagableUsers = useMemo(() => {
    if (!user || !allUsers) return []
    // Filter out the current user and apply role-based permissions
    const otherUsers = allUsers.filter((u) => u.id !== user.id)
    return filterMessagableUsers(user.role, otherUsers)
  }, [user, allUsers])

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
      setSelectedRecipientId('')
    },
    onError: (error: unknown) => {
      const message = extractErrorMessage(error, 'Failed to send message. Please try again.')
      toast({
        title: 'Failed to send message',
        description: message,
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: SendMessageFormData) => {
    console.log('Form submitted:', { data, selectedRecipientId })

    if (!selectedRecipientId) {
      toast({
        title: 'Recipient required',
        description: 'Please select a recipient to send the message to.',
        variant: 'destructive',
      })
      return
    }

    console.log('Sending message to:', selectedRecipientId)
    sendMessageMutation.mutate({
      ...data,
      recipientId: selectedRecipientId,
    })
  }

  // Update form value when recipient is selected
  const handleRecipientChange = (recipientId: string) => {
    setSelectedRecipientId(recipientId)
    setValue('recipientId', recipientId)
  }

  // Get label for recipient role
  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      patient: 'Patient',
      doctor: 'Doctor',
      nurse: 'Nurse',
      receptionist: 'Receptionist',
      billing_staff: 'Billing Staff',
      admin: 'Administrator',
    }
    return labels[role] || role
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
          {/* Recipient Selection */}
          <div className="space-y-2">
            <Label htmlFor="recipient">To</Label>
            {usersLoading ? (
              <div className="text-small text-neutral-blue-gray/60">Loading users...</div>
            ) : (
              <Select value={selectedRecipientId} onValueChange={handleRecipientChange}>
                <SelectTrigger id="recipient">
                  <SelectValue placeholder="Select a recipient" />
                </SelectTrigger>
                <SelectContent>
                  {messagableUsers?.map((recipient) => (
                    <SelectItem key={recipient.id} value={recipient.id}>
                      {recipient.firstName} {recipient.lastName} - {getRoleLabel(recipient.role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {!selectedRecipientId && (
              <p className="text-small text-neutral-blue-gray/60">
                Select who you want to send a message to
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
            {errors.subject && <p className="text-small text-error">{errors.subject.message}</p>}
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
                    isNearLimit ? 'text-error font-medium' : 'text-neutral-blue-gray/50'
                  )}
                >
                  {characterCount} / {maxCharacters}
                </span>
              </div>
            </div>
            {errors.body && <p className="text-small text-error">{errors.body.message}</p>}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                reset()
                setSelectedRecipientId('')
              }}
              disabled={sendMessageMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                sendMessageMutation.isPending || !contentValue?.trim() || !selectedRecipientId
              }
            >
              {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
            </Button>
          </div>

          {/* Debug info - remove in production */}
          {import.meta.env.DEV && (
            <div className="text-caption text-neutral-blue-gray/60 pt-2">
              Debug: Recipient={selectedRecipientId ? 'selected' : 'none'}, Content=
              {contentValue?.length || 0} chars, Available={messagableUsers.length}
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
