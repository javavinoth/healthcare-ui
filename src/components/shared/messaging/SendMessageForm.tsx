import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { Send, Paperclip, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { messagesApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { sendMessageSchema, type SendMessageFormData } from '@/lib/validations/messaging'
import { cn } from '@/lib/utils'
import { extractErrorMessage } from '@/lib/utils/apiError'

interface SendMessageFormProps {
  conversationId?: string
  recipientId?: string
}

/**
 * SendMessageForm Component
 * Form for composing and sending messages with attachment support
 */
export default function SendMessageForm({ conversationId, recipientId }: SendMessageFormProps) {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [attachments, setAttachments] = useState<File[]>([])

  // Get conversation details to find recipient
  const { data: conversation } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => (conversationId ? messagesApi.getConversation(conversationId) : null),
    enabled: !!conversationId && !recipientId,
  })

  // Determine recipient ID
  const actualRecipientId =
    recipientId || conversation?.participants.find((p) => p.id !== user?.id)?.id || ''

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<SendMessageFormData>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      recipientId: actualRecipientId,
      body: '',
      conversationId: conversationId,
    },
  })

  // Update recipientId when it changes
  useEffect(() => {
    if (actualRecipientId) {
      reset({
        recipientId: actualRecipientId,
        body: watch('body'),
        conversationId: conversationId,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actualRecipientId, conversationId])

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (data: SendMessageFormData) => messagesApi.sendMessage(data),
    onSuccess: async (newMessage) => {
      // Upload attachments if any
      if (attachments.length > 0) {
        try {
          await Promise.all(
            attachments.map((file) => messagesApi.uploadAttachment(newMessage.id, file))
          )
        } catch {
          toast({
            title: 'Attachment upload failed',
            description: 'Message sent but attachments failed to upload.',
            variant: 'destructive',
          })
        }
      }

      // Reset form and attachments
      reset({
        recipientId: actualRecipientId,
        body: '',
        conversationId: conversationId,
      })
      setAttachments([])

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })

      toast({
        title: 'Message sent',
        description: 'Your message has been sent successfully.',
        variant: 'success',
      })
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
    sendMessageMutation.mutate(data)
  }

  // Handle file attachment
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
      const maxSize = 10 * 1024 * 1024 // 10MB

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: `${file.name}: Only PDF, PNG, and JPEG files are allowed.`,
          variant: 'destructive',
        })
        return false
      }

      if (file.size > maxSize) {
        toast({
          title: 'File too large',
          description: `${file.name}: File size must be less than 10MB.`,
          variant: 'destructive',
        })
        return false
      }

      return true
    })

    setAttachments((prev) => [...prev, ...validFiles])
    e.target.value = '' // Reset input
  }

  // Remove attachment
  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const bodyValue = watch('body')
  const characterCount = bodyValue?.length || 0
  const maxCharacters = 5000
  const isNearLimit = characterCount > maxCharacters * 0.9

  return (
    <div className="border-t border-neutral-blue-gray/10 bg-white p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-neutral-light border border-neutral-blue-gray/10 rounded px-3 py-2"
              >
                <span className="text-small text-neutral-blue-gray truncate max-w-[200px]">
                  {file.name}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveAttachment(index)}
                  className="h-5 w-5 p-0 hover:bg-error/10 hover:text-error"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Message Textarea */}
        <div className="relative">
          <Textarea
            {...register('body')}
            placeholder="Type your message here..."
            className={cn(
              'min-h-[100px] resize-none',
              errors.body && 'border-error focus:ring-error'
            )}
            aria-label="Message content"
            aria-invalid={!!errors.body}
            aria-describedby={errors.body ? 'body-error' : undefined}
          />

          {/* Character Counter */}
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

        {/* Error Message */}
        {errors.body && (
          <p id="body-error" className="text-small text-error">
            {errors.body.message}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-3">
          {/* Attachment Button */}
          <div>
            <input
              type="file"
              id="file-attachment"
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg"
              multiple
              onChange={handleFileSelect}
              aria-label="Attach files"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('file-attachment')?.click()}
              disabled={isSubmitting}
            >
              <Paperclip className="h-4 w-4 mr-2" />
              Attach File
            </Button>
          </div>

          {/* Send Button */}
          <Button
            type="submit"
            disabled={isSubmitting || !bodyValue?.trim()}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
