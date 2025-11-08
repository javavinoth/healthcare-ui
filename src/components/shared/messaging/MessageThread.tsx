import { useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, isToday, isYesterday } from 'date-fns'
import { Download, FileText, Image as ImageIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { messagesApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/components/ui/use-toast'
import type { Message } from '@/types'
import { cn } from '@/lib/utils'

interface MessageThreadProps {
  conversationId: string
}

/**
 * MessageThread Component
 * Displays messages in a conversation with auto-scroll and read receipts
 */
export default function MessageThread({ conversationId }: MessageThreadProps) {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const scrollRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch messages for this conversation
  const {
    data: messagesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => messagesApi.getMessages(conversationId),
    refetchInterval: 10000, // Refresh every 10 seconds for real-time updates
    enabled: !!conversationId,
  })

  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (messageId: string) => messagesApi.markAsRead(messageId),
    onSuccess: () => {
      // Invalidate conversations to update unread counts
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
    },
  })

  const messages = messagesData?.data || []

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length])

  // Mark unread messages as read when viewing
  useEffect(() => {
    if (!user || !messages.length) return

    const unreadMessages = messages.filter((msg) => !msg.isRead && msg.senderId !== user.id)

    unreadMessages.forEach((msg) => {
      markAsReadMutation.mutate(msg.id)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, user])

  // Format date for message grouping
  const formatMessageDate = (date: Date): string => {
    if (isToday(date)) return 'Today'
    if (isYesterday(date)) return 'Yesterday'
    return format(date, 'MMMM d, yyyy')
  }

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = []
  let currentGroup: { date: string; messages: Message[] } | null = null

  messages.forEach((message) => {
    const messageDate = new Date(message.sentAt)
    const dateLabel = formatMessageDate(messageDate)

    if (!currentGroup || currentGroup.date !== dateLabel) {
      currentGroup = { date: dateLabel, messages: [message] }
      groupedMessages.push(currentGroup)
    } else {
      currentGroup.messages.push(message)
    }
  })

  // Handle attachment download
  const handleDownloadAttachment = async (attachment: any) => {
    try {
      // Use authenticated API client to download
      const response = await messagesApi.downloadAttachment(attachment.id)

      // Show mock response in development mode
      toast({
        title: 'Attachment Info',
        description: response.message || `${attachment.name} - File storage not implemented yet`,
        variant: 'default',
      })

      // Log the mock response for debugging
      console.log('Attachment download response:', response)

      // In production with real file storage, this would trigger actual download:
      // const blob = new Blob([response], { type: attachment.type })
      // const url = window.URL.createObjectURL(blob)
      // const a = document.createElement('a')
      // a.href = url
      // a.download = attachment.name
      // a.click()
      // window.URL.revokeObjectURL(url)
    } catch (error: any) {
      toast({
        title: 'Download failed',
        description: error?.message || 'Unable to download attachment',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col bg-neutral-light">
        <div className="p-4 border-b border-neutral-blue-gray/10 bg-white">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-3/4" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-neutral-light">
        <div className="text-center">
          <p className="text-error mb-2">Failed to load messages</p>
          <p className="text-small text-neutral-blue-gray/60">Please try again later</p>
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-neutral-light">
        <div className="text-center">
          <p className="text-body text-neutral-blue-gray/60">
            No messages yet. Start the conversation below.
          </p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1 bg-neutral-light" ref={scrollRef}>
      <div className="p-4 space-y-6">
        {groupedMessages.map((group) => (
          <div key={group.date}>
            {/* Date Separator */}
            <div className="flex items-center justify-center mb-4">
              <div className="bg-neutral-blue-gray/10 text-neutral-blue-gray/70 text-caption px-3 py-1 rounded-full">
                {group.date}
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-4">
              {group.messages.map((message) => {
                const isOwnMessage = message.senderId === user?.id
                const messageTime = format(new Date(message.sentAt), 'h:mm a')

                return (
                  <div
                    key={message.id}
                    className={cn('flex', isOwnMessage ? 'justify-end' : 'justify-start')}
                  >
                    <div
                      className={cn(
                        'max-w-[70%] rounded-lg p-3',
                        isOwnMessage
                          ? 'bg-primary text-white'
                          : 'bg-white text-neutral-blue-gray border border-neutral-blue-gray/10'
                      )}
                    >
                      {/* Sender Name (if not own message) */}
                      {!isOwnMessage && (
                        <p className="font-semibold text-small mb-1">
                          {message.senderName}
                          <span className="text-caption text-neutral-blue-gray/60 ml-2 capitalize">
                            ({message.senderRole})
                          </span>
                        </p>
                      )}

                      {/* Message Content */}
                      <p className="text-body whitespace-pre-wrap break-words">{message.content}</p>

                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.attachments.map((attachment) => {
                            const isImage = attachment.type.startsWith('image/')

                            return (
                              <div
                                key={attachment.id}
                                className={cn(
                                  'flex items-center gap-2 p-2 rounded border',
                                  isOwnMessage
                                    ? 'bg-primary-dark border-white/20'
                                    : 'bg-neutral-light border-neutral-blue-gray/10'
                                )}
                              >
                                {isImage ? (
                                  <ImageIcon className="h-4 w-4 flex-shrink-0" />
                                ) : (
                                  <FileText className="h-4 w-4 flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-small truncate">{attachment.name}</p>
                                  <p className="text-caption opacity-70">
                                    {(attachment.size / 1024).toFixed(1)} KB
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  variant={isOwnMessage ? 'ghost' : 'outline'}
                                  onClick={() => handleDownloadAttachment(attachment)}
                                  className={cn(
                                    'h-8 w-8 p-0',
                                    isOwnMessage && 'text-white hover:bg-white/10'
                                  )}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* Timestamp */}
                      <p
                        className={cn(
                          'text-caption mt-2',
                          isOwnMessage ? 'text-white/70' : 'text-neutral-blue-gray/50'
                        )}
                      >
                        {messageTime}
                        {message.isRead && isOwnMessage && <span className="ml-2">• Read</span>}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  )
}
